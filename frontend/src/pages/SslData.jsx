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
    const timer = setTimeout(() => {
      setLoading(true);
      api
        .get('/lights', { params: { page, limit, search, status } })
        .then((res) => {
          setLights(res.data.lights);
          setTotal(res.data.total);
          setError('');
        })
        .catch(() => setError('Data load nahi ho paya'))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, status]);

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">SSL Data</h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Controller ID ya Pole number search karo"
          className="w-72 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
        >
          <option value="">Sab status</option>
          <option value="healthy">Healthy</option>
          <option value="faulty">Faulty</option>
        </select>
      </div>

      {error && <div className="mt-4 text-red-600">{error}</div>}

      <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Controller ID</th>
              <th className="px-4 py-3">Pole</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Plugged</th>
              <th className="px-4 py-3">Control</th>
              <th className="px-4 py-3">DIM</th>
              <th className="px-4 py-3">Approval</th>
              <th className="px-4 py-3">Location</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="8" className="px-4 py-6 text-center text-slate-400">Loading...</td></tr>
            )}
            {!loading && lights.length === 0 && (
              <tr><td colSpan="8" className="px-4 py-6 text-center text-slate-400">Koi light nahi mili</td></tr>
            )}
            {!loading && lights.map((l) => (
              <tr key={l.id} className="border-t text-slate-700">
                <td className="px-4 py-3 font-medium">{l.controller_id || '-'}</td>
                <td className="px-4 py-3">{l.pole_number}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${l.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3">{l.is_plugged ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3">{l.control}</td>
                <td className="px-4 py-3">{l.dim}%</td>
                <td className="px-4 py-3 capitalize">{l.approval_status}</td>
                <td className="px-4 py-3 text-xs">{Number(l.latitude).toFixed(4)}, {Number(l.longitude).toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <div>Total: {total} lights</div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="rounded border bg-white px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <span>Page {page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded border bg-white px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
