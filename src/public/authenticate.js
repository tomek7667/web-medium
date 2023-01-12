window.addEventListener("DOMContentLoaded", () => {
	document
		.getElementById("auth-form")
		.addEventListener("submit", async (e) => {
			e.preventDefault();
			const username = document.getElementById("username").value;
			const password = document.getElementById("password").value;
			const data = { username, password };
			const response = await fetch("/api/authenticate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});
			if (response.status !== 200) {
				alert("Authentication failed");
				return;
			}
			const { token } = await response.json();
			document.cookie = `token=${token}`;
			window.location.href = "/";
		});
});
