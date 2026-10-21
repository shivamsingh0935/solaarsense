import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const menu = [
  { label: 'Dashboard', icon: '📊', to: '/' },
  {
    label: 'Solar Street Lights', icon: '💡',
    children: [
      { label: 'SSL Data', to: '/ssl-data' },
      { label: 'Bulk Approve', to: '/bulk-approve' },
      { label: 'Field Engineer Submissions', to: '/fe-submissions' },
      { label: 'Swap Requests', to: '/swap-requests' },
      { label: 'Lights Location', to: '/lights-location' },
    ],
  },
  {
    label: 'Reports', icon: '📄',
    children: [
      { label: 'Light Working Days', to: '/reports/working-days' },
      { label: 'Fault Rectification Logs', to: '/reports/fault-logs' },
    ],
  },
  {
    label: 'Users', icon: '👥',
    children: [
      { label: 'Sub Users', to: '/users/sub-users' },
      { label: 'Field Engineers', to: '/users/field-engineers' },
    ],
  },
];

export default function Layout() {
  const [openGroup, setOpenGroup] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm ${
      isActive ? 'bg-amber-500 text-white' : 'text-slate-300 hover:bg-slate-700'
    }`;

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 shrink-0 bg-slate-900 p-4">
        <div className="mb-6 flex items-center gap-2 px-2 text-xl font-bold text-white">
          <span>☀️</span> SolarSense
        </div>

        <nav className="space-y-1">
          {menu.map((item) =>
            item.children ? (
              <div key={item.label}>
                <button
                  onClick={() => setOpenGroup(openGroup === item.label ? null : item.label)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
                >
                  <span>{item.icon} {item.label}</span>
                  <span>{openGroup === item.label ? '▾' : '▸'}</span>
                </button>
                {openGroup === item.label && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-3">
                    {item.children.map((c) => (
                      <NavLink key={c.to} to={c.to} className={linkClass}>{c.label}</NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink key={item.to} to={item.to} end className={linkClass}>
                {item.icon} {item.label}
              </NavLink>
            )
          )}

          <button
            onClick={logout}
            className="mt-4 w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-slate-700"
          >
            🚪 Logout
          </button>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between bg-white px-6 py-3 shadow-sm">
          <input
            placeholder="Search..."
            className="w-64 rounded-lg bg-slate-100 px-3 py-2 text-sm outline-none"
          />
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-800">{user.name}</div>
            <div className="text-xs capitalize text-slate-500">{user.role}</div>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}