import Spy from "./spy-lib";
import {distance} from "./lib";
import Discord from "discord.js";
import logger from "winston";
import auth from "./auth.json";
// Configure logger settings
console.log("starting");
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
const bot = new Discord.Client();
bot.login(auth.token);
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

/*
Spy Report on hex (16,231) JS-Vermi-Z completed 1 hours and 11 minutes ago.
Spies had a total scan strength of 30(base) + 17(roll) = 47, against a spy defense rating of 40.
Our spying operation remained undetected.

Capture Defense: 160/160

Station Resources:
Metal 0     Gas 0     Crystal 0

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
None
 */

const regexDistance = /^(?<x1>-?\d+)\s(?<y1>-?\d+)\s(?<x2>-?\d+)\s(?<y2>-?\d+)\D*$/i;
bot.on('message', function (e) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (e.content.startsWith('/distance')) {
        try {
            // console.log(e.content.substring(10));
            const {x1, y1, x2, y2} = e.content.substring(10).match(regexDistance).groups;
            const a = {q: parseInt(x1, 10), r: parseInt(y1, 10)};
            const b = {q: parseInt(x2, 10), r: parseInt(y2, 10)};
            // console.log({a,b});
            if (typeof a.q === "number" && typeof a.r === "number" && typeof b.q === "number" && typeof b.r === "number")
                e.channel.send(`Distance between (${a.q},${a.r}) and (${b.q},${b.r}) = ${distance(a, b)} hex`);

        } catch (e) {
            console.error(e);
        }
    } else if (e.content.substring(0, 17) === 'Spy Report on hex') {
        try {
            const parsed = Spy.parseSpyReport(e.content);
            // console.log(parsed);
            e.channel.send(
                Spy.getEmbed(parsed)
                    .setAuthor(e.author.username)
            );
            e.delete();
        } catch (e) {
            console.log(e);
        }
    }
});