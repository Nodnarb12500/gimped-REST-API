const express = require("express");
const app = express();

const verification = require("../verification");
const db = require("../db/database");
const config = require("../config");


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


/**
 * TODO: 
 *  Make sure that if a database exists, 
 *  - and if it doesnt make one, if it should exist. 
 *    - otherwise fail and tell the user its invalid
 * 
 *  
 *  
 */


/* CREATING/MODIFYING DATA */
app
.post("/create/:table", async (req, res) => {
  const validated = await verification.checkToken(req.body.username, req.body.verKey);
  const table = "userData"; //this is a debug line
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

})

.put("/create/:table", async (req,res) => {
  const validated = await verification.checkToken(req.body.username, req.body.verKey);
  const table = "userData"; //this is a debug line
});

app.post("/modify/:table", async (req, res) => {
  /* Get id and send back the JSON */
  const validated = await verification.checkToken(req.body.username, req.body.verKey);
  const table = "userData"; //this is a debug line
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
  const table = "userData"; //this is a debug line
  apiRequest = verification.stripToken(req.body);


  /**
   * TODO:
   *  Consider making delete a hidden thing, that requires another confirmination that then actually deletes the post
   *      OR
   *  require users to retype passwords, or "delete" to delete a file
   * 
   *  If deleteing a users account, remove that users database entry and tokens from the token file (if required)
   *    - This needs to be tested, if a users entry is deleted does that token still allow use of the API that they shouldnt be able to access?
   */


  // require the user to retype their password for deleting their account, if this gets implemeted?
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


  /**
   * TODO:
   *  This is incorrect and needs to be looked at, this currently only grabs a row, is this what we want?
   *  maybe have 1 grabbing single rows and another one that grabs several rows in a table unless this already does that.
   * 
   *  if (params.id !== null) then single grab
   *  else row grab?
   * 
   *  ** This should NOT require a token to use otherwise all users of the site would require a password
   *        - New setting idea? "require all users to have an account to access the API (this includes viewing posts, users without an account will not be able to view posts)"
   * 
   */


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

  res.status(200).sendFile("/website/html/search.html", __dirname);
})

/*
 * This API call should also request the table name as well which might get a little weird
 * Im not entirely sure how I would do that on a generalized context since some times it might be fine
 * to show table names and other times it might not be? my API requires authentication now so it should be fine
 * to use tablenames directly but i still need to find a way to do that
 */

.post("/search", (req, res) => {

});

/* Token Test */
app.post('/tokentest', async (req, res) => {
  const result = await verification.checkToken(req.body.username, req.body.verKey);
  res.status(200).json({"valid":result});
});

module.exports = app;