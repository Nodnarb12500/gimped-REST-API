const knex = require("knex");
const { Database } = require("sqlite3");
const fs = require('fs');

const logging = require("../logging");
const config = require("../config");

// create the file if it doesnt exist
fs.stat(config.databaseFile, function(err, stat) {
  if (err == null) {
    logging.logging("Database Exists!", "INFO");
  } else if (err.code === 'ENOENT') {
    // File doesnt exist
    logging.logging("Creating the Database File!", "INFO");
      fs.open(config.databaseFile, "w", (err, fd) => {
        if (err) {
          logging.logging("An error occured creating the database file\n" + err, "DEBUG");
        }
        
      });
  } else {
    logging.logging(err, "ERROR");
  }
});

const connectedKnex = knex({
  client: "sqlite3",
  connection: {
    filename: config.databaseFile
  },
  useNullAsDefault: true

});

module.exports = connectedKnex;