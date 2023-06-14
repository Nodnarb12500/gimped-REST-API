/* 
This file will hold all of the variables that will be used across all files on the server.

in some cases a variable might not be included here if its consitered a risk. but im not entirely sure what 
might be risky to have here.
*/

// SERVER

// this work as a hostname but this server doesnt care about what host name you use it should just work
const listenAddress = "192.168.1.145";

// what port do you want to server to run on.
const listenPort = 3000;

// If your not behind a proxy you trust set this to false. default is true because thats how I use it
const trustProxy = true;

// Currently this file is relative to index.js
const databaseFile = "db/demo.sqlite3";


// USER MANAGEMENT

// this is allowed by default so that you can create an account once you start the server
// the login page is listenAddress:3000/signup (eg. 192.168.1.145:3000/signup).
// if you arent on a headless server http://localhost:3000/signup will work
const signUpAllowed = true;


// this is a placeholder i dont know what 10 would even mean here
// this will eventually set the expiry time for when the tokens should expire
// this can be an equation 
// This is Miliseconds, the default value is 7days
const expireTime = 1000 * 60 * 60 * 24 * 7;

// LOGGING
// Do you want to server to generate logs? 
const loggingEnabled = true;

// where do you want the logs to be stored
const logpath = "server.log";

// what do you want the server to log? currently debug is the only thing that exists
const loglevel = "DEBUG";

// do you want to log to the console And to a file (logging to file doesnt do anything yet)
const log2console = true;

module.exports = {
    listenAddress,
    listenPort,
    trustProxy,
    databaseFile,
    signUpAllowed,
    expireTime,
    loggingEnabled,
    logpath,
    log2console,
    loglevel
}

