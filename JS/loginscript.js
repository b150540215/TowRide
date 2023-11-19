document.addEventListener("DOMContentLoaded", function () {
	const loginForm = document.getElementById("loginForm");
	const registerForm = document.getElementById("registerForm");

	loginForm.addEventListener("submit", function (e) {
		e.preventDefault();
		const formData = new FormData(this);
		submitForm("/submit-login", formData);
	});

	registerForm.addEventListener("submit", function (e) {
		e.preventDefault();
		const formData = new FormData(this);
		submitForm("/submit-registration", formData);
	});
});

function submitForm(url, formData) {
	fetch(url, {
		method: "POST",
		body: formData,
	})
		.then((response) => response.text())
		.then((data) => {
			alert(data); // You can replace this with a more sophisticated UI update
		})
		.catch((error) => console.error("Error:", error));
}
