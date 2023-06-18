const fs = require('fs');
const config = require('./config');

const RateLimit = require('express-rate-limit');

/* this file will generate logs for the server. */
var loggingReported = false; // this is so we can yell at the user in the console for disabling logs

var connectionLogger = (req, res, next) => { // Middleware Function!
    formatted_date = datetime("logging");
    let ip = req.ip;
    let method = req.method;
    let url = req.url;
    let start = process.hrtime();
    const durationInMilliseconds = getActualRequestDurationInMilliseconds(start);
    let log;

    if (res.headersSent) {
        let status = res.statusCode; // this does nothing if something 404s it doesnt know
        log = `${ip} ${method}:${url} ${status} ${durationInMilliseconds.toLocaleString()} ms`;
        logging(log, "INFO");
    } else {
        res.on('finish', () => {
            let status = res.statusCode; // this does nothing if something 404s it doesnt know
            log = `${ip} ${method}:${url} ${status} ${durationInMilliseconds.toLocaleString()} ms`;
            logging(log, "INFO");
        });
    }
    next(); // head to the next function
}

const getActualRequestDurationInMilliseconds = start => {
    const NS_PER_SEC = 1e9; // convert to nanoseconds
    const NS_TO_MS = 1e6; // convert to milliseconds
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
}

var limiter = RateLimit({
    // 10 requests per minute per IP
    msWindow: 1*60*1000, // 1 minute?
    max: 10
})



function logging(message, loglevel) {
    /**
     * maybe move this somewhere else?
     * tell the user in the console if logging is enabled or disabled
     */
    if (loggingReported === false) {
        if (config.loggingEnabled) {
            let message2log = "\n" + datetime("logging") + " LOG LEVEL: " + "WARN" + "| " + "Logging Enabled! Logging to " + config.logpath;

            console.log(message2log);

            let logStream = fs.createWriteStream(config.logpath, {flags: 'a'});
            logStream.write(message2log + "\n");
            logStream.end();

        } else if (config.loggingEnabled === false) {
            console.log("LOG LEVEL: " + "WARN" + "| " + "Logging Disabled!");
        }
        loggingReported = true;
    }

    /* Log if logging is enabled do logging stuff */
    if (config.loggingEnabled) {
        let message2log = `${datetime("logging")} [${loglevel}] | ${message}`;

        if (config.log2console) { 
            console.log(message2log);
        }
        
        // change logpath to a directory create directory if it doesnt exist and create a file based on what day it is!

        var logStream = fs.createWriteStream(config.logpath, {flags: 'a+'}); // Open the file
        logStream.write(message2log + "\n"); // write the line
        logStream.end(); // close the file

    } else {
        // dont log
    }

}

function datetime(format, tokenExpire) {
    if (format == undefined) { format = "logging"; }

    let current_datetime = new Date();
    var result;

    if (format == "logging") {
        return `[${current_datetime.getFullYear()}-${(String(current_datetime.getMonth() + 1)).padStart(2, 0)}-${String(current_datetime.getDate()).padStart(2, 0)} ${String(current_datetime.getHours()).padStart(2, 0)}:${String(current_datetime.getMinutes()).padStart(2, 0)}:${String(current_datetime.getSeconds()).padStart(2, 0)}]`;

    } else if (format == "token") {
        result = current_datetime.getTime() + config.expireTime;

    } else if (format == "tokenCheck") {
        // valid?
        if (tokenExpire < current_datetime.getTime()) { result = false; } 
        else if (tokenExpire > current_datetime.getTime()) { result = true; }

    } else { 
        console.log("Something unexpected happened in logging.js");
    }

    return result;
}

module.exports = {
    logging,
    connectionLogger,
    limiter,
    datetime
}