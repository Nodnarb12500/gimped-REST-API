const express = require("express");
const app = express();

const logging = require("./logging");
const config = require("./config");

/*
This file is for managing user account creation logging in and generating and providing tokens
*/

app.post("/signup", async (req, res) => {
    let table = "userAccounts";
    // this is where the data will be sent to create the account in the database
    // resend the signup page but with an execute code
    
    console.log("User Created for " + req.body.username);
    
    // variable that checks if signing up is allowed? the sign up page can be bypassed it need to be here to
    // check if a username is taken already
    
    hashPassword(req.body.username, req.body.password);
    
    function hashPassword(username, password) {
        bcrypt.genSalt(10, (err, salt) => {
        if (err) { console.log(err); }
    
        bcrypt.hash(password, salt, async function(err, hash) {
            if (err) { console.log(err); }
    
            let table = "userAccounts";
            userCreds = {
            username: username,
            password: hash,
            salt: salt
            }
            console.log(userCreds);
    
        const results = await db.createRow(table, userCreds);

        res.status(201).json({id: results[0]}); // replace this with a URL (/signup) and hopfully some kind of error code that might i have no idea how to collect /signup=1 or something like that
        });
        });
    }
});




app.post("/verify", async (req, res) => {
    let table = "userAccounts";
    // this is to varify the user somehow
    // will this use another table? - that would be best if this is to be stored in the database.
    // this will only be used to check credentials
    
    const userCreds = await db.getRow(table, req.body.username);
    
    console.log("the hash being compared against: " + userCreds[0].password);
    verifyUser(req.body.password, userCreds[0].password);
    
    function verifyUser(password, hash) {
        bcrypt.compare(password, hash, (err, result) => {
        if (err) {
            console.log("Something Broke: " + err);
            res.status(200).send("A server side error has occurred")
        }
        if (result) {
            console.log("Success!");
            res.status(200).send("Success!");
    
            /*
            send back some verification code thing that the user can use
            so they they dont have to continuouly logback in with some expiry thing.
            save to a JSON file? username + verKey? verKey is required for API Access?
    
            */
    
        } else {
            console.log("Incorect Username/Password");
            res.status(200).send("Incorect Username/Password");
        }
        });
    }
});


/* Verification */
// load/make if doesnt exist file with verification tokens strored next to when they expire.
// if a token expires make the user have to login again.

function generateToken() {
    // this function will generate a token and add it to a file that will be read everytime a user logs in
    }
    
    function checkToken(token) {
    // this function is for users that are attempting to use the API
    // this validates the token the user is creating by making sure the token both exists in the tokens file
    // and is not expired. if tokens are expired this function should also remove it or call another function to remove it
    // The tokens file must either be reread everytime a token is checked, OR and possibly peferibly stored in an array on server startup
    
    
    
    }

module.exports = {
    userManagement
}
