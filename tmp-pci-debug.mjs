import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', msg => console.log('CONSOLE', msg.type(), msg.text()));
page.on('response', async (res) => {
  const url = res.url();
  if (url.includes('/__qti_pkg__/')) {
    console.log('RESP', res.status(), url);
  }
});
page.on('requestfailed', req => {
  const url = req.url();
  if (url.includes('/__qti_pkg__/')) {
    console.log('REQFAILED', req.failure()?.errorText, url);
  }
});
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.locator('input[type="file"]').setInputFiles('/Users/marcelhoekstra/Downloads/PCI-Conformance-debug.zip');
await page.waitForTimeout(15000);
await browser.close();
