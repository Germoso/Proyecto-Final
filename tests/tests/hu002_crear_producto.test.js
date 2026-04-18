const assert = require('assert');
const {
  createDriver, takeScreenshot, navigateTo,
  waitVisible, waitFor, clearAndType,
  createTestProductAPI, deleteProductAPI, getProductsAPI, uniqueCode,
  By, until, TIMEOUT
} = require('../helpers');

describe('HU-002: Registro de Productos', function () {
  this.timeout(60000);
  let driver;
  let testProductCode;
  let createdProductIds = [];

  before(async function () {
    driver = await createDriver();
    testProductCode = uniqueCode('HU2');
  });

  after(async function () {
    for (const id of createdProductIds) {
      try { await deleteProductAPI(id); } catch (e) {}
    }
    if (driver) await driver.quit();
  });

  describe('Camino Feliz', function () {

    it('HU002-CF-01: El formulario de registro carga correctamente', async function () {
      await navigateTo(driver, '/products/new');
      await takeScreenshot(driver, 'HU002_CF01_register_form_loaded');

      const header = await waitFor(driver, By.css('.page-header h2'));
      const headerText = await header.getText();
      assert.strictEqual(headerText, 'Registrar Producto', 'El título debe ser "Registrar Producto"');

      const nameInput = await driver.findElement(By.css('input[name="name"]'));
      const codeInput = await driver.findElement(By.css('input[name="code"]'));
      const priceInput = await driver.findElement(By.css('input[name="price"]'));
      const qtyInput = await driver.findElement(By.css('input[name="quantity"]'));
      const categorySelect = await driver.findElement(By.css('select[name="category"]'));

      assert.ok(nameInput, 'Campo nombre debe existir');
      assert.ok(codeInput, 'Campo código debe existir');
      assert.ok(priceInput, 'Campo precio debe existir');
      assert.ok(qtyInput, 'Campo cantidad debe existir');
      assert.ok(categorySelect, 'Campo categoría debe existir');
    });

    it('HU002-CF-02: Producto se registra exitosamente con datos válidos', async function () {
      await navigateTo(driver, '/products/new');

      await clearAndType(driver, By.css('input[name="name"]'), 'Martillo Stanley 16oz');
      await clearAndType(driver, By.css('input[name="code"]'), testProductCode);

      const categorySelect = await driver.findElement(By.css('select[name="category"]'));
      await categorySelect.sendKeys('Herramientas Manuales');

      await clearAndType(driver, By.css('input[name="price"]'), '850.00');
      await clearAndType(driver, By.css('input[name="quantity"]'), '25');

      await takeScreenshot(driver, 'HU002_CF02_form_filled');

      const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
      await submitBtn.click();
      await driver.sleep(2000);

      const alertEl = await waitFor(driver, By.css('.alert-success'));
      const alertText = await alertEl.getText();
      assert.ok(alertText.includes('exitosamente'), `Debe mostrar éxito pero dice: "${alertText}"`);
      await takeScreenshot(driver, 'HU002_CF02_product_created_success');

      const products = await getProductsAPI();
      const created = products.find(p => p.code === testProductCode);
      if (created) createdProductIds.push(created.id);
    });

    it('HU002-CF-03: El formulario se limpia después de crear un producto', async function () {
      const nameValue = await driver.findElement(By.css('input[name="name"]')).getAttribute('value');
      const codeValue = await driver.findElement(By.css('input[name="code"]')).getAttribute('value');
      const priceValue = await driver.findElement(By.css('input[name="price"]')).getAttribute('value');

      assert.strictEqual(nameValue, '', 'El campo nombre debe estar vacío');
      assert.strictEqual(codeValue, '', 'El campo código debe estar vacío');
      assert.strictEqual(priceValue, '', 'El campo precio debe estar vacío');
      await takeScreenshot(driver, 'HU002_CF03_form_cleared');
    });
  });

  describe('Prueba Negativa', function () {

    it('HU002-PN-01: No permite registrar sin campos obligatorios', async function () {
      await navigateTo(driver, '/products/new');

      const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
      await submitBtn.click();
      await driver.sleep(500);

      const errorMessages = await driver.findElements(By.css('.form-error'));
      assert.ok(errorMessages.length > 0, 'Deben aparecer mensajes de error de validación');
      await takeScreenshot(driver, 'HU002_PN01_empty_form_validation');
    });

    it('HU002-PN-02: No permite código duplicado', async function () {
      await navigateTo(driver, '/products/new');

      await clearAndType(driver, By.css('input[name="name"]'), 'Producto Duplicado');
      await clearAndType(driver, By.css('input[name="code"]'), testProductCode);

      const categorySelect = await driver.findElement(By.css('select[name="category"]'));
      await categorySelect.sendKeys('Otros');

      await clearAndType(driver, By.css('input[name="price"]'), '100');
      await clearAndType(driver, By.css('input[name="quantity"]'), '5');

      const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
      await submitBtn.click();
      await driver.sleep(2000);

      const alertEl = await waitFor(driver, By.css('.alert-error'));
      const alertText = await alertEl.getText();
      assert.ok(alertText.length > 0, 'Debe mostrar un mensaje de error por código duplicado');
      await takeScreenshot(driver, 'HU002_PN02_duplicate_code_error');
    });

    it('HU002-PN-03: Validación de precio mayor a 0', async function () {
      await navigateTo(driver, '/products/new');

      await clearAndType(driver, By.css('input[name="name"]'), 'Producto Prueba Precio');
      await clearAndType(driver, By.css('input[name="code"]'), uniqueCode('PRC'));

      const categorySelect = await driver.findElement(By.css('select[name="category"]'));
      await categorySelect.sendKeys('Otros');

      await clearAndType(driver, By.css('input[name="price"]'), '0');
      await clearAndType(driver, By.css('input[name="quantity"]'), '5');

      const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
      await submitBtn.click();
      await driver.sleep(500);

      const errors = await driver.findElements(By.css('.form-error'));
      assert.ok(errors.length > 0, 'Debe mostrar error de validación para precio 0');
      await takeScreenshot(driver, 'HU002_PN03_price_zero_validation');
    });
  });

  describe('Prueba de Límites', function () {

    it('HU002-L-01: Producto con precio decimal se registra correctamente', async function () {
      const code = uniqueCode('LMT');
      await navigateTo(driver, '/products/new');

      await clearAndType(driver, By.css('input[name="name"]'), 'Tornillo galvanizado 3/8');
      await clearAndType(driver, By.css('input[name="code"]'), code);

      const categorySelect = await driver.findElement(By.css('select[name="category"]'));
      await categorySelect.sendKeys('Tornillería');

      await clearAndType(driver, By.css('input[name="price"]'), '15.75');
      await clearAndType(driver, By.css('input[name="quantity"]'), '500');

      const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
      await submitBtn.click();
      await driver.sleep(2000);

      const alertEl = await waitFor(driver, By.css('.alert-success'));
      assert.ok(await alertEl.isDisplayed(), 'Producto con precio decimal debe crearse');
      await takeScreenshot(driver, 'HU002_L01_decimal_price_ok');

      const products = await getProductsAPI();
      const created = products.find(p => p.code === code);
      if (created) createdProductIds.push(created.id);
    });

    it('HU002-L-02: Botón Limpiar resetea el formulario', async function () {
      await navigateTo(driver, '/products/new');

      await clearAndType(driver, By.css('input[name="name"]'), 'Producto a limpiar');
      await clearAndType(driver, By.css('input[name="code"]'), 'LIMPIO-001');

      await takeScreenshot(driver, 'HU002_L02_before_clear');

      const buttons = await driver.findElements(By.css('button.btn-secondary'));
      for (const btn of buttons) {
        const text = await btn.getText();
        if (text.includes('Limpiar')) {
          await btn.click();
          break;
        }
      }
      await driver.sleep(500);

      const nameValue = await driver.findElement(By.css('input[name="name"]')).getAttribute('value');
      assert.strictEqual(nameValue, '', 'El campo nombre debe estar vacío después de limpiar');
      await takeScreenshot(driver, 'HU002_L02_after_clear');
    });
  });
});
