import { useEffect, useState } from 'react';
import api from '../api';

export default function SslData() {
  const [lights, setLights] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limit = 10;

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      api.get('/lights', { params: { page, limit, search, status } })
        .then((r) => { setLights(r.data.lights); setTotal(r.data.total); setError(''); })
        .catch(() => setError('Data load nahi ho paya'))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [page, search, status]);

  const pages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div>
      <h1 className="page-title">SSL Data</h1>
      <div className="mt-5 flex flex-wrap gap-3">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Controller ID ya pole number" className="input w-72" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input">
          <option value="">Sab status</option><option value="healthy">Healthy</option><option value="faulty">Faulty</option>
        </select>
      </div>
      {error && <div className="mt-4 text-error-600">{error}</div>}
      <div className="card mt-4 overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-100 dark:border-gray-800">
            <tr>{['Controller ID', 'Pole', 'Status', 'Plugged', 'Control', 'DIM', 'Approval', 'Location'].map((h) => <th key={h} className="th">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading && <tr><td colSpan="8" className="td text-center">Loading...</td></tr>}
            {!loading && lights.length === 0 && <tr><td colSpan="8" className="td text-center">Koi light nahi mili</td></tr>}
            {!loading && lights.map((l) => (
              <tr key={l.id}>
                <td className="td font-medium text-gray-800 dark:text-white/90">{l.controller_id || '-'}</td>
                <td className="td">{l.pole_number}</td>
                <td className="td"><span className={`badge ${l.status === 'healthy' ? 'badge-ok' : 'badge-bad'}`}>{l.status}</span></td>
                <td className="td">{l.is_plugged ? 'Yes' : 'No'}</td>
                <td className="td">{l.control}</td>
                <td className="td">{l.dim}%</td>
                <td className="td capitalize">{l.approval_status}</td>
                <td className="td text-xs">{Number(l.latitude).toFixed(4)}, {Number(l.longitude).toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div>Total: {total} lights</div>
        <div className="flex items-center gap-2">
          <button className="btn-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} / {pages}</span>
          <button className="btn-outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
