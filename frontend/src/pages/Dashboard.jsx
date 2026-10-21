import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import api from '../api';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.clear();
          window.location.href = '/login';
        } else {
          setError('Dashboard data load nahi ho paya');
        }
      });
  }, []);

  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return <div className="text-slate-500">Loading...</div>;

  const c = data.cards;

  const rows = [
    [
      { label: 'Solar Street Lights', value: c.solarStreetLights, bg: 'bg-yellow-100', iconBg: 'bg-lime-400', icon: '💡' },
      { label: 'Healthy Solar Street Lights', value: c.healthyLights, bg: 'bg-green-200', iconBg: 'bg-green-300', icon: '✅' },
      { label: 'Faulty Solar Street Lights', value: c.faultyLights, bg: 'bg-red-200', iconBg: 'bg-red-300', icon: '⚠️' },
    ],
    [
      { label: 'Total Districts', value: c.districts, bg: 'bg-amber-100', iconBg: 'bg-amber-200', icon: '🗺️' },
      { label: 'Total Blocks', value: c.blocks, bg: 'bg-emerald-100', iconBg: 'bg-emerald-200', icon: '🏘️' },
      { label: 'Total Panchayats', value: c.panchayats, bg: 'bg-pink-100', iconBg: 'bg-pink-200', icon: '🏛️' },
    ],
    [
      { label: 'Total Wards', value: c.wards, bg: 'bg-lime-100', iconBg: 'bg-lime-200', icon: '📍' },
      { label: 'CO2 Emission Reduced KG', value: c.co2ReducedKg, bg: 'bg-purple-200', iconBg: 'bg-purple-300', icon: '🌱' },
      { label: 'Energy Savings KWH', value: c.energySavingsKwh, bg: 'bg-stone-100', iconBg: 'bg-yellow-100', icon: '⚡' },
    ],
    [{ label: 'Unplugged SSL Lights', value: c.unpluggedLights, bg: 'bg-orange-100', iconBg: 'bg-orange-200', icon: '🔌' }],
  ];

  const pieData = [
    { name: 'Healthy SSL Controllers', value: data.pie.healthy, color: '#14b8a6' },
    { name: 'Faulty SSL Controllers', value: data.pie.faulty, color: '#ef4444' },
  ];
  const pieTotal = data.pie.healthy + data.pie.faulty;
  const pieChartData = pieTotal === 0 ? [{ name: 'No data', value: 1, color: '#cbd5e1' }] : pieData.filter((d) => d.value > 0);

  const lu = data.lastUpdatedController;

  return (
    <div>
      <h1 className="text-base font-semibold text-slate-800">Hi, {user.name}!</h1>
      <p className="text-sm text-slate-500">Here's what's happening on your dashboard today.</p>

      <div className="mx-auto mt-6 max-w-3xl space-y-4">
        {rows.map((row, i) => (
          <div key={i} className={`grid gap-3 ${row.length === 1 ? 'mx-auto w-1/3' : 'grid-cols-3'}`}>
            {row.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>
        ))}

        <div className="mx-auto w-72 rounded bg-sky-100 p-4">
          <PieChart width={240} height={170}>
            <Pie data={pieChartData} dataKey="value" cx="50%" cy="50%" outerRadius={70} stroke="none">
              {pieChartData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
          <div className="mt-1 space-y-1 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-500" /> Healthy SSL Controllers ({data.pie.healthy})
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Faulty SSL Controllers ({data.pie.faulty})
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded bg-white p-4 shadow-sm">
          <div className="mb-3 text-center text-sm text-slate-600">Last 5 added controllers</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs font-semibold text-slate-800">
                  <th className="py-2">Controller Id</th>
                  <th>Status</th>
                  <th>Fetch Interval</th>
                  <th>Control</th>
                  <th>DIM</th>
                </tr>
              </thead>
              <tbody>
                {data.lastAddedControllers.map((r) => (
                  <tr key={r.controller_id} className="border-b last:border-0 text-slate-700">
                    <td className="py-2">{r.controller_id}</td>
                    <td className={r.status === 'healthy' ? 'text-green-600' : 'text-red-600'}>{r.status}</td>
                    <td>{r.fetch_interval} min</td>
                    <td>{r.control}</td>
                    <td>{r.dim}%</td>
                  </tr>
                ))}
                {data.lastAddedControllers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-slate-400">Koi controller nahi mila</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded bg-white p-4 shadow-sm">
          <div className="mb-3 text-center text-sm text-slate-600">Last updated controller</div>
          {lu ? (
            <div className="space-y-2 text-sm text-slate-700">
              <div><b>Controller Id:</b> {lu.controller_id}</div>
              <div><b>Status:</b> {lu.status}</div>
              <div><b>Fetch Interval:</b> {lu.fetch_interval} min</div>
              <div><b>Control:</b> {lu.control}</div>
              <div><b>DIM:</b> {lu.dim}%</div>
              <div><b>Last updated:</b> {new Date(lu.last_updated).toLocaleString()}</div>
            </div>
          ) : (
            <div className="py-4 text-center text-slate-400">Data nahi hai</div>
          )}
        </div>
      </div>
    </div>
  );
}