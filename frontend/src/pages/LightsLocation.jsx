import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api';
import useLive from '../hooks/useLive';

export default function LightsLocation() {
  const [lights, setLights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/lights/map')
      .then((res) => { setLights(res.data.lights); setError(''); })
      .catch(() => setError('Map ka data load nahi ho paya'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useLive(load);

  const stats = useMemo(() => ({
    total: lights.length,
    healthy: lights.filter((l) => l.status === 'healthy').length,
    faulty: lights.filter((l) => l.status === 'faulty').length,
    off: lights.filter((l) => l.control === 'OFF').length,
  }), [lights]);

  const center = lights.length
    ? [Number(lights[0].latitude), Number(lights[0].longitude)]
    : [28.6139, 77.209];

  return (
    <div>
      <h1 className="page-title">Lights Location</h1>
      <p className="mt-1 text-sm text-gray-500">Map par har light ki live position aur status dekho.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[['Total Lights', stats.total, 'gray'], ['Healthy', stats.healthy, 'ok'], ['Faulty', stats.faulty, 'bad'], ['OFF', stats.off, 'warn']].map(([label, value, tone], i) => (
          <div key={label} className="card card-hover fade-up p-4" style={{ '--i': i }}>
            <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
            <div className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {value}
              {tone === 'ok' && value > 0 && <i className="ms-2 inline-block h-2.5 w-2.5 rounded-full bg-success-500 align-middle" />}
              {tone === 'bad' && value > 0 && <i className="ms-2 inline-block h-2.5 w-2.5 rounded-full bg-error-500 align-middle" />}
            </div>
          </div>
        ))}
      </div>

      {error && <div className="card pop-in mt-4 border-error-500/30 p-5 text-sm text-error-600">{error}</div>}

      <div className="card fade-up mt-4 overflow-hidden" style={{ '--i': 4 }}>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Live Map</h2>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-success-500" />Healthy</span>
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-error-500" />Faulty</span>
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-gray-400" />OFF</span>
          </div>
        </div>

        {loading ? (
          <div className="shimmer m-5 h-[60vh] rounded-xl" />
        ) : lights.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Koi light nahi mili jiski location set hai. SSL Data mein latitude/longitude add karo.
          </div>
        ) : (
          <div className="relative m-5 mt-0" style={{ height: '60vh' }}>
            <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%', borderRadius: 12 }}>
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {lights.map((l) => (
                <CircleMarker
                  key={l.id}
                  center={[Number(l.latitude), Number(l.longitude)]}
                  radius={9}
                  pathOptions={{
                    color: l.control === 'OFF' ? '#98a2b3' : l.status === 'healthy' ? '#15803d' : '#b91c1c',
                    fillColor: l.control === 'OFF' ? '#98a2b3' : l.status === 'healthy' ? '#12b76a' : '#f04438',
                    fillOpacity: 0.85,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <div><b>{l.controller_id || 'No controller'}</b></div>
                      <div>Pole: {l.pole_number}</div>
                      <div>Status: <span className={l.status === 'healthy' ? 'text-success-600' : 'text-error-600'}>{l.status}</span></div>
                      <div>Plugged: {l.is_plugged ? 'Yes' : 'No'}</div>
                      <div>Control: {l.control} | DIM: {l.dim}%</div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
}
