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
    api
      .get('/reports/working-days', { params: { from, to } })
      .then((res) => {
        setRows(res.data.rows);
        setError('');
      })
      .catch(() => setError('Report load nahi ho payi'))
      .finally(() => setLoading(false));
  }, [from, to]);

  const totalKwh = rows.reduce((s, r) => s + r.total_kwh, 0).toFixed(2);
  const totalHours = rows.reduce((s, r) => s + r.total_hours, 0);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">Light Working Days</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <label className="text-slate-600">From</label>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2" />
        <label className="text-slate-600">To</label>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2" />
        <button onClick={() => { setFrom(''); setTo(''); }}
          className="rounded-lg border bg-white px-3 py-2">Clear</button>
      </div>

      {error && <div className="mt-4 text-red-600">{error}</div>}

      <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Controller ID</th>
              <th className="px-4 py-3">Pole</th>
              <th className="px-4 py-3">Working Days</th>
              <th className="px-4 py-3">Total Hours</th>
              <th className="px-4 py-3">Energy (kWh)</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-400">Loading...</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-400">Data nahi mila</td></tr>
            )}
            {!loading && rows.map((r) => (
              <tr key={r.id} className="border-t text-slate-700">
                <td className="px-4 py-3 font-medium">{r.controller_id || '-'}</td>
                <td className="px-4 py-3">{r.pole_number}</td>
                <td className="px-4 py-3">{r.working_days}</td>
                <td className="px-4 py-3">{r.total_hours}</td>
                <td className="px-4 py-3">{r.total_kwh}</td>
              </tr>
            ))}
          </tbody>
          {!loading && rows.length > 0 && (
            <tfoot className="border-t bg-slate-50 text-sm font-semibold text-slate-800">
              <tr>
                <td className="px-4 py-3" colSpan="3">Total</td>
                <td className="px-4 py-3">{totalHours}</td>
                <td className="px-4 py-3">{totalKwh}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
