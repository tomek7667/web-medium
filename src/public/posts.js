const replaceFlag = (str) => {
	return str.replace(/flag\{.*\}/g, "");
};

const refreshPosts = async (adminSuffix = "") => {
	const postsView = document.getElementById("posts-box");
	while (postsView.firstChild) {
		postsView.removeChild(postsView.firstChild);
	}
	const response = await fetch(`/api/posts${adminSuffix}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Cookie: document.cookie,
		},
	});
	if (response.status !== 200) {
		alert("Error: " + response.status);
		return;
	}
	const posts = await response.json();
	const ids = [];
	posts.forEach((post) => {
		const { content, created, id } = post;
		const postView = document.createElement("div");
		const postContent = document.createElement("p");
		// No XSS on my watch
		postContent.innerHTML = DOMPurify.sanitize(content);
		const postDate = document.createElement("div");
		postDate.innerHTML = new Date(created).toLocaleString();
		postView.appendChild(postContent);
		postView.appendChild(postDate);
		const deleteButton = document.createElement("button");
		deleteButton.innerHTML = "Delete";
		deleteButton.id = `delete-button${id}`;
		postView.appendChild(deleteButton);
		postView.innerHTML += `<div>id: ${id}</div><hr/><br/>`;
		postView.id = id;
		// Remove any flags from the post content so it can't be leaked
		postView.innerHTML = replaceFlag(postView.innerHTML);
		postsView.appendChild(postView);
		ids.push(id);
	});
	ids.forEach((id) => {
		document
			.getElementById(`delete-button${id}`)
			.addEventListener("click", () => {
				deletePost(id);
			});
	});
};

const deletePost = async (id) => {
	const response = await fetch(`/api/posts/${id}`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Cookie: document.cookie,
		},
	});
	if (response.status !== 200) {
		alert("Error: " + response.status);
		return;
	}
	refreshPosts();
};

const addPost = async () => {
	const post = document.getElementById("content").value;
	const response = await fetch("/api/posts", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Cookie: document.cookie,
		},
		body: JSON.stringify({ post }),
	});
	if (response.status !== 200) {
		alert("Error: " + response.status);
		return;
	}
	refreshPosts();
};

window.addEventListener("DOMContentLoaded", () => {
	// get user params
	const urlParams = new URLSearchParams(window.location.search);
	const username = urlParams.get("view");
	if (username) {
		refreshPosts(`?view=${username}`);
	} else {
		refreshPosts();
	}

	document.getElementById("post-form").addEventListener("submit", (e) => {
		e.preventDefault();
		addPost();
	});
});
