import { useState } from 'react';
import { getReport, downloadReportPdf } from '../services/api';

function SalesReport() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setAlert({ type: 'error', message: 'Debe seleccionar ambas fechas' });
      setTimeout(() => setAlert(null), 3000);
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setAlert({ type: 'error', message: 'La fecha de inicio debe ser anterior a la fecha final' });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    setLoading(true);
    try {
      const res = await getReport(startDate, endDate);
      setReport(res.data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al generar el reporte' });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await downloadReportPdf(startDate, endDate);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_ventas_${startDate}_${endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al descargar el PDF' });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h2>Reporte de Ventas</h2>
        <p>Genera reportes filtrados por rango de fechas</p>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>{alert.message}</div>
      )}

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-title">Filtro por Fechas</div>
        <form onSubmit={handleGenerate}>
          <div className="date-filter">
            <div className="form-group">
              <label className="form-label">Fecha Inicio</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha Fin</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Generando...' : 'Generar Reporte'}
            </button>
            {report && (
              <button
                type="button"
                className="btn btn-success"
                onClick={handleDownloadPdf}
                disabled={downloading}
              >
                {downloading ? 'Descargando...' : 'Descargar PDF'}
              </button>
            )}
          </div>
        </form>
      </div>

      {report && (
        <div className="page-enter">
          <div className="report-summary">
            <div className="report-summary-card">
              <div className="value">{report.totalSales}</div>
              <div className="label">Ventas Realizadas</div>
            </div>
            <div className="report-summary-card">
              <div className="value">RD$ {report.totalAmount.toFixed(2)}</div>
              <div className="label">Monto Total</div>
            </div>
            <div className="report-summary-card">
              <div className="value">{report.startDate}</div>
              <div className="label">Desde</div>
            </div>
            <div className="report-summary-card">
              <div className="value">{report.endDate}</div>
              <div className="label">Hasta</div>
            </div>
          </div>

          {report.sales.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon"></div>
                <p>No se encontraron ventas en el período seleccionado</p>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID Venta</th>
                      <th>Fecha</th>
                      <th>Productos</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.sales.map((sale) => (
                      <tr key={sale.id}>
                        <td style={{ fontWeight: 600 }}>#{sale.id}</td>
                        <td>{new Date(sale.date).toLocaleDateString('es-DO')}</td>
                        <td>
                          {sale.items.map((item, idx) => (
                            <div key={idx} style={{ fontSize: '0.85rem' }}>
                              {item.productName} × {item.quantity} = RD$ {item.subtotal.toFixed(2)}
                            </div>
                          ))}
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                          RD$ {sale.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SalesReport;
