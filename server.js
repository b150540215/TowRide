const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const nodemailer = require("nodemailer");
const multer = require("multer");
const upload = multer();
require("dotenv").config();
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: true,
	},
});

pool.connect((err) => {
	if (err) {
		console.error("Failed to connect to the database!", err.stack);
	} else {
		console.log("Successfully connected to the database.");
	}
});

app.use(bodyParser.urlencoded({ extended: true }));
// Serve static files from the root directory
app.use(express.static(path.join(__dirname, "html")));

app.use("/CSS", express.static(path.join(__dirname, "CSS")));

app.use("/JS", express.static(path.join(__dirname, "JS")));

app.post("/submit-login", async (req, res) => {
	const { uname, psw } = req.body;

	try {
		const userResult = await pool.query(
			"SELECT * FROM users WHERE username = $1",
			[uname]
		);
		if (userResult.rows.length > 0) {
			const validPassword = await bcrypt.compare(
				psw,
				userResult.rows[0].password
			);
			if (validPassword) {
				res.send("Login successful");
			} else {
				res.send("Invalid password");
			}
		} else {
			res.send("User not found");
		}
	} catch (error) {
		console.error(error);
		res.status(500).send("Error logging in");
	}
});

app.post("/submit-registration", async (req, res) => {
	const { new_uname, new_psw, new_email } = req.body;
	if (!new_uname || !new_psw || !new_email) {
		return res.status(400).send("Missing fields in request");
	}

	var hashedPassword;
	try {
		hashedPassword = await bcrypt.hash(new_psw, 10);
		// ... rest of your code ...
	} catch (error) {
		console.log(error);
	}

	const token = generateVerificationToken();
	const userEmailAddress = new_email; // User's email address
	let mailOptions = {
		from: "towridetec@gmail.com",
		to: userEmailAddress,
		subject: "Towride Email Verification",
		text: `Please verify your email by entering this code: ${token}`,
	};

	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(error);
		} else {
			console.log("Email sent: " + info.response);
		}
	});

	try {
		await pool.query(
			"INSERT INTO users (username, password, email) VALUES ($1, $2, $3)",
			[new_uname, hashedPassword, new_email]
		);
		res.send("User registered successfully");
	} catch (error) {
		console.error(error);
		res.status(500).send("Error registering the user");
	}
});

//use nodemailer to send verification code to user email
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		type: "OAuth2",
		user: "towridetec@gmail.com",

		//console.cloud.google, project: OAuth2
		clientId:
			"115998107263-k2gikspnflophc64rrljul4o99b17a0g.apps.googleusercontent.com",
		clientSecret: "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",

		//OAuth2.0 Playground, API = GMAIL API v1;
		refreshToken:
			"1//04_AT82PiPIHJCgYIARAAGAQSNwF-L9Irjr--shqMUdx2TM7mibn1diDKY_P859veewUodgF0LH_42h1UH3RCj81_IEReB2PdPkM",
	},
});

function generateVerificationToken() {
	// Generate a random number between 100000 and 999999
	return Math.floor(100000 + Math.random() * 900000);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
