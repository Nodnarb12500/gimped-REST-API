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
    const exists = await db.getRow(table, apiRequest.username);
    if (exists) {
      // either modify the row or tell the user to user the correct URL
      // also perhaps make the row that would be generated here by default 
      //  - and users should already be using /modify in this case

    } else {
      const results = await db.createRow(table, apiRequest);
      res.status(201).json({id: results[0]});
    }
    

  } else {
    // Invalid token
    res.status(401).json({"verKey": "Invalid Token"});
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
    res.status(401).json({"verKey": "Invalid Token"});
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
    res.status(401).json({"verKey": "Invalid Token"});

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
    res.status(401).json({"verKey": "Invalid Token"});
    logging.logging(res.ip + " " + req.body.username + " Used an invalid Token", "INFO");
  }
});

/* Token Test */
app.get('/tokentest/:user/:token', async (req, res) => {
  const result = await verification.checkToken(req.params.user, req.params.token);
  res.status(200).send(result); // tell the user in JSON that the token is valid or invaild

});

app.post('/tokentest', async (req, res) => {
  const result = await verification.checkToken(req.body.username, req.body.verKey);
  console.log(result);
  res.status(200).json({"valid":result});
});

module.exports = app;