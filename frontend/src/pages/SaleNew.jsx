import { useState, useEffect } from 'react';
import { getProducts, createSale } from '../services/api';

function SaleNew() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState(1);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data.filter((p) => p.quantity > 0));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const addToCart = () => {
    if (!selectedProductId) return;
    const product = products.find((p) => p.id === Number(selectedProductId));
    if (!product) return;

    const existing = cart.find((c) => c.productId === product.id);
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty + qty > product.quantity) {
      setAlert({
        type: 'error',
        message: `Stock insuficiente. Disponible: ${product.quantity - currentQty}`,
      });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    if (existing) {
      setCart((prev) =>
        prev.map((c) =>
          c.productId === product.id
            ? { ...c, quantity: c.quantity + qty, subtotal: (c.quantity + qty) * c.unitPrice }
            : c
        )
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          productCode: product.code,
          unitPrice: Number(product.price),
          quantity: qty,
          subtotal: qty * Number(product.price),
          maxStock: product.quantity,
        },
      ]);
    }

    setSelectedProductId('');
    setQty(1);
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  };

  const updateCartQty = (productId, delta) => {
    setCart((prev) =>
      prev.map((c) => {
        if (c.productId !== productId) return c;
        const newQty = c.quantity + delta;
        if (newQty < 1 || newQty > c.maxStock) return c;
        return { ...c, quantity: newQty, subtotal: newQty * c.unitPrice };
      })
    );
  };

  const total = cart.reduce((sum, c) => sum + c.subtotal, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) {
      setAlert({ type: 'error', message: 'Agregue al menos un producto' });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    setLoading(true);
    try {
      await createSale({
        items: cart.map((c) => ({
          productId: c.productId,
          quantity: c.quantity,
        })),
      });
      setAlert({ type: 'success', message: 'Venta registrada exitosamente' });
      setCart([]);
      await loadProducts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al registrar la venta';
      setAlert({ type: 'error', message: msg });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 5000);
    }
  };

  if (loadingProducts) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="page-header">
        <h2>Nueva Venta</h2>
        <p>Selecciona productos y registra la venta</p>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>{alert.message}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <div className="card-title">Agregar Productos</div>
          <div className="form-group">
            <label className="form-label">Producto</label>
            <select
              className="form-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">Seleccione un producto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.code} — RD$ {Number(p.price).toFixed(2)} (Stock: {p.quantity})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Cantidad</label>
              <input
                type="number"
                className="form-input"
                min="1"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                className="btn btn-primary"
                onClick={addToCart}
                disabled={!selectedProductId}
                style={{ width: '100%' }}
              >
                Agregar
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Carrito de Venta</div>

          {cart.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"></div>
              <p>Carrito vacío</p>
            </div>
          ) : (
            <div className="sale-cart">
              {cart.map((item) => (
                <div className="cart-item" key={item.productId}>
                  <div className="cart-item-info">
                    <div className="name">{item.productName}</div>
                    <div className="details">
                      {item.productCode} — RD$ {item.unitPrice.toFixed(2)} c/u
                    </div>
                  </div>
                  <div className="qty-control">
                    <button onClick={() => updateCartQty(item.productId, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateCartQty(item.productId, 1)}>+</button>
                  </div>
                  <div style={{ marginLeft: '16px', fontWeight: 700, minWidth: '100px', textAlign: 'right' }}>
                    RD$ {item.subtotal.toFixed(2)}
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ marginLeft: '8px' }}
                    onClick={() => removeFromCart(item.productId)}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className="cart-total">
                <span className="label">Total a Pagar</span>
                <span className="amount">RD$ {total.toFixed(2)}</span>
              </div>

              <button
                className="btn btn-success btn-lg"
                style={{ width: '100%', marginTop: '16px' }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Finalizar Venta'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SaleNew;
