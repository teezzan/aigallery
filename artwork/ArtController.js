var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var cors = require('cors');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../user/User');
var Art = require('./Art');
var VerifyToken = require('../auth/VerifyToken');

var mongoose = require('mongoose');
const crypto = require("crypto");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const path = require("path");

const mongoURI = "mongodb://localhost:27017/aipixdb";

const conn = mongoose.createConnection(mongoURI, {
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
router.post("/upload", cors(), upload.single("file"), (req, res) => {

    // console.log(req);
    var file_info = {
        name: req.body.name,
        description: req.body.description,
        filename: req.file.filename,
        dateCreated: req.file.uploadDate
    }

    // console.log(file_info);

    Art.create(file_info, function (err, art) {
        if (err) return res.status(500).send(err);

        res.status(200).send(file_info);
    })

});

//Vanilla for getting and downloading from common repo 
router.get("/media/:filename", cors(),// VerifyToken, 
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


router.get("/wakeup", cors(), (req, res) => {
    res.status(200).send("Awake.")
})


router.get("/media", (req, res) => {
    Art.find({}, (err, art) => {
        if(err) return res.status(500).send("nothing found");
        res.status(200).send(art);
    });
});

router.get("/:id/like", VerifyToken, (req, res) => {
    console.log(req.params.id)
    Art.findOne({_id: req.params.id}, function (err, art) {
        if(err) return res.status(500).send("error finding id");
        Art.findOneAndUpdate({_id: req.params.id}, {likes: art.likes+1}, { new: true }, function (err, arts) {
            if(err) return res.status(500).send(err);
            res.status(200).send(arts);

        });
    });

});

router.get("/:id/unlike", VerifyToken, (req, res) => {
    
    Art.findOne({_id: req.params.id}, function (err, art) {
        if(err) return res.status(500).send("error finding id");
        Art.findOneAndUpdate({_id: req.params.id}, {likes: Math.abs(art.likes-1)}, { new: true }, function (err, arts) {
            if(err) return res.status(500).send(err);
            res.status(200).send(arts);

        });
    });

});
module.exports = router;