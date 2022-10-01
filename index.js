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
    patientEmail: {type: String},
    patientName: {type: String},
    date: {type: String},
    time: {type: String}
})
let contactFormSchema = new mongoose.Schema({
    firstName: {type: String},
    lastName: {type: String},
    email: {type: String},
    phone: {type: String},
    comment: {type:String}
})

// creating models
let Patient = mongoose.model("Patient", patientSchema);
let Doctor = mongoose.model("Doctor", doctorSchema);
let Booking = mongoose.model("Booking", bookingSchema);
let Query = mongoose.model("Query", contactFormSchema)

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
app.get("/", async (req, res) => {
    res.sendFile(__dirname + "/html/home.html");
});

app.post("/signin", bodyParser.urlencoded({extended: false}) ,(req, res) => {
    Patient.find({email: req.body.username}, (error, data) => {
        if(!error) {
            if(req.body.password == data[0].password) {
                Booking.find({patientEmail: req.body.username}, (error, data) => {
                    if(!error) {
                        res.render("patientHome.ejs", {
                            bookingsList: data
                        })
                    }
                })
            }
        }
    })
})

app.post("/doctor-view", bodyParser.urlencoded({extended: false}) ,(req, res) => {
    Doctor.find({email: req.body.username}, (error, data) => {
        if(!error) {
            if(req.body.password == data[0].password) {
                Booking.find({doctorName: data[0].firstName}, (error, bookings) => {
                    if(!error) {
                        res.render("doctorHome.ejs", {
                            bookingsList: bookings
                        })
                    }
                })
            }
        }
    })
})

app.post("/admin-view", bodyParser.urlencoded({extended: false}) ,(req, res) => {
    if((req.body.password == process.env.ADMIN_PASSWORD) && (req.body.username == process.env.ADMIN_USERNAME)) {
        res.sendFile(__dirname + "/html/adminHome.html")
    }
})

app.post("/availability", bodyParser.urlencoded({extended: false}) ,(req, res) => {
    Booking.find({doctorName: req.body.doctorName}, (error, bookings) => {
        if(!error) {
            res.render("doctorSlots.ejs", {
                bookingsList: bookings
            })
        }
    })
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

app.post("/contactUs", bodyParser.urlencoded({extended: false}) ,(req, res) => {
    temp = new Query({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.patientEmail,
        phone: req.body.patientPhone,
        comment: req.body.comments
    })
    temp.save((error, data) => {
        if(!error) {
            res.sendFile(__dirname + "/html/home.html")
        }
    })
})

app.post("/subscribe", bodyParser.urlencoded({extended: false}) ,(req, res) => {
    temp = new Query({
        email: req.body.subscribedEmail,
        comment: "Subscriber"
    })
    temp.save((error, data) => {
        if(!error) {
            res.sendFile(__dirname + "/html/home.html")
        }
    })
})

app.get("/doctors", (req, res) => {
    Doctor.find({}, (error, data) => {
        res.render("doctorsList.ejs", {
            doctorsList: data
        })
    })
})

app.post("/createBooking", bodyParser.urlencoded({extended: false}), (req, res) => {
    temp = new Booking({
        doctorName: req.body.doctorName,
        patientName: req.body.firstName + " " + req.body.lastName,
        patientEmail: req.body.patientEmail,
        date: req.body.date.substring(0, 10),
        time: req.body.time
    })
    temp.save((error, data) => {
        if(!error) {
            res.render("singleBooking.ejs", {
                booking: data
            })
        }
    })
})
app.post("/searchBooking", bodyParser.urlencoded({extended: false}), (req, res) => {
    Booking.find({ _id: req.body.bookingID }, (error, data) => {
        if(!error) {
            res.render("singleBooking.ejs", {
                booking: data[0]
            })
        }
    })
})

app.post("/allBookings", bodyParser.urlencoded({extended: false}), (req, res) => {
    Booking.find({ }, (error, data) => {
        if(!error) {
            res.render("allBookings.ejs", {
                bookingsList: data
            })
        }
    })
})

app.post("/allQueries", bodyParser.urlencoded({extended: false}), (req, res) => {
    Query.find({ }, (error, data) => {
        if(!error) {
            res.render("allQueries.ejs", {
                Queries: data
            })
        }
    })
})

app.post("/deleteBooking", bodyParser.urlencoded({extended: false}), (req, res) => {
    if(req.body.deleteBookingID == process.env.DELETE_ALL_BOOKINGS_CODE) {
        Booking.deleteMany({}, (error, data) => {
            if(!error) {
                res.sendFile(__dirname + "/html/adminHome.html")
            }
        });
    }
    Booking.deleteMany({ _id: req.body.deleteBookingID }, (error, data) => {
        if(!error) {
            res.sendFile(__dirname + "/html/adminHome.html")
        }
    })
})
app.post("/deleteQuery", bodyParser.urlencoded({extended: false}), (req, res) => {
    Query.deleteOne({ email: req.body.deleteQueryEmail }, (error, data) => {
        if(!error) {
            res.sendFile(__dirname + "/html/adminHome.html")
        }
    })
})