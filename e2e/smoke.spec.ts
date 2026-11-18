import { expect, test } from "@playwright/test";

test("home page renders the name and every section", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Raunak Yadav/);
    await expect(page.getByRole("heading", { level: 1, name: "Raunak Yadav" })).toBeVisible();
    for (const id of ["about", "skills", "projects", "experience", "contact"]) {
        await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
});

test("no horizontal scrolling", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
});

test("contact form shows validation errors", async ({ page }) => {
    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: /post it/i }).click();
    await expect(page.getByText("What should I call you?")).toBeVisible();
});

test("contact API rejects invalid input", async ({ request }) => {
    const res = await request.post("/api/contact", { data: { name: "", email: "nope", message: "" } });
    expect(res.status()).toBe(400);
});

test("theme toggle switches the theme", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /switch to light theme/i }).click();
    await expect(page.locator("html")).toHaveClass(/light/);
});

test("robots.txt and sitemap.xml exist", async ({ request }) => {
    expect((await request.get("/robots.txt")).ok()).toBeTruthy();
    expect((await request.get("/sitemap.xml")).ok()).toBeTruthy();
});
