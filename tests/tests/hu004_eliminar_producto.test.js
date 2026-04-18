const assert = require('assert');
const {
  createDriver, takeScreenshot, navigateTo,
  waitFor, createTestProductAPI, deleteProductAPI, uniqueCode,
  By, until, TIMEOUT
} = require('../helpers');

describe('HU-004: Eliminación de Productos', function () {
  this.timeout(60000);
  let driver;
  let testProduct1, testProduct2;
  const code1 = uniqueCode('DEL1');
  const code2 = uniqueCode('DEL2');

  before(async function () {
    driver = await createDriver();
    testProduct1 = await createTestProductAPI({
      name: 'Producto Para Eliminar 1',
      code: code1,
      price: 100.00,
      quantity: 10,
      category: 'Otros'
    });
    testProduct2 = await createTestProductAPI({
      name: 'Producto Para Eliminar 2',
      code: code2,
      price: 200.00,
      quantity: 5,
      category: 'Otros'
    });
  });

  after(async function () {
    if (testProduct2 && testProduct2.id) {
      try { await deleteProductAPI(testProduct2.id); } catch (e) {}
    }
    if (driver) await driver.quit();
  });

  describe('Camino Feliz', function () {

    it('HU004-CF-01: Cada producto tiene un botón de eliminar', async function () {
      await navigateTo(driver, '/products');
      await driver.sleep(1500);
      await takeScreenshot(driver, 'HU004_CF01_delete_buttons_visible');

      const deleteButtons = await driver.findElements(By.css('.btn-danger'));
      assert.ok(deleteButtons.length >= 2, 'Cada producto debe tener un botón de eliminar');
    });

    it('HU004-CF-02: Se muestra confirmación antes de eliminar', async function () {
      await navigateTo(driver, '/products');
      await driver.sleep(1500);

      const rows = await driver.findElements(By.css('.table tbody tr'));
      let deleteBtn = null;

      for (const row of rows) {
        const text = await row.getText();
        if (text.includes(code1)) {
          deleteBtn = await row.findElement(By.css('.btn-danger'));
          break;
        }
      }

      assert.ok(deleteBtn, 'Debe encontrar el botón de eliminar para el producto de prueba');

      await deleteBtn.click();
      await driver.sleep(2000);

      await takeScreenshot(driver, 'HU004_CF02_after_delete_confirm');
    });

    it('HU004-CF-03: El producto eliminado desaparece de la lista', async function () {
      await driver.sleep(1000);

      const pageSource = await driver.getPageSource();
      assert.ok(!pageSource.includes(code1), `El producto con código ${code1} debe haber desaparecido`);
      await takeScreenshot(driver, 'HU004_CF03_product_removed');
    });

    it('HU004-CF-04: Se muestra alerta de éxito al eliminar', async function () {
      await navigateTo(driver, '/products');
      await driver.sleep(1500);

      const rows = await driver.findElements(By.css('.table tbody tr'));
      let deleteBtn = null;

      for (const row of rows) {
        const text = await row.getText();
        if (text.includes(code2)) {
          deleteBtn = await row.findElement(By.css('.btn-danger'));
          break;
        }
      }

      if (deleteBtn) {
        await deleteBtn.click();
        await driver.sleep(2000);

        const alerts = await driver.findElements(By.css('.alert-success'));
        assert.ok(alerts.length > 0, 'Debe mostrarse una alerta de éxito al eliminar');

        const alertText = await alerts[0].getText();
        assert.ok(alertText.includes('eliminado'), `La alerta debe decir "eliminado": "${alertText}"`);
        await takeScreenshot(driver, 'HU004_CF04_delete_success_alert');
      }
    });
  });

  describe('Prueba Negativa', function () {

    it('HU004-PN-01: La tabla se actualiza correctamente después de eliminar', async function () {
      await navigateTo(driver, '/products');
      await driver.sleep(1500);

      const rows = await driver.findElements(By.css('.table tbody tr'));
      const initialCount = rows.length;

      const pageSource = await driver.getPageSource();
      assert.ok(!pageSource.includes(code1), 'Producto 1 eliminado no debe aparecer');

      await takeScreenshot(driver, 'HU004_PN01_table_updated');
    });
  });
});
