// imported node stuff
const bodyParser = require("body-parser");
const express = require("express");
const app = express();



// imported files
const db = require("./db/database");
const config = require("./config");
const logging = require("./logging");
const api = require("./routes/api");
const userManagement = require("./routes/userManagement");

logging.logging("The server is starting", "INFO");

// Create tables if they dont already exist
db.checkTable("userAccounts");
db.checkTable("userData");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// needed for obtaining user IPs for logging even behind a proxy
// apperently unsafe(easily manipulated)
app.set('trust proxy', config.trustProxy);


/* Web Pages */ // If i knew how to put this in another File I would.
app.use("/resources", express.static("./website/resources"));
app.set("/resources", express.static("./website/resources"));



/* API Shit */
app.use("/api", api);
app.use("", userManagement);

app.get("/", (req, res) => {
  res.sendFile('website/html/index.html', {root: __dirname});
  // create a line using the car req to fine the IP address.
  logging.logConnection(req);
  // some kind of timeout thing?

});

/* USER MANAGMENT */ // If I knew how to put this in another file I would
// app.post("/signup", async (req, res) => {
//   let table = "userAccounts";
//   // this is where the data will be sent to create the account in the database
//   // resend the signup page but with an execute code

//   if (config.signUpAllowed) {
//     let table =  "userAccounts";
//     const test = await db.getRow(table, req.body.username);

//     try {
//       var userExists = (req.body.username === test[0].username);

//     } catch (error) {
//       logging.logging("Creating user for " + req.body.username, "INFO");
      
//     }

//     console.log(userExists);

//     if (userExists) {
//       // if name exists send error and tell user name exists
//       logging.logging(req.ip + " Attempted to use a username already created", "DEBUG");
//       res.status(200).send("Username already in use please try another one"); // this should instead refresh the page but send an execute code to the page
//     } else {
//       // name doesnt exist already we can let the user create the account
//       hashPassword(req.body.username, req.body.password);
//     }

//   } else {
//     // signup not allowed
//     logging.logging(req.ip + " Attempted signup but signup is disabled!", "INFO");
//   }

//   function hashPassword(username, password) {
//     bcrypt.genSalt(10, (err, salt) => {
//       if (err) { logging.logging(err, "ERROR"); }

//       bcrypt.hash(password, salt, async function(err, hash) {
//         if (err) { logging.logging(err, "ERROR"); }

//         let table = "userAccounts";
//         userCreds = {
//           username: username,
//           password: hash,
//           salt: salt
//         }
//         logging.logging(userCreds, "DEBUG");

//       const results = await db.createRow(table, userCreds);
      

//       res.status(201).json({id: results[0]}); // replace this with a URL (/signup) and hopfully some kind of error code that might i have no idea how to collect /signup=1 or something like that
//       });
//     });
//   }
// });

// s

        /* hopfully whoever saves me from this hell can figure out what I wanted here
        verKey = await generateToken(req.body.username);
        console.log("verKey outside the promise: " + verKey);
        res.status(200).json({"verKey" : verKey});
        */

        /*
        send back some verification code thing that the user can use
        so they they dont have to continuouly logback in with some expiry thing.
        save to a JSON file? username + verKey? verKey is required for API Access?

        */

//       } else {
//         logging.logging("Incorect Username/Password", "WARN"); // somehow also get the req.ip here so we can learn of more bots
        
//         res.status(200).json({"verKey":"Incorect Username/Password"}); // Send Errors back as JSON
//       }
//     });
//   }
// });

/* Verification */
// load/make if doesnt exist file with verification tokens strored next to when they expire.
// if a token expires make the user have to login again.

// app.get('/api/tokentest/:user/:token', async (req, res) => {
//   const result = await checkToken(req.params.user, req.params.token);

//   res.status(200).send(result); // tell the user in JSON that the token is valid or invaild
// });

// app.use(function(req, res, next) {
//   logging.logConnection(req); // log ALL conenctions?

//   setTimeout(() => {
//     try {
//       throw new Error('BROKEN');
//     } catch (err) {
//       next(err);
//     }
//   }, 100); // replace this with a 50* error and page?

//   var err = new Error("Not Found");
//   err.status = 404;
//   next(err); // replace this with a 404 page and 404 status?
// });


app.listen(config.listenPort, () => {
  logging.logging("The server is listening on port " + config.listenPort, "INFO")
  logging.logging("The server is ready", "INFO");

});