// imported node stuff
const express = require("express");
const app = express();
// const {body, validationResult} = require("express-validator");

// imported files
const db = require("./db/database");
const config = require("./config");
const logging = require("./logging");
const api = require("./routes/api");
const userManagement = require("./routes/userManagement");
const uploads = require("./routes/upload");


logging.logging("The server is starting", "INFO");

// Make tables if they dont already exist!
db.makeTable("userAccounts", ["username|string", "password|string"]);
// db.makeTable("userData", ["username|string", "data|string"]); // you might want to remove this if you arent going to use it
db.makeTable("content", ["desc|string", "tag|string", "filePath|string", "fileType|string", "uploader|string", "likes|integer", "comments|string"]);

app.use(express.json());

// needed for obtaining user IPs for logging even behind a proxy
// apperently unsafe(easily manipulated)
app.set('trust proxy', config.trustProxy); // defaulted to false for now

app.use(logging.connectionLogger);
app.use(logging.limiter);

/* Web Pages */
app.use("/resources", express.static("./website/resources"));
app.set("/resources", express.static("./website/resources"));

/* API Shit */
app.use("/", userManagement);
app.use("/", uploads);
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