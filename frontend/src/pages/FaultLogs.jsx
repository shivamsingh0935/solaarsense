import { useEffect, useState } from 'react';
import api from '../api';

function fmt(d) {
  return d ? new Date(d).toLocaleString() : '-';
}

export default function FaultLogs() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get('/reports/fault-logs', { params: { status } })
      .then((res) => {
        setRows(res.data.rows);
        setError('');
      })
      .catch(() => setError('Report load nahi ho payi'))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">Fault Rectification Logs</h1>

      <div className="mt-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
        >
          <option value="">Sab</option>
          <option value="pending">Pending</option>
          <option value="rectified">Rectified</option>
        </select>
      </div>

      {error && <div className="mt-4 text-red-600">{error}</div>}

      <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Controller ID</th>
              <th className="px-4 py-3">Pole</th>
              <th className="px-4 py-3">Fault</th>
              <th className="px-4 py-3">Reported</th>
              <th className="px-4 py-3">Rectified</th>
              <th className="px-4 py-3">Rectified By</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="7" className="px-4 py-6 text-center text-slate-400">Loading...</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan="7" className="px-4 py-6 text-center text-slate-400">Data nahi mila</td></tr>
            )}
            {!loading && rows.map((r) => (
              <tr key={r.id} className="border-t text-slate-700">
                <td className="px-4 py-3 font-medium">{r.controller_id || '-'}</td>
                <td className="px-4 py-3">{r.pole_number}</td>
                <td className="px-4 py-3">{r.fault_type}</td>
                <td className="px-4 py-3">{fmt(r.reported_at)}</td>
                <td className="px-4 py-3">{fmt(r.rectified_at)}</td>
                <td className="px-4 py-3">{r.rectified_by || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${r.rectified_at ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {r.rectified_at ? 'Rectified' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
