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

export const modifiers = {
    buildings: {
        'Cadet School': {
            ships: {
                'Corvette': {firepower: 0.8, hp: 4},
                'Patrol Ship': {firepower: 0.8, hp: 4}
            }
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
}

export class Fleet {
    constructor(ship, qty = 0, cards = [], level = 0) {
        this.level = level;
        this.ship = ship;
        this.cards = cards;
        this.qty = qty;
    }

    get(stationCards) {
        const {firepower, hp} = getShipModifiers(this.ship, this.cards, stationCards);
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

            cards: this.cards,
            qty: this.qty,
            ship: {...this.ship}
        };
    }
}
function reduce(result, {cardFirepower, cardHp}){
    if (typeof cardFirepower === 'object') {
        if (cardFirepower.hasOwnProperty('rate'))
            result.firepower.rate += cardFirepower.rate * 100
        if (cardFirepower.hasOwnProperty('value'))
            result.firepower.value += cardFirepower.value * 100;
    } else if (_.isNumber(cardFirepower)) {
        result.firepower.value += cardFirepower * 100;
    }
    if (typeof cardHp === 'object') {
        if (cardHp.hasOwnProperty('rate'))
            result.hp.rate += cardHp.rate * 100
        if (cardHp.hasOwnProperty('value'))
            result.hp.value += cardHp.value * 100;
    } else if (_.isNumber(cardFirepower)) {
        result.hp.value += cardHp * 100;
    }
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
        }, {firepower: {rate: 100, value: 0}, hp: {rate: 100, value: 0}})
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

