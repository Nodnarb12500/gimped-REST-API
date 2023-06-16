const express = require("express");
const app = express();

const verification = require("../verification");
const db = require("../db/database");

/* API Shit */
// if verified {
//   run SQL thing
// } else {
//   yell at user to login in JSON
// }
// logging.logging(req.ip + "relevent thing", "API");


// we are already in the /api path so /api should not be used here in the paths
app.post("/create", async (req, res) => {
  const validated = await verification.checkToken(req.body.username, req.body.verKey);
  const table = "userData";
  apiRequest = verification.stripToken(req.body);

  if (validated === true) {
    if (dbLimit) {
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

app.post("/modify", async (req, res) => {
  /* Get id and send back the JSON */
  const validated = await verification.checkToken(req.body.username, req.body.verKey);
  const table = "userData";
  apiRequest = stripToken(req.body);

  if (validated === true) {
    const results = await db.modifyRow(table, apiRequest);
    res.status(200).json({results});
    
  } else {
    // invalid token
    res.status(401).json({"ERROR": "Invalid Token"});
  }

});

/* You might want to leave this commented out */
app.post("/rm", async (req, res) => {
  // mark stuff for delete and hide instead?
  const validated = await verification.checkToken(req.body.username, req.body.verKey);
  const table = "userData";
  apiRequest = stripToken(req.body);

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

app.post("/get/:id", async (req, res) => {
  /* Get id and send back the JSON */
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
  console.log(result);
  res.status(200).json({"valid":result});
});

module.exports = app;