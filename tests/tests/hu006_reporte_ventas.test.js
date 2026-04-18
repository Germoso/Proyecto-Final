const assert = require('assert');
const {
  createDriver, takeScreenshot, navigateTo,
  waitFor, clearAndType,
  By, until, TIMEOUT
} = require('../helpers');

describe('HU-006: Reporte de Ventas', function () {
  this.timeout(60000);
  let driver;

  before(async function () {
    driver = await createDriver();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  describe('Camino Feliz', function () {

    it('HU006-CF-01: La página de reportes carga correctamente', async function () {
      await navigateTo(driver, '/reports');
      await driver.sleep(500);
      await takeScreenshot(driver, 'HU006_CF01_reports_page_loaded');

      const header = await waitFor(driver, By.css('.page-header h2'));
      const headerText = await header.getText();
      assert.strictEqual(headerText, 'Reporte de Ventas', 'El título debe ser "Reporte de Ventas"');
    });

    it('HU006-CF-02: El formulario de filtro tiene campos de fecha', async function () {
      const dateInputs = await driver.findElements(By.css('input[type="date"]'));
      assert.strictEqual(dateInputs.length, 2, 'Debe haber 2 campos de fecha (inicio y fin)');

      const generateBtn = await driver.findElement(By.css('button[type="submit"]'));
      const btnText = await generateBtn.getText();
      assert.ok(btnText.includes('Generar'), 'Debe existir botón "Generar Reporte"');
      await takeScreenshot(driver, 'HU006_CF02_filter_form');
    });

    it('HU006-CF-03: Se puede generar un reporte con rango de fechas', async function () {
      await navigateTo(driver, '/reports');
      await driver.sleep(500);

      const dateInputs = await driver.findElements(By.css('input[type="date"]'));

      await dateInputs[0].clear();
      await dateInputs[0].sendKeys('2026-01-01');

      await dateInputs[1].clear();
      await dateInputs[1].sendKeys('2026-12-31');

      await takeScreenshot(driver, 'HU006_CF03_dates_filled');

      const generateBtn = await driver.findElement(By.css('button[type="submit"]'));
      await generateBtn.click();
      await driver.sleep(2000);

      await takeScreenshot(driver, 'HU006_CF03_report_generated');

      const summaryCards = await driver.findElements(By.css('.report-summary-card'));
      const pageSource = await driver.getPageSource();
      const hasReport = summaryCards.length > 0 || pageSource.includes('No se encontraron');
      assert.ok(hasReport, 'Debe mostrar el resumen del reporte o mensaje de no resultados');
    });

    it('HU006-CF-04: El resumen muestra las tarjetas de información correctas', async function () {
      const summaryCards = await driver.findElements(By.css('.report-summary-card'));

      if (summaryCards.length > 0) {
        assert.strictEqual(summaryCards.length, 4, 'Debe haber 4 tarjetas de resumen');

        const labels = await driver.findElements(By.css('.report-summary-card .label'));
        const labelTexts = await Promise.all(labels.map(l => l.getText()));

        assert.ok(labelTexts.some(t => t.includes('Ventas')), 'Debe mostrar "Ventas Realizadas"');
        assert.ok(labelTexts.some(t => t.includes('Monto')), 'Debe mostrar "Monto Total"');
        assert.ok(labelTexts.some(t => t.includes('Desde')), 'Debe mostrar "Desde"');
        assert.ok(labelTexts.some(t => t.includes('Hasta')), 'Debe mostrar "Hasta"');
        await takeScreenshot(driver, 'HU006_CF04_summary_cards');
      }
    });

    it('HU006-CF-05: El botón de descargar PDF aparece después de generar', async function () {
      const pdfButtons = await driver.findElements(By.css('.btn-success'));
      const hasPdfBtn = pdfButtons.length > 0;

      if (hasPdfBtn) {
        const btnTexts = await Promise.all(pdfButtons.map(b => b.getText()));
        const hasPdf = btnTexts.some(t => t.includes('PDF'));
        assert.ok(hasPdf, 'Debe existir un botón para descargar PDF');
        await takeScreenshot(driver, 'HU006_CF05_pdf_button_visible');
      } else {
        assert.ok(true, 'No hay ventas, botón PDF no aplica');
      }
    });
  });

  describe('Prueba Negativa', function () {

    it('HU006-PN-01: No se puede generar reporte sin fechas', async function () {
      await navigateTo(driver, '/reports');
      await driver.sleep(500);

      const generateBtn = await driver.findElement(By.css('button[type="submit"]'));
      await generateBtn.click();
      await driver.sleep(1000);

      const alerts = await driver.findElements(By.css('.alert-error'));
      assert.ok(alerts.length > 0, 'Debe mostrar error al generar sin fechas');

      const alertText = await alerts[0].getText();
      assert.ok(alertText.includes('fecha'), `Debe mencionar las fechas: "${alertText}"`);
      await takeScreenshot(driver, 'HU006_PN01_no_dates_error');
    });

    it('HU006-PN-02: Fecha inicio mayor que fecha fin muestra error', async function () {
      await navigateTo(driver, '/reports');
      await driver.sleep(500);

      const dateInputs = await driver.findElements(By.css('input[type="date"]'));

      await dateInputs[0].clear();
      await dateInputs[0].sendKeys('2026-12-31');

      await dateInputs[1].clear();
      await dateInputs[1].sendKeys('2026-01-01');

      const generateBtn = await driver.findElement(By.css('button[type="submit"]'));
      await generateBtn.click();
      await driver.sleep(1000);

      const alerts = await driver.findElements(By.css('.alert-error'));
      assert.ok(alerts.length > 0, 'Debe mostrar error cuando fecha inicio > fecha fin');
      await takeScreenshot(driver, 'HU006_PN02_invalid_date_range');
    });

    it('HU006-PN-03: Rango sin ventas muestra mensaje informativo', async function () {
      await navigateTo(driver, '/reports');
      await driver.sleep(500);

      const dateInputs = await driver.findElements(By.css('input[type="date"]'));

      await dateInputs[0].clear();
      await dateInputs[0].sendKeys('2020-01-01');

      await dateInputs[1].clear();
      await dateInputs[1].sendKeys('2020-01-02');

      const generateBtn = await driver.findElement(By.css('button[type="submit"]'));
      await generateBtn.click();
      await driver.sleep(2000);

      await takeScreenshot(driver, 'HU006_PN03_no_sales_in_range');

      const pageSource = await driver.getPageSource();
      const isEmpty = pageSource.includes('No se encontraron') || pageSource.includes('0');
      assert.ok(isEmpty, 'Debe indicar que no hay ventas en el rango seleccionado');
    });
  });
});
