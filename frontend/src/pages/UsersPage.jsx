import { useEffect, useState } from 'react';
import api from '../api';
import { toast } from '../components/Toast';

const empty = { name: '', username: '', password: '', phone: '' };

export default function UsersPage({ role, title }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(empty);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/users', { params: { role } })
      .then((r) => { setUsers(r.data.users); setError(''); })
      .catch(() => setError('List load nahi ho payi'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); setShow(false); }, [role]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setFormError(''); setSaving(true);
    try {
      await api.post('/users', { ...form, role });
      setForm(empty); setShow(false); load(); toast('User ban gaya');
    } catch (err) {
      const m = err.response?.data?.message || 'User nahi ban paya'; setFormError(m); toast(m, 'error');
    } finally { setSaving(false); }
  };

  const toggle = async (id) => {
    try { await api.patch(`/users/${id}/toggle`); load(); toast('Status badal gaya'); } catch { setError('Status badal nahi paya'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="page-title">{title}</h1>
        <button className="btn-primary" onClick={() => setShow(!show)}>{show ? 'Band karo' : 'Naya jodo'}</button>
      </div>

      {show && (
        <form onSubmit={submit} className="card mt-5 grid gap-4 p-5 sm:grid-cols-2">
          <input className="input" placeholder="Naam" value={form.name} onChange={set('name')} />
          <input className="input" placeholder="Username" value={form.username} onChange={set('username')} />
          <input className="input" type="password" placeholder="Password (kam se kam 6)" value={form.password} onChange={set('password')} />
          <input className="input" placeholder="Phone (optional)" value={form.phone} onChange={set('phone')} />
          {formError && <div className="text-sm text-error-600 sm:col-span-2">{formError}</div>}
          <button disabled={saving} className="btn-primary sm:col-span-2">{saving ? <><span className="spinner" /> Save ho raha hai</> : 'Save karo'}</button>
        </form>
      )}

      {error && <div className="mt-4 text-error-600">{error}</div>}
      <div className="card mt-5 overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-100 dark:border-gray-800">
            <tr>{['Naam', 'Username', 'Phone', 'Status', 'Action'].map((h) => <th key={h} className="th">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading && <tr><td colSpan="5" className="td text-center">Loading...</td></tr>}
            {!loading && users.length === 0 && <tr><td colSpan="5" className="td text-center">Koi user nahi mila</td></tr>}
            {!loading && users.map((u) => (
              <tr key={u.id}>
                <td className="td font-medium text-gray-800 dark:text-white/90">{u.name}</td>
                <td className="td">{u.username}</td><td className="td">{u.phone || '-'}</td>
                <td className="td"><span className={`badge ${u.is_active ? 'badge-ok' : 'badge-off'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="td"><button className="btn-outline" onClick={() => toggle(u.id)}>{u.is_active ? 'Inactive karo' : 'Active karo'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
