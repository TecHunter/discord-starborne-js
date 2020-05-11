import Spy, {MARKERS} from '../src/spy-lib';
import {describe, it} from "mocha";
import {expect} from 'chai';

const testSimpleReport = `Spy Report on hex (39,134) Sol completed 0 seconds ago.
Spies had a total scan strength of 43(base) + 10(roll) = 53, against a spy defense rating of 41.
Our spying operation remained undetected.

Capture Defense: 160/160

Station Resources: 
Metal 49086     Gas 33384     Crystal 211866     

Cards: 
cardTooltip(2027) Crystal Vault, cardTooltip(9010) Waste Processing, cardTooltip(9008) Build Queue Extension, cardTooltip(9009) Ship Queue Extension, cardTooltip(2029) Mining Robots, cardTooltip(2007) Flare Monitors.


Station Labor: 
Labor 872     
Buildings: 
Living Quarters - Level: 10
Metal Refinery - Level: 6
Gas Refinery - Level: 10
Crystal Refinery - Level: 10
Helios Express - Level: 1
Zirachi Brothers - Level: 1
Docking Bay - Level: 1
Container Port - Level: 1
Plasma Chamber - Level: 10
Trailer Manufacturing - Level: 10
Station Hall - Level: 9
Frachead Assembly - Level: 1
Warehouse - Level: 8
Distribution Hub - Level: 1
Internal Affairs - Level: 1
Relocation Bureau - Level: 1
Industrial Complex - Level: 1
Trucker's Hall - Level: 5
Gas Refinery - Level: 10

Construction Queues:
Building Construction Queue:
Upgrading 91 %
RG Consortium - Level: 1
Station Hall - Level: 10

Fleet Construction Queue:
Empty

Station Hidden Resources: 
Metal 2560     Gas 2560     Crystal 2560     
Outposts: 
Mining Facility - Level 5 - Operational Boosted(Low)
Trading Port - Level 5 - Operational Boosted(Low)
Stargate - Level 5 - Operational Boosted(Low)
Mining Colony - Level 4 - Operational

Fleets: 
2 fleets are supplied by this station
300 Industrials
Cards: cardTooltip(1059) MPL Harvester, cardTooltip(1050) Smuggler's Hold, cardTooltip(1056) HDL System, cardTooltip(1070) Spatial Convex, cardTooltip(1065) Borts.


Hangar: 
Nemo (Corvette) 100
Faust (Patrol Ship) 250`;

const testSimpleReportParsed = {
    HEADER: { name: 'Sol', x: 39, y: 134 },
    'Capture Defense': { current: 160, total: 160 },
    'Station Resources': { Metal: 49086, Gas: 33384, Crystal: 211866 },
    'Station Labor': 872,
    Buildings: {
        'Living Quarters': {level: 10},
        'Metal Refinery': {level: 6},
        'Gas Refinery': {level: 10},
        'Crystal Refinery': {level: 10},
        'Helios Express': {level: 1},
        'Zirachi Brothers': {level: 1},
        'Docking Bay': {level: 1},
        'Container Port': {level: 1},
        'Plasma Chamber': {level: 10},
        'Trailer Manufacturing': {level: 10},
        'Station Hall': {level: 9},
        'Frachead Assembly': {level: 1},
        'Warehouse': {level: 8},
        'Distribution Hub': {level: 1},
        'Internal Affairs': {level: 1},
        'Relocation Bureau': {level: 1},
        'Industrial Complex': {level: 1},
        'Trucker\'s Hall': {level: 5},
        'Gas Refinery 2': {level: 10},
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

describe('SpyParser Complex Reports', function () {
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
