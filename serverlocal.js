const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const nodemailer = require("nodemailer");

const pool = new Pool({
	connectionString:
		"postgres://towrideuser:9NmWDkSXwqB5LNQSVM2iXq9D5xbNM6uN@dpg-cld3vmeg1b2c73f3qbe0-a.ohio-postgres.render.com/towridedb?sslmode=require",
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
	const hashedPassword = await bcrypt.hash(new_psw, 10);

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

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		type: "OAuth2",
		user: "towridetec@gmail.com",
		clientId:
			"115998107263-k2gikspnflophc64rrljul4o99b17a0g.apps.googleusercontent.com",
		clientSecret: "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",
		refreshToken:
			"1//04RniMtKrsuocCgYIARAAGAQSNwF-L9Irgqpc1ty8pZ_sRYY-SzzKSNtFT5xLVlJ2dGX2Bp2XLuZSEnGFuWm_sUCGXMwk8CmRGgg",
	},
});

function generateVerificationToken() {
	// Generate a random number between 100000 and 999999
	return Math.floor(100000 + Math.random() * 900000);
}

app.listen(3000, function () {
	console.log("Server is running on port 3000");
});
