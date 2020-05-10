import _ from 'lodash';
import moment from 'moment';
import Discord from "discord.js";

import {levenshteinDistance} from './lib'

const MARKER_HEADER = 'HEADER';
const MARKER_CAPTURE = 'Capture Defense';
const MARKER_STATION_RES = 'Station Resources';
const MARKER_STATION_CARDS = 'Cards';
const MARKER_STATION_LABOR = 'Station Labor';
const MARKER_BUILDINGS = 'Buildings';
const MARKER_QUEUE_BUILDINGS = 'Building Construction Queue';
const MARKER_QUEUE_FLEETS = 'Fleet Construction Queue';
const MARKER_STATION_HIDDEN_RES = 'Station Hidden Resources';
const MARKER_OUTPOSTS = 'Outposts';
const MARKER_FLEETS = 'Fleets';
const MARKER_HANGAR = 'Hangar';

function Report() {
    this[MARKER_HEADER] = {};
    this[MARKER_CAPTURE] = {};
    this[MARKER_STATION_RES] = {};
    this[MARKER_STATION_CARDS] = [];
    this[MARKER_STATION_LABOR] = null;
    this[MARKER_BUILDINGS] = {};
    this[MARKER_QUEUE_BUILDINGS] = [];
    this[MARKER_QUEUE_FLEETS] = [];
    this[MARKER_STATION_HIDDEN_RES] = {};
    this[MARKER_OUTPOSTS] = {};
    this[MARKER_FLEETS] = [];
    this[MARKER_HANGAR] = [];
}

export const MARKERS = {
    MARKER_HEADER,
    MARKER_CAPTURE,
    MARKER_STATION_RES,
    MARKER_STATION_CARDS,
    MARKER_STATION_LABOR,
    MARKER_BUILDINGS,
    MARKER_QUEUE_BUILDINGS,
    MARKER_QUEUE_FLEETS,
    MARKER_STATION_HIDDEN_RES,
    MARKER_OUTPOSTS,
    MARKER_FLEETS,
    MARKER_HANGAR
};
const shipTypes = [
    'Patrol Ship',
    'Corvette',
    'Scout', 'Industrial',
    'Destroyer', 'Frigate',
    'Recon', 'Gunship',
    'Troop Carrier',
    'Carrier', 'Dreadnought'
]
const SHIP_TYPES_LEN = shipTypes.length;

function normalizeShipType(type) {
    let dist = 1000;
    let closest = 10000;
    let i = 0;
    let selected = null;
    while (dist > 2 && i < SHIP_TYPES_LEN) {
        dist = levenshteinDistance(type, shipTypes[i]);
        if (dist < closest) {
            selected = shipTypes[i];
            closest = dist;
        } else if (dist < 2 && closest === dist) {
            console.error("ambiguous");
            return type;
        }
        i++;
    }
    if (closest > 4) {
        console.error("ambiguous");
        return type;
    }
    return selected;
}

const REGEX_HEADER = /^\((?<x>-?\d+)[\s,+]+(?<y>-?\d+)\)\s+(?<name>.+)$/i;
const REGEX_STATION_RES = /(?<res>\w+)\s(?<val>\d+)\s*/gi;
const REGEX_LABOR = /^Labor\s(\w+)$/i;
const REGEX_FLEET = /^(?<qty>\d+)\s(?<type>[a-z\s]+)$/i;
const REGEX_HANGAR = /^[a-z\s]*\((?<type>[a-z\s]+)\)\s(?<qty>\d+)$/i;
const PARSERS = {
    [MARKER_HEADER]: lines => {
        const header = lines[0].substring(18).split(' completed')[0].match(REGEX_HEADER).groups;
        return {
            name: header.name,
            x: parseInt(header.x, 10),
            y: parseInt(header.y, 10)
        };
    },
    [MARKER_CAPTURE]: line => {
        const cap = _.map(line.split(':')[1].trim().split('/'), s => parseInt(s, 10));
        return {current: cap[0], total: cap[1]};
    },
    [MARKER_STATION_RES]: lines => {
        const regex = lines[0].matchAll(REGEX_STATION_RES);
        const r = {};
        if (!regex) return null;
        for (let result of regex) {
            r[result.groups.res] = parseInt(result.groups.val, 10);
        }
        return r;
    },
    [MARKER_STATION_CARDS]: lines => {
        return lines[0].split(',');
    },
    [MARKER_STATION_LABOR]: lines => {
        return parseInt(lines[0].match(REGEX_LABOR)[1], 10);
    },
    [MARKER_BUILDINGS]: lines => {
        return lines.length === 0 || lines[0].startsWith('None') ? null : _
            .chain(lines)
            .filter(_.isNotNull)
            .map(l => l.split(' - '))
            .filter(_.isNotNull)
            .keyBy(0)
            .mapValues(o => ({
                level: parseInt(o[1].substring(6).trim(), 10),
                ...(o.length > 2 ? {operational: o[2] === 'Operational'} : {})
            }))
            .value();
    },
    [MARKER_QUEUE_BUILDINGS]: lines => {

    },
    [MARKER_QUEUE_FLEETS]: lines => {

    },
    // [MARKER_STATION_HIDDEN_RES]: lines => {
    //
    // },
    [MARKER_FLEETS]: lines =>
        _.chain(lines)
            .map(l => {
                return l.startsWith('None') ? null : l.match(REGEX_FLEET).groups
            })
            .filter(_.isNotNull)
            .map(({qty, type}) => ({qty: parseInt(qty, 10), type: normalizeShipType(type)}))
            .value()
    ,
    [MARKER_HANGAR]:
        lines =>
            _.chain(lines)
                .map(l => {
                    return l.startsWith('None') ? null : l.match(REGEX_HANGAR).groups
                })
                .filter(_.isNotNull)
                .map(({qty, type}) => ({qty: parseInt(qty, 10), type: normalizeShipType(type)}))
                .value()
}
// same parsers
PARSERS[MARKER_STATION_HIDDEN_RES] = PARSERS[MARKER_STATION_RES];
PARSERS[MARKER_OUTPOSTS] = PARSERS[MARKER_BUILDINGS];

// privates

function parseSpyReport(raw) {
    const lines = raw.split('\n');
    let marker = MARKER_HEADER;
    const byMarkers = {[MARKER_HEADER]: []};
    try {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.endsWith(':')) {
                // new marker, process last marker
                if (marker != null) {
                    // console.debug('processing ' + marker, byMarkers[marker]);
                    byMarkers[marker] = PARSERS[marker](byMarkers[marker]);
                }
                if (line === 'Construction Queues:') {
                    //skip
                    marker = null;
                } else {
                    marker = line.substring(0, line.length - 1);
                    // console.debug('New marker ' + marker);
                    byMarkers[marker] = [];
                }
            } else if (line.startsWith(MARKER_CAPTURE)) {
                byMarkers[MARKER_CAPTURE] = PARSERS[MARKER_CAPTURE](line);
            } else {
                if (line !== '')
                    byMarkers[marker].push(line.trim());
            }
        }
        if (marker != null) {
            // console.debug('processing ' + marker, byMarkers[marker]);
            byMarkers[marker] = PARSERS[marker](byMarkers[marker]);
        }
    } catch (e) {
        console.error(`Marker ${marker} failed to process`, e)
    }

    return {
        ...new Report(),
        ..._.chain(byMarkers)
            .mapValues()
            .value()
    };
}


function getFormattedReport(report) {
    return ">>> " + report;
}

function getEmbed({
                      [MARKER_HEADER]: {name, x, y},
                      [MARKER_CAPTURE]: {current, total},
                      [MARKER_STATION_RES]: {Metal: metal, Gas: gas, Crystal: crystal},
                      [MARKER_STATION_HIDDEN_RES]: {Metal: hiddenMetal, Gas: hiddenGas, Crystal: hiddenCrystal},
                      [MARKER_STATION_CARDS]: {},
                      [MARKER_STATION_LABOR]: labor,
                      [MARKER_BUILDINGS]: buildings,
                      [MARKER_QUEUE_BUILDINGS]: buildingQueue,
                      [MARKER_QUEUE_FLEETS]: fleetQueue,
                      [MARKER_OUTPOSTS]: outposts,
                      [MARKER_FLEETS]: fleets,
                      [MARKER_HANGAR]: hangar
                  }) {
    return new Discord.MessageEmbed()
        .setTitle(`Spy Report at **${name}**`)
        .setDescription(`\`/goto ${x} ${y}\``)
        .setColor(0xff0000)
        .setTimestamp()

        .addFields({
                "name": "Capture Defense",
                "value": `${current}/**${total}**`,
                inline: true
            },
            {
                "name": "Metal / Gas / Crystal (hidden)",
                "value": `${metal} (${hiddenMetal || '*0*'}) / ${gas} (${hiddenGas || '*0*'}) / ${crystal} (${hiddenCrystal || '*0*'})`,
                inline: true
            },
            {
                "name": "Buildings",
                "value": _.map(buildings, ({level: bLevel}, bName) => `${bName} lvl **${bLevel}**`).join('\n') || '*empty*',
            },
            {
                "name": "Outposts",
                "value": _.map(outposts, ({level: bLevel, operational: bOpe}, bName) => `${bName} lvl **${bLevel}** ${bOpe ? ':white_check_mark:' : ':zzz:'}`).join('\n') || '*empty*',
                inline: true
            },
            {
                "name": "Fleet",
                "value": _.map(fleets, ({qty, type}) => `${qty} x ${type}`).join('\n') || '*empty*',
            },
            {
                "name": "Hangar",
                "value": _.map(hangar, ({qty, type}) => `${qty} x ${type}`).join('\n') || '*empty*',
                "inline": true
            }
        );
    //channel.send("this `supports` __a__ **subset** *of* ~~markdown~~ 😃 ```js\nfunction foo(bar) {\n  console.log(bar);\n}\n\nfoo(1);```", { embed });
}

export default {
    PARSERS,
    normalizeShipType,
    parseSpyReport,
    getFormattedReport,
    getEmbed
};