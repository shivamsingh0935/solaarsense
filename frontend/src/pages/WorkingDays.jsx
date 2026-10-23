import { useEffect, useState } from 'react';
import api from '../api';

export default function WorkingDays() {
  const [rows, setRows] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/reports/working-days', { params: { from, to } })
      .then((r) => { setRows(r.data.rows); setError(''); })
      .catch(() => setError('Report load nahi ho payi'))
      .finally(() => setLoading(false));
  }, [from, to]);

  const kwh = rows.reduce((s, r) => s + r.total_kwh, 0).toFixed(2);
  const hrs = rows.reduce((s, r) => s + r.total_hours, 0);

  return (
    <div>
      <h1 className="page-title">Light Working Days</h1>
      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
        <span className="text-gray-500">From</span>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
        <span className="text-gray-500">To</span>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
        <button className="btn-outline h-11" onClick={() => { setFrom(''); setTo(''); }}>Clear</button>
      </div>
      {error && <div className="mt-4 text-error-600">{error}</div>}
      <div className="card mt-4 overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-100 dark:border-gray-800">
            <tr>{['Controller ID', 'Pole', 'Working Days', 'Total Hours', 'Energy (kWh)'].map((h) => <th key={h} className="th">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading && <tr><td colSpan="5" className="td text-center">Loading...</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan="5" className="td text-center">Data nahi mila</td></tr>}
            {!loading && rows.map((r) => (
              <tr key={r.id}>
                <td className="td font-medium text-gray-800 dark:text-white/90">{r.controller_id || '-'}</td>
                <td className="td">{r.pole_number}</td><td className="td">{r.working_days}</td>
                <td className="td">{r.total_hours}</td><td className="td">{r.total_kwh}</td>
              </tr>
            ))}
          </tbody>
          {!loading && rows.length > 0 && (
            <tfoot className="border-t border-gray-200 dark:border-gray-800">
              <tr className="font-semibold text-gray-800 dark:text-white/90">
                <td className="td" colSpan="3">Total</td><td className="td">{hrs}</td><td className="td">{kwh}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
