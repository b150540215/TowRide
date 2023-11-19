const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const { Client } = require("pg");

const client = new Client({
	connectionString:
		"postgres://towrideuser:9NmWDkSXwqB5LNQSVM2iXq9D5xbNM6uN@dpg-cld3vmeg1b2c73f3qbe0-a.ohio-postgres.render.com/towridedb?sslmode=require",
});

client.connect((err) => {
	if (err) {
		console.error("Failed to connect to the database!", err.stack);
	} else {
		console.log("Successfully connected to the database.");
	}
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
