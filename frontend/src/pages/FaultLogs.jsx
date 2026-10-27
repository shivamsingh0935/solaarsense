import { useEffect, useState } from 'react';
import api from '../api';
import useLive from '../hooks/useLive';

const fmt = (d) => (d ? new Date(d).toLocaleString() : '-');

export default function FaultLogs() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get('/reports/fault-logs', { params: { status } })
      .then((r) => { setRows(r.data.rows); setError(''); })
      .catch(() => setError('Report load nahi ho payi'))
      .finally(() => setLoading(false));
  }, [status, reload]);

  useLive(() => setReload((n) => n + 1));

  return (
    <div>
      <h1 className="page-title">Fault Rectification Logs</h1>
      <div className="mt-5">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
          <option value="">Sab</option><option value="pending">Pending</option><option value="rectified">Rectified</option>
        </select>
      </div>
      {error && <div className="mt-4 text-error-600">{error}</div>}
      <div className="card mt-4 overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-100 dark:border-gray-800">
            <tr>{['Controller ID', 'Pole', 'Fault', 'Reported', 'Rectified', 'Rectified By', 'Status'].map((h) => <th key={h} className="th">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading && <tr><td colSpan="7" className="td text-center">Loading...</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan="7" className="td text-center">Data nahi mila</td></tr>}
            {!loading && rows.map((r) => (
              <tr key={r.id}>
                <td className="td font-medium text-gray-800 dark:text-white/90">{r.controller_id || '-'}</td>
                <td className="td">{r.pole_number}</td><td className="td">{r.fault_type}</td>
                <td className="td">{fmt(r.reported_at)}</td><td className="td">{fmt(r.rectified_at)}</td>
                <td className="td">{r.rectified_by || '-'}</td>
                <td className="td"><span className={`badge ${r.rectified_at ? 'badge-ok' : 'badge-bad'}`}>{r.rectified_at ? 'Rectified' : 'Pending'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
