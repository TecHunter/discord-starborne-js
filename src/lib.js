import _ from 'lodash';

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

//https://www.redblobgames.com/grids/hexagons/
// axial coords
export const distance = function hex_distance(a, b) {
    return (Math.abs(a.q - b.q)
        + Math.abs(a.q + a.r - b.q - b.r)
        + Math.abs(a.r - b.r)) / 2;
}
export const BUILDING_STATS = {
    building: [[
        {cost: [166, 66, 100, 4 * 60 + 13], hp: 84, influence: 0.13},
        {cost: [388, 155, 233, 9 * 60 + 50], hp: 281, influence: 0.43},
        {cost: [775, 310, 465, 19 * 60 + 41], hp: 675, influence: 1.04},
        {cost: [1218, 487, 731, 30 * 60 + 56], hp: 1294, influence: 1.98},
        {cost: [1661, 664, 997, 42 * 60 + 11], hp: 2138, influence: 3.28},
        {cost: [2159, 864, 1296, 54 * 60 + 50], hp: 3234, influence: 4.96},
        {cost: [2713, 1085, 1628, 3600 + 8 * 60 + 54], hp: 4613, influence: 7.07},
        {cost: [3322, 1329, 1993, 3600 + 24 * 60 + 22], hp: 6300, influence: 9.66},
        {cost: [4208, 1683, 2525, 3600 + 46 * 60 + 52], hp: 8438, influence: 12.94},
        {cost: [5537, 2215, 3322, 2 * 3600 + 20 * 60 + 37], hp: 11250, influence: 17.25}
    ],
        [
            {cost: [374, 623, 249, 15 * 60], hp: 300, influence: 0.46},
            {cost: [795, 1325, 530, 31 * 60 + 52], hp: 938, influence: 1.44},
            {cost: [1281, 2135, 854, 51 * 60 + 22], hp: 1965, influence: 3.01},
            {cost: [1917, 3195, 1278, 1 * 3600 + 16 * 60 + 52], hp: 3503, influence: 5.37},
            {cost: [2749, 4582, 1833, 1 * 3600 + 50 * 60 + 15], hp: 5708, influence: 8.75},
            {cost: [3647, 6079, 2431, 2 * 3600 + 26 * 60 + 15], hp: 8633, influence: 13.24},
            {cost: [4610, 7684, 3074, 3 * 3600 + 4 * 60 + 52], hp: 12330, influence: 18.91},
            {cost: [5798, 9663, 3865, 3 * 3600 + 52 * 60 + 30], hp: 16980, influence: 26.04},
            {cost: [7257, 12095, 4838, 4 * 3600 + 51 * 60], hp: 22800, influence: 34.96},
            {cost: [8978, 14963, 5985, 6 * 3600], hp: 30000, influence: 46.00}
        ],
        [
            {cost: [1083, 433, 650, 24 * 60 + 45], hp: 495, influence: 0.76},
            {cost: [2313, 925, 1388, 52 * 60 + 52], hp: 1553, influence: 2.38},
            {cost: [3741, 1496, 2244, 3600 + 25 * 60 + 30], hp: 3263, influence: 5.00},
            {cost: [5414, 2166, 3248, 2 * 3600 + 3 * 60 + 45], hp: 5738, influence: 8.80},
            {cost: [7235, 2894, 4341, 2 * 3600 + 45 * 60 + 22], hp: 9045, influence: 13.87},
            {cost: [9450, 3780, 5670, 3 * 3600 + 36 * 60 + 13], hp: 365, influence: 20.49},
            {cost: [12108, 4843, 7265, 4 * 3600 + 36 * 60 + 45], hp: 18900, influence: 28.98},
            {cost: [15455, 6182, 9273, 5 * 3600 + 53 * 60 + 15], hp: 25965, influence: 39.81},
            {cost: [18998, 7599, 11399, 7 * 3600 + 14 * 60 + 15], hp: 34650, influence: 53.13},
            {cost: [22641, 9056, 13584, 8 * 3600 + 37 * 60 + 30], hp: 45000, influence: 69.00}
        ],
        [
            {cost: [2067, 827, 1240, 45 * 60], hp: 900, influence: 1.38},
            {cost: [4272, 1709, 2563, 1 * 3600 + 33 * 60], hp: 2760, influence: 4.23},
            {cost: [6615, 2646, 3969, 2 * 3600 + 24 * 60], hp: 5640, influence: 8.65},
            {cost: [9096, 3638, 5457, 3 * 3600 + 18 * 60], hp: 9600, influence: 14.72},
            {cost: [11714, 4686, 7028, 4 * 3600 + 15 * 60], hp: 14700, influence: 22.54},
            {cost: [14470, 5788, 8682, 5 * 3600 + 15 * 60], hp: 21000, influence: 32.20},
            {cost: [17364, 6946, 10419, 6 * 3600 + 18 * 60], hp: 28560, influence: 43.79},
            {cost: [20534, 8214, 12320, 7 * 3600 + 27 * 60], hp: 37500, influence: 57.50},
            {cost: [23979, 9592, 14388, 8 * 3600 + 42 * 60], hp: 47940, influence: 73.51},
            {cost: [27700, 11080, 16620, 10 * 3600 + 3 * 60], hp: 60000, influence: 92.00}

        ]],

    outpost: [
        [
            //T1
            {hp: 22000}, {hp: 44000}, {hp: 66000}, {hp: 88000}, {hp: 118800},
        ],
        [
            //T2
            {hp: 30800},
            {hp: 44000},
            {hp: 88000},
            {hp: 176000},
            {hp: 242000}
        ],
        [
            //T3
            {hp: 176000}, {hp: 264000}, {hp: 352000}, {hp: 440000}, {hp: 598400}
        ],
        [
            //T4
            {hp: 352000}, {hp: 440000}, {hp: 528000}, {hp: 616000}, {hp: 792000}
        ],
        [
            //CSA
            {hp: 528000}, {hp: 616000}, {hp: 704000}, {hp: 792000}, {hp: 1056000}
        ]
    ],
    csa: [
        {hp: 528000}, {hp: 616000}, {hp: 704000}, {hp: 792000}, {hp: 1056000}
    ],
    org: [
        [{hp: 10500}],
        [{hp: 30750}],
        [{hp: 46500}],
        [{hp: 62250}]

    ],
    seat: [
        {cost: [8741, 8741, 8741, 15 * 3600], hp: 1500, influence: 5.00},
        {cost: [8829, 8829, 8829, 20 * 3600], hp: 3015, influence: 10.05},
        {cost: [9003, 9003, 9003, 1 * 24 * 3600 + 2 * 3600 + 40 * 60], hp: 4560, influence: 15.20},
        {cost: [9353, 9353, 9353, 1 * 24 * 3600 + 6 * 3600], hp: 6165, influence: 20.55},
        {cost: [9965, 9965, 9965, 1 * 24 * 3600 + 9 * 3600 + 20 * 60], hp: 7875, influence: 26.25},
        {cost: [10927, 10927, 10927, 1 * 24 * 3600 + 12 * 3600 + 40 * 60], hp: 9750, influence: 32.50},
        {cost: [12325, 12325, 12325, 1 * 24 * 3600 + 16 * 3600], hp: 11865, influence: 39.55},
        {cost: [14248, 14248, 14248, 1 * 24 * 3600 + 19 * 3600 + 20 * 60], hp: 14310, influence: 47.70},
        {cost: [16783, 16783, 16783, 1 * 24 * 3600 + 22 * 3600 + 40 * 60], hp: 17190, influence: 57.30},
        {cost: [20017, 20017, 20017, 2 * 24 * 3600 + 2 * 3600], hp: 20625, influence: 68.75},
        {cost: [24038, 24038, 24038, 2 * 24 * 3600 + 10 * 3600 + 20 * 60], hp: 24750, influence: 82.50},
        {cost: [28934, 28934, 28934, 2 * 24 * 3600 + 18 * 3600 + 40 * 60], hp: 29715, influence: 99.05},
        {cost: [35140, 35140, 35140, 3 * 24 * 3600 + 11 * 3600 + 20 * 60], hp: 35745, influence: 119.15},
        {cost: [43094, 43094, 43094, 4 * 24 * 3600 + 4 * 3600], hp: 43140, influence: 143.80},
        {cost: [53234, 53234, 53234, 5 * 24 * 3600 + 13 * 3600 + 20 * 60], hp: 52275, influence: 174.25},
        {cost: [66434, 66434, 66434, 6 * 24 * 3600 + 22 * 3600 + 40 * 60], hp: 63675, influence: 212.25},
        {cost: [84003, 84003, 84003, (7 + 1) * 24 * 3600 + 8 * 3600], hp: 78090, influence: 260.30},
        {cost: [107037, 107037, 107037, (7 + 3) * 24 * 3600 + 10 * 3600], hp: 96458, influence: 321.53},
        {cost: [136713, 136713, 136713, (7 + 4) * 24 * 3600 + 2 * 3600 + 40 * 60], hp: 119918, influence: 399.73},
        {cost: [175306, 175306, 175306, (7 + 6) * 24 * 3600 + 21 * 3600 + 20 * 60], hp: 150000, influence: 500.00}
    ]
};
export const modifiers = {
    buildings: {
        "Living Quarters": {tier: 1},
        "Crystal Refinery": {tier: 1},
        "Gas Refinery": {tier: 1},
        "Metal Refinery": {tier: 1},
        'Department of Acquisitions': {
            tier: 2,
            ships: {
                'Corvette': {raiding: {plunder: {rate: 2}, cargo: {rate: 5}}},
                'Patrol Ship': {raiding: {plunder: {rate: 2}, cargo: {rate: 5}}},
                'Destroyer': {raiding: {plunder: {rate: 2}, cargo: {rate: 5}}},
                'Frigate': {raiding: {plunder: {rate: 2}, cargo: {rate: 5}}}
            }
        },
        'Fleet Docks': {
            tier: 1,
            ships: {
                'Corvette': {cost: {time: {rate: 3}}},
                'Patrol Ship': {cost: {time: {rate: 3}}}
            }
        },
        'Military Barracks': {
            tier: 1,
            shipClasses: {
                light: {labor: -3},
                heavy: {labor: -3},
                capital: {labor: -3}
            }
        },

        "Container Port": {tier: 1},
        "Docking Bay": {tier: 1},
        "Implant Clinic": {tier: 1},
        "Plasma Chamber": {tier: 1},
        "Search and Rescue HQ": {tier: 1},
        "Trailer Manufacturing": {tier: 1},

        // T2
        'Cadet School': {
            tier: 2,
            ships: {
                'Corvette': {firepower: 0.8, hp: 4},
                'Patrol Ship': {firepower: 0.8, hp: 4}
            }
        },
        'Scout Command': {
            tier: 2,
            ships: {
                'Scout': {firepower: 0.8, hp: 4}
            }
        },
        "Communication Array": {tier: 2},
        "Docking Services": {tier: 2},
        "Frachead Assembly": {tier: 2},
        "Military Hangars": {tier: 2},
        "Resource Bazaar": {tier: 2},
        "Station Hall": {tier: 2},
        "Warehouse": {tier: 2},

        // T3
        'Barricades': {
            tier: 3,
            buildings: {hp: {rate: 2}},
            station: {capture: 4}
        },

        "Distribution Hub": {tier: 3},
        "Drone Launch Facility": {tier: 3},
        "Internal Affairs": {tier: 3},
        "Navy Academy": {tier: 3},
        "Outpost Management Services": {tier: 3},
        "Relocation Bureau": {tier: 3},
        "Sector Command": {tier: 3},
        "Strategic Division": {tier: 3},

        // T4
        "Campaign Directorate": {tier: 4},
        "Colonial Relay": {tier: 4},
        "Governor's Mansion": {tier: 4},
        "Industrial Complex": {tier: 4},
        "Institute of Technology": {tier: 4},
        "MIC Offices": {tier: 4},
        "Public Transport": {tier: 4},
        "Trucker's Hall": {tier: 4},
        "War Council": {tier: 4},

        // Seat
        "The Seat": {tier: 1, type: 'seat'},

        //Orgs
        //T1
        "Civic Intelligence": {tier: 1, type: 'org'},
        "Helios Express": {tier: 1, type: 'org'},
        "Les Apaches": {tier: 1, type: 'org'},
        "Royal Pilot School": {tier: 1, type: 'org'},
        "Solheim Institute": {tier: 1, type: 'org'},
        "Trans-Galactic Exports": {tier: 1, type: 'org'},

        //T2
        "Ataka": {tier: 2, type: 'org'},
        "Bellicose Industries": {tier: 2, type: 'org'},
        "Nightcorps": {tier: 2, type: 'org'},
        "Primwell & Hauft": {tier: 2, type: 'org'},
        "Romberg DSR": {tier: 2, type: 'org'},
        "Zirachi Brothers": {tier: 2, type: 'org'},
        //T3
        "Craft Logistics": {tier: 3, type: 'org'},
        "Expedialis": {tier: 3, type: 'org'},
        "Gatos Fritos": {tier: 3, type: 'org'},
        "Gubernatorial Colonial": {tier: 3, type: 'org'},
        "Huang's Emporium": {tier: 3, type: 'org'},
        "RG Consortium": {tier: 3, type: 'org'},
        //T4
        "Chattle's Human Resources": {tier: 4, type: 'org'},
        "Magna Exercitus": {tier: 4, type: 'org'},
        "New Horizons": {tier: 4, type: 'org'},
        "Orbital Synfonica": {tier: 4, type: 'org'},
        "Prospect Inc.": {tier: 4, type: 'org'},
        "Robwell Freight Brokerage": {tier: 4, type: 'org'}

    },
    outposts: {
        'Mining Facility': {tier: 1},
        'Trading Port': {tier: 2},
        'Scanner': {tier: 2},
        'Missile Battery': {
            firepower: 8000,
            tier: 2
        },
        Fortress: {tier: 3},
        Stargate: {tier: 3},
        'Logistics Hub': {tier: 3},
        'Mining Colony': {tier: 4},
        'Habitation Dome': {tier: 4},
        'Heavy Ship Assembly': {tier: 4},
        'Capital Ship Assembly': {
            type: 'csa',
            tier: 1
        }
    },
    cards: {
        'Ablative Armor': {
            name: 'Ablative Armor',
            shortname: 'AblArm',
            shipClasses: {
                light: {hp: 50},
                heavy: {hp: 250},
                capital: {hp: 1250}
            }
        },
        'Ammunition Bay': {
            name: 'Ammunition Bay',
            shortname: 'AmmuBay',
            buildings: {
                Fortress: {influence: 1},
                Station: {harvest: {rate: 10}}
            }
        },
        'Antimatter Missile': {
            name: 'Antimatter Missile',
            shortname: 'AMMiss',
            ships: {
                Gunship: {
                    bombing: 80
                }
            }
        },
        'Antimatter Torpedo': {
            name: 'Antimatter Torpedo',
            shortname: 'AMTorp',
            ships: {
                Gunship: {
                    bombing: 40
                }
            }
        },
        'AP Rounds': {
            name: 'AP Rounds',
            shortname: 'APRnds',
            shipClasses: {
                heavy: {
                    bombing: 5
                },
                capital: {
                    bombing: 25
                }
            }
        },
        'APEX Mining Laser': {
            name: 'APEX Mining Laser',
            shortname: 'ApexML',
            outposts: {
                'Mining Colony': {influence: 1, harvest: {rate: 5}}
            }
        },
        'Arc Veil': {
            name: 'Arc Veil',
            shortname: 'ArcV',
            ships: {
                Industrial: {time: {rate: -20}}
            }
        },
        'Armed Garrison': {
            name: 'Armed Garrison',
            shortname: 'ArmGarr',
            outposts: {
                'Missile Battery': {influence: 1}
            }
        },
        'Astral Confluence': {
            name: 'Astral Confluence',
            shortname: 'AsConfl',
            shipClasses: {
                capital: {time: {rate: -15}}
            }
        },
        'Atomic Maser': {
            name: 'Atomic Maser',
            shortname: 'AtoMas',
            shipClasses: {
                light: {firepower: 15},
                heavy: {firepower: 75},
                capital: {firepower: 375}
            }
        },
        'Atomized Coating': {
            name: 'Atomized Coating',
            shortname: 'AtoCoat',
            shipClasses: {
                light: {hp: 20},
                heavy: {hp: 100},
                capital: {hp: 500}
            }
        },
        'Auto-Aim System': {
            name: 'Auto-Aim System',
            shortname: 'AAimSys',
            shipClasses: {
                light: {firepower: {rate: 12}},
                heavy: {firepower: {rate: 12}},
                capital: {firepower: {rate: 12}}
            }
        }

    },
    faction: {}
};

export class Ship {
    constructor(props) {
        this.type = props.type;
        this.shipClass = props.shipClass;
        this.labor = props.labor;
        this.cost = props.cost;
        this.speed = props.speed;
        this.firepower = props.firepower;
        this.hp = props.hp;
        this.cargo = props.cargo;
        this.scan = props.scan;
        this.stealth = props.stealth;
        this.bombing = props.bombing;
        this.perLevel = props.perLevel;
    }

    getHp(level = 0) {
        return (this.perLevel.hp || 0) * level + this.hp;
    }

    getFirepower(level = 0) {
        return (this.perLevel.firepower || 0) * level + this.firepower;
    }

    getBombing(level = 0) {
        return (this.perLevel.bombing || 0) * level + this.bombing;
    }
}

export class Fleet {
    constructor(ship, qty = 0, cards = [], level = 0) {
        this.level = level;
        this.ship = ship;
        this.cards = cards;
        this.qty = qty;
    }

    get(stationCards) {
        const {firepower, hp, bombing} = getShipModifiers(this.ship, this.cards, stationCards);
        return {
            hp: (
                    this.ship.getHp(this.level) * 100
                    + (hp && _.isNumber(hp.value) ? hp.value * 100 : 0)
                )
                * this.qty
                * (hp && _.isNumber(hp.rate) && hp.rate !== 100 ? hp.rate : 100)
                / 10000,

            firepower: (
                    this.ship.getFirepower(this.level) * 100
                    + (firepower && _.isNumber(firepower.value) ? firepower.value : 0)
                )
                * this.qty
                * (firepower && _.isNumber(firepower.rate) && firepower.rate !== 100 ? firepower.rate : 100)
                / 10000,

            bombing: (
                    this.ship.getBombing(this.level) * 100
                    + (bombing && _.isNumber(bombing.value) ? bombing.value : 0)
                )
                * this.qty
                * (bombing && _.isNumber(bombing.rate) && bombing.rate !== 100 ? bombing.rate : 100)
                / 10000,

            cards: this.cards,
            qty: this.qty,
            ship: {...this.ship}
        };
    }
}
function _getRateAndValue(stats, result, stat) {
    if (typeof stats === 'object') {
        if (stats.hasOwnProperty('rate'))
            result[stat].rate += stats.rate * 100
        if (stats.hasOwnProperty('value'))
            result[stat].value += stats.value * 100;
    } else if (_.isNumber(stats)) {
        result[stat].value += stats * 100;
    }
}
function reduce(result, {cardFirepower, cardHp, cardBombing}) {
    _getRateAndValue(cardFirepower, result, 'firepower');
    _getRateAndValue(cardHp, result, 'hp');
    _getRateAndValue(cardBombing, result, 'bombing');
}

export function getShipModifiers({type, shipClass}, fleetCards = [], stationCards = []) {
    return _.chain(fleetCards)
        .concat(stationCards)
        .filter(_.isNotNull)
        .map(({name}) => modifiers.cards[name])
        .filter(_.isNotNull)
        .reduce((result, cardModifier, key) => {
            // console.log(cardModifier);
            if (cardModifier.shipClasses && cardModifier.shipClasses[shipClass]) {
                reduce(result, cardModifier.shipClasses[shipClass]);
            }
            if (cardModifier.ships && cardModifier.ships[type]) {
                reduce(result, cardModifier.ships[type]);
            }

            return result;
        }, {firepower: {rate: 100, value: 0}, bombing: {rate: 100, value: 0}, hp: {rate: 100, value: 0}})
        .value();
}

export const baseShipStats = {
    'Patrol Ship': new Ship({
        type: 'Patrol Ship',
        shipClass: 'light',
        labor: 1,
        cost: [75, 50, 125, 450],
        speed: 6,
        firepower: 80,
        hp: 200,
        cargo: 50,
        scan: 0,
        stealth: 0,
        bombing: 0,
        perLevel: {hp: 10, firepower: 4}
    }),
    'Corvette': new Ship({
        type: 'Corvette',
        shipClass: 'light',
        labor: 1,
        cost: [100, 60, 40, 300],
        speed: 8,
        firepower: 60,
        hp: 150,
        cargo: 10,
        scan: 0,
        stealth: 0,
        bombing: 0,
        perLevel: {cargo: 2, firepower: 6}
    }),
    'Scout': new Ship({
        type: 'Scout',
        shipClass: 'light',
        labor: 1,
        cost: [90, 150, 60, 600],
        speed: 8,
        firepower: 70,
        hp: 175,
        cargo: 5,
        scan: 0.75,
        stealth: 0,
        bombing: 0,
        perLevel: {hp: 8.75, firepower: 3.5}
    }),
    'Industrial': new Ship({
        type: 'Industrial',
        shipClass: 'light',
        labor: 2,
        cost: [200, 200, 200, 16 * 60],
        speed: 3,
        firepower: 0,
        hp: 400,
        cargo: 100,
        scan: 0,
        stealth: 0,
        bombing: 0,
        perLevel: {speed: 1}
    }),

    'Destroyer': new Ship({
        type: 'Destroyer',
        shipClass: 'heavy',
        labor: 3,
        cost: [550, 330, 220, 16 * 60],
        speed: 8,
        firepower: 300,
        hp: 750,
        cargo: 40,
        scan: 0,
        stealth: 0,
        bombing: 0,
        perLevel: {cargo: 8, firepower: 30}
    }),
    'Frigate': new Ship({
        type: 'Frigate',
        shipClass: 'heavy', labor: 3,
        cost: [413, 275, 688, 24 * 60],
        speed: 6,
        firepower: 400,
        hp: 1000,
        cargo: 20,
        scan: 0,
        stealth: 0,
        bombing: 0,
        perLevel: {hp: 50, firepower: 20}
    }),
    'Recon': new Ship({
        type: 'Recon',
        shipClass: 'heavy', labor: 3,
        cost: [495, 825, 330, 1920],
        speed: 8,
        firepower: 350,
        hp: 875,
        cargo: 20,
        scan: 1.5,
        stealth: 0,
        bombing: 0,
        perLevel: {hp: 43.75, firepower: 17.5}
    }),
    'Gunship': new Ship({
        type: 'Gunship',
        shipClass: 'heavy', labor: 6,
        cost: [1650, 990, 660, 3600],
        speed: 5,
        firepower: 400,
        hp: 1000,
        cargo: 10,
        scan: 0,
        stealth: 0,
        bombing: 80,
        perLevel: {bombing: 80, firepower: 20, hp: 50}
    }),
    'Troop Carrier': new Ship({
        type: 'Troop Carrier',
        shipClass: 'heavy',
        labor: 200,
        cost: [250000, 250000, 250000, 24 * 3600],
        speed: 3,
        firepower: 400,
        hp: 1000,
        cargo: 100,
        scan: 0,
        stealth: 0,
        bombing: 0,
        perLevel: {speed: 1}
    }),
    'Carrier': new Ship({
        type: 'Carrier',
        shipClass: 'capital',
        labor: 9,
        cost: [4400, 2640, 1760, 3840],
        speed: 6,
        firepower: 2000,
        hp: 5000,
        cargo: 100,
        scan: 0,
        stealth: 0,
        bombing: 0,
        perLevel: {hp: 250, firepower: 100}
    }),
    'Dreadnought': new Ship({
        type: 'Dreadnought',
        shipClass: 'capital',
        labor: 9,
        cost: [2640, 1760, 4400, 4800],
        speed: 6,
        firepower: 1800,
        hp: 4500,
        cargo: 50,
        scan: 0,
        stealth: 0,
        bombing: 100,
        perLevel: {firepower: 180, bombing: 10}
    })
};

