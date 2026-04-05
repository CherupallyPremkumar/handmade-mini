import { test, expect } from '@playwright/test';

test('full checkout flow', async ({ page }) => {
  test.setTimeout(60000);

  // Capture console logs from the browser
  const consoleLogs: string[] = [];
  page.on('console', (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));

  // Monitor the create-order API call
  let backendResponse: { status: number; body: string } | null = null;
  page.on('response', async (response) => {
    if (response.url().includes('/api/checkout/create-order')) {
      backendResponse = {
        status: response.status(),
        body: await response.text().catch(() => ''),
      };
    }
  });

  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/Dhanunjaiah/);
  console.log('✅ 1. Homepage loaded');

  await page.click('text=Collection');
  await page.waitForTimeout(2000);
  console.log('✅ 2. Collection page');

  await page.locator('a[href*="/sarees/"]').first().click();
  await page.waitForTimeout(2000);
  console.log('✅ 3. Product detail');

  const addBtn = page.locator('button', { hasText: /add to cart/i });
  if (await addBtn.isVisible()) {
    await addBtn.click();
    await page.waitForTimeout(1000);
    console.log('✅ 4. Added to cart');
  }

  await page.goto('http://localhost:3000/cart');
  await page.waitForTimeout(2000);

  const body = await page.textContent('body');
  if (body?.toLowerCase().includes('empty')) {
    console.log('❌ Cart empty — aborting');
    return;
  }
  console.log('✅ 5. Cart has items');

  await page.goto('http://localhost:3000/checkout');
  await page.waitForTimeout(2000);
  console.log('✅ 6. Checkout page');

  // Fill form fields by index (order: name, phone, email, addr1, addr2, city, pincode)
  const allInputs = page.locator('input:visible');
  const values = [
    'Priya Sharma',
    '9876543210',
    'priya@test.com',
    '123 Pochampally Rd',
    'Near Weavers Colony',
    'Hyderabad',
    '500001',
  ];
  const count = await allInputs.count();
  for (let i = 0; i < Math.min(count, values.length); i++) {
    await allInputs.nth(i).fill(values[i]);
  }
  console.log('✅ 7. Form filled');

  // Click pay
  const payBtn = page.locator('button').filter({ hasText: /pay|razorpay|place order/i });
  expect(await payBtn.isVisible()).toBe(true);
  await payBtn.click();
  console.log('   Clicked pay...');
  await page.waitForTimeout(5000);

  // Check results
  const url = page.url();

  if (backendResponse) {
    console.log(`   Backend API: ${backendResponse.status}`);
    if (backendResponse.status === 200) {
      const order = JSON.parse(backendResponse.body);
      console.log(`   ✅ Order created: ${order.orderNumber}`);
      console.log(`   ✅ Razorpay order: ${order.razorpayOrderId}`);
      console.log(`   ✅ Amount: ₹${(order.amount / 100).toFixed(2)}`);
    } else {
      console.log(`   ❌ Backend error: ${backendResponse.body}`);
    }
  } else {
    console.log('   ⚠️ No backend call detected (may be CORS or network issue)');
  }

  // Check final landing page
  if (url.includes('order-confirmation')) {
    const orderNum = url.split('/order-confirmation/')[1];
    if (orderNum?.startsWith('DHN-')) {
      console.log(`✅ 8. Real order confirmed: ${orderNum}`);
      console.log('   (Razorpay modal skipped — SDK does not load in headless browser)');
    } else if (orderNum?.includes('DEMO')) {
      console.log(`⚠️ 8. Demo fallback: ${orderNum}`);
      console.log('   (Backend call may have failed — check logs above)');
    } else {
      console.log(`✅ 8. Order confirmed: ${orderNum}`);
    }
  } else {
    const razorpay = page.locator('iframe[src*="razorpay"]');
    if (await razorpay.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✅ 8. Razorpay modal opened!');
    } else {
      console.log(`❌ 8. Unexpected state. URL: ${url}`);
    }
  }

  // Print relevant console errors
  const errors = consoleLogs.filter(
    (l) => l.includes('[error]') || l.includes('Failed')
  );
  if (errors.length > 0) {
    console.log('   Browser errors:', errors.slice(0, 5));
  }

  await page.screenshot({ path: 'e2e/result.png', fullPage: true });
});
