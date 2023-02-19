import { test as testBase, expect } from "@playwright/test";

const test = testBase.extend({
    dir  : [ "static", { option : true }],
});

test("style ordering", async ({ page, dir }) => {
    await page.goto(`/${dir}/`);
    
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
