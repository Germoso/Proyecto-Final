import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ProductRegister from './pages/ProductRegister';
import ProductSearch from './pages/ProductSearch';
import SaleNew from './pages/SaleNew';
import SalesReport from './pages/SalesReport';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products/new" element={<ProductRegister />} />
            <Route path="/products" element={<ProductSearch />} />
            <Route path="/sales/new" element={<SaleNew />} />
            <Route path="/reports" element={<SalesReport />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
