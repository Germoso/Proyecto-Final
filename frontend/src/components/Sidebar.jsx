import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>🔧 Ferretería</h1>
        <p>Sistema de Inventario</p>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-title">Principal</div>
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
          <span>Dashboard</span>
        </NavLink>

        <div className="nav-section-title">Inventario</div>
        <NavLink to="/products/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span>Registrar Producto</span>
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
          <span>Buscar Productos</span>
        </NavLink>

        <div className="nav-section-title">Ventas</div>
        <NavLink to="/sales/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span>Nueva Venta</span>
        </NavLink>

        <div className="nav-section-title">Reportes</div>
        <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span>Reporte de Ventas</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
