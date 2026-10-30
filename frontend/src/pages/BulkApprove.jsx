import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import api from '../api';
import useLive from '../hooks/useLive';
import { toast } from '../components/Toast';

export default function BulkApprove() {
  const [lights, setLights] = useState([]);
  const [picked, setPicked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canWrite = user.role === 'customer' || user.role === 'admin';

  const load = () => {
    setLoading(true);
    api.get('/approvals/pending-lights')
      .then((r) => { setLights(r.data.lights); setPicked([]); setError(''); })
      .catch(() => setError('List load nahi ho payi'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  useLive(load);

  const allSelected = lights.length > 0 && picked.length === lights.length;
  const toggleAll = () => setPicked(allSelected ? [] : lights.map((l) => l.id));
  const toggle = (id) => setPicked(picked.includes(id) ? picked.filter((i) => i !== id) : [...picked, id]);

  const act = async (action) => {
    if (picked.length === 0) return;
    if (action === 'reject' && !window.confirm(picked.length + ' light reject karni hain?')) return;
    setBusy(true);
    try {
      const r = await api.post('/approvals/lights/bulk', { ids: picked, action });
      toast(r.data.updated + (action === 'approve' ? ' light approve ho gayi' : ' light reject ho gayi'));
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Kuch galat ho gaya', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title">Bulk Approve</h1>
        {canWrite && (
          <div className="flex gap-2">
            <button className="btn-primary" disabled={busy || picked.length === 0} onClick={() => act('approve')}>
              <Check size={18} /> Approve ({picked.length})
            </button>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-error-600 px-5 text-sm font-medium text-white hover:bg-error-500 disabled:opacity-60"
              disabled={busy || picked.length === 0}
              onClick={() => act('reject')}
            >
              <X size={18} /> Reject ({picked.length})
            </button>
          </div>
        )}
      </div>

      {error && <div className="mt-4 text-error-600">{error}</div>}

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-100 dark:border-gray-800">
            <tr>
              {canWrite && (
                <th className="th w-12"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
              )}
              {['Controller ID', 'Pole', 'Status', 'Location'].map((h) => <th key={h} className="th">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}><td colSpan="5" className="td"><div className="shimmer h-5 rounded" /></td></tr>
            ))}
            {!loading && lights.length === 0 && (
              <tr><td colSpan="5" className="td text-center">Koi light approval ke liye pending nahi hai</td></tr>
            )}
            {!loading && lights.map((l) => (
              <tr key={l.id}>
                {canWrite && (
                  <td className="td"><input type="checkbox" checked={picked.includes(l.id)} onChange={() => toggle(l.id)} /></td>
                )}
                <td className="td font-medium text-gray-800 dark:text-white/90">{l.controller_id || '-'}</td>
                <td className="td">{l.pole_number}</td>
                <td className="td"><span className={'badge ' + (l.status === 'healthy' ? 'badge-ok' : 'badge-bad')}>{l.status}</span></td>
                <td className="td text-xs">{l.latitude ? Number(l.latitude).toFixed(4) + ', ' + Number(l.longitude).toFixed(4) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
