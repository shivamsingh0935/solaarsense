import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Lightbulb, CheckCircle2, AlertTriangle, MapPin, Building2, Landmark, Home, Leaf, Zap, Unplug } from 'lucide-react';
import api from '../api';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.get('/dashboard').then((r) => setData(r.data)).catch((err) => {
      if (err.response?.status === 401) { localStorage.clear(); window.location.href = '/login'; }
      else setError('Dashboard data load nahi ho paya');
    });
  }, []);

  if (error) return <div className="text-error-600">{error}</div>;
  if (!data) return (
    <div>
      <div className="shimmer h-6 w-48 rounded" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => <div key={i} className="shimmer h-36 rounded-2xl" />)}
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="shimmer h-72 rounded-2xl" /><div className="shimmer h-72 rounded-2xl xl:col-span-2" />
      </div>
    </div>
  );

  const c = data.cards;
  const cards = [
    { label: 'Solar Street Lights', value: c.solarStreetLights, icon: Lightbulb, tone: 'brand' },
    { label: 'Healthy Lights', value: c.healthyLights, icon: CheckCircle2, tone: 'ok' },
    { label: 'Faulty Lights', value: c.faultyLights, icon: AlertTriangle, tone: 'bad' },
    { label: 'Unplugged Lights', value: c.unpluggedLights, icon: Unplug, tone: 'warn' },
    { label: 'Total Districts', value: c.districts, icon: MapPin, tone: 'gray' },
    { label: 'Total Blocks', value: c.blocks, icon: Building2, tone: 'gray' },
    { label: 'Total Panchayats', value: c.panchayats, icon: Landmark, tone: 'gray' },
    { label: 'Total Wards', value: c.wards, icon: Home, tone: 'gray' },
    { label: 'CO2 Reduced (kg)', value: c.co2ReducedKg, icon: Leaf, tone: 'ok' },
    { label: 'Energy Savings (kWh)', value: c.energySavingsKwh, icon: Zap, tone: 'warn' },
  ];

  const total = data.pie.healthy + data.pie.faulty;
  const pie = total === 0
    ? [{ name: 'No data', value: 1, color: '#e4e7ec' }]
    : [
        { name: 'Healthy', value: data.pie.healthy, color: '#12b76a' },
        { name: 'Faulty', value: data.pie.faulty, color: '#f04438' },
      ].filter((d) => d.value > 0);
  const lu = data.lastUpdatedController;

  return (
    <div>
      <h1 className="page-title">Hi, {user.name}!</h1>
      <p className="mt-1 text-sm text-gray-500">Aaj aapke dashboard par ye chal raha hai.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((x, i) => <StatCard key={x.label} index={i} {...x} />)}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="card fade-up p-6" style={{ '--i': 10 }}>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Controller health</h2>
          <div className="flex justify-center">
            <PieChart width={240} height={200}>
              <Pie data={pie} dataKey="value" innerRadius={55} outerRadius={85} stroke="none" isAnimationActive animationDuration={1000}>
                {pie.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-success-500" />Healthy ({data.pie.healthy})</span>
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-error-500" />Faulty ({data.pie.faulty})</span>
          </div>
        </div>

        <div className="card fade-up overflow-hidden xl:col-span-2" style={{ '--i': 11 }}>
          <div className="p-6 pb-3 text-lg font-semibold text-gray-800 dark:text-white/90">Last 5 added controllers</div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-y border-gray-100 dark:border-gray-800">
                <tr><th className="th">Controller Id</th><th className="th">Status</th><th className="th">Fetch Interval</th><th className="th">Control</th><th className="th">DIM</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.lastAddedControllers.map((r) => (
                  <tr key={r.controller_id}>
                    <td className="td font-medium text-gray-800 dark:text-white/90">{r.controller_id}</td>
                    <td className="td"><span className={`badge ${r.status === 'healthy' ? 'badge-ok' : 'badge-bad'}`}>{r.status}</span></td>
                    <td className="td">{r.fetch_interval} min</td>
                    <td className="td">{r.control}</td>
                    <td className="td">{r.dim}%</td>
                  </tr>
                ))}
                {data.lastAddedControllers.length === 0 && <tr><td colSpan="5" className="td text-center">Koi controller nahi mila</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card fade-up mt-4 p-6" style={{ '--i': 12 }}>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Last updated controller</h2>
        {lu ? (
          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3 lg:grid-cols-6">
            {[['Controller Id', lu.controller_id], ['Status', lu.status], ['Fetch Interval', `${lu.fetch_interval} min`], ['Control', lu.control], ['DIM', `${lu.dim}%`], ['Updated', new Date(lu.last_updated).toLocaleString()]].map(([k, v]) => (
              <div key={k}><div className="text-gray-500">{k}</div><div className="mt-1 font-medium text-gray-800 dark:text-white/90">{v}</div></div>
            ))}
          </div>
        ) : <div className="mt-3 text-gray-500">Data nahi hai</div>}
      </div>
    </div>
  );
}
