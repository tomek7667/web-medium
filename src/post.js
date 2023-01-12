import { v4 } from "uuid";
import { posts } from "./app.js";

export const addPost = (postContent) => {
	const post = {
		id: v4(),
		created: new Date().toISOString(),
		content: postContent,
	};
	posts.push(post);
	return post;
};
