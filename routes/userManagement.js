const express = require("express");
const app = express();

const fs = require("node:fs");
const bcrypt = require("bcrypt");
const crypto = require("crypto");


const db = require("../db/database");
const verification = require("../verification");
const logging = require("../logging");
const config = require("../config");

/*
This file is for managing user account creation logging in and generating and providing tokens
*/

/* Signup Page */
app
.get("/signup", async (req, res) => {
  if (config.signUpAllowed) {
      res.status(200).sendFile('website/html/signup.html', {root: __dirname});
    } else {
      res.status(418).json({"Error":"Signup isnt allowed!"}); // cant find an error code that matches to we're a teapot
    }
})

.post("/signup", async (req, res) => {
  // this is where the data will be sent to create the account in the database
  // resend the signup page but with an execute code
  let table =  "userAccounts";
  if (config.signUpAllowed == true) {
    // if signup is allowed make sure we arent creating an account with a username already in use
    
    const test = await db.getRow(table, req.body.username);
    try {
      var userExists = (req.body.username === test[0].username);
    } catch (error) {
      logging.logging(`Creating an account for ${req.body.username} in ${table}`, "INFO");
    }

    if (userExists === true) { // if name exists send error, if it doesnt exist make the account
      logging.logging(req.ip + " Attempted to use a username already created", "DEBUG");
      res.status(200).json({"Error":"Username already in use!"});

    } else {
      verification.hashPassword(req.body.username, req.body.password).then(async userCreds => {        
        const results = await db.createRow(table, userCreds);
        res.status(201).json({"Success!":`User account ${req.body.username} created!`});

      });
    }

  } else {
    // signup not allowed
    logging.logging(req.ip + " Attempted signup but signup is disabled!", "INFO");
  }

});

/* Login Page */
app
.get("/verify", async (req,res) => {
  // this is a demo page for users to log in 
  res.sendFile('website/html/login.html', {root: __dirname});

})

.post("/verify", async (req, res) => {
    let table = "userAccounts";
    // this is to varify the user somehow
    // will this use another table? - that would be best if this is to be stored in the database.
    // this will only be used to check credentials
  
    if (req.body.username == undefined) {
      res.status(200).json({"ERROR": "Send as URL encoded!"});
      // needs to stop execution databases also need some error checking so they stop crashing the server
    }
  
    const userCreds = await db.getRow(table, req.body.username);
    verifyUser(req.body.password, userCreds[0].password);
  
    function verifyUser(password, hash) {
      bcrypt.compare(password, hash, async (err, result) => {
        if (err) {
          logging.logging("Something Broke: " + err, "ERROR");
          res.status(500).send({"ERROR":"A server side error has occurred"});
  
        } else if (result) {
          logging.logging("User logged in " + userCreds[0].username, "DEBUG");
  
          verification.generateToken(req.body.username).then(result => {
            res.status(200).json({"verKey" : result});
          });
          
        } else {
          // somehow also get the req.ip here so we can learn of more bots // this might already "work"
          logging.logging("Incorect Username/Password", "WARN");
          // Send Errors back as JSON
          res.status(401).json({"ERROR":"Incorect Username/Password"});
        }
      });
    }
});

module.exports = app;