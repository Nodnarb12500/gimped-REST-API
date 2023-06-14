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

app.use(function(req, res, next) {
  //logging.logging("", "INFO");
  logging.logConnection(res, "INFO");

  var err = new Error("Not Found");
  err.status = 404;
  next(err);

  // the following timeout thing doesnt actually work
  // setTimeout(() => {
  //   try {
  //     throw new Error('Broken');
  //   } catch (err) {
  //     next(err);
  //   }
  // }, 100) // replace with a server error code
});

app.listen(config.listenPort, () => {
  logging.logging("The server is listening on port " + config.listenPort, "INFO")
  logging.logging("The server is ready", "INFO");

});