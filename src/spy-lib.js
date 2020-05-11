import _ from 'lodash';
import moment from 'moment';
import Discord from "discord.js";

import {levenshteinDistance, Ship, Fleet, baseShipStats, modifiers, BUILDING_STATS} from './lib'

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
const REGEX_FLEET = /^(?<qty>\d+)\s(?<type>[a-z\s]+)(?<noCards> - No cards\.)?$/i;
const REGEX_HANGAR = /^[a-z\s]*\((?<type>[a-z\s]+)\)\s(?<qty>\d+)$/i;
const REGEX_CARD = /cardTooltip\((\d+)\)\s([\w\s\-']+)/i;

function parseCards(line) {
    return _.map(line.split(','), (card) => {
        const [, cardId, name] = card.match(REGEX_CARD);
        return {cardId, name, modifiers};
    })
}

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
    [MARKER_STATION_CARDS]: ([line]) => {
        return parseCards(line.substring(0, line.length - 1));
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
            .mapValues(o => {
                console.log(o);
                const level = parseInt(o[1].substring(6).trim(), 10);
                const building = modifiers.buildings[o[0].trim()] || {tier: 1, type: 'building'};
                return ({
                    name: o[0],
                    tier: building.tier,
                    level,
                    hp: BUILDING_STATS[building.type || 'building'][building.tier - 1][level - 1].hp
                });
            })
            .value();
    },
    [MARKER_QUEUE_BUILDINGS]: lines => {

    },
    [MARKER_QUEUE_FLEETS]: lines => {

    },
    // [MARKER_STATION_HIDDEN_RES]: lines => {
    //
    // },
    [MARKER_FLEETS]: ([firstLine, ...lines]) => {
        let supplied = undefined;
        if (firstLine.trim().endsWith('are supplied by this station')) {
            supplied = parseInt(firstLine.split(' ')[0], 10);
        } else if (firstLine.startsWith('None')) {
            return {
                fleets: []
            };
        }

        let fleets = [];
        let info;
        const totalLines = lines.length;
        for (let i = 0; i < totalLines; i++) {
            const l = lines[i];
            // console.log(l);
            try {
                if (l === null || l.trim() === '') {
                } else {
                    console.log(l);
                    const grps = l.match(REGEX_FLEET).groups;
                    const qty = parseInt(grps.qty, 10);
                    const type = normalizeShipType(grps.type);
                    const ship = baseShipStats[type];
                    let cards = null;
                    try {
                        if (!grps.noCards && i + 1 < totalLines && lines[i + 1].startsWith('Cards:')) {
                            cards = parseCards(lines[i + 1].substring(7, lines[i + 1].length - 1));
                            //skiping nextline
                            i++;
                        }
                    } catch (e) {
                        info = 'Cannot read cards';
                        console.error(lines[i], e);
                    }
                    // console.log(`adding fleet of ${qty} ${type}`);
                    fleets.push(new Fleet(ship, qty, cards));
                }
            } catch (eregex) {
                console.error('fleet line parse error', eregex);
            }
        }

        return {
            supplied,
            fleets
        }
    }
    ,
    [MARKER_HANGAR]:
        lines =>
            _.chain(lines)
                .map(l => {
                    return l.startsWith('None') ? null : l.match(REGEX_HANGAR).groups
                })
                .filter(_.isNotNull)
                .map(({qty, type}) => ({qty: parseInt(qty, 10), type: normalizeShipType(type)}))
                .value(),
    [MARKER_OUTPOSTS]: lines => {
        return lines.length === 0 || lines[0].startsWith('None') ? null : _
            .chain(lines)
            .filter(_.isNotNull)
            .map(l => l.split(' - '))
            .filter(_.isNotNull)
            .keyBy(0)
            .mapValues(o => {
                console.log(o);
                const level = parseInt(o[1].substring(6).trim(), 10);
                const building = modifiers.outposts[o[0].trim()];
                const hp = BUILDING_STATS[building.type || 'outpost'][building.tier - 1][level - 1].hp;
                if (o.length > 2) {
                    const op = o[2];

                    return {
                        name: o[0],
                        tier: building.tier,
                        hp: BUILDING_STATS.outpost[building.tier - 1][level - 1].hp,
                        level,
                        operational: op.startsWith('Operational'),
                        boosted: op.substring(11).trim() || false
                    }
                }
                return ({
                    name: o[0],
                    tier: building.tier,
                    level,
                    hp
                });
            })
            .value();
    }
}
// same parsers
PARSERS[MARKER_STATION_HIDDEN_RES] = PARSERS[MARKER_STATION_RES];

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

function getFirepower(modifier, level) {
    return modifier && _.isNumber(modifier.firepower) ? modifier.firepower * level : 0;
}

function getFormattedReport({
                                [MARKER_HEADER]: {name, x, y},
                                [MARKER_CAPTURE]: {current, total},
                                [MARKER_STATION_RES]: {Metal: metal, Gas: gas, Crystal: crystal},
                                [MARKER_STATION_HIDDEN_RES]: {Metal: hiddenMetal, Gas: hiddenGas, Crystal: hiddenCrystal},
                                [MARKER_STATION_CARDS]: stationCards,
                                [MARKER_STATION_LABOR]: labor,
                                [MARKER_BUILDINGS]: buildings,
                                [MARKER_QUEUE_BUILDINGS]: buildingQueue,
                                [MARKER_QUEUE_FLEETS]: fleetQueue,
                                [MARKER_OUTPOSTS]: outposts,
                                [MARKER_FLEETS]: {fleets, supplied},
                                [MARKER_HANGAR]: hangar
                            }) {
    const fleetsDesc = _.invokeMap(fleets, 'get');
    // console.log(fleetsDesc);
    const totalBuildingHp = _.reduce(buildings,
        (result, {hp}, name) => result + hp, 0);
    const [totalOutpostFirepower, totalOutpostHp] = _.reduce(outposts,
        (result, {hp, name, level}) =>
            [result[0] + getFirepower(modifiers.outposts[name], level), result[1] + hp], [0, 0]);
    const [totalFirepower, totalHp, totalBombing] = _.reduce(fleetsDesc,
        (result, {firepower, hp, bombing}) => [result[0] + firepower, result[1] + hp, result[2] + bombing], [0, 0, 0]);
    return `>>> ====================================================================
__Spy Report at **${name}**__ \`/goto ${x} ${y}\`
Capture Defense: **${current}/${total}**
Metal / Gas / Crystal (hidden)
${metal} (${hiddenMetal || '*?*'}) / ${gas} (${hiddenGas || '*?*'}) / ${crystal} (${hiddenCrystal || '*?*'})
Cards: ${_.map(stationCards, 'name').join(',')}
Labor **${labor}**
__Buildings:__ \`${String(totalBuildingHp).padStart(7, ' ')}\`:hearts:
${_.map(buildings, ({level: bLevel}, bName) =>
            `${bName} lvl **${bLevel}**`).join('\n') || '*empty*'
        }

__Outposts:__ \`${String(totalOutpostFirepower).padStart(7, ' ')}\`:boom: | \`${String(totalOutpostHp).padStart(7, ' ')}\`:hearts:
${_.map(outposts, ({level: bLevel, operational: bOpe, boosted}, bName) =>
            `${bOpe ? ':white_check_mark: ' : ':zzz: '}${boosted ? '(' + boosted + ') - ' : ''}${bName} lvl **${bLevel}**`).join('\n') || '*empty*'
        }

__Fleets:__ \`${String(totalFirepower).padStart(7, ' ')}\`:boom: | \`${String(totalHp).padStart(7, ' ')}\`:hearts: | \`${String(totalBombing).padStart(7, ' ')}\`:bomb: `
        + (supplied ? ` **${supplied}** supplied` : '')
        + _.map(fleetsDesc,
            ({hp, firepower, bombing, qty, cards, ship: {type}}) =>
                `${qty} x ${type} \`${String(firepower).padStart(7, ' ')} \`:boom: | \`${String(hp).padStart(7, ' ')} \`:hearts: `
                + (bombing ? `| \`${String(bombing).padStart(7, ' ')} \`:bomb:` : '')
                + (cards && cards.length > 0 ? 'Cards: ||' + _.map(cards, c => c.name.substring(0, 15)
                //c => c.shortname || _.map(c.name.split(' '), namePart => namePart.substr(0,3)).join('')
                ).join(', ') + `||` : '')
        ).join('\n')
        + `__Hangar:__\n`
+ (_.map(hangar, ({qty, type}) => `${qty} x ${type}`
        ).join('\n') || '*empty*');
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
                      [MARKER_FLEETS]: {fleets, supplied},
                      [MARKER_HANGAR]: hangar
                  }) {
    const fleetsDesc = _.invokeMap(fleets, 'get');
    // console.log(fleetsDesc);
    const [totalFirepower, totalHp] = _.reduce(fleetsDesc,
        (result, {firepower, hp}) => [result[0] + firepower, result[1] + hp], [0, 0]);
    return new Discord.MessageEmbed()
        .setTitle(
            `
    Spy
    Report
at **${name}
**
    `
        )
        .setDescription(
            `\`
/goto $
{
    x
}
 $
{
    y
}
\`
`
)

.
setColor(0xff0000)
    .setTimestamp()

    .addFields({
            "name": "Capture Defense",
            "value": `
$
{
    current
}
/**$
{
    total
}
**
`,
            inline: true
        },
        {
            "name": "Labor",
            "value": labor,
            inline: true
        },
        {
            "name": "Metal / Gas / Crystal (hidden)",
            "value": `
$
{
    metal
}
 ($
{
    hiddenMetal || '*?*'
}
) / $
{
    gas
}
 ($
{
    hiddenGas || '*?*'
}
) / $
{
    crystal
}
 ($
{
    hiddenCrystal || '*?*'
}
)
`,
            inline: true
        },
        {
            "name": "Buildings",
            "value": _.map(buildings, ({level: bLevel}, bName) => `
$
{
    bName
}
 lvl **$
{
    bLevel
}
**
`).join('\n') || '*empty*',
            inline: true
        },
        {
            "name": "Outposts",
            "value": _.map(outposts, ({level: bLevel, operational: bOpe}, bName) => `
$
{
    bName
}
 lvl **$
{
    bLevel
}
** $
{
    bOpe ? ':white_check_mark:' : ':zzz:'
}
`).join('\n') || '*empty*',
            inline: true
        },
        {
            "name": "Fleets Total: " + '`' + String(totalFirepower).padStart(7, ' ') + '`:boom: | `' + String(totalHp).padStart(7, ' ') + '`:heart:',
            "value": (supplied ? " *" + supplied + " supplied*" : ''),
        },
        ..._.map(fleetsDesc,
            ({hp, firepower, qty, cards, ship: {type}}) => ({
                name: '`' + String(firepower).padStart(7, ' ') + '`:boom: | `' + String(hp).padStart(7, ' ') + '`:heart: ' + `
$
{
    qty
}
 x $
{
    type
}
`,
                value: `
$
{
    cards && cards.length > 0 ? 'Cards: ' + _.map(cards,
        c => c.name.substring(0, 15)
        //c => c.shortname || _.map(c.name.split(' '), namePart => namePart.substr(0,3)).join('')
    ).join(',') : '\u200b'
}
`
            })),

        {
            "name": "Hangar",
            "value": _.map(hangar, ({qty, type}) => `
$
{
    qty
}
 x $
{
    type
}
`).join('\n') || '*empty*',
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