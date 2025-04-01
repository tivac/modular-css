import { test, expect } from "@playwright/test";

const testCases = [{
    name : "serve - static",
    url  : "http://localhost:5173/static/",
},
{
    name : "serve - dynamic",
    url  : "http://localhost:5173/dynamic/",
},
{
    name : "built - static",
    url  : "http://localhost:5174/static/",
},
{
    name : "built - dynamic",
    url  : "http://localhost:5174/dynamic/",
}];

for(const { name, url } of testCases) {
    test(`style ordering - ${name}`, async ({ page }) => {
        await page.goto(url);
        
        const a = await page.getByText("A");
    
        await expect(a).toBeVisible();
    
        await expect(a).toHaveCSS("background-color", "rgb(0, 0, 255)");
        await expect(a).toHaveCSS("color", "rgb(255, 0, 0)");
        await expect(a).toHaveClass("mc_c mc_a");
        
        const b = await page.getByText("B");
        
        await expect(b).toBeVisible();
        
        await expect(b).toHaveCSS("background-color", "rgb(0, 0, 255)");
        await expect(b).toHaveCSS("color", "rgb(255, 255, 255)");
        await expect(b).toHaveClass("mc_c mc_b");
    });
}

test("coverage", async ({ page }) => {
    await page.goto(testCases[0].url);

    // eslint-disable-next-line no-undef -- it's running in the browser chill out
    const coverage = await page.evaluate(() => globalThis.mcssCoverage);

    expect(coverage).toStrictEqual({
        "packages/vite/tests/specimens/shared/static-c.mcss" : { c : 2 },
        "packages/vite/tests/specimens/static/a.mcss"        : { a : 1 },
        "packages/vite/tests/specimens/static/b.mcss"        : { b : 1 },
    });
});
