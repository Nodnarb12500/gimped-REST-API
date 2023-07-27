/**
 * TODO:
 *  This file will be for anything that requires verification. and dealing with tokens.
 *  This file should handle
 * 
 *      - Server side should send clients to the correct place if they already have a token.
 *      - a signout button that deletes the token?
 * 
 */
var resCopy, resultCopy;

async function postJSON(formData, path) {
    try {
        const response = await fetch(path, {
            credentials: "same-origin",
            method: "POST", // can use 'PUT' apperently
            // method: "PUT",
            headers: {
                "Content-Type": "application/json",
                // "Content-Type": "application/x-www-form-urlencoded",
            },
            body: JSON.stringify(formData),
            // body: formData,
        }).then((res) => {
            resCopy = res.clone();
            return res.text();
        }).catch((err) => {
            console.error(err);
        });

        const result = await response;
        console.log("Success:", JSON.parse(result));
        return JSON.parse(result);
    } catch (error) {
        console.error("Error:", error);
    }
}

async function login() {
    // const formData = new FormData(document.getElementById("loginForm"));
    // postJSON(formData, "/verify");

    // to send data with the formData object i need to use a different middleware to parse the multi-part/form encoding
    // i will need this for uploading i think, uploading stuff like text and images.

    var data = {
        username: document.getElementById("usernameBox").value,
        password: document.getElementById("passwordBox").value

    }

    let result = await postJSON(data, "/verify");
    resultCopy = result;

    cookie.set("username", data.username);
    cookie.set("verKey", result.verKey, result.expireDate);

}

async function signup() {
    // This function should use the makeRequest function to send data to the server required for creating an account.
    // it should then handle the response from the server and display it to the user!

    // const formData = new FormData();
    // formData.append("username", "test");
    // formData.append("password", "12345");

    if (document.getElementById("passwordBox1").value === document.getElementById("passwordBox2").value) {
        // make sure that both passwords are set correctly and are exactly the same!

        const data = {
            username: document.getElementById("usernameBox").value,
            password: document.getElementById("passwordBox1").value
        }
    
        if (document.getElementById("rememberBtn").checked) {
            cookie.set("username", data.username);
        }

        const promiseResult = await postJSON(data, "/signup");

        console.log(promiseResult);

        if (promiseResult.Error) {

            // window.alert(promiseResult.Error);

            let errorBox = document.createElement("p");
            errorBox.innerText = promiseResult.Error;
            errorBox.style.color = "red";

            document.getElementById("ErrorCheck").appendChild(errorBox);
        } else {
            console.log("not sure why we are here");
        }

    } else {
        window.alert("Passwords do not match!");
    }

    // postJSON(formData, "/signup");
    // postJSON(data, "/signup");

}

function cookieAutoFill() {
    let username = document.getElementById("usernameBox");
    let storedUsername = cookie.get("username");

    if (storedUsername) {
        username.value = storedUsername;
    }
}

const cookie = {
    set: (cname, cvalue, expire) => {
        console.log(`setting ${cname} as a cookie for access later`);

        const d = new Date();
        d.setTime(d.getTime() + expire);
        let expires = "expires="+d.toUTCString();

        let path = "/"; // does this mean current page or site wide?

        document.cookie = `${cname}=${cvalue};${expires};path=${path}`

    },

    get: (cname) => {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }

        }
        return "";

    },

    delete: (cname) => {
        let cvalue = null;
        let expire = `expires=-1;path=/`;

        document.cookie = `${cname}=${cvalue};${expire}`;
    }
}