const express = require("express");
const app = express();

const logging = require("./logging");
const config = require("./config");

/*
This file is for all the web pages that are displayed for testing 
or even production if you want to use this server for more then just an API
*/


// these are the resources that all pages served on this server use for styling and JS
app.use("/resources", express.static("resources"));
app.set("/resources", express.static("resources"));

app.get("/", (req, res) => {
  res.sendFile('resources/html/index.html', {root: __dirname});

});

app.get("/signup", (req, res) => {
  // this is where the user views and accesses the page that allows them to create an account
  if (config.signUpAllowed) {
    res.sendFile('resources/html/signup.html', {root: __dirname});
  } else {
    res.send("Signup isnt allowed!");
  }
  
});

/* The following Path is for Verifying and eventually sending the user a token that will expire after some time */
// variables

app.get("/verify", (req, res) => {
  // this is a demo page for users to log in 
  res.sendFile('resources/html/login.html', {root: __dirname});

});