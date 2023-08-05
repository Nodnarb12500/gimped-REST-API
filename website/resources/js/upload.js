/**
 * This file should take the form data and the files and upload both sets of data to the server though 2 different post requests
 * TODO:
 *  - Create a function to send data to the server via a POST request [Using fetch()]
 *  - attempt to display the data sent from the server on the screen somewhere 
 *      - this could be useful for failed signups/logins in the future
 *  - once sending and receiving data is working, create the form for both upload types
 *      - both of these API calls should happen at the same time. (one can fail because of the API limits)
 *      - Downloads should be directed into their own folder and filepaths should be generated on the server
 */

function start() {
    // this file is for adding listeners to things

    let uploadForm = document.getElementById("uploadForm")
    let submitBtn = document.getElementById("submitBtn");
    let fileUpload = document.getElementById("fileUpload")

    uploadForm.addEventListener("submit", (e) => {
        e.preventDefault();
    });

    submitBtn.addEventListener("click", (e) => {
        e.preventDefault();
        upload();
    })

    // auto populate the file name box
    fileUpload.addEventListener("change", (e) => {
        e.preventDefault();
        document.getElementById("fileName").value = fileUpload.value.slice(12);
    });

    document.getElementById("verKeyBox").value = cookie.get("verKey");

}

async function postRequest(formData, path) {
    try {
        const response = fetch(path, {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error:", error)
    }
}

function upload() {
    // this is where the form information is gatherd before getting set to the server
    // this form information can use formData objects since it needs to be a multi-part/form for file uploads!
    // attempt to get authenication with cookies?

    let formData = new FormData(document.getElementById("uploadForm"));
    // add any other random form entries?


    // send this via a post request and process the response!
     


    // wtf did we send to the server?
    for (var pair of formData.entries()) {
        console.log(pair[0]+ ', ' + pair[1]); 
    }

    postRequest(formData, "/upload");

}