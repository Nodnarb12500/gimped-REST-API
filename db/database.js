const knex = require("./knex");
const logging = require("../logging");

function makeTable(tName, cNames) {
  // if (!cNames.isArray()) { console.log(`cNames isnt an array?\n${cNames}`); return; }
  if (!cNames.constructor === Array) { console.log(`cNames isnt an array?\n${cNames}`); return; }

  knex.schema.hasTable(tName).then((exists) => {
    if (!exists) {
      logging.logging(`Creating table ${tName} with ${cNames}`, "INFO");
      return knex.schema.createTable(tName, (t) => {
        t.increments('id').primary(); // autoincementing ID for all rows
        cNames.forEach(element => {
          let cName = element.split("|")[0]; let cType = element.split("|")[1];
  
          if (cType == "string") {
            t.string(cName);
          } else if (cType == "integer") {
            t.integer(cName);
          } else {
            logging.logging(`malformed database thingy ${element}`, "INFO");
            return; //hopfully this cancels creating the database
          }
          
        });
      });
    } else {
      logging.logging(`Table ${tName} already exists! Skipping...`, "INFO");
    }
  });
}

/*
 * You may notice that theres 2 rows in each of these functions that can use either the username OR the id
 * I want to make these functions deal with both things but they dont do that just yet
 * 
 * If I give the database an ID number I expect it to use that ID number and modify or fetch the data I want
 * Same as above for a Username. I might get away with a caveman solution of Is number? ID | is String? username!
 * and I might use such a method for now. 
 * 
 * It might be safer and more Secure if i make 2 sets of functions one for user accounts and one for userdata and posts by the user
 * 
 */

/* Modifying the database */
function createRow(table, data) {
  // this should only ever run on the creation of a new user if specified
  // This might also get used for creating posts!
  return knex(table).insert(data);
}

function modifyRow(table, user, data) {
  // this should run anytime the user syncs their bookmarks
  // return knex(table).where("id", id).update(data);
  return knex(table).where("user", user).update(data);
}

function deleteRow(table, id) {
  // we might not want/need this. this might make the user unable to ever log in again.
  return knex(table).where("id", id).del();
}

/* Searching the database */
function getRow(table, user) {
  // this grabs a specific row and should not have pagination
  //return knex(table).where("id", id); // im keeping this line because its what i normally use
  // console.log("collecting " + user + "'s data from table " + table); //debugLine
  return knex(table).where("username", user);
}

/* Pagination */
function pagination(table, count, page) {
  if (count => 100) {
    // limit amount to 100
    count = 100;
  }
  let n = count * page;

  // console.log("getting " + count + " rows!"); // debugLine
  return knex(table).select('*').limit(count).offset(n);

}

function databaseSize(table, count) {
  if (count >= 100) {count = 100;}
  // this function is to tell the client how meny pages there are and what to set the max page button to
  let numberOfRows = knex(table).count('*');
  return (numberOfRows/100);

}

/* Sorting */
function searchDB(search, table, count, page, sortBy) {
  // this might get complicated!
  // the search options might be separated by a | or some other delimiter
  // searching should search the database with the first option THEN 
  // nodeJS will do the rest of the searching putting the values that matched into the next array
  // looping until we run out of search terms

  // thinking the delimiter should be ,
  // let delimiter = ",";


  // make sure we have what we need so we dont crash the database!
  if (table == undefined) {return "table is undefined!";}
  // console.log("debugging!");
  if (search == undefined) {search = '*';console.log("search is undefined")}
  if (count == undefined) {count = 25;console.log("count is undefined")}
  if (page == undefined) {page = 1;console.log("page is undefined")}
  if (sortBy == undefined) {sortBy = "DESC"} // sort from newest to oldest

  // limits set on users of the API
  if (count >= 100) {count = 100;}

  // let searchTerms = [multipul, search, terms, here, for, sorting, very, soon!];
  // knex(table).whereLike('users', "\%" + searchTerms[0] + "\%").orderBy(sortBy).limit(count).offset.page;
  // for (i = 1; i < searchTerms.length; i++){
    // Sort though all search terms refining the list down!
  // }
  // ill be sorting though an array of objects so this might be a pain in the ass!
  // this will also not give the user the number of results they asked for since they will removed if they dont match other terms!
  // this needs to be done better!

  // currently this isnt a great idea for the current setup of this server
  // the setup of the server is influenced heavily by the next project I will be doing!

  if (search == '*') {
    return knex(table).select('*').orderBy(sortBy).limit(count).offset(page);
  } else {
    // this needs some more work. I want to be able to process several search terms and this only allows 1 for now
    return knex(table).whereLike('users', "\%" + search + "\%").orderBy(sortBy).limit(count).offset.page;
  }

}


function stripToken(apiRequest) {
  // delete the verKey from the API request, this is a requirement for the old login system and is a backup for weird systems
  // might get removed soon?

  delete apiRequest.verKey;

  return apiRequest;
}

module.exports = {
  makeTable,
  createRow,
  modifyRow,
  deleteRow,
  getRow,
  pagination,
  searchDB
}
