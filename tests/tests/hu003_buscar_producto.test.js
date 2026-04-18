const assert = require('assert');
const {
  createDriver, takeScreenshot, navigateTo,
  waitVisible, waitFor, clearAndType,
  createTestProductAPI, deleteProductAPI, uniqueCode,
  By, until, TIMEOUT
} = require('../helpers');

describe('HU-003: Búsqueda de Productos', function () {
  this.timeout(60000);
  let driver;
  let testProduct;
  const productCode = uniqueCode('BUS');
  const productName = 'Destornillador Phillips Test';

  before(async function () {
    driver = await createDriver();
    testProduct = await createTestProductAPI({
      name: productName,
      code: productCode,
      price: 350.00,
      quantity: 30,
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

    it('HU003-CF-01: La página de búsqueda carga con todos los productos', async function () {
      await navigateTo(driver, '/products');
      await driver.sleep(1000);
      await takeScreenshot(driver, 'HU003_CF01_search_page_loaded');

      const header = await waitFor(driver, By.css('.page-header h2'));
      const headerText = await header.getText();
      assert.strictEqual(headerText, 'Buscar Productos');

      const rows = await driver.findElements(By.css('.table tbody tr'));
      assert.ok(rows.length >= 1, 'Debe haber al menos 1 producto en la tabla');
    });

    it('HU003-CF-02: Buscar por nombre muestra el producto correcto', async function () {
      await navigateTo(driver, '/products');
      await driver.sleep(1000);

      const searchInput = await driver.findElement(By.css('.search-bar input'));
      await searchInput.clear();
      await searchInput.sendKeys('Destornillador');
      await searchInput.sendKeys('\n');
      await driver.sleep(1500);

      await takeScreenshot(driver, 'HU003_CF02_search_by_name');

      const pageSource = await driver.getPageSource();
      assert.ok(pageSource.includes('Destornillador'), 'El producto debe aparecer en los resultados de búsqueda');
    });

    it('HU003-CF-03: Buscar por código muestra el producto correcto', async function () {
      await navigateTo(driver, '/products');
      await driver.sleep(1000);

      const searchInput = await driver.findElement(By.css('.search-bar input'));
      await searchInput.clear();
      await searchInput.sendKeys(productCode);
      await searchInput.sendKeys('\n');
      await driver.sleep(1500);

      await takeScreenshot(driver, 'HU003_CF03_search_by_code');

      const pageSource = await driver.getPageSource();
      assert.ok(pageSource.includes(productCode), 'El producto debe aparecer al buscar por código');
    });

    it('HU003-CF-04: La tabla muestra columnas correctas', async function () {
      await navigateTo(driver, '/products');
      await driver.sleep(1000);

      const headers = await driver.findElements(By.css('.table thead th'));
      const headerTexts = await Promise.all(headers.map(h => h.getText()));

      assert.ok(headerTexts.includes('Código'), 'Debe tener columna "Código"');
      assert.ok(headerTexts.includes('Nombre'), 'Debe tener columna "Nombre"');
      assert.ok(headerTexts.includes('Categoría'), 'Debe tener columna "Categoría"');
      assert.ok(headerTexts.includes('Precio'), 'Debe tener columna "Precio"');
      assert.ok(headerTexts.includes('Stock'), 'Debe tener columna "Stock"');
      assert.ok(headerTexts.includes('Acciones'), 'Debe tener columna "Acciones"');
      await takeScreenshot(driver, 'HU003_CF04_table_columns');
    });

    it('HU003-CF-05: El badge de stock muestra el color correcto', async function () {
      await navigateTo(driver, '/products');
      await driver.sleep(1000);

      const badges = await driver.findElements(By.css('.badge-success'));
      assert.ok(badges.length >= 1, 'Debe haber al menos un badge verde de stock');
      await takeScreenshot(driver, 'HU003_CF05_stock_badges');
    });
  });

  describe('Prueba Negativa', function () {

    it('HU003-PN-01: Búsqueda sin resultados muestra mensaje informativo', async function () {
      await navigateTo(driver, '/products');
      await driver.sleep(1000);

      const searchInput = await driver.findElement(By.css('.search-bar input'));
      await searchInput.clear();
      await searchInput.sendKeys('ProductoQueNoExiste12345');
      await searchInput.sendKeys('\n');
      await driver.sleep(1500);

      await takeScreenshot(driver, 'HU003_PN01_no_results');

      const pageSource = await driver.getPageSource();
      const hasEmptyMsg = pageSource.includes('no encontrado') || pageSource.includes('No hay productos');
      assert.ok(hasEmptyMsg, 'Debe mostrar mensaje cuando no hay resultados');
    });

    it('HU003-PN-02: Búsqueda vacía muestra todos los productos', async function () {
      await navigateTo(driver, '/products');
      await driver.sleep(1000);

      const searchInput = await driver.findElement(By.css('.search-bar input'));
      await searchInput.clear();
      await searchInput.sendKeys('');
      await searchInput.sendKeys('\n');
      await driver.sleep(1500);

      const rows = await driver.findElements(By.css('.table tbody tr'));
      assert.ok(rows.length >= 1, 'Búsqueda vacía debe mostrar todos los productos');
      await takeScreenshot(driver, 'HU003_PN02_empty_search_shows_all');
    });
  });

  describe('Prueba de Límites', function () {

    it('HU003-L-01: Contador de productos encontrados es correcto', async function () {
      await navigateTo(driver, '/products');
      await driver.sleep(1000);

      const countText = await driver.findElement(By.xpath("//*[contains(text(), 'encontrado')]"));
      const text = await countText.getText();
      assert.ok(/\d+/.test(text), `El texto debe contener un número: "${text}"`);
      await takeScreenshot(driver, 'HU003_L01_product_count');
    });
  });
});
