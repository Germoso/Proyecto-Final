import { useState, useEffect } from 'react';
import { searchProducts, deleteProduct } from '../services/api';

function ProductSearch() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await searchProducts('');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchProducts(query);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${name}"?`)) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setAlert({ type: 'success', message: `Producto "${name}" eliminado` });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al eliminar producto' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const getStockBadge = (qty) => {
    if (qty === 0) return <span className="badge badge-danger">Sin stock</span>;
    if (qty < 10) return <span className="badge badge-warning">Bajo ({qty})</span>;
    return <span className="badge badge-success">{qty} uds.</span>;
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h2>Buscar Productos</h2>
        <p>Busca por nombre o código de producto</p>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>{alert.message}</div>
      )}

      <form onSubmit={handleSearch}>
        <div className="search-bar">
          <span className="search-icon">&#x2315;</span>
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por nombre o código..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
        </div>
      </form>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"></div>
            <p>{searched ? 'Producto no encontrado' : 'No hay productos registrados'}</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.code}</td>
                    <td>{p.name}</td>
                    <td>
                      <span className="badge badge-info">{p.category}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>RD$ {Number(p.price).toFixed(2)}</td>
                    <td>{getStockBadge(p.quantity)}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(p.id, p.name)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

export default ProductSearch;
