import express from "express";
import jsonwebtoken from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { __express as pug } from "pug";
import { randomBytes } from "crypto";
import { addPost } from "./post.js";
import { flag } from "./flag.js";
import { verifyPost } from "./bot.js";

const adminPassword = randomBytes(0xff).toString("hex");
const app = express();
const port = 3000;
const users = new Map();
export let posts = [];
const secret = randomBytes(0xff).toString("hex");

users.set("admin", { password: adminPassword, posts: [] });
users
	.get("admin")
	.posts.push(addPost(`<h1>This is my private note:</h1> <b>${flag}</b>`));

app.engine("pug", pug);
app.set("view engine", "pug");
app.set("views", "templates");

app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

const authenticate = (req, res, next) => {
	try {
		const token = req.cookies.token;
		if (!token) {
			return res.redirect("/");
		}
		const { username } = jsonwebtoken.verify(token, secret);
		req.username = username;
		return next();
	} catch (e) {
		return res.redirect("/");
	}
};

// Routes

app.get("/", (req, res) => {
	try {
		const { token } = req.cookies;
		const decoded = jsonwebtoken.verify(token, secret);
		return res.render("index", { username: decoded.username });
	} catch (e) {
		return res.render("index");
	}
});

app.get("/posts", authenticate, (req, res) => {
	return res.render("posts");
});

app.get("/api/posts", authenticate, (req, res) => {
	const ip_address =
		req.headers["x-forwarded-for"] || req.socket.remoteAddress;
	if (
		req.username === "admin" &&
		(ip_address !== "localhost" || ip_address !== "::1") &&
		req.query.view
	) {
		const { view } = req.query;
		if (!users.has(view)) {
			return res.status(404).send("User not found");
		}
		return res
			.status(200)
			.json([...users.get(req.username).posts, ...users.get(view).posts]);
	}
	return res.status(200).json(users.get(req.username).posts);
});

app.post("/api/posts", authenticate, (req, res) => {
	try {
		const { post } = req.body;
		const { username } = req;
		users.get(username).posts.push(addPost(post));
		return res.status(200).send("Post added");
	} catch (e) {
		return res.status(500).send("Something went wrong");
	}
});

app.delete("/api/posts/:id", authenticate, (req, res) => {
	try {
		const { id } = req.params;
		const { username } = req;
		const user = users.get(username);
		const post = user.posts.find((post) => post.id === id);
		if (!post) {
			return res.status(404).send("Post not found");
		}
		posts = posts.filter((post) => post.id !== id);
		user.posts = user.posts.filter((post) => post.id !== id);
		return res.status(200).send("Post deleted");
	} catch (e) {
		return res.status(500).send("Something went wrong");
	}
});

app.post("/api/report", authenticate, (req, res) => {
	try {
		const { username } = req;
		verifyPost(username, adminPassword);
		return res.status(200).send("Reported");
	} catch (e) {
		return res.status(500).send("Something went wrong");
	}
});

app.post("/api/authenticate", (req, res) => {
	try {
		const { username, password } = req.body;
		if (!/^[a-zA-Z0-9]+$/.test(username) || username.length > 100) {
			return res.status(401).send("Invalid characters");
		}
		if (!users.has(username)) {
			users.set(username, { password, posts: [] });
			const token = jsonwebtoken.sign({ username }, secret);
			return res.status(200).send({ token });
		}
		if (users.get(username).password !== password) {
			return res.status(401).send("Invalid credentials");
		}
		const token = jsonwebtoken.sign({ username }, secret);
		return res.status(200).send({ token });
	} catch (e) {
		return res.status(500).send("Something went wrong");
	}
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
