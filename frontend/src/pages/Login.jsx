import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import api from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
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
    <div className="flex min-h-screen">
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <form onSubmit={submit} className="slide-left w-full max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <div className="pop-in flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white"><Zap size={22} /></div>
            <span className="text-2xl font-semibold text-gray-800 dark:text-white/90">SolarSense</span>
          </div>
          <h1 className="text-title text-3xl font-semibold text-gray-800 dark:text-white/90">Sign in</h1>
          <p className="mt-2 text-sm text-gray-500">Apna username aur password daalo.</p>

          {error && <div className="pop-in mt-5 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600">{error}</div>}

          <label className="mt-6 block text-sm font-medium text-gray-700 dark:text-gray-400">Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="input mt-1.5 w-full" placeholder="Username" />

          <label className="mt-5 block text-sm font-medium text-gray-700 dark:text-gray-400">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input mt-1.5 w-full" placeholder="Password" />

          <button disabled={loading} className="btn-primary mt-7 w-full">{loading ? <><span className="spinner" /> Sign in ho raha hai</> : 'Sign in'}</button>
        </form>
      </div>
      <div className="hidden w-1/2 items-center justify-center login-bg relative overflow-hidden p-12 lg:flex">
        <span className="blob -start-10 top-10 h-56 w-56" />
        <span className="blob bottom-10 end-10 h-72 w-72" style={{ animationDelay: '-4s' }} />
        <div className="relative max-w-sm text-white">
          <Zap size={44} className="float" />
          <h2 className="mt-6 text-3xl font-semibold">Solar street lights, ek hi jagah se.</h2>
          <p className="mt-3 text-white/80">Har light ki status, fault aur energy savings live dekho.</p>
        </div>
      </div>
    </div>
  );
}
