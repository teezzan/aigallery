var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../user/User');
var Art = require('./Art');

var mongoose = require('mongoose');
const crypto = require("crypto");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const path = require("path");

const mongoURI = "mongodb://localhost:27017/aipixdb";

const conn = mongoose.createConnection(mongoURI,  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

// init gfs
let gfs;
conn.once("open", () => {
  // init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads"
  });
});


// Storage
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString("hex") + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: "uploads"
          };
          resolve(fileInfo);
        });
      });
    }
  });
  
  const upload = multer({
    storage
  });

  

  //vanilla upload or not 
router.post("/upload", upload.single("file"), (req, res) => {
    
    console.log(req);
    var file_info = {
      id: req.file.id,
      filename: req.file.filename,
      content_type: req.file.contentType,
      dateCreated: req.file.uploadDate,
      size: req.file.size
    }
  
    // console.log(file_info);
  
    // Art.create(file_info, function (err, art){
    //     if (err) return res.status(500).send("error uploading");
       
    //     res.status(200).send(art)
    // })
   console.log(file_info);
  
  });
  
  //Vanilla for getting and downloading from common repo 
  router.get("/media/:filename", //cors(),// VerifyToken, 
    (req, res) => {
      const file = gfs
        .find({
          filename: req.params.filename
        })
        .toArray((err, files) => {
          if (!files || files.length === 0) {
            return res.status(404).json({
              err: "no files exist"
            });
          }
          gfs.openDownloadStreamByName(req.params.filename).pipe(res);
        });
    });
  
  module.exports = router;