import _ from 'lodash';
import DefUnits from "./server_data/UNIT_DEFINITIONS.json";
import DefBuildings from "./server_data/BUILDING_DEFINITIONS.json";
import DefOutpost from "./server_data/OUTPOST_DEFINITIONS.json";
import {FleetCards, StationCards} from "./server_data/CARDS.json";

const MAX_FLEET_LEVEL = DefUnits.FleetExperienceLevelThresholds.length;
/**
 * @param {string} a
 * @param {string} b
 * @return {number}
 * {@link https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/string/levenshtein-distance/levenshteinDistance.js}
 */
export const levenshteinDistance = function levenshteinDistance(a, b) {
    // Create empty edit distance matrix for all possible modifications of
    // substrings of a to substrings of b.
    const distanceMatrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    // Fill the first row of the matrix.
    // If this is first row then we're transforming empty string to a.
    // In this case the number of transformations equals to size of a substring.
    for (let i = 0; i <= a.length; i += 1) {
        distanceMatrix[0][i] = i;
    }

    // Fill the first column of the matrix.
    // If this is first column then we're transforming empty string to b.
    // In this case the number of transformations equals to size of b substring.
    for (let j = 0; j <= b.length; j += 1) {
        distanceMatrix[j][0] = j;
    }

    for (let j = 1; j <= b.length; j += 1) {
        for (let i = 1; i <= a.length; i += 1) {
            const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
            distanceMatrix[j][i] = Math.min(
                distanceMatrix[j][i - 1] + 1, // deletion
                distanceMatrix[j - 1][i] + 1, // insertion
                distanceMatrix[j - 1][i - 1] + indicator, // substitution
            );
        }
    }

    return distanceMatrix[b.length][a.length];
};


export class Building {
    constructor({Id, Name, Stats, Effects, LevelCap, TierAffinity}) {
        this.id = Id;
        this.name = Name;
        this.stats = Stats;
        this.tier = TierAffinity && TierAffinity.length > 0 ? TierAffinity[0] : TierAffinity || 0;
        this.maxLevel = LevelCap;
        this.effects = Effects;
        this.perLevelHp = _.chain(this.stats)
            .filter(['TargetAttribute', "STAT_B_HP"])
            .flatMap('ModifierArray')
            .value();
    }

    getHp(level = 1) {
        return this.perLevelHp[Math.min(this.maxLevel, level) - 1];
    }
}

export class Outpost {
    constructor({Name, Stats, Effects, MaxOutpostLevel, TierAffinity}) {
        this.name = Name;
        this.stats = Stats;
        this.tier = TierAffinity && TierAffinity.length > 0 ? TierAffinity[0] : TierAffinity || 0;
        this.effects = Effects;
        this.maxLevel = MaxOutpostLevel;
        this.perLevelHp = _.chain(this.stats)
            .filter(['TargetAttribute', "OP_HITPOINTS"])
            .flatMap('ModifierArray')
            .map(s => s.replace(/,/g, ''))
            .map(s => parseInt(s, 10))
            .value();
    }

    getHp(level = 1) {
        return this.perLevelHp[Math.min(this.maxLevel, level) - 1];
    }
}


export class Ship {
    constructor({
                    "Name": name,
                    AltName: altName,
                    ShipClass: shipClass,
                    "Type": type,
                    "StringId": id,
                    Stats
                }) {
        const {
            "COST_UPKEEP": labor,
            "COST_MTL": metal,
            "COST_GAS": gas,
            "COST_CRS": crystal,
            "COST_TIME": time,
            "UNIT_FIREPOWER": fp,
            "UNIT_HP": hp,
            "UNIT_XPVAL": xpValue,
            "UNIT_SPD": speed,
            "UNIT_FSIZE": fleetSize,
            "UNIT_CARGO": cargo,
            "UNIT_SCANSTR": scanStr,
            "UNIT_SIGINT": stealth,
            "UNIT_BOMB": bombing
        } = Stats || {};
        this.type = type;
        this.name = name;
        this.altName = altName;
        this.shipClass = shipClass;
        this.labor = labor;
        this.cost = {metal, gas, crystal};
        this.UNIT_SPD = parseInt(speed, 10);
        this.UNIT_FIREPOWER = parseInt(fp, 10) || 0;
        this.UNIT_HP = parseInt(hp, 10) || 0;
        this.UNIT_CARGO = parseInt(cargo, 10) || 0;
        this.UNIT_SCANSTR = parseInt(scanStr, 10) || 0;
        this.UNIT_SIGINT = parseInt(stealth, 10) || 0;
        this.UNIT_BOMB = parseInt(bombing, 10) || 0;

        this.progression = _.chain(DefUnits.StatProgression)
            .filter(['Target', this.altName])
            .filter(['Type', 'Modifier'])
            .value()
        this.perLevelHp = _.chain(this.progression)
            .filter(['TargetAttribute', "UNIT_HP"])
            .flatMap('ModifierArray')
            .map(s => typeof s === 'string' ? s.replace(/[,']/g, '') : s)
            .map(s => parseInt(s, 10))
            .map(levelStat => hp + levelStat)
            .value();
        this.perLevelFirepower = _.chain(this.progression)
            .filter(['TargetAttribute', "UNIT_FIREPOWER"])
            .flatMap('ModifierArray')
            .map(s => typeof s === 'string' ? s.replace(/[,']/g, '') : s)
            .map(s => parseInt(s, 10))
            .map(levelStat => fp + levelStat)
            .value();
        this.perLevelBombing = _.chain(this.progression)
            .filter(['TargetAttribute', "UNIT_BOMB"])
            .flatMap('ModifierArray')
            .map(s => typeof s === 'string' ? s.replace(/[,']/g, '') : s)
            .map(s => parseInt(s, 10))
            .map(levelStat => bombing + levelStat)
            .value();
    }

    getHp(level = 0) {
        return this.perLevelHp && this.perLevelHp.length > level ? this.perLevelHp[level] : this.UNIT_HP;
    }

    getFirepower(level = 0) {
        return this.perLevelHp && this.perLevelHp.length > level ? this.perLevelFirepower[level] : this.UNIT_FIREPOWER;
    }

    getBombing(level = 0) {
        return this.perLevelBombing && this.perLevelBombing.length > level ? this.perLevelBombing[level] : this.UNIT_BOMB;
    }
}

const UNITS = _.chain(DefUnits.Units).keyBy('Type').value();
const BUILDINGS = _.chain(DefBuildings.BuildingTypes).keyBy('Id').map(b => new Building(b)).value();
const OUTPOSTS = _.chain(DefOutpost.Definitions).keyBy('Name').value();


const FLEET_CARD_INDEX = _.chain(FleetCards).keyBy('ID').value();
const STATION_CARD_INDEX = _.chain(StationCards).keyBy('ID').value();
const CARDS = {...FLEET_CARD_INDEX, ...STATION_CARD_INDEX};

const BUILDING_INDEX = _.chain(DefBuildings.BuildingTypes).keyBy('Name').mapValues('Id').value();


//https://www.redblobgames.com/grids/hexagons/
// axial coords
export const distance = function hex_distance(a, b) {
    return (Math.abs(a.q - b.q)
        + Math.abs(a.q + a.r - b.q - b.r)
        + Math.abs(a.r - b.r)) / 2;
}


const UNIT_INDEX = _.chain(DefUnits.Units).keyBy('Name').mapValues(o => new Ship(o)).value();
const SHIP_TYPES = Object.keys(UNIT_INDEX);
const SHIP_TYPES_LEN = SHIP_TYPES.length;

function safeSum(a, b, def = 0) {
    return ((_.isNumber(a) ? a * 100 : def * 100) + (_.isNumber(b) ? a * 100 : def * 100)) / 100
}

function getModifier(stat, qty, modifier) {
    return (
            stat * 100
            + (modifier && _.isNumber(modifier.value) ? modifier.value * 100 : 0)
        )
        * qty
        * (modifier && _.isNumber(modifier.rate) && modifier.rate !== 200 ? modifier.rate - 100 : 100)
        / 10000;
}

export class Fleet {
    constructor({ship, qty = 0, cards, level = 0, fromPlayer}) {
        this.level = level;
        this.ship = ship;
        this.cards = cards;
        this.qty = qty;
        this.fromPlayer = fromPlayer;
    }

    get({cards, buildings}) {
        // const {firepower, hp, bombing} = getShipModifiers(this.ship, this.cards, cards);
        const {UNIT_FIREPOWER: cardsFirepower, UNIT_HP: cardsHp, UNIT_BOMB: cardsBombing} = getShipModifiers(this.ship, this.cards, cards);
        const {UNIT_FIREPOWER: buildingFirepower, UNIT_HP: buildingHp, UNIT_BOMB: buildingBombing} = getBuildingShipModifiers(this.ship, buildings);
        const hp = {
            rate: safeSum(cardsHp && cardsHp.rate, buildingHp && buildingHp.rate, 100),
            value: safeSum(cardsHp && cardsHp.value, buildingHp && buildingHp.value)
        };
        const firepower = {
            rate: safeSum(cardsFirepower && cardsFirepower.rate, buildingFirepower && buildingFirepower.rate, 100),
            value: safeSum(cardsFirepower && cardsFirepower.value, buildingFirepower && buildingFirepower.value)
        };
        const bombing = {
            rate: safeSum(cardsBombing && cardsBombing.rate, buildingBombing && buildingBombing.rate, 100),
            value: safeSum(cardsBombing && cardsBombing.value, buildingBombing && buildingBombing.value)
        };

        const modifiers = {
            hp: getModifier(this.ship.getHp(0), this.qty, hp),
            firepower: getModifier(this.ship.getFirepower(0), this.qty, firepower),
            bombing: getModifier(this.ship.getBombing(0), this.qty, bombing),
            maxHp: getModifier(this.ship.getHp(MAX_FLEET_LEVEL), this.qty, hp),
            maxFirepower: getModifier(this.ship.getFirepower(MAX_FLEET_LEVEL), this.qty, firepower),
            maxBombing: getModifier(this.ship.getBombing(MAX_FLEET_LEVEL), this.qty, bombing)
        };
        return {...this, modifiers};
    }
}

const applyRestrictions = ({altName, shipClass}) =>
    ({Restrictions}) => {
        // find if has restrictions and it applies correctly
        if (!Restrictions) {
            return true;
        }
        const rest = _.filter(Restrictions, ['$type', 'AllowedShipTypes']);
        if (!rest || rest.length === 0) return true;
        //TODO only one restriction possible?
        return _.filter(rest[0].Types, name => name === altName || name === shipClass).length > 0;
    };
const applyTargetDest = ({altName, shipClass}) =>
    ({Destination, Target, Conditions}) => !Conditions
        && (Destination === 'FleetsInRange' || Destination === 'Fleets' || Destination === 'EmpireFleets')
        && (Target === altName || Target === shipClass || Target === 'Fleet');

export function getShipModifiers({type, altName, shipClass}, fleetCards = [], stationCards = []) {
    return _.chain(fleetCards)
        .concat(stationCards)
        .filter(_.isNotNull)
        .map(id => CARDS[id])
        .filter(applyRestrictions({type, altName, shipClass}))
        .filter(_.isNotNull)
        .flatMap('Effects')
        .filter(({Destination, Target, Conditions, ...o}) => {
            return !Conditions
                && (Destination === 'FleetsInRange' || Destination === 'Fleets' || Destination === 'EmpireFleets')
                && (Target === altName || Target === shipClass || Target === 'Fleet');
        })
        .filter(_.isNotNull)
        .filter(effect => {
            const {Destination, Target} = effect;
            console.log({type, altName, shipClass, Destination, Target})
            return (Destination === 'FleetsInRange' || Destination === 'Fleets' || Destination === 'EmpireFleets')
                && Target === altName || Target === shipClass || Target === 'Fleet'
        })
        .reduce((result, {TargetAttribute, Type, Modifier, Origin}, key) => {
            console.log(`Applying effect from ${Origin}`, {TargetAttribute, Type, Modifier});
            const {[TargetAttribute]: attr = {rate: 100, value: 0}, ...r} = result;
            const {rate, value} = attr;
            if (Type === 'Modifier') {
                return {
                    ...r,
                    [TargetAttribute]: {rate, value: value + Modifier}
                }
            } else if (Type === 'PercentageModifier' || Type === 'Multiplier') {
                return {
                    ...r,
                    [TargetAttribute]: {rate: rate + Modifier * 100, value: value}
                }
            }
            return result;
        }, {})
        .value();
}

export function getBuildingShipModifiers({type, altName, shipClass}, buildings) {
    return _.chain(buildings)
        .filter(applyRestrictions({type, altName, shipClass}))
        .filter(_.isNotNull)
        .reduce((result, {level, effects}, key) => {
            return _.chain(effects)
                .filter(({Conditions, Destination}) => !Conditions && Destination === 'FleetsInRange')
                .map(({UseArray, ModifierArray, TargetAttribute, Type, Modifier, Origin}) => {
                    if (UseArray) {
                        return {UseArray, ModifierArray, TargetAttribute, Type, Modifier: ModifierArray[level], Origin}
                    }
                    return {UseArray, ModifierArray, TargetAttribute, Type, Modifier, Origin}
                })
                .filter(_.isNotNull)
                .reduce((subResult, {TargetAttribute, Type, Modifier}) => {
                    // const {UseArray, ModifierArray, TargetAttribute, Type, Modifier, Origin} = effects;
                    const {[TargetAttribute]: attr = {rate: 100, value: 0}, ...r} = subResult;
                    const {rate, value} = attr;
                    if (Type === 'Modifier') {
                        return {
                            ...r,
                            [TargetAttribute]: {rate, value: value + Modifier}
                        }
                    } else if (Type === 'PercentageModifier' || Type === 'Multiplier') {
                        return {
                            ...r,
                            [TargetAttribute]: {rate: rate + Modifier * 100, value: value}
                        }
                    }
                    return subResult;
                }, result).value();
        }, {})
        .value();
}

export class Station {
    constructor({
                    station: {name, x, y},
                    captureDefense,
                    resources: {metal, gas, crystal},
                    hiddenResources: {metal: hiddenMetal, gas: hiddenGas, crystal: hiddenCrystal},
                    cards,
                    labor,
                    buildings,
                    buildingQueue,
                    fleetQueue,
                    outposts,
                    fleets: {fleets, supplied},
                    hangar,
                    failedReport,
                    ...others
                }) {
        this.captureDefense = captureDefense;
        this.fleets = _.map(fleets, ({type, ...o}) => new Fleet({...o, ship: UNIT_INDEX[type]}));
        this.hangar = hangar;
        this.resources = {metal, gas, crystal};
        this.hiddenResources = {hiddenCrystal, hiddenGas, hiddenMetal};
        this.coords = {x, y};
        this.owner = name;
        this.cards = cards;
        this.buildings = _.map(buildings, ({id, level}) => ({id, level, building: BUILDINGS[id]}));
        this.labor = labor;
        this.queues = {
            buildings: buildingQueue,
            ships: fleetQueue
        }
        this.outposts = outposts;
        this.suppliedFleets = supplied;
        this.incompleteReport = failedReport;
    }

    getFleets() {
        return _.map(this.fleets, f => f.get(this));
    }
}

export default {
    UNITS,
    BUILDINGS,
    OUTPOSTS,
    UNIT_INDEX,
    BUILDING_INDEX,
    SHIP_TYPES,
    SHIP_TYPES_LEN
};