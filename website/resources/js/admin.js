/* REMOVE THIS FILE */

/*
 * Until i find a good way to make sure this file is safe and accessable only internally I would reccomend removing it. 
 * theres no real reason why this should exist outside of testing I want it to be useful and allow shit like manual password resets
 * and maybe reading logs (probly not happening). i just dont know how i would secure it. any user would be allowed to do anything they wanted
 * because admin is just a name not a level of permission.
 */ 

url = "api/get/userAccounts";

username = "admin"; // username is assumed to be admin

// fetch from cookies if exists?
verKey = "token" // manually add a token here for testing

data = {
    username: username,
    verKey: verKey
}

fetch(url, {
    method: "POST",
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify(data)
  }).then(res => {
    console.log("Request complete! response:", res);
  });
