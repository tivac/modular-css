import { test as testBase, expect } from "@playwright/test";

const test = testBase.extend({
    dir  : [ "static", { option : true }],
});

test("style ordering", async ({ page, dir }) => {
    await page.goto(`/${dir}/`);
    
    const elA = await page.getByText("A");

    await expect(elA).toBeVisible();

    await expect(elA).toHaveCSS("background-color", "rgb(0, 0, 255)");
    await expect(elA).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(elA).toHaveClass("mc_c mc_a");
    
    const elB = await page.getByText("B");
    
    await expect(elB).toBeVisible();
    
    await expect(elB).toHaveCSS("background-color", "rgb(0, 0, 255)");
    await expect(elB).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(elB).toHaveClass("mc_c mc_b");
});
