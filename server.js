const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const { Pool } = require("pg");

const pool = new Pool({
	user: "TowRideDB",
	host: "database-1.cttspqpwh5sj.us-east-2.rds.amazonaws.com",
	database: "postgres",
	password: "bmtg020822",
	port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, "HTML")));

app.use("/CSS", express.static(path.join(__dirname, "CSS")));

app.use("/JS", express.static(path.join(__dirname, "JS")));

app.post("/submit-login", function (req, res) {
	// Validate and process login form
	// Check user credentials against database
});

app.post("/submit-registration", function (req, res) {
	// Validate and process registration form
	// Insert new user data into database
});

app.listen(3000, function () {
	console.log("Server is running on port 3000");
});
