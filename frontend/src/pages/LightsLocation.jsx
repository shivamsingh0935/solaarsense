import { useEffect, useState, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api';
import useLive from '../hooks/useLive';

const STATUS_COLORS = {
  healthy: { fill: '#12b76a', stroke: '#15803d' },
  faulty: { fill: '#f04438', stroke: '#b91c1c' },
  off: { fill: '#98a2b3', stroke: '#667085' },
};

function statusOf(l) {
  return l.control === 'OFF' ? 'off' : l.status === 'healthy' ? 'healthy' : 'faulty';
}

function lightSvg(status, size) {
  const c = STATUS_COLORS[status];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 2h8l4 10H4L8 2Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>
    <path d="M12 12v6" stroke="#475467" stroke-width="1.75"/>
    <path d="M8 22v-2c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v2H8Z" stroke="#475467" stroke-width="1.75"/>
  </svg>`;
}

function lightIcon(l) {
  const pin = `<div style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;background:#fff;border-radius:9999px;border:1px solid #e4e7ec;box-shadow:0 2px 6px rgba(16,24,40,.35);box-sizing:border-box;">${lightSvg(statusOf(l), 20)}</div>`;
  return L.divIcon({ className: 'ss-light-marker', html: pin, iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -16] });
}

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

  const icons = useMemo(() => new Map(lights.map((l) => [l.id, lightIcon(l)])), [lights]);

  const center = lights.length
    ? [Number(lights[0].latitude), Number(lights[0].longitude)]
    : [28.6139, 77.209];

  return (
    <div>
      <h1 className="page-title">Lights Location</h1>
      <p className="mt-1 text-sm text-gray-500">View the live position and status of each light on the map.</p>

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
            {[['healthy', 'Healthy'], ['faulty', 'Faulty'], ['off', 'OFF']].map(([status, label]) => (
              <span key={status} className="flex items-center gap-1.5">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm"
                  dangerouslySetInnerHTML={{ __html: lightSvg(status, 14) }}
                />
                {label}
              </span>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="shimmer m-5 h-[60vh] rounded-xl" />
        ) : (
          <div className="relative m-5 mt-0" style={{ height: '60vh' }}>
            {lights.length === 0 && (
              <div className="absolute left-1/2 top-3 z-[500] -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-4 py-1.5 text-sm text-gray-600 shadow-md">
                No data yet — markers will appear here once API data is received
              </div>
            )}
            <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%', borderRadius: 12 }}>
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {lights.map((l) => (
                <Marker
                  key={l.id}
                  position={[Number(l.latitude), Number(l.longitude)]}
                  icon={icons.get(l.id)}
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
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
}
