import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api';

export default function LightsLocation() {
  const [lights, setLights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/lights/map')
      .then((res) => setLights(res.data.lights))
      .catch(() => setError('Map ka data load nahi ho paya'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-500">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  const center = lights.length
    ? [Number(lights[0].latitude), Number(lights[0].longitude)]
    : [28.6139, 77.209];

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">Lights Location</h1>
      <div className="mt-2 flex gap-4 text-sm text-slate-600">
        <span><span className="mr-1 inline-block h-3 w-3 rounded-full bg-green-500" />Healthy</span>
        <span><span className="mr-1 inline-block h-3 w-3 rounded-full bg-red-500" />Faulty</span>
        <span>Total: {lights.length}</span>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl shadow-sm" style={{ height: '70vh' }}>
        <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {lights.map((l) => (
            <CircleMarker
              key={l.id}
              center={[Number(l.latitude), Number(l.longitude)]}
              radius={10}
              pathOptions={{
                color: l.status === 'healthy' ? '#15803d' : '#b91c1c',
                fillColor: l.status === 'healthy' ? '#22c55e' : '#ef4444',
                fillOpacity: 0.8,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div><b>{l.controller_id || 'No controller'}</b></div>
                  <div>Pole: {l.pole_number}</div>
                  <div>Status: {l.status}</div>
                  <div>Plugged: {l.is_plugged ? 'Yes' : 'No'}</div>
                  <div>Control: {l.control} | DIM: {l.dim}%</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
