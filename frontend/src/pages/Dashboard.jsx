import { useState, useEffect } from 'react';
import { getProducts, getSales } from '../services/api';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    lowStock: 0,
  });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, salesRes] = await Promise.all([
        getProducts(),
        getSales(),
      ]);
      const products = productsRes.data;
      const sales = salesRes.data;

      setStats({
        totalProducts: products.length,
        totalSales: sales.length,
        totalRevenue: sales.reduce((sum, s) => sum + Number(s.total), 0),
        lowStock: products.filter((p) => p.quantity < 10).length,
      });
      setRecentSales(sales.slice(0, 5));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Resumen general del sistema de inventario</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-icon"></div>
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-label">Productos Registrados</div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon"></div>
          <div className="stat-value">{stats.totalSales}</div>
          <div className="stat-label">Ventas Realizadas</div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon"></div>
          <div className="stat-value">RD$ {stats.totalRevenue.toFixed(2)}</div>
          <div className="stat-label">Ingresos Totales</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon"></div>
          <div className="stat-value">{stats.lowStock}</div>
          <div className="stat-label">Stock Bajo (&lt;10)</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <div className="card-title">Acceso Rápido</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/products/new" className="btn btn-primary" style={{ textAlign: 'center' }}>
              Registrar Producto
            </Link>
            <Link to="/products" className="btn btn-secondary" style={{ textAlign: 'center' }}>
              Buscar Productos
            </Link>
            <Link to="/sales/new" className="btn btn-success" style={{ textAlign: 'center' }}>
              Nueva Venta
            </Link>
            <Link to="/reports" className="btn btn-secondary" style={{ textAlign: 'center' }}>
              Generar Reporte
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Ventas Recientes</div>
          {recentSales.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"></div>
              <p>No hay ventas registradas aún</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>#{sale.id}</td>
                      <td>{new Date(sale.date).toLocaleDateString('es-DO')}</td>
                      <td style={{ fontWeight: 600, color: 'var(--success)' }}>
                        RD$ {Number(sale.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
