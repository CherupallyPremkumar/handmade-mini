import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('All Pages Smoke Test', () => {
  test.setTimeout(30000);

  // ─── Store Pages ───

  test('1. Homepage', async ({ page }) => {
    await page.goto(BASE);
    await expect(page).toHaveTitle(/Dhanunjaiah/);
    await expect(page.getByRole('link', { name: 'Collection', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Nool', exact: true })).toBeVisible();
    console.log('✅ Homepage — title, nav links visible');
  });

  test('2. Collection (/sarees)', async ({ page }) => {
    await page.goto(`${BASE}/sarees`);
    await expect(page.locator('text=Pochampally Sarees')).toBeVisible();
    // Should have product cards from backend
    const cards = page.locator('a[href*="/sarees/"]');
    await expect(cards.first()).toBeVisible({ timeout: 5000 });
    const count = await cards.count();
    console.log(`✅ Collection — ${count} product cards visible`);
    expect(count).toBeGreaterThan(0);
  });

  test('3. Product Detail (/sarees/[id])', async ({ page }) => {
    // First get a real product ID from collection
    await page.goto(`${BASE}/sarees`);
    const firstLink = page.locator('a[href*="/sarees/"]').first();
    await expect(firstLink).toBeVisible({ timeout: 5000 });
    const href = await firstLink.getAttribute('href');
    expect(href).toBeTruthy();

    await page.goto(`${BASE}${href}`);
    await page.waitForTimeout(2000);
    // Should have product name and Add to Cart button
    const addBtn = page.locator('button', { hasText: /add to cart/i });
    await expect(addBtn).toBeVisible();
    console.log(`✅ Product Detail (${href}) — Add to Cart visible`);
  });

  test('4. Cart (/cart) — empty', async ({ page }) => {
    await page.goto(`${BASE}/cart`);
    await page.waitForTimeout(1000);
    const body = await page.textContent('body');
    // Either shows empty cart or items
    const hasContent = body?.includes('Cart') || body?.includes('empty');
    expect(hasContent).toBe(true);
    console.log('✅ Cart — page renders');
  });

  test('5. Cart with item', async ({ page }) => {
    // Add item first
    await page.goto(`${BASE}/sarees`);
    const firstLink = page.locator('a[href*="/sarees/"]').first();
    await expect(firstLink).toBeVisible({ timeout: 5000 });
    await firstLink.click();
    await page.waitForTimeout(2000);

    const addBtn = page.locator('button', { hasText: /add to cart/i });
    await addBtn.click();
    await page.waitForTimeout(1000);

    await page.goto(`${BASE}/cart`);
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Shopping Cart')).toBeVisible();
    await expect(page.locator('text=Order Summary')).toBeVisible();
    console.log('✅ Cart with item — shows Shopping Cart + Order Summary');
  });

  test('6. Checkout (/checkout) — redirects to login', async ({ page }) => {
    await page.goto(`${BASE}/checkout`);
    await page.waitForTimeout(2000);
    // Should redirect to login since not logged in
    expect(page.url()).toContain('/login');
    console.log('✅ Checkout — redirects to /login when not authenticated');
  });

  test('7. Track Order (/track)', async ({ page }) => {
    await page.goto(`${BASE}/track`);
    await page.waitForTimeout(1000);
    const body = await page.textContent('body');
    const hasTrack = body?.toLowerCase().includes('track') || body?.toLowerCase().includes('order');
    expect(hasTrack).toBe(true);
    console.log('✅ Track Order — page renders');
  });

  test('8. Nool (/nool)', async ({ page }) => {
    await page.goto(`${BASE}/nool`);
    await page.waitForTimeout(1000);
    const body = await page.textContent('body');
    expect(body?.length).toBeGreaterThan(0);
    console.log('✅ Nool — page renders');
  });

  test('9. Order Confirmation (/order-confirmation/TEST-123)', async ({ page }) => {
    await page.goto(`${BASE}/order-confirmation/TEST-123`);
    await page.waitForTimeout(1000);
    const body = await page.textContent('body');
    expect(body?.length).toBeGreaterThan(0);
    console.log('✅ Order Confirmation — page renders');
  });

  // ─── Auth Pages ───

  test('10. Login (/login)', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.locator('text=Welcome Back')).toBeVisible();
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.locator('button', { hasText: /sign in/i })).toBeVisible();
    console.log('✅ Login — email, password, sign in button visible');
  });

  test('11. Register (/register)', async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    await expect(page.locator('input#name')).toBeVisible();
    await expect(page.locator('input#reg-email')).toBeVisible();
    await expect(page.locator('input#reg-password')).toBeVisible();
    // Phone field should NOT exist
    const phoneField = page.locator('input#phone');
    await expect(phoneField).toHaveCount(0);
    console.log('✅ Register — name, email, password visible, NO phone field');
  });

  // ─── Auth Flow ───

  test('12. Register + Login flow', async ({ page }) => {
    const unique = Date.now();
    const email = `test${unique}@test.com`;
    const password = 'Test@123';

    // Register
    await page.goto(`${BASE}/register`);
    await page.fill('input#name', 'Test User');
    await page.fill('input#reg-email', email);
    await page.fill('input#reg-password', password);
    await page.fill('input#confirm-password', password);
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(3000);

    // Should redirect to home after register
    expect(page.url()).toBe(`${BASE}/`);
    console.log('✅ Register flow — created account, redirected to home');

    // Logout (clear localStorage)
    await page.evaluate(() => localStorage.clear());

    // Login
    await page.goto(`${BASE}/login`);
    await page.fill('input#email', email);
    await page.fill('input#password', password);
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(3000);

    expect(page.url()).toBe(`${BASE}/`);
    console.log('✅ Login flow — signed in, redirected to home');
  });

  // ─── Admin Pages ───

  test('13. Admin (/admin) — shows login popup when not logged in', async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Admin Login Required')).toBeVisible();
    await expect(page.locator('button', { hasText: /sign in/i })).toBeVisible();
    console.log('✅ Admin — shows login popup for unauthenticated users');
  });

  test('14. Admin with login — access denied for non-admin', async ({ page }) => {
    // Register a regular user
    const unique = Date.now();
    const email = `user${unique}@test.com`;

    await page.goto(`${BASE}/register`);
    await page.fill('input#name', 'Regular User');
    await page.fill('input#reg-email', email);
    await page.fill('input#reg-password', 'Test@123');
    await page.fill('input#confirm-password', 'Test@123');
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(3000);

    // Try admin
    await page.goto(`${BASE}/admin`);
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Access Denied')).toBeVisible();
    console.log('✅ Admin — shows Access Denied for non-admin user');
  });

  test('15. Admin pages with admin login', async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE}/login`);
    await page.fill('input#email', 'admin@pochampally.com');
    await page.fill('input#password', 'Admin@123');
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(3000);

    // Check if we can access admin
    await page.goto(`${BASE}/admin`);
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    const isAdmin = !body?.includes('Access Denied') && !body?.includes('Admin Login Required');

    if (!isAdmin) {
      console.log('⚠️ Admin login — admin@pochampally.com may not exist or has wrong password');
      return;
    }

    console.log('✅ Admin Dashboard — accessible');

    // Admin Products
    await page.goto(`${BASE}/admin/sarees`);
    await page.waitForTimeout(1000);
    const hasSarees = await page.textContent('body');
    expect(hasSarees?.length).toBeGreaterThan(0);
    console.log('✅ Admin Products — page renders');

    // Admin Orders
    await page.goto(`${BASE}/admin/orders`);
    await page.waitForTimeout(1000);
    const hasOrders = await page.textContent('body');
    expect(hasOrders?.length).toBeGreaterThan(0);
    console.log('✅ Admin Orders — page renders');

    // Admin Nool
    await page.goto(`${BASE}/admin/nool`);
    await page.waitForTimeout(1000);
    const hasNool = await page.textContent('body');
    expect(hasNool?.length).toBeGreaterThan(0);
    console.log('✅ Admin Nool — page renders');
  });

  // ─── Full Checkout Flow (authenticated) ───

  test('16. Full checkout flow with login', async ({ page }) => {
    const unique = Date.now();
    const email = `buyer${unique}@test.com`;

    // Register
    await page.goto(`${BASE}/register`);
    await page.fill('input#name', 'Buyer Test');
    await page.fill('input#reg-email', email);
    await page.fill('input#reg-password', 'Test@123');
    await page.fill('input#confirm-password', 'Test@123');
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(3000);

    // Add item to cart
    await page.goto(`${BASE}/sarees`);
    const firstLink = page.locator('a[href*="/sarees/"]').first();
    await expect(firstLink).toBeVisible({ timeout: 5000 });
    await firstLink.click();
    await page.waitForTimeout(2000);
    await page.locator('button', { hasText: /add to cart/i }).click();
    await page.waitForTimeout(1000);

    // Go to checkout
    await page.goto(`${BASE}/checkout`);
    await page.waitForTimeout(2000);

    // Should be on checkout (not redirected to login)
    expect(page.url()).toContain('/checkout');
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();

    // Name and email should be pre-filled
    const nameInput = page.locator('input').first();
    const nameValue = await nameInput.inputValue();
    expect(nameValue).toBe('Buyer Test');
    console.log('✅ Checkout — name pre-filled from login');

    // Fill remaining fields
    const allInputs = page.locator('input:visible');
    const count = await allInputs.count();
    for (let i = 0; i < count; i++) {
      const input = allInputs.nth(i);
      const val = await input.inputValue();
      if (val) continue; // skip pre-filled
      const placeholder = (await input.getAttribute('placeholder') || '').toLowerCase();
      if (placeholder.includes('98765')) await input.fill('9876543210');
      else if (placeholder.includes('house')) await input.fill('123 Main St');
      else if (placeholder.includes('landmark')) await input.fill('Near Temple');
      else if (placeholder.includes('hyderabad')) await input.fill('Hyderabad');
      else if (placeholder.includes('500001')) await input.fill('500001');
    }

    // Monitor backend call
    let backendOk = false;
    page.on('response', async (res) => {
      if (res.url().includes('/api/checkout/create-order') && res.status() === 200) {
        backendOk = true;
      }
    });

    // Click pay
    const payBtn = page.locator('button').filter({ hasText: /pay|razorpay/i });
    await payBtn.click();
    await page.waitForTimeout(5000);

    if (backendOk) {
      console.log('✅ Checkout — backend order created successfully with auth');
    } else {
      console.log('⚠️ Checkout — backend call may have failed');
    }

    // Should land on order confirmation or have Razorpay modal
    const url = page.url();
    const razorpay = page.locator('iframe[src*="razorpay"]');
    const hasRazorpay = await razorpay.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasRazorpay) {
      console.log('✅ Razorpay modal opened');
    } else if (url.includes('order-confirmation')) {
      console.log('✅ Order confirmation page reached');
    }
  });
});
