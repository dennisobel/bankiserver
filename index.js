var express  = require('express');
var routes = require("./app/routes/routes");
var app      = express();
var session = require('express-session');
var server = require('http').createServer(app);
var socketio = require('socket.io');
var io = socketio().listen(server)
var bodyParser = require("body-parser");
var cors = require('cors');
var logger = require('morgan');
var mongoose = require('mongoose');
var multer = require('multer')




let Image = require('./app/models/image');
let path = require('path');
let fs = require('fs');
let del = require('del');

// mongoose.Promise = require('bluebird');
//connect to mongo using mongoose
let UPLOAD_PATH = 'uploads'
// let PORT = 3000;

var storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, UPLOAD_PATH)
    },
    filename: (req,file,cb) => {
        cb(null,file.fieldname + '-' + Date.now())
    }
})
let upload = multer({storage:storage})

var databaseConfig = require('./app/config/database');

mongoose.connect(databaseConfig.url,{useNewUrlParser: true});

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || '127.0.0.1'

app.use(session({
    secret:'SleepyeyeS2017',
    resave: true,
    saveUninitialized: true
}));

app.use(cors());

app.use(function(req,res,next){   
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");    
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", true);
    console.log(req.headers.origin)
    return next();
    
    return next();
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));



// IMAGE UPLOAD
    // UPLOAD A NEW IMAGE WITH DESCRIPTION
    app.post('/images', upload.single('image'), (req, res, next) => {
        // Create a new image model and fill the properties
        let newImage = new Image();
        newImage.filename = req.file.filename;
        newImage.originalName = req.file.originalname;
        newImage.desc = req.body.desc
        newImage.save(err => {
            if (err) {
                return res.sendStatus(400);
            }
            res.status(201).send({ newImage });
        });
    });

    // GET ALL UPLOADED IMAGES
    app.get('/images', (req, res, next) => {
        // use lean() to get a plain JS object
        // remove the version key from the response
        Image.find({}, '-__v').lean().exec((err, images) => {
            if (err) {
                res.sendStatus(400);
            }
     
            // Manually set the correct URL to each image
            for (let i = 0; i < images.length; i++) {
                var img = images[i];
                img.url = req.protocol + '://' + req.get('host') + '/images/' + img._id;
            }
            res.json(images);
        })
    });

    // GET ONE IMAGE BY ITS ID
    app.get('/images/:id', (req, res, next) => {
        let imgId = req.params.id;
     
        Image.findById(imgId, (err, image) => {
            if (err) {
                res.sendStatus(400);
            }
            // stream the image back by loading the file
            res.setHeader('Content-Type', 'image/jpeg');
            fs.createReadStream(path.join(UPLOAD_PATH, image.filename)).pipe(res);
        })
    });

    // DELETE ONE IMAGE BY ID
    app.delete('/images/:id', (req, res, next) => {
        let imgId = req.params.id;
     
        Image.findByIdAndRemove(imgId, (err, image) => {
            if (err && image) {
                res.sendStatus(400);
            }
     
            del([path.join(UPLOAD_PATH, image.filename)]).then(deleted => {
                res.sendStatus(200);
            })
        })
    });


var clients = {};
require('./socket/socket.js')(io,clients)

server.listen(PORT,()=>console.log(`Live on ${PORT}`))
routes(app,UPLOAD_PATH,upload);

// export default app;
// module.exports.app = app

