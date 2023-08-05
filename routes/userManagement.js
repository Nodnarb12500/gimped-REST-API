const express = require("express");
const app = express();

const db = require("../db/database");
const verification = require("../verification");
const logging = require("../logging");
const config = require("../config");

// this is to help determine the root folder
const rootFolder = `${__dirname}/..`;

/* This file is for managing user account creation logging in and generating and providing tokens */

/* Signup Page */
app
.get("/signup", async (req, res) => {
  if (config.signUpAllowed) {
    res.status(200).sendFile('/website/html/signup.html', {root: rootFolder});
  } else {
    res.status(418).json({"Error":"Signup isnt allowed!"}); // cant find an error code that matches to we're a teapot(401 or 403 would probly work)
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
        const results = await db.createRow(table, userCreds); //doesnt need await lmao im not using the data generated from this
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
  res.sendFile('website/html/login.html', {root: rootFolder});

})

.post("/verify", async (req, res) => {
  let table = "userAccounts";
  // this is to varify the user somehow
  // will this use another table? - that would be best if this is to be stored in the database.
  // this will only be used to check credentials

  /**
   * MAKE SURE WE HAVE THE INFORMATION REQUIRED!
   */

  if (req.body.username == undefined) {
    logging.logging("didnt not receive data!");
    res.status(200).json({"ERROR": "Send as URL encoded!"});
    return; // needs to stop execution databases also need some error checking so they stop crashing the server
  } else if (req.body.password == undefined) {
    logging.logging("didnt not receive password!");
    res.status(200).json({"ERROR": "Password Undefined!"});
    return;
  } 
  const userCreds = await db.getRow(table, req.body.username); // move this error check to the database file!
  if (userCreds[0] == undefined) {
    logging.logging("user doesnt exist!");
    res.status(200).json({"ERROR": "User doesnt exist!"});
    return;
  }

  /**
   * USE THE AQUIRED DATA
   */

  verification.verifyUser(req.body.password, userCreds[0].password).then(async verifed => {
    if (verifed) {
      logging.logging("User logged in " + userCreds[0].username, "DEBUG");

        verification.generateToken(req.body.username).then(result => {
          res.status(200).json(result);
        });
    } else {
      // somehow also get the req.ip here so we can learn of more bots // this might already "work"
      logging.logging("Incorect Username/Password", "WARN");
      // Send Errors back as JSON
      res.status(401).json({"ERROR":"Incorect Username/Password"});
    }
  });
});

/** This is how users might interact with the site i think?
 * TODO:
 *  - 
 */

// app.get("/:table/upload", async (req, res) => {
  /**
   * This is where users will find their upload form.
   * this form needs to send 2 post requests using fetch();
   * one fetch goes to /api/create sending along the table 
   */
// })

// .post("/:table/upload", async (req, res) => {
  /**
   * This is where the users upload form will send the files they might upload.
   * any data like a title of a post and a message will be sent to the database.
   * when this data is accessed the client will ask the server for the data and after the server provides that data
   * the client will use the JSON to create DOM elements and create the page
   */
// });

module.exports = app;