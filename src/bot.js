require('dotenv').config();

import Spy from "./spy-lib";
import {distance} from "./lib";
import Discord from "discord.js";
import logger from "winston";
import axios from "axios";
import http from 'http';
import fs from 'fs';

const download = function (url, dest, cb) {
    const file = fs.createWriteStream(dest);
    const request = http.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(cb);  // close() is async, call cb after close completes.
        });
    }).on('error', function (err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        if (cb) cb(err.message);
    });
};
// Configure logger settings

console.log("starting");
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
const bot = new Discord.Client();
if (process.env.TOKEN_DEV) {
    logger.info('Using DEV token');
    bot.login(process.env.TOKEN_DEV);
} else if (process.env.TOKEN_PROD) {
    logger.info('Using PROD token');
    bot.login(process.env.TOKEN_PROD);
} else {
    logger.error('Missing token');
    process.exit(-1);
}
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

const regexDistance = /^(?<x1>-?\d+)\s(?<y1>-?\d+)\s(?<x2>-?\d+)\s(?<y2>-?\d+)\D*$/i;
bot.on('message', function (e) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!
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

        } catch (e) {
            console.log(e);
        }
        e.delete();

    } else if (e.attachments && e.content.startsWith('/spy')) {
        e.attachments.each(attachment => {
            if (attachment.name === 'message.txt') {
                axios
                    .get(attachment.url, {responseType: 'text'})
                    .then(({data}) => {
                        if (data.startsWith('Spy Report on hex')) {
                            const parsed = Spy.parseSpyReport(data);
                            // console.log(parsed);
                            e.channel.send(
                                Spy.getEmbed(parsed)
                                    .setAuthor(e.author.username)
                            );
                            e.delete();
                        }
                    });
            }
        })
    }

});