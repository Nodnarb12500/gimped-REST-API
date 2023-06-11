const fs = require('fs');
const config = require('./config');

/* this file will generate logs for the server. */
var loggingReported = false; // this is so we can yell at the user in the console for disabling logs

function logConnection(req, loglevel) {
    if (!loglevel) {
        loglevel = "INFO";
    }

    logging("Connected Client "+ req.ip + " " + req.method + " " + req.path + " " + req.get('User-Agent'), loglevel);

    // apache log for reference
    // 127.0.0.1 - - [20/Jul/2021:00:00:05 -0400] "GET / HTTP/1.1" 200 9523 "-" "Munin - http_loadtime"
}

function logging(message, loglevel) {
    if (loggingReported === false) {
        if (config.loggingEnabled) {
            let message2log = "\n" + datetime() + " LOG LEVEL: " + "WARN" + "| " + "Logging Enabled! Logging to " + config.logpath;

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
            //console.log("LOG LEVEL: " + loglevel + "| " + message);
            console.log(message2log);

        }
        // open a file for writting, write 1 line, then close it
        var logStream = fs.createWriteStream(config.logpath, {flags: 'a+'});
        logStream.write(message2log + "\n");
        logStream.end();

        // logging this way can create some bugs, my log might not be busy now but people on windows might stuggle using this
        // fs.appendFile(config.logpath, message2log, (err) => {
        //     if (err) throw err;
        // });

    } else {
        // dont log
    }

}

function datetime() {
    //date and time down to seconds if thats not something already in nodeJS.

    const d = new Date();
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let day = d.getDate();

    var date = d.getMonth() + "/" + d.getDay() + "/" + d.getFullYear();
    var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

    var currentDateTime = date + " " + time;
    // var currentDateTime = d.getTime();
    return currentDateTime;

    // month++; // months start at 0 for soe reason

    // let date = month + "/" + day + "/" + year

}

module.exports = {
    logging,
    logConnection
}