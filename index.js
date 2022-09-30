// importing .env, http, express.js, html body parser, mongoose for MongoDB
require("dotenv").config();
let http = require('http');
let express = require("express");
let bodyParser = require("body-parser");
const { default: mongoose } = require('mongoose');
const { doesNotMatch } = require("assert");
const { createDiffieHellmanGroup } = require("crypto");
let app = express();

// connecting to MongoDB Atlas
mongoose.connect(process.env.ATLAS_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });

// creating schemas
let patientSchema = new mongoose.Schema({
    firstName: {type: String},
    lastName: {type: String},
    email: {type: String},
    password: {type: String}
});
let doctorSchema = new mongoose.Schema({
    firstName: {type: String},
    lastName: {type: String},
    email: {type: String},
    password: {type: String}
})
let bookingSchema = new mongoose.Schema({
    doctorName: {type: String},
    patientName: {type: String},
    date: {type: String},
    time: {type: String}
})

// creating models
let Patient = mongoose.model("Patient", patientSchema);
let Doctor = mongoose.model("Doctor", doctorSchema);
let Booking = mongoose.model("Booking", bookingSchema);

// initializing server
app.listen(8080, "localhost");

// middleware
app.use("/", (req, res, next) => {
    console.log(req.method + req.ip + req.path);
    next();
});

app.use("/resources", express.static(__dirname + "/resources"));
app.use("/html", express.static(__dirname + "/html"));

// root path request and response
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/html/home.html");
});

app.post("/signin", bodyParser.urlencoded({extended: false}) ,(req, res) => {
    if(req.body.isDoctor) {
        Doctor.find({email: req.body.username}, (error, data) => {
            if(!error) {
                if(req.body.password == data[0].password) {
                    res.sendFile(__dirname + "/html/doctorHome.html");
                }
                else {
                    res.sendFile(__dirname + "/html/home.html");
                }
            }
            else {
                res.sendFile(__dirname + "/html/home.html");
            }
        })
    }
    else {
        Patient.find({email: req.body.username}, (error, data) => {
            if(!error) {
                if(req.body.password == data[0].password) {
                    res.sendFile(__dirname + "/html/doctorHome.html");
                }
                else {
                    res.sendFile(__dirname + "/html/home.html");
                }
            }
            else {
                res.sendFile(__dirname + "/html/home.html");
            }
        })
    }
})

app.post("/signup", bodyParser.urlencoded({extended: false}) ,(req, res) => {
    temp = new Patient({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.username,
        password: req.body.password,
    })
    if(req.body.tnc) {
        temp.save((error, data) => {
            if(!error) {
                res.sendFile(__dirname + "/html/signin.html")
            }
        })
    }
})

app.get("/doctors", (req, res) => {
    Doctor.find({}, (error, data) => {
        res.render("doctorsList.ejs", {
            doctorsList: data
        })
    })
})