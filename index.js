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

// creating user schema
let userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String},
    isAdmin: {type: Boolean, default: false}
});

// creating user model
let User = mongoose.model("User", userSchema);

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