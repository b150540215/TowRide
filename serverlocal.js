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

const isProduction = process.env.NODE_ENV === "production";
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false, // For Heroku, you may need this to be false if using a free tier PostgreSQL plan
		// This requires the server's CA certificate. For Heroku and other managed databases, they often provide a valid certificate.
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

app.use(express.json());

app.post("/submit-login", upload.none(), async (req, res) => {
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
				res.json({ message: "Login successful" });
			} else {
				res.json({ message: "Invalid password" });
			}
		} else {
			res.json({ message: "User not found" });
		}
	} catch (error) {
		console.error(error);
		res.status(500).send("Error logging in");
	}
});

app.post("/submit-registration", upload.none(), async (req, res) => {
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

	const userEmailAddress = new_email; // User's email address
	var token;
	try {
		token = await sendVerificationEmail(userEmailAddress);
	} catch (error) {
		console.error(error);
		throw error;
	}

	try {
		await pool.query(
			"INSERT INTO users (username, password, email, verification_code) VALUES ($1, $2, $3, $4)",
			[new_uname, hashedPassword, new_email, token]
		);
		res.json({ message: "User registered successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).send("Error registering the user");
	}
});

async function sendVerificationEmail(userEmailAddress) {
	const token = generateVerificationToken();
	let mailOptions = {
		from: "towridetec@gmail.com",
		to: userEmailAddress,
		subject: "Towride Email Verification",
		text: `Please verify your email by entering this code: ${token}`,
	};

	try {
		let info = await transporter.sendMail(mailOptions);
		console.log("Email sent: " + info.response);
		return token;
	} catch (error) {
		console.error(error);
		throw error; // Rethrow the error so it can be handled by the caller
	}
}

app.post("/resend-verification-email", async (req, res) => {
	console.log(req.body);
	const { email } = req.body;

	try {
		const userResult = await pool.query(
			"SELECT is_verified FROM users WHERE email = $1",
			[email]
		);

		if (userResult.rows.length > 0) {
			const isVerified = userResult.rows[0].is_verified;
			if (isVerified) {
				return res.json({ message: "Email is already verified." });
			}
		} else {
			return res.json({ message: "Email not registered" });
		}

		// At this point, the email is not verified and is a valid email
		const token = await sendVerificationEmail(email);
		await pool.query(
			"UPDATE users SET verification_code = $1 WHERE email = $2",
			[token, email]
		);
		return res.json({
			message: "Verification email resent successfully.",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).send("Error processing request");
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

app.post("/verify-email", upload.none(), async (req, res) => {
	const { verify_email, verify_code } = req.body;

	try {
		const userResult = await pool.query(
			"SELECT * FROM users WHERE email = $1",
			[verify_email]
		);

		if (userResult.rows.length > 0) {
			if (userResult.rows[0].is_verified == true) {
				return res.json({ message: "Email already verified, ready to log in" });
			}
			if (verify_code == userResult.rows[0].verification_code) {
				await pool.query(
					"UPDATE users SET is_verified = true WHERE email = $1",
					[verify_email]
				);
				return res.json({ message: "Email verified successfully" });
			} else {
				return res.json({ message: "Verification code incorrect" });
			}
		} else {
			return res.json({ message: "Email not registered" });
		}
	} catch (error) {
		console.error("Error verifying email:", error);
		res.status(500).send("Error during verification");
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
