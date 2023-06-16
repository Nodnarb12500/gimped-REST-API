const knex = require("./knex");
const logging = require("../logging");


function checkTable(tableName){
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
  // this should only ever run on the creation of a new user if specified
  // This might also get used for creating posts!
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
  // this grabs a specific row and should not have pagination
  //return knex(table).where("id", id); // im keeping this line because its what i normally use
  console.log("collecting " + user + "'s data from table " + table);
  return knex(table).where("username", user);
}

/* Pagination */
function pagination(table, count, page) {
  if (count => 100) {
    // limit amount to 100
    count = 100;
  }
  let n = count * page;

  console.log("getting " + count + " rows!");
  return knex(table).select('*').limit(count).offset(n);

}

/* Sorting */
function searchDB(search, count, page) {
  // this might get complicated!
  // the search options might be separated by a | or some other delimiter
  // searching should search the database with the first option THEN 
  // nodeJS will do the rest of the searching putting the values that matched into the next array
  // looping until we run out of search terms

}

module.exports = {
  checkTable,
  createRow,
  modifyRow,
  deleteRow,
  getRow,
  pagination,
  searchDB
}
