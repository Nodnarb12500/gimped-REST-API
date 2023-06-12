const express = require("express");
const app = express();


/* API Shit */ // If I knew how to put this in another file I would.
// if verified {
//   run SQL thing
// } else {
//   yell at user to login in JSON
// }
// logging.logging(req.ip + "relevent thing", "API");
  
app.post("/api/create", async (req, res) => {
  const validated = checkToken(req.body.username, req.body.verKey);

  // the verKey might need to be stripped out of the request
  // the database might think it needs to store it if we give it 'as is'


  apiRequest = {

  }

  if (validated) {
    const results = await db.createRow(req.body);
    res.status(201).json({id: results[0]});

  } else {
    // invalid token
    res.status(403).json({"verKey": "Invalid Token"});
  }

});

app.post("/api/modify", async (req, res) => {
  /* Get id and send back the JSON */
  const validated = checkToken(req.body.username, req.body.verKey);

  if (validated) {
    const results = await db.modifyRow(req.params.id, req.body);
    res.status(200).json({results});
    
  } else {
    // invalid token
    res.status(403).json({"verKey": "Invalid Token"});
  }

});

/* You might want to leave this commented out */
app.post("/api/rm", async (req, res) => {
  // mark stuff for delete and hide instead?
  const validated = checkToken(req.body.username, req.body.verKey);

  if (validated) {
    await db.deleteRow(req.params.id);
    res.status(200).json({success: true});

  } else {
    // invalid token
    res.status(403).json({"verKey": "Invalid Token"});

  }


});

app.post("/api/get/:id", async (req, res) => {
  /* Get id and send back the JSON */
  const validated = checkToken(req.body.username, req.body.verKey);

  if (validated) {
    const results = await db.getRow(req.params.id);
    res.status(200).json({results});

  } else {
    // invalid token
    res.status(403).json({"verKey": "Invalid Token"});

  }
});
