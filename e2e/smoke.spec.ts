import { test, expect } from "@playwright/test";

test("landing → web card → staff stamp → card updates", async ({ page, context }) => {
  await page.goto("/e2e-cafe");
  await expect(page.getByRole("heading", { name: /add your card in one tap|welcome back/i })).toBeVisible();
  await page.getByRole("button", { name: /save as web card/i }).click();
  await expect(page).toHaveURL(/\/e2e-cafe\/card\//);
  const code = (await page.getByTestId("short-code").innerText()).replace("-", "");
  const before = Number((await page.getByRole("img", { name: /of 10 stamps/i }).first().getAttribute("aria-label"))!.split(" ")[0]);

  const staff = await context.newPage();
  await staff.goto("/e2e-cafe/staff");
  await staff.getByLabel(/^pin$/i).fill("246810");
  await staff.getByRole("button", { name: /^enter$/i }).click();
  await expect(staff.getByLabel(/card code/i)).toBeVisible();
  await staff.getByLabel(/card code/i).fill(code);
  await staff.getByRole("button", { name: /look up/i }).click();
  await expect(staff.getByRole("button", { name: /\+1 stamp/i })).toBeVisible();
  await staff.getByRole("button", { name: /\+1 stamp/i }).click();
  await expect(staff.getByRole("status")).toHaveText(/stamped!|reward earned/i);
  await expect(staff.getByRole("img", { name: new RegExp(`${(before + 1) % 10} of 10 stamps`, "i") })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("img", { name: new RegExp(`${(before + 1) % 10} of 10 stamps`, "i") }).first()).toBeVisible();
  await page.screenshot({ path: "test-results/web-card.png", fullPage: true });
  await staff.screenshot({ path: "test-results/staff.png", fullPage: true });
});

test("staff PIN gate rejects a wrong PIN", async ({ page }) => {
  await page.goto("/e2e-cafe/staff");
  await page.getByLabel(/^pin$/i).fill("000000");
  await page.getByRole("button", { name: /^enter$/i }).click();
  await expect(page.getByText(/isn't right/i)).toBeVisible();
});

test("unknown shop is a 404", async ({ page }) => {
  const res = await page.goto("/definitely-not-a-shop");
  expect(res?.status()).toBe(404);
});
