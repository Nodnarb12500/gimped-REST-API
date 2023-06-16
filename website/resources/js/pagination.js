/* The Goal of this file is to create a general pagination file. 
 * while this might not get used in some projects this will be an example for how to make it work in a project someone is making
 * Ive made several projects off of this template before and for a large amount of them i needed pagination. i also want to have some kind of sorting
 * but i dont know the best way to have sorting just yet.
 */

// function search(path, page) {
//     // create the search request here and then send it to the search thing
//     url = window.location.href.split('/');
//     page = parseInt(page) - 1;
  
//     if (path == "") {
//       path = "all";
//       document.title = "Search: Everything";
//     } else {
//       document.title = "Search: " + path;
//     }
//     let search = url[0] + "//" + url[2] + "/db/search/" + path + "/" + page;
  
//     searchMedia(search).then(result => {
//       console.log(JSON.parse(result));
//       searchResults(JSON.parse(result));
//     });
  
//     pagesBar(page);
// }

/* dependencies these will go into their own file eventually! */
/* This stuff here mighe get changed to a POST request since i decided thats what i want the API to use now */
function getJSON(url, callback) {
    /* Needed for sending requests to the server */
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};
var url;

function searchMedia(search) {
    return new Promise(function(resolve, reject) {
      getJSON(search, (err, data) => {
        if (err !== null) {
          alert("something went wrong: " + err);
          reject(err);
        } else {
          thing = JSON.stringify(data);
          resolve(thing);
            }
      })
    })
}

// some of the code above has been replaced with something called fetch()
// and will eventually be replaced with fetch();
// fetch can also do post requests which ill be using!

function search(path, count, page) {
    // count = items per page
    // page = page to get
    // path is search terms?
}

function pagination(page) {
    // there will be 7 buttons
    // First, 1, 2, 3, 4, 5, Last
    // the 1-5 buttons will change based on what page we are on and after page 3 page 1 will become page 2
    // and all the numbers should reflect that change

    for (i = 0; i > 8; i++) {
        console.log("Weiner! " + i);
    }
}