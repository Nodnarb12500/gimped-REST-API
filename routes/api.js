const express = require("express");
const app = express();

const verification = require("../verification");
const db = require("../db/database");
const config = require("../config");

const rootFolder = `${__dirname}/..`;

/*
 * Before I forget what the hell I'm doing
 * make each API call get called on a table name (users @tag?)
 * useraccounts on normal circumstances should NEVER be called and they are dealt with in userManagement.js and verification.js
 * this database calls should be done on the table name or a users name and should be sorted newest to oldest select('*').orderBy(DESC)
 * 
 * 
 * Something i had forgotten to think about was how to take data from several tables 
 * and append those together for suggestions or general viewing.
 * The above is only an issue if someone were to try and use this as a platform for multipul people to upload content and expect that content
 * to be visible on more then just that single users feed or page
 * 
 */


// we are already in the /api path so /api should not be used here in the paths

/* CREATING/MODIFYING DATA */
app.post("/create/:table", async (req, res) => {
  const validated = await verification.checkToken(req.body.username, req.body.verKey);
  const table = "userData";
  apiRequest = verification.stripToken(req.body);

  // just noticed i didnt finish this yet lmao
  // for how the server is currently set up lets assume database is limited

  if (validated === true) {
    if (config.dbLimit) {
      const exists = await db.getRow(table, apiRequest.username);
      if (exists) {
        // tell the user they cant make more rows in the database, and to use the proper API URI

        res.status(403).json({"ERROR":"You already have data stored, Please use /api/modify"});
      } else {
        const results = await db.createRow(table, apiRequest);
        res.status(201).json({id: results[0]});
      }

    }

  } else {
    // Invalid token
    res.status(401).json({"ERROR": "Invalid Token"});
  }

});

app.post("/modify/:table", async (req, res) => {
  /* Get id and send back the JSON */
  const validated = await verification.checkToken(req.body.username, req.body.verKey);
  const table = "userData";
  apiRequest = verification.stripToken(req.body);

  if (validated === true) {
    const results = await db.modifyRow(table, apiRequest);
    res.status(200).json({results});
    
  } else {
    // invalid token
    res.status(401).json({"ERROR": "Invalid Token"});
  }

});

/* You might want to leave this commented out */
app.post("/rm/:table", async (req, res) => {
  // mark stuff for delete and hide instead?
  const validated = await verification.checkToken(req.body.username, req.body.verKey);
  const table = "userData";
  apiRequest = verification.stripToken(req.body);

  // require the user to retype their password for deleting their account
  // make sure to remove the users tokens

  if (validated === true) {
    await db.deleteRow(table, apiRequest); // if a user requests a delete delete their account to
    res.status(200).json({success: true});

  } else {
    // invalid token
    res.status(401).json({"ERROR": "Invalid Token"});

  }
});

/* VIEWING DATA */
// These API calls should not require authentication
app.post("/get/:table", async (req, res) => {
  /* Get id and send back the JSON */
  // this shoulnt actually need authentication
  const validated = await verification.checkToken(req.body.username, req.body.verKey);

  if (validated === true) {
    const results = await db.getRow(req.params.id);
    res.status(200).json({results});

  } else {
    // invalid token
    res.status(401).json({"ERROR": "Invalid Token"});
    logging.logging(res.ip + " " + req.body.username + " Used an invalid Token", "INFO");
  }
});

app
.get("/search", (req, res) => {
  res.status(200).sendFile("website/html/search.html", {root: rootFolder});

})

/*
 * This API call should also request the table name as well which might get a little weird
 * Im not entirely sure how I would do that on a generalized context since some times it might be fine
 * to show table names and other times it might not be? my API requires authentication now so it should be fine
 * to use tablenames directly but i still need to find a way to do that
 */

.post("/search", (req, res) => {

});

/**
 * TODO:
 *  User Uploads
 *    - Uploads must accept
 *      - JSON
 *      - user Files
 *    - the files must be compressed.
 *    - the files must be placed in folders based on their upload date and filenames updated to reflect the perminite path for the files
 * 
 *
 */

app.get("/upload", (req, res) => {
  // res.status(200).sendFile("/website/html/upload.html", {root: rootFolder});
  res.status(200).sendFile("website/html/upload.html", {root: rootFolder});
})

.post("/upload", (req, res) => {

  console.log(req);
});

/* Token Test */
app.post('/tokentest', async (req, res) => {
  const result = await verification.checkToken(req.body.username, req.body.verKey);
  res.status(200).json({"valid":result});
});

module.exports = app;