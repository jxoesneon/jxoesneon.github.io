import { test, expect } from '@playwright/test';

test('portfolio site loads correctly', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Verify the canvas is present (NodeWeb)
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();

  // Verify Hero section
  const hero = page.locator('h1');
  await expect(hero).toContainText("Hi, I'm");

  // Verify ProjectGrid
  const projects = page.locator('h2', { hasText: 'Featured Projects' });
  await expect(projects).toBeVisible();
});
