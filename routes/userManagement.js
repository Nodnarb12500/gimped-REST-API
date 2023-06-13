const express = require("express");
const app = express();


const verification = require("../verification");

/*
This file is for managing user account creation logging in and generating and providing tokens
*/

/* Signup Page */
app
.get("signup", async (req, res) => {
  if (config.signUpAllowed) {
      res.sendFile('website/html/signup.html', {root: __dirname});
    } else {
      res.send("Signup isnt allowed!");
    }
})

.post("signup", async (req, res) => {
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


app
.get("verify", async (req,res) => {
  // this is a demo page for users to log in 
  res.sendFile('website/html/login.html', {root: __dirname});

  // whatever this thing is seems interesting ill have to look into res.render()
  // res.render('login', {
    //   title: 'Express Login'
    // });

})

/* Login Page */

.post("verify", async (req, res) => {
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
          res.status(200).send({"ERROR":"A server side error has occurred"});
  
        } else if (result) {
          logging.logging("User logged in " + userCreds[0].username, "DEBUG");
  
          /* Not the way I wanted this done but it should work */
          crypto.randomBytes(48, (err, buf) => {
            if (err) logging.logging(err, "ERROR");
        
            let verKey = buf.toString('hex');
            let date = "now"; // this needs to use logging.datetime(); to create a date but logging.datetime() should be more universal
        
            result = {
              username: req.body.username,
              verKey: verKey,
              createDate: date
            }
        
            var tokenStream = fs.createWriteStream('tokens.json', {flags: 'a+'});
            tokenStream.write(JSON.stringify(result) + "\n");
            tokenStream.end();
        
            console.log(verKey);
            res.sendStatus(200).json({"verKey" : verKey});
            
          });
  
          /* hopfully whoever saves me from this hell can figure out what I wanted here
          verKey = await generateToken(req.body.username);
          console.log("verKey outside the promise: " + verKey); // this should be the generated token
          res.status(200).json({"verKey" : verKey});
          */
        } else {
          logging.logging("Incorect Username/Password", "WARN"); // somehow also get the req.ip here so we can learn of more bots
          
          res.status(200).json({"verKey":"Incorect Username/Password"}); // Send Errors back as JSON
        }
      });
    }
  });

module.exports = app;