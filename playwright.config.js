/** @type {import("@playwright/test").PlaywrightTestConfig}<{ dir : string }> */
const config = {
	testDir : "./packages/vite/tests",
    
	timeout : 30 * 1000,
	
	expect : {
		timeout : 5 * 1000,
	},
	
	// Run tests in files in parallel
	fullyParallel : true,

	// Fail the build on CI if you accidentally left test.only in the source code.
	forbidOnly : Boolean(process.env.CI),

	// Retry on CI only
	retries : process.env.CI ? 2 : 0,
	
    // Opt out of parallel tests on CI.
	workers : process.env.CI ? 1 : undefined,
	
    use : {
		channel : "chromium",

		screenshot : "only-on-failure",
        trace      : "on-first-retry",
        video      : "on-first-retry",
	},

    webServer : [{
		command             : "npx vite",
        port                : 5173,
		timeout             : 30 * 1000,
		reuseExistingServer : !process.env.CI,
	}, {
		command             : "npx vite build && npx vite preview --port=5174",
        port                : 5174,
		timeout             : 30 * 1000,
		reuseExistingServer : !process.env.CI,
	}],
};

module.exports = config;
