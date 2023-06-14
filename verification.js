const crypto = require("crypto");
const fs = require("node:fs");
const readline = require("node:readline");


const logging = require("./logging");

/* Verification */
// load/make if doesnt exist file with verification tokens strored next to when they expire.
// if a token expires make the user have to login again.

async function generateToken(user) {
    let verKey = crypto.randomBytes(48, (err, buf) => {
  // return crypto.randomBytes(48, (err, buf) => {
    if (err) logging.logging(err, "ERROR");

    let token = buf.toString('hex');
    let date = "now"; // this needs to use logging.datetime(); to create a date but logging.datetime() should be more universal

    result = {
      username: user,
      verKey: token,
      createDate: date
    }

    var tokenStream = fs.createWriteStream('tokens.json', {flags: 'a+'});
    tokenStream.write(JSON.stringify(result) + "\n");
    tokenStream.end();

    console.log(token);
    
  });

  return verKey;
}

// make this not async? // do this after making a new commit
async function checkToken(user, verKey) {
const fileStream = fs.createReadStream("./tokens.json");
const rl = readline.createInterface({
  input : fileStream,
  crlfDelay: Infinity,
});

var userAuth, match;

for await (const line of rl) {
  // console.log("Line from File: " + line);

  // do token comparisions here

  match = JSON.parse(line).verKey == verKey;
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
  return match;
  } 
  // else if (userAuth !== user) {
  //   logging.logging(user + " Attempted to use " + userAuth.username + "'s Auth Token!", "WARN");
  //   match = false;
  // } // useless?
  else {

  logging.logging(user + " Attempted to use " + userAuth.username + "'s Auth Token!", "WARN");
  match = false;
  }

} else {
  logging.logging(user + " Used invalid key", "WARN");
  match = false; // redundent?
}

return match;
/*
attempt to use only the token to auth the user. // username + token is required

this function is for users that are attempting to use the API
this validates the token the user is using by making sure the token both exists in the tokens file
AND is not expired. if tokens are expired this function should also remove it or call another function to remove it
The tokens file must either be reread everytime a token is checked, OR and possibly (and preferably?) stored in an array on server startup // global variable
*/

}

function stripToken(userReq) {
  // this function is for removeing the verKey from the API request because it would crash the server if it got passed to the database
  apiRequest = { // unfortunatly this is probly use case specific so change this to something else if you need something else
    username: userReq.username,
    data: userReq.data
  }
  return apiRequest;

}

module.exports = {
    generateToken, // doesnt work but im leaving it exported because i want to get it working at somepoint
    checkToken,
    stripToken
}