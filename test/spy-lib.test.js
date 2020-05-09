import Spy, {MARKERS} from '../spy-lib';
import {describe, it} from "mocha";
import {expect} from 'chai';

const testSimpleReport = `Spy Report on hex (14,131) Some-Dude completed 1 hours and 11 minutes ago.
Spies had a total scan strength of 30(base) + 17(roll) = 47, against a spy defense rating of 40.
Our spying operation remained undetected.

Capture Defense: 159/160

Station Resources:
Metal 34530     Gas 3450     Crystal 670

Station Labor:
Labor 930
Buildings:
Living Quarters - Level: 10
Metal Refinery - Level: 9
Gas Refinery - Level: 10
Crystal Refinery - Level: 10
Military Barracks - Level: 10
Fleet Docks - Level: 10
Container Port - Level: 10
Department of Acquisitions - Level: 10
Frachead Assembly - Level: 6
Military Hangars - Level: 6
Cadet School - Level: 6
Distribution Hub - Level: 2
Outpost Management Services - Level: 2
Drone Launch Facility - Level: 2
Colonial Relay - Level: 4
Industrial Complex - Level: 2
Governor's Mansion - Level: 4

Station Hidden Resources:
Metal 8516     Gas 6104     Crystal 12699
Outposts:
Mining Facility - Level 5 - Operational
Mining Colony - Level 3 - Operational
Trading Port - Level 2 - Operational

Fleets:
87 Corvettes
1 Patrol Ship
160 Industrials
1 Scout
33 Scouts

Hangar:
Faust (Patrol Ship) 34
`;

const complexSpyReport = `
Spy Report on hex (214,420) Another-Dude completed 18 minutes ago.
Spies had a total scan strength of 34(base) + 20(roll) = 54, against a spy defense rating of 40.
Our spying operation remained undetected.

Capture Defense: 160/160

Station Resources: 
Metal 192061     Gas 142325     Crystal 194273     

Cards: 
cardTooltip(2010) Ionization Chamber, cardTooltip(2007) Flare Monitors, cardTooltip(2006) Mlat Scanners.


Station Labor: 
Labor 800     
Buildings: 
Living Quarters - Level: 10
Metal Refinery - Level: 10
Gas Refinery - Level: 9
Crystal Refinery - Level: 10
Helios Express - Level: 1
Ataka - Level: 1
Expedialis - Level: 1
Orbital Synfonica - Level: 1
Plasma Chamber - Level: 10
Military Barracks - Level: 3
Fleet Docks - Level: 1
Department of Acquisitions - Level: 1
Scout Command - Level: 1
Docking Services - Level: 1
Warehouse - Level: 7
Strategic Division - Level: 6
Relocation Bureau - Level: 4
Navy Academy - Level: 1
Institute of Technology - Level: 2
MIC Offices - Level: 7
War Council - Level: 1

Construction Queues:
Building Construction Queue:
Upgrading 3 %
MIC Offices - Level: 8

Fleet Construction Queue:
Progress: 78 %
31 Gunships 

Station Hidden Resources: 
None

Outposts: 
Stargate - Level 5 - Operational
Heavy Ship Assembly - Level 5 - Operational

Fleets: 
1 fleets are supplied by this station
0 Gunship - No cards. 
300 Industrials
Cards: cardTooltip(1050) Smuggler's Hold, cardTooltip(1060) Sanctum Harvester.

1 Scout
Cards: cardTooltip(1027) MPL Probe Battery, cardTooltip(1039) Remote Hacking.

1 Scout
Cards: cardTooltip(1031) E-Ghil Thrusters, cardTooltip(1027) MPL Probe Battery, cardTooltip(1038) Isolation Chamber.

1 Scout
Cards: cardTooltip(1026) Basic Battery Pack, cardTooltip(1038) Isolation Chamber.

1 Scout - No cards. 

Hangar: 
Hawking (Scout) 1
Banshee (Gunship) 51
VermifaxYesterday at 9:22 PM
inactive person I think dropped from MAD
Spy Report on hex (-69,347) Heathrew completed 17 minutes ago.
Spies had a total scan strength of 30(base) + 12(roll) = 42, against a spy defense rating of 10.
Our spying operation remained undetected.

Capture Defense: 40/40

Station Resources: 
Metal 12000     Gas 12000     Crystal 12000

Station Labor: 
Labor 459
Buildings: 
Living Quarters - Level: 7
Metal Refinery - Level: 8
Gas Refinery - Level: 8
Crystal Refinery - Level: 8
Department of Acquisitions - Level: 3
Trailer Manufacturing - Level: 3
Plasma Chamber - Level: 3
Military Barracks - Level: 5

Station Hidden Resources: 
None

Outposts: 
None

Fleets: 
28 Corvettes 
5 Patrol Ships 
59 Patrol Ships 
90 Industrials 
6 Scouts 
24 Scouts 
26 Scouts 

Hangar: 
Faust (Patrol Ship) 34
`;

const testSimpleReportParsed = {
    HEADER: { name: 'Some-Dude', x: 14, y: 131 },
    'Capture Defense': { current: 159, total: 160 },
    'Station Resources': { Metal: 34530, Gas: 3450, Crystal: 670 },
    'Station Labor': 930,
    Buildings: {
        'Living Quarters': { level: 10 },
        'Metal Refinery': { level: 9 },
        'Gas Refinery': { level: 10 },
        'Crystal Refinery': { level: 10 },
        'Military Barracks': { level: 10 },
        'Fleet Docks': { level: 10 },
        'Container Port': { level: 10 },
        'Department of Acquisitions': { level: 10 },
        'Frachead Assembly': { level: 6 },
        'Military Hangars': { level: 6 },
        'Cadet School': { level: 6 },
        'Distribution Hub': { level: 2 },
        'Outpost Management Services': { level: 2 },
        'Drone Launch Facility': { level: 2 },
        'Colonial Relay': { level: 4 },
        'Industrial Complex': { level: 2 },
        "Governor's Mansion": { level: 4 }
    },
    'Station Hidden Resources': { Metal: 8516, Gas: 6104, Crystal: 12699 },
    Outposts: {
        'Mining Facility': { level: 5, operational: true },
        'Mining Colony': { level: 3, operational: true },
        'Trading Port': { level: 2, operational: true }
    },
    Fleets: [
        { qty: 87, type: 'Corvette' },
        { qty: 1, type: 'Patrol Ship' },
        { qty: 160, type: 'Industrial' },
        { qty: 1, type: 'Scout' },
        { qty: 33, type: 'Scout' }
    ],
    Hangar: [ { qty: 34, type: 'Patrol Ship' } ]
};

const parsed = Spy.parseSpyReport(testSimpleReport);
console.debug(parsed);

describe('SpyParser', function () {
    describe('#normalizeShipType()', function () {
        it('should normalize plural', function () {
            expect(Spy.normalizeShipType('Corvettes')).to.equal('Corvette');
        });
    });
    describe('#parseSpyReport()', function () {
        it('should return an object', function () {
            expect(parsed).to.be.an('object');
        });
        it('should return correct position and name', function () {
            expect(parsed).to.have.any.keys(MARKERS.MARKER_HEADER);
            expect(parsed[MARKERS.MARKER_HEADER]).to.deep.equal({
                x: 14, y: 131, name: 'Some-Dude'
            });
        });
        it('should return correct capture def', function () {
            expect(parsed).to.have.any.keys(MARKERS.MARKER_CAPTURE);
            expect(parsed[MARKERS.MARKER_CAPTURE]).to.deep.equal({current: 159, total: 160});
        });
        it('should return correct resources', function () {
            expect(parsed).to.have.any.keys(MARKERS.MARKER_STATION_RES);
            expect(parsed[MARKERS.MARKER_STATION_RES]).to.have.keys('Metal', 'Gas', 'Crystal');
            expect(parsed[MARKERS.MARKER_STATION_RES]).to.deep.equal({
                Metal: 34530,
                Gas: 3450,
                Crystal: 670
            });
        });
        it('should return correct Label', function () {
            expect(parsed).to.have.any.keys(MARKERS.MARKER_STATION_LABOR);
            expect(parsed[MARKERS.MARKER_STATION_LABOR]).to.equal(930);
        });
        it('should return correct buildings', function () {
            expect(parsed).to.have.any.keys(MARKERS.MARKER_BUILDINGS);
            // expect(Object.keys(parsed[MARKERS.MARKER_BUILDINGS])).to.have.lengthOf(17);
            expect(parsed[MARKERS.MARKER_BUILDINGS]).to.deep.include({
                'Living Quarters': {level: 10},
                'Metal Refinery': {level: 9},
                'Gas Refinery': {level: 10},
                'Crystal Refinery': {level: 10},
                'Military Barracks': {level: 10},
                'Fleet Docks': {level: 10},
                'Container Port': {level: 10},
                'Department of Acquisitions': {level: 10},
                'Frachead Assembly': {level: 6},
                'Military Hangars': {level: 6},
                'Cadet School': {level: 6},
                'Distribution Hub': {level: 2},
                'Outpost Management Services': {level: 2},
                'Drone Launch Facility': {level: 2},
                'Colonial Relay': {level: 4},
                'Industrial Complex': {level: 2},
                'Governor\'s Mansion': {level: 4},
            });
        });
        it('should return correct hidden resources', function () {
            expect(parsed).to.have.any.keys(MARKERS.MARKER_STATION_HIDDEN_RES);
            expect(parsed[MARKERS.MARKER_STATION_HIDDEN_RES]).to.have.keys('Metal', 'Gas', 'Crystal');
            expect(parsed[MARKERS.MARKER_STATION_HIDDEN_RES]).to.deep.include({
                Metal: 8516,
                Gas: 6104,
                Crystal: 12699
            });
        });
        it('should return correct outposts', function () {
            expect(parsed).to.have.any.keys(MARKERS.MARKER_OUTPOSTS);
            expect(parsed[MARKERS.MARKER_OUTPOSTS]).to.deep.equal({
                'Mining Facility': {level: 5, operational: true},
                'Mining Colony': {level: 3, operational: true},
                'Trading Port': {level: 2, operational: true}
            });
        });

        it('should return correct fleets', function () {
            expect(parsed).to.have.any.keys(MARKERS.MARKER_FLEETS);
            expect(parsed[MARKERS.MARKER_FLEETS]).to.have.deep.members([
                { qty: 87, type: 'Corvette' },
                { qty: 1, type: 'Patrol Ship' },
                { qty: 160, type: 'Industrial' },
                { qty: 1, type: 'Scout' },
                { qty: 33, type: 'Scout' }
            ]);
        });

        it('should return correct hangar', function () {
            expect(parsed).to.have.any.keys(MARKERS.MARKER_HANGAR);
            expect(parsed[MARKERS.MARKER_HANGAR]).to.have.deep.members([
                {type: 'Patrol Ship', qty: 34}
            ]);
        });

    });
});
