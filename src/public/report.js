window.addEventListener("DOMContentLoaded", () => {
	document
		.getElementById("report-form")
		.addEventListener("submit", async (e) => {
			e.preventDefault();
			await fetch("/api/report", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Cookie: document.cookie,
				},
			});
			if (response.status !== 200) {
				alert("Error: " + response.status);
				return;
			} else {
				alert("Post reported successfully");
			}
		});
});
