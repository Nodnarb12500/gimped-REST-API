const knex = require("./knex");
const logging = require("../logging");

/*
 * replace tableName with the name of the table you want to modify
 * and if you want change the names of the functions to reflect that change to
 */


// check for the table and create it if !exists
/*
* Currently the table and all the modifications that might be done to the table
* all expect to be provided an ID number. 
* I dont see why username only wouldnt work so if preferable I might be able
* to grab rows based on Username instead of the ID number
*/



function checkTable(tName){
  let tableName = tName

  if (tableName == "userData") {
    knex.schema.hasTable(tableName).then(function(exists) {
      if (!exists) {
        logging.logging("Creating Table " + tableName, "INFO");
        return knex.schema.createTable(tableName, function(t) {
          t.increments('id', { primaryKey: true });
          t.string('username').notNullable();
          t.string('data');
        });
      } else {
        logging.logging("Table " + tableName + " Exists!", "INFO");
      }
    });
  } else if (tableName == "userAccounts") {
    knex.schema.hasTable(tableName).then(function(exists) {
      if (!exists) {
        // Why another table for passwords?
        // the other table will be sent to the client everytime it asks.
        // which would include everything in that requested row.

        logging.logging("Creating Table " + tableName, "INFO");

        return knex.schema.createTable(tableName, function(t) {
          t.increments('id', { primaryKey: true });
          t.string('username').notNullable();
          t.string('password');
          t.string('salt');

        });
        
      } else {
        logging.logging("Table " + tableName + " Exists!", "INFO");
      }
    });
  }
}


/* Modifying the database */

function createRow(table, data) {
  // this should only ever run on the creation of a new user
  return knex(table).insert(data);
}

function modifyRow(table, id, data) {
  // this should run anytime the user syncs their bookmarks
  return knex(table).where("id", id).update(data);
}

function deleteRow(table, id) {
  // we might not want/need this. this might make the user unable to ever log in again.
  return knex(table).where("id", id).del();
}

/* Searching the database */

function getRow(table, user) {
  // this should also happen whenever a user syncs bookmarks but should happen last.
  //return knex(table).where("id", id);
  console.log("collecting " + user + "'s data from table " + table);
  return knex(table).where("username", user);

}

module.exports = {
  checkTable,
  createRow,
  modifyRow,
  deleteRow,
  getRow
}
