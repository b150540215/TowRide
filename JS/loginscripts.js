document.addEventListener("DOMContentLoaded", function () {
	const loginForm = document.getElementById("loginForm");
	const registerForm = document.getElementById("registerForm");
	const verificationForm = document.getElementById("verificationForm");

	loginForm.addEventListener("submit", function (event) {
		event.preventDefault();
		submitForm("/submit-login", new FormData(this), false);
	});

	registerForm.addEventListener("submit", function (event) {
		event.preventDefault();
		const formData = new FormData(this);
		submitForm("/submit-registration", formData, true);
	});

	verificationForm.addEventListener("submit", function (event) {
		event.preventDefault();
		const formData = new FormData(this);

		// Log each key-value pair in the FormData object
		for (let [key, value] of formData.entries()) {
			console.log(key, value);
		}
		submitForm("/verify-email", formData, false);
	});
});

document
	.getElementById("toggleRegisterForm")
	.addEventListener("click", function () {
		var loginForm = document.getElementById("loginFormdiv");
		var registerForm = document.getElementById("registerFormdiv");

		if (loginForm.style.display === "none") {
			loginForm.style.display = "block";
			registerForm.style.display = "none";
			this.textContent = "Register"; // Change button text to 'Register'
		} else {
			loginForm.style.display = "none";
			registerForm.style.display = "block";
			this.textContent = "Login"; // Change button text to 'Login'
		}
	});

function submitForm(url, formData, isRegistration = false) {
	fetch(url, {
		method: "POST",
		body: formData,
	})
		.then((response) => response.json())
		.then((data) => {
			alert(data.message); // Use the 'message' property from the JSON response
			if (isRegistration && data.message.includes("successful")) {
				document.getElementById("registerFormdiv").style.display = "none";
				document.getElementById("verificationFormdiv").style.display = "block";
			}
		})
		.catch((error) => console.error("Error:", error));
}

document.getElementById("resendButton").addEventListener("click", function () {
	const email = document.getElementById("verifyEmailInput").value;
	if (!email) {
		alert("Please enter your email address.");
		return;
	}
	console.log(email);
	fetch("/resend-verification-email", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email: email }), // Use the email variable here
	})
		.then((response) => response.json())
		.then((data) => {
			alert(data.message); // Display a success/failure message from the server
		})
		.catch((error) => {
			console.error("Error:", error);
			alert("An error occurred while sending the email.");
		});
});
