const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

const FRONTEND_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const TIMEOUT = 10000;

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function createDriver() {
  const options = new chrome.Options();
  options.addArguments(
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--window-size=1400,900',
    '--disable-extensions'
  );

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  await driver.manage().setTimeouts({ implicit: TIMEOUT });
  return driver;
}

async function takeScreenshot(driver, name) {
  try {
    const sanitized = name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    const timestamp = Date.now();
    const filename = `${sanitized}_${timestamp}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);
    const image = await driver.takeScreenshot();
    fs.writeFileSync(filepath, image, 'base64');
    console.log(`  📸 Screenshot: ${filename}`);
    return filepath;
  } catch (err) {
    console.warn('  ⚠ Screenshot failed:', err.message);
  }
}

async function navigateTo(driver, pagePath) {
  await driver.get(`${FRONTEND_URL}${pagePath}`);
  await driver.wait(until.elementLocated(By.css('.sidebar')), TIMEOUT);
  await driver.sleep(500);
}

async function waitVisible(driver, locator, timeout = TIMEOUT) {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  return driver.wait(until.elementIsVisible(el), timeout);
}

async function waitFor(driver, locator, timeout = TIMEOUT) {
  return driver.wait(until.elementLocated(locator), timeout);
}

async function clearAndType(driver, locator, text) {
  const el = await driver.findElement(locator);
  await el.clear();
  await el.sendKeys(Key.chord(Key.CONTROL, 'a'));
  await el.sendKeys(Key.BACK_SPACE);
  await el.sendKeys(text);
  return el;
}

async function createTestProductAPI(productData) {
  const http = require('http');
  const data = JSON.stringify(productData);

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/products',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function deleteProductAPI(id) {
  const http = require('http');

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/products/${id}`,
      method: 'DELETE',
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.end();
  });
}

async function getProductsAPI() {
  const http = require('http');

  return new Promise((resolve, reject) => {
    http.get(`${BACKEND_URL}/api/products`, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', reject);
  });
}

function uniqueCode(prefix = 'TEST') {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

module.exports = {
  FRONTEND_URL,
  BACKEND_URL,
  TIMEOUT,
  createDriver,
  takeScreenshot,
  navigateTo,
  waitVisible,
  waitFor,
  clearAndType,
  createTestProductAPI,
  deleteProductAPI,
  getProductsAPI,
  uniqueCode,
  By,
  until,
  Key
};
