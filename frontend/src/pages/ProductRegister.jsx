import { useState } from 'react';
import { createProduct } from '../services/api';

const CATEGORIES = [
  'Herramientas Manuales',
  'Herramientas Eléctricas',
  'Tornillería',
  'Pinturas',
  'Plomería',
  'Electricidad',
  'Construcción',
  'Jardinería',
  'Seguridad',
  'Otros',
];

function ProductRegister() {
  const [form, setForm] = useState({
    name: '',
    code: '',
    price: '',
    quantity: '',
    category: '',
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!form.code.trim()) newErrors.code = 'El código es obligatorio';
    if (!form.price || Number(form.price) <= 0) newErrors.price = 'El precio debe ser mayor a 0';
    if (!form.quantity || Number(form.quantity) < 0) newErrors.quantity = 'La cantidad no puede ser negativa';
    if (!form.category) newErrors.category = 'La categoría es obligatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await createProduct({
        name: form.name.trim(),
        code: form.code.trim(),
        price: Number(form.price),
        quantity: Number(form.quantity),
        category: form.category,
      });
      setAlert({ type: 'success', message: 'Producto registrado exitosamente' });
      setForm({ name: '', code: '', price: '', quantity: '', category: '' });
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Error al registrar el producto';
      setAlert({ type: 'error', message: msg });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 5000);
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h2>Registrar Producto</h2>
        <p>Ingresa los datos del nuevo producto al inventario</p>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>{alert.message}</div>
      )}

      <div className="card" style={{ maxWidth: '700px' }}>
        <div className="card-title">Nuevo Producto</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre del Producto *</label>
            <input
              type="text"
              name="name"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Ej: Martillo de acero 16oz"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Código del Producto *</label>
              <input
                type="text"
                name="code"
                className={`form-input ${errors.code ? 'error' : ''}`}
                placeholder="Ej: HM-001"
                value={form.code}
                onChange={handleChange}
              />
              {errors.code && <div className="form-error">{errors.code}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <select
                name="category"
                className={`form-select ${errors.category ? 'error' : ''}`}
                value={form.category}
                onChange={handleChange}
              >
                <option value="">Seleccione una categoría</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <div className="form-error">{errors.category}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Precio (RD$) *</label>
              <input
                type="number"
                name="price"
                step="0.01"
                min="0.01"
                className={`form-input ${errors.price ? 'error' : ''}`}
                placeholder="0.00"
                value={form.price}
                onChange={handleChange}
              />
              {errors.price && <div className="form-error">{errors.price}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Cantidad en Stock *</label>
              <input
                type="number"
                name="quantity"
                min="0"
                className={`form-input ${errors.quantity ? 'error' : ''}`}
                placeholder="0"
                value={form.quantity}
                onChange={handleChange}
              />
              {errors.quantity && <div className="form-error">{errors.quantity}</div>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Producto'}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={() => {
                setForm({ name: '', code: '', price: '', quantity: '', category: '' });
                setErrors({});
              }}
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductRegister;
