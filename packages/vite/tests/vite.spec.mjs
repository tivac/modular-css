import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("/");
})

test("a is right", async ({ page }) => {
    const el = await page.getByText("A");

    await expect(el).toBeVisible();

    await expect(el).toHaveCSS("background-color", "rgb(0, 0, 255)");
    await expect(el).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(el).toHaveClass("mc_c mc_a");
});

test("b is right", async ({ page }) => {
    const el = await page.getByText("B");

    await expect(el).toBeVisible();

    await expect(el).toHaveCSS("background-color", "rgb(0, 0, 255)");
    await expect(el).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(el).toHaveClass("mc_c mc_b");
});