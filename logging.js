const fs = require('fs');
const config = require('./config');

/* this file will generate logs for the server. */
var loggingReported = false; // this is so we can yell at the user in the console for disabling logs

let connectionLogger = (req, res, next) => { // Middleware Function!


    let method = req.method;
    let url = req.url;
    let status = res.statusCode;

    let start = process.hrtime();
    const durationInMilliseconds = getActualRequestDurationInMilliseconds(start);

    // let log = `[${formatted_date}] ${method}:${url} ${status}`;
    let log = `[${formatted_date}] ${method}:${url} ${status} ${durationInMilliseconds.toLocaleString()} ms`;
    console.log(log);
    next();
}

const getActualRequestDurationInMilliseconds = start => {
    const NS_PER_SEC = 1e9; // convert to nanoseconds
    const NS_TO_MS = 1e6; // convert to milliseconds
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
  };

function logConnection(req, loglevel) {
    if (!loglevel) {
        loglevel = "INFO";
    }
    // log the HTTP code to userAgent is questionable if its really needed
    // http code doesnt seem to be something thats easily obtainable right now
    logging("Connected Client "+ req.ip + " " + req.method + " " + req.path + " " + req.get('User-Agent'), loglevel);

    // apache log for reference
    // 127.0.0.1 - - [20/Jul/2021:00:00:05 -0400] "GET / HTTP/1.1" 200 9523 "-" "Munin - http_loadtime"
}

function logging(message, loglevel) {
    if (loggingReported === false) {
        if (config.loggingEnabled) {
            let message2log = "\n" + datetime("logging") + " LOG LEVEL: " + "WARN" + "| " + "Logging Enabled! Logging to " + config.logpath;

            console.log(message2log);

            let logStream = fs.createWriteStream(config.logpath, {flags: 'a'});
            logStream.write(message2log + "\n");
            logStream.end();

        } else if (config.loggingEnabled === false) {
            // logging is disabled
            console.log("LOG LEVEL: " + "WARN" + "| " + "Logging Disabled!");
        }
        loggingReported = true;
    }


    // open a file to a variable
    // logfile = fs.open(logPath) // open this file for appending

    if (config.loggingEnabled) {
        var message2log = datetime() + " " + "LOG LEVEL: " + loglevel + "| " + message;

        if (config.log2console) { 
            console.log(message2log);
        }
        
        var logStream = fs.createWriteStream(config.logpath, {flags: 'a+'}); // Open the file
        logStream.write(message2log + "\n"); // write the line
        logStream.end(); // close the file

    } else {
        // dont log
    }

}

function datetime(format, tokenExpire) {
    if (format == undefined) { format = "logging"; }

    const d = new Date();
    var result;

    if (format == "logging") {
        // this is the format I use for logging
        result = (d.getMonth() + 1) + "-" + d.getDay() + "/" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

    } else if (format == "token") {
        result = d.getTime() + config.expireTime;

    } else if (format == "tokenCheck") {
        // valid?
        if (tokenExpire < d.getTime()) { result = false; } 
        else if (tokenExpire > d.getTime()) { result = true; }

    } else { 
        console.log("Something unexpected happened in logging.js");
    }

    return result;
}

module.exports = {
    logging,
    connectionLogger,
    datetime
}