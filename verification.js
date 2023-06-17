const crypto = require("crypto");
const fs = require("node:fs");
const readline = require("node:readline");


const logging = require("./logging");

/* Verification */
// load/make if doesnt exist file with verification tokens strored next to when they expire.
// if a token expires make the user have to login again.

async function generateToken(user) {
  return new Promise(function(resolve, reject) {
    crypto.randomBytes(48, (err, buf) => {
      if (err !== null) {
        logging.logging(err, "ERROR");
        reject(err);
      } else {
        let token = buf.toString('hex');
        let date = logging.datetime("token");
        result = {
          username: user,
          verKey: token,
          createDate: date
        }
  
        var tokenStream = fs.createWriteStream('tokens.json', {flags: 'a+'});
        tokenStream.write(JSON.stringify(result) + "\n");
        tokenStream.end();
        resolve(token);
      }
    });
  });
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
  match = JSON.parse(line).verKey == verKey;

  if (match === true) {
  userAuth = JSON.parse(line);
  break; // if match is found stop matching
  }
}

if (match === true && logging.datetime("tokenCheck", userAuth.expireDate)) {
  // if the token exists is it the correct user trying to use it.
  if (userAuth.username === user) {
    // token isnt invalid OR expired!
    return match;

  } else if (match === true || logging.datetime("tokenCheck", userAuth.expireDate)) {
    // token is either invalid or expired!
    match = false;
    return match;

  } else {
    logging.logging(user + " Attempted to use " + userAuth.username + "'s Auth Token!", "WARN");

    match = false;

  }

} else {
  logging.logging(user + " Used invalid key", "WARN");
  match = false; // redundent?
}


return match;
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
    generateToken, // doesnt work but im leaving it exported because i want to get it working at some point
    checkToken,
    stripToken
}