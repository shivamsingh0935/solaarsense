import { Link } from 'react-router-dom';
import { Zap, Home } from 'lucide-react';

export default function NotFound() {
  const loggedIn = !!localStorage.getItem('token');
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 dark:bg-gray-900">
      <div className="card pop-in w-full max-w-md p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-500/15">
          <Zap size={28} />
        </div>
        <h1 className="mt-6 text-5xl font-bold text-gray-800 dark:text-white/90">404</h1>
        <p className="mt-3 text-gray-500">Ye page nahi mila. Ho sakta hai link badal gaya ho.</p>
        <Link
          to={loggedIn ? '/' : '/login'}
          className="btn-primary mt-8 w-full"
        >
          <Home size={18} /> {loggedIn ? 'Dashboard par jao' : 'Login par jao'}
        </Link>
      </div>
    </div>
  );
}
