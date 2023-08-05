const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const {formidable, errors} = require("formidable");
const fs = require('node:fs');

const {FFmpegCommand, FFmpegInput, FFmpegOutput} = require('fessonia')({
  debug: true,
  log_warnings: true
});

const db = require("../db/database");
const verification = require("../verification");
const logging = require("../logging");
const config = require("../config");

// this is to help determine the root folder
const rootFolder = `${__dirname}/..`;
app.use(cookieParser());

app.get("/upload", (req, res) => {
    res.status(200).sendFile("website/html/upload.html", {root: rootFolder});

}).post("/upload", (req, res) => {
  // send file to file saver function that returns its saved path
  // take the new saved path and extra variables not yet added "likes/rating, etc, etc"
  // save the data to database
/**
 * TODO
 *    - compress files, and place files in their new homes generating any required directorys
 *      - Files must be accessible everywhere. they are not protected by the token by default! (unrealistic fix)
 *    - make sure we know the path of the file so we can save the path and finally create the database entry
 * 
 * 
 *    - new table
 *      - id        (auto handled by database)
 *      - desc      (fields.desc)
 *      - tag       (fields.tag)
 *      - filepath  (file.newpath/file.originalFilename)
 *      - filetype  (files.mimetype.split('/')[0])
 *      - likes     (int, 0)
 *      - comments  (test, null)
 *      - uploader
 * 
 */

  parseCookies(req.cookies);

  parseForm(req).then(async result => {
    let files = result.files;
    let fields = result.fields;

    fields = json2obj(fields);
    fields = upload(files.fileUpload[0], fields);

    // REMOVE THESE IF YOU DON'T NEED
    fields.uploader = req.cookies["username"];

    console.log(fields);
    let dbPost = await db.createRow("content", fields);

    console.log(result);

    res.status(200).json({"Success": dbPost});

  }).catch((err) => {
    console.error(err.stack);
    res.status(401).json({"Error": `${err.stack}`});
  });

});

async function parseForm(req) {
  const form = formidable({});
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.log(`${err}\n\n${err.stack}`);
        return err.stack;
      }

      let data = {fields, files}
      resolve(data);
    });
  });
}

/* The 2 functions below are for dealing with data so I can use it directly */

function json2obj(json) {
  // this needs renamed. none of the data inputted is actualy JSON.
  // currently this is being used to remove the arrays fomidible automatically adds to all the variables

  json = JSON.parse(JSON.stringify(json)); // distructivly redefine json variable convert. helps sometimes
  let jsonArray = JSON.stringify(json).split(',');
  let objNames = []; let objValues = [];

  jsonArray.forEach(element => {
    let newstr = element.replace(/["{}\[\]]/g, '').split(':'); // remove all the characters that are in the way

    objNames.push(newstr[0]); // append the names
    objValues.push(newstr[1]); // append the values
  });

  let obj = {} // create an empty object
  if (objNames.length == objValues.length) {
    for (let i = 0; i < objNames.length; i++) { obj[objNames[i]] = objValues[i]; } // take the 2 values from before and push them into a new object
  } else {console.log("something that shouldnt happen somehow happened!");}
  
  return obj;
}

function parseCookies(cookies) {
  /**
   * TODO
   *  redirect users to login page if verification fails
   */

  if (cookies['username'] && cookies['verKey']) {
    if (verification.checkToken(cookies['username'], cookies['verKey'])) {
      // user is logged in
    } else {
      // redirect the user to login page!
      res.status(400).json({"Error": "You need to login!"});
      return false;
    }
  } else {
    // redirect the user to login page!
    res.status(400).json({"Error": "You need to login!"});
    return false;
  }
}

/* the 2 functions below are for dealing with files */

function upload(file, fields) {
  let folder = logging.datetime("folderDate");
  let absoPath = `${rootFolder}/website/resources/media/${folder}`; // this works
  file.newPath = absoPath;
  runFfmpeg(file);

  let filetype = file.mimetype.split('/')[0];

  let path;
  if (filetype === "image") {
    path = `/resources/media/${folder}/${file.originalFilename.split('.')[0]}.webp`;
  } else if (filetype === "audio") {
    console.log("Audio is not supported yet!");
  } else if (filetype === "video") {
    // this is video? perhaps should be done the same as above and else used as a catch weird files
    path = `/resources/media/${folder}/${file.originalFilename}`;
  } else {
    
  }

  fields.filePath = path;
  fields.fileType = filetype;
  return fields;
}

function runFfmpeg(file) {
  fs.mkdir(file.newPath, {recursive: true}, (err) => {if (err) {logging.logging(err, "ERROR");}}); // make the directory for the day

  if (file.mimetype.includes("image")) {
    // compress the image and save it to its new path
    const ffin = new FFmpegInput(file.filepath);
    const ffout = new FFmpegOutput(`${file.newPath}/${file.originalFilename.split('.')[0]}.webp`);

    const cmd = new FFmpegCommand();
    cmd.addInput(ffin);
    cmd.addOutput(ffout);
    cmd.execute();

  } else if (file.mimetype.includes("video")) {
    let encoding = false;
    if (encoding) {
    // Converting Video files to webp might not be worth doing!
    // takes a huge amount of power to convert video!

    /**
     * TODO
     *  config to enable video reencoding
     */


    } else {
      // let source = fs.createReadStream(file.filepath);
      // let dest = `${file.newPath}/${file.originalFilename}`

      // source.pipe(dest);
      // source.on('end', () => {
      //   console.log("Done!");
      // })
      // source.on('error', () => {
      //   console.log("Error!");
      // })



      fs.createReadStream(file.filepath).pipe(fs.createWriteStream(`${file.newPath}/${file.originalFilename}`))
      .on("end", () => {console.log("Done")}).on("error", () => {console.log("Error!")});
    }

  } else if (file.mimetype.includes("audio")) {
    console.log(`audio is not yet supported but is planned to be supported!`);
  } else {
    console.log(`unknown type ${type}`);
    return false;
  }

  return true; // error checking for if it succeeded 
}

module.exports = app;