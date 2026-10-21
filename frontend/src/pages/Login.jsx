import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Server se connect nahi ho paa raha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="text-4xl">☀️</div>
          <h1 className="mt-2 text-2xl font-bold text-slate-800">SolarSense</h1>
          <p className="text-sm text-slate-500">Solar Street Light Monitoring</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
        )}

        <label className="text-sm font-medium text-slate-700">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4 mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-amber-500"
          placeholder="Username"
        />

        <label className="text-sm font-medium text-slate-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-amber-500"
          placeholder="Password"
        />

        <button
          disabled={loading}
          className="w-full rounded-lg bg-amber-500 py-2.5 font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
        >
          {loading ? 'Login ho raha hai...' : 'Login'}
        </button>
      </form>
    </div>
  );
}