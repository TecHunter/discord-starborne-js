require('dotenv').config();

import Spy from "./spy-lib";
import {distance} from "./lib";
import Discord from "discord.js";
import logger from "winston";
import axios from "axios";
import _ from 'lodash';
// import http from 'http';
// import fs from 'fs';
// import redis from 'redis';
// const redisClient = redis.createClient();


// Configure logger settings

console.log("starting");
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'info';
// redisClient.on("error", function(error) {
//     logger.error(error);
// });

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
    // bot.user.setGame("Starborne");
    // bot.user.setStatus("online");
    logger.info('Shard online');
});

const patreon = 'https://www.patreon.com/techunter_chaos'
const helpEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Support me on Patreon!')
    .setURL(patreon)
    .setAuthor('TecHunter')
    .setDescription('Starborne Tool list of commands')
    .addFields(
        {name: 'Get hex distance', value: '`/distance x1 y1 x2 y2`'},
        {name: 'Spy report', value: 'send raw report in chat\nyou can also mention someone in the very first char\n'
        + 'i.e. `@techunter Spy Report on hex [...]`'
        },
        // {name: 'Last Spy report', value: '`/spy x y`\nwill try to remember the last known report in this channel for hex (x,y)'},
    )
    .addField('Big spy report', 'add `/spy [some message]` in the message when uploading file(s)', true)
    .setImage('https://i.ibb.co/hddtj03/big-Report.png')
    .setTimestamp();

const regexDistance = /^(?<x1>-?\d+)\s(?<y1>-?\d+)\s(?<x2>-?\d+)\s(?<y2>-?\d+)\D*$/i;

function getKey({channel, author}, {x, y}) {

    let key = channel.guild.id + ':' + channel.id + ':' + x + ':' + y;
    if (author) {
        return key + ':' + author.id;
    }
    return key + ':*'
}

function registerReport(key, report) {
    try {
        //console.log(key, JSON.stringify(report))
        // client.set("key", "value", redis.print);
        // client.get("key", redis.print);
    } catch (e) {
        logger.error(e);
    }
}

function getPrefix({author}) {
    return `:detective:  <@${author.id}>`;
}

function send({channel, author, createdAt}, report, extra) {
    report.timestamp = createdAt;
    // registerReport(getKey({channel, author}, report.HEADER), report);
    const prefix = getPrefix({author}) + (extra ? `: ${extra}` : '');
    const message = prefix + Spy.getFormattedReport(report);
    // console.log(`message size: ${message.length}`);
    if (message.length >= 2000)
        for (let i = 0; i < message.length;) {
            const chunkSize = Math.min(message.length - i + 4, 2000);
            // console.log(`sending part of ${chunkSize} long`);
            const lastIndexCRLF = message.substring(i, i + chunkSize - 4).lastIndexOf('\n');
            const realChunkSize = lastIndexCRLF > 0 ? lastIndexCRLF : chunkSize - 4;
            // console.log({i, realChunkSize});
            channel.send('>>> ' + message.substring(i, i + realChunkSize));
            if (lastIndexCRLF > 0) {
                i = i + realChunkSize + 1; //ignoring next char since it's `\n`
            } else {
                i = i + realChunkSize;
            }

        }
    else
        channel.send(`>>> ` + message);
}

const REPORT_REGEX = /^(<@![a-z0-9]+>)?\s?Spy\sReport\son\shex/i
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
    } else if (e.content.startsWith('/spy')) {

        if (e.attachments && e.attachments.size > 0) {
            // console.log('parsing')
            const extra = e.content.substring(4).trim();
            e.attachments.each(attachment => {
                axios
                    .get(attachment.url, {responseType: 'text'})
                    .then(({data}) => {
                        if (data.startsWith('Spy Report on hex')) {
                            const parsed = Spy.parseSpyReport(data);
                            // console.log(parsed);
                            send(e, parsed, extra);
                            // e.delete();
                        }
                    });
            })
        } else {
            const commands = e.content.substr(4).trimLeft().match(/^(-?\d+) (-?\d+)/i);
            if (!commands || commands.length !== 3) {
                e.channel.send(helpEmbed);
            } else {
                const x = parseInt(commands[1], 10);
                const y = parseInt(commands[2], 10);
                if (_.isNaN(x) || _.isNaN(y)) {
                    e.channel.send('Invalid coordinates, use `/spy {x} {y}`')
                } else {
                    console.log('getting report for ' + getKey({channel: e.channel}, {x, y}))
                }
            }
        }
    } else {
        const reportMatch = e.content.match(REPORT_REGEX);
        if (reportMatch) {
            try {
                const parsed = Spy.parseSpyReport(reportMatch.length > 0 && reportMatch[1] ? e.content.substring(reportMatch[1].length+1) : e.content);
                // console.log(parsed);
                send(e, parsed, reportMatch.length > 0 && reportMatch[1]);
                e.delete();
            } catch (e) {
                console.log(e);
            }

        }
    }

});

export default bot;