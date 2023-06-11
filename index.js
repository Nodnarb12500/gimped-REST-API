// imported node stuff
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const crypto = require("crypto")
const bcrypt = require("bcrypt");
const fs = require("node:fs");
const readline = require("node:readline");

// imported files
const db = require("./db/database");
const config = require("./config");
const logging = require("./logging");
const { match } = require("assert");

logging.logging("The server is starting", "INFO");

// Create tables if they dont already exist
db.checkTable("userAccounts");
db.checkTable("userData");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

 // needed for obtaining user IPs for logging even behind a proxy
 // apperently unsafe(easily manipulated), make a config value for this to disable easily?
app.set('trust proxy', true);


/* Web Pages */ // If i knew how to put this in another File I would.
app.use("/resources", express.static("resources"));
app.set("/resources", express.static("resources"));

app.get("/", (req, res) => {
  res.sendFile('website/html/index.html', {root: __dirname});
  // create a line using the car req to fine the IP address.
  logging.logConnection(req);
});

app.get("/signup", (req, res) => {
  // this is where the user views and accesses the page that allows them to create an account
  if (config.signUpAllowed) {
    res.sendFile('website/html/signup.html', {root: __dirname});
  } else {
    res.send("Signup isnt allowed!");
  }
  
});

/* The following Path is for Verifying and eventually sending the user a token that will expire after some time */
// variables

app.get("/verify", (req, res) => {
  // this is a demo page for users to log in 
  res.sendFile('website/html/login.html', {root: __dirname});

});

/* Until i find a way to export the following to external files they will remain here in chaos */

/* API Shit */ // API Access it unauthenticated
// ALL API calls might need to be POST methods for verification
// If I knew how to put this in another file I would.
app.post("/api/create", async (req, res) => {
    /*
    if verified {
      run SQL thing
    } else {
      yell at user to login in JSON
    }
    logging.logging(req.ip + "relevent thing", "API");
    */
  
    const results = await db.createRow(req.body);
    res.status(201).json({id: results[0]});
});
  
app.post("/api/modify/:id", async (req, res) => {
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

/* USER MANAGMENT */ // If I knew how to put this in another file I would
app.post("/signup", async (req, res) => {
  let table = "userAccounts";
  // this is where the data will be sent to create the account in the database
  // resend the signup page but with an execute code

  if (config.signUpAllowed) {
    let table =  "userAccounts";
    const test = await db.getRow(table, req.body.username);

    try {
      var userExists = (req.body.username === test[0].username);

    } catch (error) {
      logging.logging("Creating user for " + req.body.username, "INFO");
      
    }

    console.log(userExists);

    if (userExists) {
      // if name exists send error and tell user name exists
      logging.logging(req.ip + " Attempted to use a username already created", "DEBUG");
      res.status(200).send("Username already in use please try another one"); // this should instead refresh the page but send an execute code to the page
    } else {
      // name doesnt exist already we can let the user create the account
      hashPassword(req.body.username, req.body.password);
    }

  } else {
    // signup not allowed
    logging.logging(req.ip + " Attempted signup but signup is disabled!", "INFO");
  }

  function hashPassword(username, password) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) { logging.logging(err, "ERROR"); }

      bcrypt.hash(password, salt, async function(err, hash) {
        if (err) { logging.logging(err, "ERROR"); }

        let table = "userAccounts";
        userCreds = {
          username: username,
          password: hash,
          salt: salt
        }
        logging.logging(userCreds, "DEBUG");

      const results = await db.createRow(table, userCreds);
      

      res.status(201).json({id: results[0]}); // replace this with a URL (/signup) and hopfully some kind of error code that might i have no idea how to collect /signup=1 or something like that
      });
    });
  }
});

app.post("/verify", async (req, res) => {
  let table = "userAccounts";
  // this is to varify the user somehow
  // will this use another table? - that would be best if this is to be stored in the database.
  // this will only be used to check credentials

  const userCreds = await db.getRow(table, req.body.username);

  verifyUser(req.body.password, userCreds[0].password);

  function verifyUser(password, hash) {
    bcrypt.compare(password, hash, async (err, result) => {
      if (err) {
        logging.logging("Something Broke: " + err, "ERROR");
        res.status(200).send("A server side error has occurred")
      }
      if (result) {
        logging.logging("User logged in " + userCreds[0].username, "DEBUG");

        let verKey = await generateToken(userCreds[0].username);

        console.log(verKey);

        res.status(200).json({verKey});
        // res.status(200).send("Success!"); // send the verKey back as JSON

        /*
        send back some verification code thing that the user can use
        so they they dont have to continuouly logback in with some expiry thing.
        save to a JSON file? username + verKey? verKey is required for API Access?

        verKey should be linked to a username already to so all that should be required is the verification key
        */

      } else {
        logging.logging("Incorect Username/Password", "WARN"); // somehow also get the req.ip here so we can learn of more bots
        
        res.status(200).json("Incorect Username/Password"); // Send Errors back as JSON
      }
    });
  }
});

/* Verification */
// load/make if doesnt exist file with verification tokens strored next to when they expire.
// if a token expires make the user have to login again.

app.get('/api/tokentest/:user/:token', async (req, res) => {
  const result = await checkToken(req.params.user, req.params.token);

  res.status(200).send(result); // tell the user in JSON that the token is valid or invaild
});

async function generateToken(user) {
  let token
  // this function will generate a token and add it to a file that will be read everytime a user logs in


  crypto.randomBytes(48, (err, buf) => {
    if (err) logging.logging(err, "ERROR");

    var token = buf.toString('hex');

    let date = "now";

    result = {
      username: user,
      verKey: token,
      createDate: date
    }
    
    // console.log(result);

    // write the result to a file. tokens.js?
    var tokenStream = fs.createWriteStream('tokens.json', {flags: 'a+'});
    tokenStream.write(JSON.stringify(result) + "\n");
    tokenStream.end();
    
    console.log(token)
    return token;

  });

}


async function checkToken(user, token) {
  const fileStream = fs.createReadStream("./tokens.json");
  const rl = readline.createInterface({
    input : fileStream,
    crlfDelay: Infinity,
  });
  
  var userAuth, match;

  for await (const line of rl) {
    // console.log("Line from File: " + line);

    // do token comparisions here

    match = JSON.parse(line).verKey == token;
    console.log(match)
    if (match === true) {
     userAuth = JSON.parse(line);
     break;
    }
    // if (match === true) return match;

  }
  if (match === true) {
    // if the token exists is it the correct user trying to use it.
    if (userAuth.username === user) {

    } else {
      logging.logging(user + " Attempted to use " + userAuth.username + "'s Auth Token!", "WARN");
      match = false;
    }

  } else {
    logging.logging(user + " Used invalid key", "WARN");
    match = false; // redundent?
  }

  return match;
/*
  read tokens.js line by line and parse to json. push lines to an array
  call back the tokens with token[0].verKey == token to compare the tokens


  attempt to use only the token to auth the user. // username + token is required

  this function is for users that are attempting to use the API
  this validates the token the user is creating by making sure the token both exists in the tokens file
  AND is not expired. if tokens are expired this function should also remove it or call another function to remove it
  The tokens file must either be reread everytime a token is checked, OR and possibly peferibly stored in an array on server startup
*/

}

// app.get('*', (req, res) => {
//   // if * works how i think it does in the way i used it this "webpage" will be used to find bots or any pages the user might have accidentally mis typed
//   // this will be what handles the 404 page and will also allow banning bots though external programs like fail2ban

//   logging.logging("Client Connected from " + req.ip, "INFO");
//   // this has to be placed at the bottom!!!!!!
// })

app.listen(config.listenPort, () => {
  logging.logging("The server is listening on port " + config.listenPort, "INFO")
  logging.logging("The server is ready", "INFO");

});