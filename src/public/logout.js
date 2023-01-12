window.addEventListener("DOMContentLoaded", () => {
	document.getElementById("logout").addEventListener("click", async (e) => {
		e.preventDefault();
		document.cookie = "token=";
		window.location.href = "/";
	});
});
