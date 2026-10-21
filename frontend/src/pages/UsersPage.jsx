import { useEffect, useState } from 'react';
import api from '../api';

export default function UsersPage({ role, title }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: '', phone: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get('/users', { params: { role } })
      .then((res) => {
        setUsers(res.data.users);
        setError('');
      })
      .catch(() => setError('List load nahi ho payi'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    setShowForm(false);
  }, [role]);

  const change = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await api.post('/users', { ...form, role });
      setForm({ name: '', username: '', password: '', phone: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'User nahi ban paya');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (id) => {
    try {
      await api.patch(`/users/${id}/toggle`);
      load();
    } catch {
      setError('Status badal nahi paya');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
        >
          {showForm ? 'Band karo' : '+ Naya jodo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mt-4 grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2">
          <input value={form.name} onChange={change('name')} placeholder="Naam"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500" />
          <input value={form.username} onChange={change('username')} placeholder="Username"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500" />
          <input type="password" value={form.password} onChange={change('password')} placeholder="Password (kam se kam 6)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500" />
          <input value={form.phone} onChange={change('phone')} placeholder="Phone (optional)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500" />
          {formError && <div className="text-sm text-red-600 sm:col-span-2">{formError}</div>}
          <button disabled={saving}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2">
            {saving ? 'Save ho raha hai...' : 'Save karo'}
          </button>
        </form>
      )}

      {error && <div className="mt-4 text-red-600">{error}</div>}

      <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Naam</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-400">Loading...</td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-400">Koi user nahi mila</td></tr>
            )}
            {!loading && users.map((u) => (
              <tr key={u.id} className="border-t text-slate-700">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">{u.username}</td>
                <td className="px-4 py-3">{u.phone || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(u.id)} className="rounded border px-3 py-1 text-xs hover:bg-slate-50">
                    {u.is_active ? 'Inactive karo' : 'Active karo'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
