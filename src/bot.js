import puppeteer from "puppeteer";

const sleep = async (s) => new Promise((resolve) => setTimeout(resolve, s));

export const verifyPost = async (username, password) => {
	let browser;
	try {
		browser = await puppeteer.launch({
			headless: true,
			args: [
				"--disable-gpu",
				"--no-sandbox",
				"--js-flags=--noexpose_wasm,--jitless",
			],
			executablePath: "/usr/bin/chromium-browser",
		});
		const context = await browser.createIncognitoBrowserContext();
		const page = await context.newPage();
		await page.goto("http://localhost:3000");
		await page.waitForSelector("input[name='username']");
		await page.type("input[name='username']", "admin");
		await page.type("input[name='password']", password);
		await page.click("button[type='submit']");
		await page.waitForNavigation();
		await page.goto(`http://localhost:3000/posts?view=${username}`);
		await sleep(5000);
		await browser.close();
	} catch (e) {
		console.log(e);
	} finally {
		if (browser) {
			await browser.close();
		}
	}
};
