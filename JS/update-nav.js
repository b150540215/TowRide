document.addEventListener("DOMContentLoaded", function () {
	fetch("/check-login")
		.then((response) => response.json())
		.then((data) => {
			if (data.loggedIn) {
				const loginLink = document.querySelector('a[href="login.html"]');
				if (loginLink) {
					loginLink.setAttribute("href", "account.html");
					loginLink.textContent = "Account";
				}
			}
		})
		.catch((error) => console.error("Error checking login status:", error));
});
