import _ from 'lodash';
import numeral from 'numeral';


import Definitions, {levenshteinDistance, Station, Ship, Fleet, baseShipStats, modifiers, BUILDING_STATS} from './lib'

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

const {SHIP_TYPES_LEN, SHIP_TYPES, BUILDING_INDEX, UNIT_INDEX, OUTPOST_INDEX} = Definitions;

function normalizeShipType(type) {
    let dist = 1000;
    let closest = 10000;
    let i = 0;
    let selected = null;
    while (dist > 2 && i < SHIP_TYPES_LEN) {
        dist = levenshteinDistance(type, SHIP_TYPES[i]);
        if (dist < closest) {
            selected = SHIP_TYPES[i];
            closest = dist;
        } else if (dist < 2 && closest === dist) {
            console.error("ambiguous " + type);
            return type;
        }
        i++;
    }
    if (closest > 4) {
        console.error("very ambiguous" + type);
        return type;
    }
    return selected;
}

const REGEX_HEADER = /^\((?<x>-?\d+)[\s,+]+(?<y>-?\d+)\)\s+(?<name>.+)$/i;
const REGEX_STATION_RES = /(?<res>\w+)\s(?<val>\d+)\s*/gi;
const REGEX_LABOR = /^Labor\s(\w+)$/i;
const REGEX_FLEET = /^(?<qty>\d+)\s(?<type>[a-z\s]+\w)(?<noCards> - No cards\.)?\s?(?<fromPlayer>From\splayerProfile\()?(?<player>[\w\s\d]*)\)?.*/i;
const REGEX_HANGAR = /^[a-z\s]*\((?<type>[a-z\s]+)\)\s(?<qty>\d+)/i;
const REGEX_CARD = /cardTooltip\((\d+)\)\s([\w\s\-']+)/i;

/*
station: {name, x, y},
captureDefense: {current, total},
resources: {metal, gas, crystal},
hiddenResources: {metal: hiddenMetal, gas: hiddenGas, crystal: hiddenCrystal},
cards: stationCards,
 labor: labor,
    buildings: buildings,
    buildingQueue: buildingQueue,
    fleetQueue: fleetQueue,
    outposts: outposts,
    fleets: {fleets, supplied},
hangar: hangar,*/
function parseCards(line) {
    return _.chain(line.split(','))
        .map((card) => {
            try {
                const [, cardId, name] = card.match(REGEX_CARD);
                // return {cardId, name, modifiers};
                return parseInt(cardId, 10);
            } catch {
                return null;
            }
        })
        .filter(_.isNotNull)
        .value();
}

const PARSERS = {
    [MARKER_HEADER]: lines => {
        const header = lines[0].substring(18).split(' completed')[0].match(REGEX_HEADER).groups;
        return {
            station: {
                name: header.name,
                x: parseInt(header.x, 10),
                y: parseInt(header.y, 10)
            }
        };
    },
    [MARKER_CAPTURE]: line => {
        const cap = _.map(line.split(':')[1].trim().split('/'), s => parseInt(s, 10));
        return {captureDefense: {current: cap[0], total: cap[1]}};
    },
    [MARKER_STATION_RES]: lines => {
        const regex = lines[0].matchAll(REGEX_STATION_RES);
        const r = {};
        if (!regex) return {resources: null};
        for (let result of regex) {
            r[result.groups.res.toLowerCase()] = parseInt(result.groups.val, 10);
        }
        return {resources: r};
    },
    [MARKER_STATION_CARDS]: ([line]) => {
        return {cards: parseCards(line.substring(0, line.length - 1))};
    },
    [MARKER_STATION_LABOR]: lines => {
        try {
            if (!lines || lines.length < 1 || lines [0].trim() === 'None') {
                return false;
            }
            return {labor: parseInt(lines[0].match(REGEX_LABOR)[1], 10)};
        } catch (e) {
            return false;
        }
    },
    [MARKER_BUILDINGS]: lines => {
        return lines.length === 0 || lines[0].startsWith('None')
            ? {buildings: null}
            : {
                buildings: _
                    .chain(lines)
                    .filter(_.isNotNull)
                    .map(l => l.split(' - '))
                    .filter(_.isNotNull)
                    .map(o => {
                        // console.log(o);
                        const levelString = o[1].substring(6).trim();
                        return {
                            id: BUILDING_INDEX[o[0]],
                            level: !levelString.startsWith('unknown') && parseInt(levelString, 10)
                        }
                            ;
                    })
                    .value()
            };
    },
    [MARKER_QUEUE_BUILDINGS]: lines => {
        /*if(lines && lines.length>1){
            let progress;
            if(lines[0].startsWith('Upgrading')){
                progress = lines[0].match(/\s(\d+)/)[1]
            }
            _
                .chain(lines)
                .filter(_.isNotNull)
                .map(l => l.split(' - '))
                .filter(_.isNotNull)
                .map(o => {
                    // console.log(o);
                    const levelString = o[1].substring(6).trim();
                    return {
                        name: BUILDING_INDEX[o[0]],
                        level: !levelString.startsWith('unknown') && parseInt(levelString, 10)
                    }
                        ;
                })
                .value()
        }*/
        return {buildingQueue: lines};
    },
    [MARKER_QUEUE_FLEETS]: lines => {
        return {shipQueue: lines && lines.length === 1 && lines[0] === 'Empty' ? null : lines};
    },
    // [MARKER_STATION_HIDDEN_RES]: lines => {
    //
    // },
    [MARKER_FLEETS]: (lines) => {
        let supplied = undefined;
        const firstLine = lines[0];
        let i = 0;
        if (firstLine.trim().endsWith('are supplied by this station')) {
            supplied = parseInt(firstLine.split(' ')[0], 10);
            i++;
        } else if (firstLine.startsWith('None')) {
            return {
                fleets: {}
            };
        }

        let fleets = [];
        let info;
        const totalLines = lines.length;
        for (; i < totalLines; i++) {
            const l = lines[i];
            // console.log(l);
            try {
                if (l === null || l.trim() === '') {
                } else {
                    // console.log(l);
                    const match = l.match(REGEX_FLEET);
                    if (match !== null) {
                        const grps = match.groups;
                        // console.log(grps);
                        const qty = parseInt(grps.qty, 10);
                        const type = normalizeShipType(grps.type);
                        let fromPlayer = null;
                        let cards = null;
                        try {
                            if (!grps.noCards && i + 1 < totalLines) {
                                const nextLine = lines[i + 1];
                                if (nextLine.startsWith('Cards:')) {
                                    cards = parseCards(nextLine.substring(7, lines[i + 1].length - 1));
                                    // console.log('found cards: ',cards);
                                    //skiping nextline
                                    i++;

                                    if (!grps.player && i + 1 < totalLines) {
                                        // from player is onthe next line
                                        const playerMatchLine = lines[i + 1].match(/^From playerProfile\(([\d\w\s]+)\)/);
                                        if (playerMatchLine) {
                                            // console.log('matching ', playerMatchLine)
                                            fromPlayer = playerMatchLine.length > 1 && playerMatchLine[1];
                                            i++;
                                        }
                                    }
                                }
                            }
                            if (grps.noCards && grps.player) {
                                console.error(grps.player);
                                fromPlayer = grps.player;
                            }
                        } catch (e) {
                            info = 'Cannot read cards';
                            console.error(lines[i], e);
                        }
                        // console.log(`adding fleet of ${qty} ${type}`);
                        fleets.push({type, qty, cards, fromPlayer});
                    }
                }
            } catch (eregex) {
                console.error('fleet line parse error', eregex);
            }
        }

        return {
            fleets: {
                supplied,
                fleets
            }
        }
    }
    ,
    [MARKER_HANGAR]:
        lines =>
            ({
                hangar: _.chain(lines)
                    .map(l => {
                        return l.startsWith('None') ? null : l.match(REGEX_HANGAR).groups
                    })
                    .filter(_.isNotNull)
                    .map(({qty, type}) => ({qty: parseInt(qty, 10), type: normalizeShipType(type)}))
                    .value()
            }),
    [MARKER_OUTPOSTS]: lines => {
        return {
            outposts: lines.length === 0 || lines[0].startsWith('None') ? null
                : _.chain(lines)
                    .filter(_.isNotNull)
                    .map(l => l.split(' - '))
                    .filter(_.isNotNull)
                    .map(o => {
                        // console.log(o);
                        const levelString = o[1].substring(6).trim();

                        if (levelString.startsWith('??')) {
                            // console.log('found building', building);
                            return ({
                                name: o[0],
                                level: false
                            });
                        }

                        const level = parseInt(levelString, 10);
                        if (o.length > 2) {
                            const op = o[2];

                            return {
                                name: o[0],
                                level,
                                operational: op.startsWith('Operational'),
                                boosted: op.substring(11).trim().length > 0
                            }
                        }
                        return ({
                            id: o[0],
                            level
                        });
                    })
                    .value()
        };
    },
    [MARKER_STATION_HIDDEN_RES]: lines => {
        const regex = lines[0].matchAll(REGEX_STATION_RES);
        const r = {};
        if (!regex) return {resources: null};
        for (let result of regex) {
            r[result.groups.res.toLowerCase()] = parseInt(result.groups.val, 10);
        }
        return {hiddenResources: r};
    }
}

// privates

function parseSpyReport(raw) {
    const lines = raw.split('\n');
    let marker = MARKER_HEADER;
    let linesToProcess = [];
    let result = {};
    try {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.endsWith(':')) {
                // new marker, process last marker
                if (marker != null) {
                    // console.debug('processing ' + marker, byMarkers[marker]);
                    result = _.merge(result, PARSERS[marker](linesToProcess));
                }
                if (line === 'Construction Queues:') {
                    //skip
                    marker = null;
                } else {
                    marker = line.substring(0, line.length - 1);
                    // console.debug('New marker ' + marker);
                    linesToProcess = [];
                }
            } else if (line.startsWith(MARKER_CAPTURE)) {
                result = _.merge(result, PARSERS[MARKER_CAPTURE](line));
            } else {
                if (i > lines.length - 3 && line.startsWith('Could not get')) {
                    result.failedReport = true;
                } else {
                    if (line !== '')
                        linesToProcess.push(line.trim());
                }
            }
        }
        if (marker != null) {
            // console.debug('processing ' + marker, byMarkers[marker]);
            result = _.merge(result, PARSERS[marker](linesToProcess));
        }
    } catch (e) {
        console.error(`Marker ${marker} failed to process`, e)
    }

    return result;
}

/*

{
  HEADER: { name: 'Sol', x: 39, y: 134 },
  'Capture Defense': { current: 160, total: 160 },
  'Station Resources': { Metal: 49086, Gas: 33384, Crystal: 211866 },
  Cards: [ '2027', '9010', '9008', '9009', '2029', '2007' ],
  'Station Labor': 872,
  Buildings: [
    { name: 1, level: 10 },
    { name: 2, level: 6 },
    { name: 3, level: 10 },
    { name: 4, level: 10 },
    { name: '301', level: 1 },
    { name: '310', level: 1 },
    { name: 2002, level: 1 },
    { name: 3000, level: 1 },
    { name: 3001, level: 10 },
    { name: 3002, level: 10 },
    { name: 2102, level: 9 },
    { name: 3100, level: 1 },
    { name: 3101, level: 8 },
    { name: 3201, level: 1 },
    { name: 2200, level: 1 },
    { name: 2201, level: 1 },
    { name: 3301, level: 1 },
    { name: 3300, level: 5 },
    { name: 3, level: 10 }
  ],
  'Building Construction Queue': [
    'Upgrading 91 %',
    'RG Consortium - Level: 1',
    'Station Hall - Level: 10'
  ],
  'Fleet Construction Queue': [ 'Empty' ],
  'Station Hidden Resources': { Metal: 2560, Gas: 2560, Crystal: 2560 },
  Outposts: [
    {
      name: 'Mining Facility',
      level: 5,
      operational: true,
      boosted: true
    },
    {
      name: 'Trading Port',
      level: 5,
      operational: true,
      boosted: true
    },
    { name: 'Stargate', level: 5, operational: true, boosted: true },
    {
      name: 'Mining Colony',
      level: 4,
      operational: true,
      boosted: false
    }
  ],
  Fleets: { supplied: 2, fleets: [ [Object] ] },
  Hangar: [ { qty: 100, type: 1 }, { qty: 250, type: 2 } ],
  failedReport: false
}


* */

function computeStationModifiers({cards}) {
    _.chain([]).concat(report.cards)
}

function getFirepower(modifier, level) {
    return modifier && _.isNumber(modifier.firepower) ? modifier.firepower * level : 0;
}

function defaultFormatNumber(n) {
    return _.isNumber(n) ? numeral(n).format('0,0') : '?';
}

function formatHpNumber(n) {
    return numeral(n).format('0,0').padStart(10, ' ');
}

function formatFirepowerNumber(n) {
    return numeral(n).format('0,0').padStart(10, ' ');
}

const TEMPLATE_FLEETS_H1 = `__Fleets:__\`` + String().padStart(22, ' ') + '`';

function getFormattedReport(report) {
    const station = new Station(report);
    const {
        owner: name,
        coords: {x, y},
        captureDefense: {current, total},
        resources: {metal, gas, crystal},
        hiddenResources: {metal: hiddenMetal, gas: hiddenGas, crystal: hiddenCrystal},
        cards: stationCards,
        labor: labor,
        buildings: buildings,
        queues: {
            buildings: buildingQueue,
            ships: fleetQueue
        },
        outposts: outposts,
        fleets: {fleets, supplied},
        hangar: hangar,
        failedReport
    } = station;
    const fleetsDesc = _.invokeMap(fleets, 'get');
    // console.log(fleetsDesc);
    const totalBuildingHp = _.reduce(buildings,
        (result, {hp}, name) => result + hp, 0);
    // console.log(outposts);
    const [totalOutpostFirepower, totalOutpostHp] = _.reduce(outposts,
        (result, {hp, name, level}) =>
            [result[0] + getFirepower(modifiers.outposts[name], level), result[1] + hp], [0, 0]);
    const [totalFirepower, totalHp, totalBombing] = _.reduce(fleetsDesc,
        (result, {firepower, hp, bombing}) => [result[0] + firepower, result[1] + hp, result[2] + bombing], [0, 0, 0]);
    // console.log(buildingQueue);
    // console.log(fleetQueue);
    return `=== __**${name}**__ ===================\`/goto ${x} ${y}\`
:shield:  **${current}/${total}**:black_small_square::purple_square: ${defaultFormatNumber(metal)} | ${defaultFormatNumber(hiddenMetal)}:black_small_square::large_blue_diamond: ${defaultFormatNumber(gas)} | ${defaultFormatNumber(hiddenGas)}:black_small_square::green_square: ${defaultFormatNumber(crystal)} | ${defaultFormatNumber(hiddenCrystal)}:black_small_square::construction_worker: **${labor || 'None'}**
Cards:  ${_.map(stationCards, 'name').join(',')}

__Buildings:__ \`${formatHpNumber(totalBuildingHp).padStart(7, ' ')}\`:hearts:
${_.map(buildings, ({level: bLevel, name: bName}) =>
            `**${bLevel || '?'}** ${bName}`).join('\n') || '*empty*'
        }

__Outposts:__
${
            _.map(outposts, ({level: bLevel, operational: bOpe, boosted, hp, name: bName}) =>
                `${bOpe ? ':white_check_mark: ' : ':zzz: '}${boosted ? ':arrow_double_up:' : ':black_small_square:'}\`${formatHpNumber(hp)}\` :hearts: **${bLevel || '?'}** ${bName}`
            ).join('\n') || '*empty*'
        }

${TEMPLATE_FLEETS_H1} \`${formatFirepowerNumber(totalFirepower)} \`:boom: | \`${formatHpNumber(totalHp)} \`:hearts: | \`${formatFirepowerNumber(totalBombing)} \`:skull: `
        + (supplied ? ` | **${supplied}** supplied` : '')
        + '\n' + _.map(fleetsDesc,
            ({hp, firepower, bombing, qty, cards, fromPlayer, ship: {type}}) =>
                `\`${String(qty).padStart(5)}\` x \`${type.padStart(20)}\` \`${formatFirepowerNumber(firepower)} \`:black_small_square: | \`${formatHpNumber(hp)} \`:black_small_square: `
                + `| \`${formatFirepowerNumber(bombing || 0)} \`:black_small_square:`
                + (fromPlayer ? `From: \`${fromPlayer}\`` : '')
                + (cards && cards.length > 0 ? ':card_box: ||' + _.map(cards, c => c.name.substring(0, 15)
                //c => c.shortname || _.map(c.name.split(' '), namePart => namePart.substr(0,3)).join('')
                ).join(', ') + `||` : '')
        ).join('\n')
        + `\n__Hangar:__\n`
        + (_.map(hangar, ({qty, type}) => `${qty} x ${type}`
        ).join('\n') || '*empty*')

        + (buildingQueue && buildingQueue.length > 0 ? `\n\n__Building Construction Queue:__\n${buildingQueue.join('\n')}` : '')
        + (fleetQueue && fleetQueue.length > 0 ? `\n\n__Fleet Construction Queue:__\n${fleetQueue.join('\n')}` : '')
        + (failedReport ? `\`\`\`diff
- Spy report not reliable, your spy strength is lower than target spy defense.
\`\`\`` : '');
}


export default {
    PARSERS,
    normalizeShipType,
    parseSpyReport,
    getFormattedReport
};