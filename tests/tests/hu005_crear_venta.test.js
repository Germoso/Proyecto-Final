const assert = require('assert');
const {
  createDriver, takeScreenshot, navigateTo,
  waitFor, clearAndType,
  createTestProductAPI, deleteProductAPI, getProductsAPI, uniqueCode,
  By, until, TIMEOUT
} = require('../helpers');

describe('HU-005: Creación de Ventas', function () {
  this.timeout(60000);
  let driver;
  let testProduct;
  const productCode = uniqueCode('VTA');

  before(async function () {
    driver = await createDriver();
    testProduct = await createTestProductAPI({
      name: 'Llave Ajustable 10 Pulgadas',
      code: productCode,
      price: 750.00,
      quantity: 50,
      category: 'Herramientas Manuales'
    });
  });

  after(async function () {
    if (testProduct && testProduct.id) {
      try { await deleteProductAPI(testProduct.id); } catch (e) {}
    }
    if (driver) await driver.quit();
  });

  describe('Camino Feliz', function () {

    it('HU005-CF-01: La página de nueva venta carga correctamente', async function () {
      await navigateTo(driver, '/sales/new');
      await driver.sleep(1000);
      await takeScreenshot(driver, 'HU005_CF01_sale_page_loaded');

      const header = await waitFor(driver, By.css('.page-header h2'));
      const headerText = await header.getText();
      assert.strictEqual(headerText, 'Nueva Venta', 'El título debe ser "Nueva Venta"');

      const productSelect = await driver.findElement(By.css('.form-select'));
      assert.ok(productSelect, 'Debe existir un selector de productos');
    });

    it('HU005-CF-02: El dropdown muestra productos con stock', async function () {
      await navigateTo(driver, '/sales/new');
      await driver.sleep(1000);

      const select = await driver.findElement(By.css('.form-select'));
      const options = await select.findElements(By.css('option'));

      assert.ok(options.length >= 2, 'El dropdown debe tener al menos el producto de prueba');

      const optionTexts = await Promise.all(options.map(o => o.getText()));
      const hasTestProduct = optionTexts.some(t => t.includes('Llave Ajustable'));
      assert.ok(hasTestProduct, 'El producto de prueba debe aparecer en el dropdown');
      await takeScreenshot(driver, 'HU005_CF02_product_dropdown');
    });

    it('HU005-CF-03: Se puede agregar un producto al carrito', async function () {
      await navigateTo(driver, '/sales/new');
      await driver.sleep(1000);

      const select = await driver.findElement(By.css('.form-select'));
      const options = await select.findElements(By.css('option'));

      for (const option of options) {
        const text = await option.getText();
        if (text.includes('Llave Ajustable')) {
          await option.click();
          break;
        }
      }

      const qtyInput = await driver.findElement(By.css('input[type="number"]'));
      await qtyInput.clear();
      await qtyInput.sendKeys('3');

      const addBtn = await driver.findElement(By.css('.btn-primary'));
      await addBtn.click();
      await driver.sleep(500);

      await takeScreenshot(driver, 'HU005_CF03_product_added_to_cart');

      const cartItems = await driver.findElements(By.css('.cart-item'));
      assert.ok(cartItems.length >= 1, 'Debe haber al menos 1 item en el carrito');

      const cartText = await driver.findElement(By.css('.cart-item .name')).getText();
      assert.ok(cartText.includes('Llave Ajustable'), 'El producto debe aparecer en el carrito');
    });

    it('HU005-CF-04: El total se calcula correctamente', async function () {
      const totalText = await driver.findElement(By.css('.cart-total .amount')).getText();
      assert.ok(totalText.includes('2,250.00') || totalText.includes('2250.00'),
        `El total debe ser RD$ 2,250.00 pero muestra: "${totalText}"`);
      await takeScreenshot(driver, 'HU005_CF04_total_calculated');
    });

    it('HU005-CF-05: Los controles de cantidad (+/-) funcionan', async function () {
      const buttons = await driver.findElements(By.css('.qty-control button'));
      const plusBtn = buttons[1];
      await plusBtn.click();
      await driver.sleep(300);

      const qtySpan = await driver.findElement(By.css('.qty-control span'));
      const qty = await qtySpan.getText();
      assert.strictEqual(qty, '4', 'La cantidad debe ser 4 después de incrementar');
      await takeScreenshot(driver, 'HU005_CF05_qty_controls');
    });

    it('HU005-CF-06: La venta se registra exitosamente', async function () {
      const finalizeBtn = await driver.findElement(By.css('.btn-success.btn-lg'));
      await finalizeBtn.click();
      await driver.sleep(3000);

      const alertEl = await waitFor(driver, By.css('.alert-success'));
      const alertText = await alertEl.getText();
      assert.ok(alertText.includes('exitosamente'), `Debe mostrar éxito: "${alertText}"`);
      await takeScreenshot(driver, 'HU005_CF06_sale_registered');
    });

    it('HU005-CF-07: El carrito se vacía después de la venta', async function () {
      const emptyState = await driver.findElements(By.css('.empty-state'));
      assert.ok(emptyState.length > 0, 'El carrito debe estar vacío después de la venta');
      await takeScreenshot(driver, 'HU005_CF07_cart_emptied');
    });
  });

  describe('Prueba Negativa', function () {

    it('HU005-PN-01: No se puede finalizar venta con carrito vacío', async function () {
      await navigateTo(driver, '/sales/new');
      await driver.sleep(1000);

      const finalizeButtons = await driver.findElements(By.css('.btn-success.btn-lg'));

      if (finalizeButtons.length > 0) {
        await finalizeButtons[0].click();
        await driver.sleep(1000);

        const alerts = await driver.findElements(By.css('.alert-error'));
        assert.ok(alerts.length > 0, 'Debe mostrar error al intentar venta vacía');
        await takeScreenshot(driver, 'HU005_PN01_empty_cart_error');
      } else {
        assert.ok(true, 'El botón de finalizar no aparece con carrito vacío');
        await takeScreenshot(driver, 'HU005_PN01_no_finalize_button');
      }
    });

    it('HU005-PN-02: No se puede agregar sin seleccionar producto', async function () {
      await navigateTo(driver, '/sales/new');
      await driver.sleep(1000);

      const addBtn = await driver.findElement(By.css('.btn-primary'));
      const isDisabled = await addBtn.getAttribute('disabled');

      assert.ok(isDisabled !== null || isDisabled === 'true',
        'El botón de agregar debe estar deshabilitado sin producto seleccionado');
      await takeScreenshot(driver, 'HU005_PN02_add_without_product');
    });
  });
});
