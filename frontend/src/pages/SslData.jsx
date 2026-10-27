import { useEffect, useState } from 'react';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import api from '../api';
import useLive from '../hooks/useLive';
import { toast } from '../components/Toast';

const emptyForm = {
  controller_id: '', pole_number: '', latitude: '', longitude: '',
  status: 'healthy', dim: '100', is_plugged: true,
};

const Label = ({ children }) => (
  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">{children}</label>
);

export default function SslData() {
  const [lights, setLights] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState(null);
  const [editError, setEditError] = useState('');
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);
  const limit = 10;

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canWrite = user.role === 'customer';

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      api.get('/lights', { params: { page, limit, search, status } })
        .then((r) => { setLights(r.data.lights); setTotal(r.data.total); setError(''); })
        .catch(() => setError('Data load nahi ho paya'))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [page, search, status, reload]);

  useLive(() => setReload((n) => n + 1));

  const pages = Math.max(Math.ceil(total / limit), 1);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setE = (k) => (e) => setEdit({ ...edit, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.controller_id.trim() || !form.pole_number.trim()) {
      setFormError('Controller ID aur Pole number zaruri hain');
      return;
    }
    setSaving(true);
    try {
      await api.post('/lights', form);
      toast('Light add ho gayi');
      setForm(emptyForm);
      setShow(false);
      setPage(1);
      setReload((n) => n + 1);
    } catch (err) {
      const m = err.response?.data?.message || 'Light add nahi ho payi';
      setFormError(m);
      toast(m, 'error');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (l) => {
    setEditError('');
    setEdit({
      id: l.id,
      controller_id: l.controller_id || '',
      pole_number: l.pole_number || '',
      latitude: l.latitude ?? '',
      longitude: l.longitude ?? '',
      status: l.status,
      dim: l.dim ?? 100,
      control: l.control || 'ON',
      is_plugged: !!l.is_plugged,
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!String(edit.pole_number).trim()) {
      setEditError('Pole number khali nahi ho sakta');
      return;
    }
    setBusy(true);
    try {
      await api.put(`/lights/${edit.id}`, {
        pole_number: edit.pole_number,
        latitude: edit.latitude,
        longitude: edit.longitude,
        status: edit.status,
        dim: edit.dim,
        control: edit.control,
        is_plugged: edit.is_plugged,
      });
      toast('Light update ho gayi');
      setEdit(null);
      setReload((n) => n + 1);
    } catch (err) {
      const m = err.response?.data?.message || 'Update nahi ho payi';
      setEditError(m);
      toast(m, 'error');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await api.delete(`/lights/${del.id}`);
      toast('Light hat gayi');
      setDel(null);
      if (lights.length === 1 && page > 1) setPage(page - 1);
      setReload((n) => n + 1);
    } catch (err) {
      toast(err.response?.data?.message || 'Light nahi hat payi', 'error');
    } finally {
      setBusy(false);
    }
  };

  const cols = canWrite ? 9 : 8;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="page-title">SSL Data</h1>
        {canWrite && (
          <button className="btn-primary" onClick={() => setShow(!show)}>
            {show ? <><X size={18} /> Band karo</> : <><Plus size={18} /> Light jodo</>}
          </button>
        )}
      </div>

      {show && (
        <form onSubmit={submit} className="card pop-in mt-5 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <div><Label>Controller ID *</Label><input className="input w-full" placeholder="jaise SSL-1007" value={form.controller_id} onChange={set('controller_id')} /></div>
          <div><Label>Pole number *</Label><input className="input w-full" placeholder="jaise POLE-7" value={form.pole_number} onChange={set('pole_number')} /></div>
          <div><Label>Status</Label>
            <select className="input w-full" value={form.status} onChange={set('status')}>
              <option value="healthy">Healthy</option><option value="faulty">Faulty</option>
            </select>
          </div>
          <div><Label>Latitude</Label><input className="input w-full" placeholder="28.6139" value={form.latitude} onChange={set('latitude')} /></div>
          <div><Label>Longitude</Label><input className="input w-full" placeholder="77.2090" value={form.longitude} onChange={set('longitude')} /></div>
          <div><Label>DIM (0 se 100)</Label><input className="input w-full" type="number" min="0" max="100" value={form.dim} onChange={set('dim')} /></div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-400">
            <input type="checkbox" checked={form.is_plugged} onChange={(e) => setForm({ ...form, is_plugged: e.target.checked })} /> Plugged hai
          </label>
          {formError && <div className="text-sm text-error-600 sm:col-span-2 lg:col-span-3">{formError}</div>}
          <button disabled={saving} className="btn-primary sm:col-span-2 lg:col-span-3">
            {saving ? <><span className="spinner" /> Save ho raha hai</> : 'Save karo'}
          </button>
        </form>
      )}

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
            <tr>
              {['Controller ID', 'Pole', 'Status', 'Plugged', 'Control', 'DIM', 'Approval', 'Location'].map((h) => <th key={h} className="th">{h}</th>)}
              {canWrite && <th className="th">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading && <tr><td colSpan={cols} className="td text-center">Loading...</td></tr>}
            {!loading && lights.length === 0 && <tr><td colSpan={cols} className="td text-center">Koi light nahi mili</td></tr>}
            {!loading && lights.map((l) => (
              <tr key={l.id}>
                <td className="td font-medium text-gray-800 dark:text-white/90">{l.controller_id || '-'}</td>
                <td className="td">{l.pole_number}</td>
                <td className="td"><span className={`badge ${l.status === 'healthy' ? 'badge-ok' : 'badge-bad'}`}>{l.status}</span></td>
                <td className="td">{l.is_plugged ? 'Yes' : 'No'}</td>
                <td className="td">{l.control}</td>
                <td className="td">{l.dim}%</td>
                <td className="td capitalize">{l.approval_status}</td>
                <td className="td text-xs">{l.latitude ? `${Number(l.latitude).toFixed(4)}, ${Number(l.longitude).toFixed(4)}` : '-'}</td>
                {canWrite && (
                  <td className="td">
                    <div className="flex gap-2">
                      <button className="btn-outline !px-2" title="Edit" onClick={() => openEdit(l)}><Pencil size={16} /></button>
                      <button className="btn-outline !px-2 !text-error-600" title="Delete" onClick={() => setDel(l)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                )}
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

      {edit && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-gray-900/50 p-4" onClick={() => !busy && setEdit(null)}>
          <form onSubmit={saveEdit} onClick={(e) => e.stopPropagation()} className="card pop-in grid w-full max-w-2xl gap-4 bg-white p-6 sm:grid-cols-2 dark:bg-gray-900">
            <div className="flex items-center justify-between sm:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Light badlo ({edit.controller_id})</h2>
              <button type="button" className="btn-outline !px-2" onClick={() => setEdit(null)}><X size={16} /></button>
            </div>
            <div><Label>Pole number</Label><input className="input w-full" value={edit.pole_number} onChange={setE('pole_number')} /></div>
            <div><Label>Status</Label>
              <select className="input w-full" value={edit.status} onChange={setE('status')}>
                <option value="healthy">Healthy</option><option value="faulty">Faulty</option>
              </select>
            </div>
            <div><Label>Latitude</Label><input className="input w-full" value={edit.latitude} onChange={setE('latitude')} /></div>
            <div><Label>Longitude</Label><input className="input w-full" value={edit.longitude} onChange={setE('longitude')} /></div>
            <div><Label>Control</Label>
              <select className="input w-full" value={edit.control} onChange={setE('control')}>
                <option value="ON">ON</option><option value="OFF">OFF</option>
              </select>
            </div>
            <div><Label>DIM (0 se 100)</Label><input className="input w-full" type="number" min="0" max="100" value={edit.dim} onChange={setE('dim')} /></div>
            <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2 dark:text-gray-400">
              <input type="checkbox" checked={edit.is_plugged} onChange={(e) => setEdit({ ...edit, is_plugged: e.target.checked })} /> Plugged hai
            </label>
            {editError && <div className="text-sm text-error-600 sm:col-span-2">{editError}</div>}
            <button disabled={busy} className="btn-primary sm:col-span-2">
              {busy ? <><span className="spinner" /> Save ho raha hai</> : 'Update karo'}
            </button>
          </form>
        </div>
      )}

      {del && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-gray-900/50 p-4" onClick={() => !busy && setDel(null)}>
          <div onClick={(e) => e.stopPropagation()} className="card pop-in w-full max-w-md bg-white p-6 dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Light hatani hai?</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <b>{del.controller_id}</b> ({del.pole_number}) hat jayegi. Iske working days, fault logs aur submissions bhi hat jayenge. Ye wapas nahi aayega.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button className="btn-outline h-11" disabled={busy} onClick={() => setDel(null)}>Nahi</button>
              <button className="inline-flex h-11 items-center gap-2 rounded-lg bg-error-600 px-5 text-sm font-medium text-white hover:bg-error-500 disabled:opacity-60" disabled={busy} onClick={confirmDelete}>
                {busy ? <><span className="spinner" /> Hat rahi hai</> : 'Haan, hatao'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
