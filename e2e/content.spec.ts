import { expect, test } from "@playwright/test";

test("every project renders with the shared schema", async ({ page }) => {
    await page.goto("/");
    const stages = page.locator("#projects ol > li");
    await expect(stages).toHaveCount(4);
    for (const slug of ["hermes", "pokeverse", "calculate", "algoforge"]) {
        const res = await page.request.get(`/projects/${slug}`);
        expect(res.ok()).toBeTruthy();
    }
});

test("hero stays in place while scrolling", async ({ page }) => {
    await page.goto("/");
    const h1 = page.getByRole("heading", { level: 1, name: "Raunak Yadav" });
    await expect(h1).toBeVisible();
    await page.waitForTimeout(2200);
    const docTop = () => h1.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    const before = await docTop();
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(400);
    expect(Math.abs((await docTop()) - before)).toBeLessThan(1);
});

test("project stages keep sticky positioning on desktop", async ({ page, isMobile }) => {
    test.skip(isMobile, "sticky stack is desktop only");
    await page.goto("/");
    const pos = await page
        .locator("#projects ol > li")
        .first()
        .locator("article")
        .evaluate((el) => getComputedStyle(el).position);
    expect(pos).toBe("sticky");
});

test("footer shows contact and copyright", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer#footer");
    await expect(footer.getByRole("link", { name: /@/ })).toBeVisible();
    await expect(footer).toContainText("©");
});
