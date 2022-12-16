//** @type {import("@playwright/test").PlaywrightTestConfig} */
const config = {
	testDir: "./packages/vite/tests",
    // baseURL : "http://127.0.0.1:5173",
    
	timeout: 30 * 1000,
	
	expect: {
		timeout: 5 * 1000,
	},
	
	// Run tests in files in parallel
	fullyParallel: true,

	// Fail the build on CI if you accidentally left test.only in the source code.
	forbidOnly: !!process.env.CI,

	// Retry on CI only
	retries: process.env.CI ? 2 : 0,
	
    // Opt out of parallel tests on CI.
	workers: process.env.CI ? 1 : undefined,
	
    use: {
		screenshot : "only-on-failure",
        trace : "on-first-retry",
        video : "on-first-retry",
	},

    webServer : {
		command : "npm run test:vite",
        port: 5173,
		timeout : 30 * 1000,
		reuseExistingServer : true,
	},
};

module.exports = config;
