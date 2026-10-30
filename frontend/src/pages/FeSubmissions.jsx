import { useEffect, useState } from 'react';
import { Check, X, Plus, Image } from 'lucide-react';
import api from '../api';
import useLive from '../hooks/useLive';
import { toast } from '../components/Toast';
import { fmtDate } from '../utils/format';

const empty = { light_id: '', remarks: '', photo_url: '' };

const statusBadge = (s) =>
  s === 'approved' ? 'badge-ok' : s === 'rejected' ? 'badge-bad' : 'badge-warn';

export default function FeSubmissions() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [lights, setLights] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isFe = user.role === 'field_engineer';
  const canWrite = user.role === 'admin' || user.role === 'customer';

  const load = () => {
    setLoading(true);
    api.get('/approvals/submissions', { params: { status } })
      .then((r) => { setRows(r.data.rows); setError(''); })
      .catch(() => setError('List load nahi ho payi'))
      .finally(() => setLoading(false));
  };
  useEffect(load, [status]);
  useLive(load);

  useEffect(() => {
    if (isFe) {
      api.get('/lights/all').then((r) => setLights(r.data.lights)).catch(() => {});
    }
  }, [isFe]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.light_id) { toast('Light chuno', 'error'); return; }
    setBusy(true);
    try {
      await api.post('/approvals/submissions', form);
      toast('Submission bhej di gayi');
      setForm(empty);
      setShow(false);
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Submission nahi bheji ja saki', 'error');
    } finally { setBusy(false); }
  };

  const act = async (id, action) => {
    setBusy(true);
    try {
      await api.post(`/approvals/submissions/${id}`, { action });
      toast(action === 'approve' ? 'Submission approve ho gayi' : 'Submission reject ho gayi');
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Kuch galat ho gaya', 'error');
    } finally { setBusy(false); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title">Field Engineer Submissions</h1>
        {isFe && (
          <button className="btn-primary" onClick={() => setShow(!show)}>
            {show ? <><X size={18} /> Band karo</> : <><Plus size={18} /> Naya submission</>}
          </button>
        )}
      </div>

      {show && (
        <form onSubmit={submit} className="card pop-in mt-5 grid gap-4 p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Light *</label>
            <select className="input w-full" value={form.light_id} onChange={set('light_id')}>
              <option value="">Light chuno</option>
              {lights.map((l) => (
                <option key={l.id} value={l.id}>{l.controller_id || 'No controller'} — Pole {l.pole_number}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Remarks</label>
            <textarea className="input h-24 w-full resize-y py-3" placeholder="Kya kaam kiya..." value={form.remarks} onChange={set('remarks')} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Photo URL (optional)</label>
            <input className="input w-full" placeholder="https://..." value={form.photo_url} onChange={set('photo_url')} />
          </div>
          <button disabled={busy} className="btn-primary sm:col-span-2">
            {busy ? <><span className="spinner" /> Bhej rahe hain</> : 'Submit karo'}
          </button>
        </form>
      )}

      <div className="mt-5">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
          <option value="">Sab status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
        </select>
      </div>

      {error && <div className="mt-4 text-error-600">{error}</div>}

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-100 dark:border-gray-800">
            <tr>
              {['Controller ID', 'Pole', 'Engineer', 'Remarks', 'Submitted', 'Status'].map((h) => <th key={h} className="th">{h}</th>)}
              {canWrite && <th className="th">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}><td colSpan={canWrite ? 7 : 6} className="td"><div className="shimmer h-5 rounded" /></td></tr>
            ))}
            {!loading && rows.length === 0 && <tr><td colSpan={canWrite ? 7 : 6} className="td text-center">Koi submission nahi mili</td></tr>}
            {!loading && rows.map((r) => (
              <tr key={r.id}>
                <td className="td font-medium text-gray-800 dark:text-white/90">{r.controller_id || '-'}</td>
                <td className="td">{r.pole_number}</td>
                <td className="td">{r.engineer || '-'}</td>
                <td className="td max-w-xs">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{r.remarks || '-'}</span>
                    {r.photo_url && (
                      <a href={r.photo_url} target="_blank" rel="noreferrer" className="shrink-0 text-brand-500 hover:text-brand-600" title="Photo dekho">
                        <Image size={16} />
                      </a>
                    )}
                  </div>
                </td>
                <td className="td">{fmtDate(r.submitted_at)}</td>
                <td className="td"><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                {canWrite && (
                  <td className="td">
                    {r.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button className="btn-outline !px-2 !text-success-600" title="Approve" disabled={busy} onClick={() => act(r.id, 'approve')}><Check size={16} /></button>
                        <button className="btn-outline !px-2 !text-error-600" title="Reject" disabled={busy} onClick={() => act(r.id, 'reject')}><X size={16} /></button>
                      </div>
                    ) : '-'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
