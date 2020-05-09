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
    cards: {},
    faction: {}
};

export const baseShipStats = {
    'Patrol Ship': {
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
    },
    'Corvette': {
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
    },
    'Scout': {
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
    },
    'Industrial': {
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
    },

    'Destroyer': {
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
    },
    'Frigate': {
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
    },
    'Recon': {
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
    },
    'Gunship': {
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
    },
    'Troop Carrier': {
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
    },
    'Carrier': {
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
    },
    'Dreadnought': {
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
    }
}