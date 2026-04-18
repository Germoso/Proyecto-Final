const assert = require('assert');
const {
  createDriver, takeScreenshot, navigateTo,
  waitVisible, waitFor,
  By, until, TIMEOUT
} = require('../helpers');

describe('HU-001: Visualización del Dashboard', function () {
  this.timeout(60000);
  let driver;

  before(async function () {
    driver = await createDriver();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  describe('Camino Feliz', function () {

    it('HU001-CF-01: El dashboard carga correctamente', async function () {
      await navigateTo(driver, '/');
      await takeScreenshot(driver, 'HU001_CF01_dashboard_loaded');

      const header = await waitFor(driver, By.css('.page-header h2'));
      const headerText = await header.getText();
      assert.strictEqual(headerText, 'Dashboard', 'El título del dashboard debe ser "Dashboard"');
    });

    it('HU001-CF-02: Se muestran las 4 tarjetas de estadísticas', async function () {
      const statCards = await driver.findElements(By.css('.stat-card'));
      assert.strictEqual(statCards.length, 4, 'Deben existir exactamente 4 tarjetas de estadísticas');
      await takeScreenshot(driver, 'HU001_CF02_stat_cards_visible');

      const labels = await driver.findElements(By.css('.stat-label'));
      const labelTexts = await Promise.all(labels.map(l => l.getText()));

      assert.ok(labelTexts.includes('Productos Registrados'), 'Debe mostrar "Productos Registrados"');
      assert.ok(labelTexts.includes('Ventas Realizadas'), 'Debe mostrar "Ventas Realizadas"');
      assert.ok(labelTexts.includes('Ingresos Totales'), 'Debe mostrar "Ingresos Totales"');
      assert.ok(labelTexts.some(t => t.includes('Stock Bajo')), 'Debe mostrar "Stock Bajo"');
    });

    it('HU001-CF-03: Los valores de estadísticas son numéricos', async function () {
      const statValues = await driver.findElements(By.css('.stat-value'));
      for (const val of statValues) {
        const text = await val.getText();
        assert.ok(/\d/.test(text), `El valor "${text}" debe contener números`);
      }
      await takeScreenshot(driver, 'HU001_CF03_stat_values_numeric');
    });

    it('HU001-CF-04: Los botones de acceso rápido funcionan', async function () {
      const quickLinks = await driver.findElements(By.css('.card a.btn'));
      assert.ok(quickLinks.length >= 4, 'Deben existir al menos 4 botones de acceso rápido');

      const registerBtn = await driver.findElement(By.css('a[href="/products/new"]'));
      await registerBtn.click();
      await driver.sleep(500);

      const url = await driver.getCurrentUrl();
      assert.ok(url.includes('/products/new'), 'Debe navegar a /products/new');
      await takeScreenshot(driver, 'HU001_CF04_quick_access_navigation');

      await navigateTo(driver, '/');
    });
  });

  describe('Prueba Negativa', function () {

    it('HU001-PN-01: Dashboard no muestra errores con datos vacíos', async function () {
      await navigateTo(driver, '/');
      await driver.sleep(1000);

      const alerts = await driver.findElements(By.css('.alert-error'));
      assert.strictEqual(alerts.length, 0, 'No deben aparecer alertas de error en el dashboard');
      await takeScreenshot(driver, 'HU001_PN01_no_errors_on_load');
    });
  });

  describe('Navegación del Sidebar', function () {

    it('HU001-NAV-01: El sidebar muestra todas las secciones', async function () {
      await navigateTo(driver, '/');

      const navLinks = await driver.findElements(By.css('.nav-link'));
      assert.ok(navLinks.length >= 5, 'El sidebar debe tener al menos 5 enlaces de navegación');
      await takeScreenshot(driver, 'HU001_NAV01_sidebar_sections');
    });

    it('HU001-NAV-02: La sección activa se resalta en el sidebar', async function () {
      await navigateTo(driver, '/');
      await driver.sleep(300);

      const activeLink = await driver.findElement(By.css('.nav-link.active'));
      const activeText = await activeLink.getText();
      assert.ok(activeText.includes('Dashboard'), 'El enlace activo debe ser "Dashboard"');
      await takeScreenshot(driver, 'HU001_NAV02_active_link_highlighted');
    });
  });
});
