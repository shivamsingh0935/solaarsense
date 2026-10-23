import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ToastHost, toast } from './Toast';
import {
  LayoutGrid, Lightbulb, FileText, Users, LogOut, Menu, X, Sun, Moon, Search, ChevronDown, Zap,
} from 'lucide-react';

const menu = [
  { label: 'Dashboard', icon: LayoutGrid, to: '/' },
  {
    label: 'Solar Street Lights', icon: Lightbulb,
    children: [
      { label: 'SSL Data', to: '/ssl-data' },
      { label: 'Bulk Approve', to: '/bulk-approve' },
      { label: 'Field Engineer Submissions', to: '/fe-submissions' },
      { label: 'Swap Requests', to: '/swap-requests' },
      { label: 'Lights Location', to: '/lights-location' },
    ],
  },
  {
    label: 'Reports', icon: FileText,
    children: [
      { label: 'Light Working Days', to: '/reports/working-days' },
      { label: 'Fault Rectification Logs', to: '/reports/fault-logs' },
    ],
  },
  {
    label: 'Users', icon: Users,
    children: [
      { label: 'Sub Users', to: '/users/sub-users' },
      { label: 'Field Engineers', to: '/users/field-engineers' },
    ],
  },
];

const item = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:translate-x-1 ${
    isActive
      ? 'bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400'
      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
  }`;

export default function Layout() {
  const [open, setOpen] = useState(null);
  const [mobile, setMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const onClick = (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      b.classList.add('ripple-host');
      const r = b.getBoundingClientRect();
      const d = document.createElement('span');
      d.className = 'ripple-dot';
      d.style.left = e.clientX - r.left + 'px';
      d.style.top = e.clientY - r.top + 'px';
      b.appendChild(d);
      setTimeout(() => d.remove(), 600);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast('Logout ho gaya');
    navigate('/login');
  };

  const initials = (user.name || 'U').slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen">
      {mobile && <div className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden" onClick={() => setMobile(false)} />}

      <aside
        className={`fixed inset-y-0 start-0 z-50 flex w-72 flex-col border-e border-gray-200 bg-white px-5 transition-transform dark:border-gray-800 dark:bg-gray-900
        ${mobile ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0'}`}
      >
        <div className="flex h-20 items-center gap-3">
          <div className="pop-in flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white"><Zap size={20} /></div>
          <span className="text-xl font-semibold text-gray-800 dark:text-white/90">SolarSense</span>
        </div>

        <nav className="mt-2 flex-1 space-y-1 overflow-y-auto pb-6">
          <div className="mb-2 px-3 text-xs text-gray-400">Menu</div>
          {menu.map((m, mi) =>
            m.children ? (
              <div key={m.label} className="slide-left" style={{ '--i': mi }}>
                <button
                  onClick={() => setOpen(open === m.label ? null : m.label)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                >
                  <m.icon size={20} />
                  <span className="flex-1 text-start">{m.label}</span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${open === m.label ? 'rotate-180' : ''}`} />
                </button>
                <div className={`grid transition-all duration-300 ease-out ${open === m.label ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="ms-6 mt-1 space-y-1 border-s border-gray-200 ps-3 dark:border-gray-800">
                      {m.children.map((c) => (
                        <NavLink key={c.to} to={c.to} onClick={() => setMobile(false)} className={item}>{c.label}</NavLink>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <NavLink key={m.to} to={m.to} end onClick={() => setMobile(false)} className={(a) => item(a) + ' slide-left'} style={{ '--i': mi }}>
                <m.icon size={20} /> {m.label}
              </NavLink>
            )
          )}
        </nav>

        <button onClick={logout} className="mb-5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      <ToastHost />
      <div key={'bar' + location.pathname} className="route-bar" />
      <div className={`transition-all ${collapsed ? '' : 'lg:ms-72'}`}>
        <header className="header-in sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 lg:px-6">
          <button
            onClick={() => (window.innerWidth >= 1024 ? setCollapsed(!collapsed) : setMobile(!mobile))}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/5"
            aria-label="Menu"
          >
            {mobile ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="relative hidden w-full max-w-md sm:block">
            <Search size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search..." className="input w-full ps-11" />
          </div>

          <div className="ms-auto flex items-center gap-3">
            <button
              onClick={() => { setDark(!dark); toast(dark ? 'Light mode on' : 'Dark mode on'); }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/5"
              aria-label="Theme"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-500 dark:bg-brand-500/15">{initials}</div>
              <div className="hidden leading-tight sm:block">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</div>
                <div className="text-xs capitalize text-gray-500">{(user.role || '').replace('_', ' ')}</div>
              </div>
            </div>
          </div>
        </header>

        <main key={location.pathname} className="page-enter mx-auto max-w-screen-2xl p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
