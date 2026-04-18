import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// ========== PRODUCTS ==========
export const getProducts = () => api.get('/products');
export const searchProducts = (query) => api.get(`/products/search?q=${encodeURIComponent(query)}`);
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// ========== SALES ==========
export const getSales = () => api.get('/sales');
export const getSale = (id) => api.get(`/sales/${id}`);
export const createSale = (data) => api.post('/sales', data);

// ========== REPORTS ==========
export const getReport = (startDate, endDate) =>
  api.get(`/reports?startDate=${startDate}&endDate=${endDate}`);

export const downloadReportPdf = (startDate, endDate) =>
  api.get(`/reports/pdf?startDate=${startDate}&endDate=${endDate}`, {
    responseType: 'blob',
  });

export default api;
