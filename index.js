// imported node stuff
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
// const {body, validationResult} = require("express-validator");

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

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

app.use(express.json());

// needed for obtaining user IPs for logging even behind a proxy
// apperently unsafe(easily manipulated)
app.set('trust proxy', config.trustProxy);

app.use(logging.connectionLogger);
app.use(logging.limiter);

/* Web Pages */
app.use("/resources", express.static("./website/resources"));
app.set("/resources", express.static("./website/resources"));

/* API Shit */
app.use("/", userManagement);
app.use("/api", api);

app.get("/", (req, res) => {
  res.sendFile('website/html/index.html', {root: __dirname});

});

/* Error Handling and 404 */
app.use((req, res, next) => {
  if (req.method == "POST") {
    res.status(404).json({"Error":"Does not Exist!"})
  } else if (req.method == "GET") {
    res.status(404).sendFile("./website/errorpages/404.html", {root: __dirname});
  }
  next();
});

app.use((err, req, res, next) => {
  logging.logging(`${req.ip} did a thing and caused ${err.stack}`, "ERROR");

  if (req.method == "POST") {
    res.status(500).json({"Error":"Server Sploded"});
  } else if (req.method == "GET") {
    res.status(500).sendFile("./website/errorpages/500.html", {root: __dirname});
  }
  next();
});

app.listen(config.listenPort, config.listenAddress, () => {
  logging.logging(`The server is listening on ${config.listenAddress}:${config.listenPort}`, "INFO");
  logging.logging("The server is ready", "INFO");

});