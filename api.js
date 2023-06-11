const express = require("express");
const app = express();

const logging = require("./logging");
const config = require("./config");
/*

This file is for all the API calls that can be made to this server
more files might be created if this file grows to much

*/

/* API Shit */ // API Access it unauthenticated
// ALL API calls might need to be POST methods for verification
app.post("/api/create", async (req, res) => {
    console.log(req.body);
  
     /*
    if verified {
      run SQL thing
    } else {
      yell at user to login in JSON
    }
    */
  
    const results = await db.createRow(req.body);
    res.status(201).json({id: results[0]});
});
  
app.post("/api/modify/:id", async (req, res) => {
    console.log(req.body);
    /* Get id and send back the JSON */
    const results = await db.modifyRow(req.params.id, req.body);
    res.status(200).json({results});
  
});
  
  /* You might want to leave this commented out */
app.get("/api/rm/:id", async (req, res) => {
    // mark stuff for delete and hide instead?
    await db.deleteRow(req.params.id);
    res.status(200).json({success: true});
});
  
app.get("/api/get/:id", async (req, res) => {
    /* Get id and send back the JSON */
    const results = await db.getRow(req.params.id);
    res.status(200).json({results});
  
});