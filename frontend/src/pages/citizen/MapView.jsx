import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { complaintAPI } from '../../services/api';
import { StatusBadge } from '../../components/common/Badge';
import { CATEGORY_ICONS } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';
import { Link } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const mkIcon = (category, status) => {
  const colors = {
    pending:     '#F59E0B',
    resolved:    '#10B981',
    in_progress: '#8B5CF6',
    assigned:    '#3B82F6',
    escalated:   '#EF4444',
  };
  const color = colors[status] || '#94A3B8';
  const emoji = CATEGORY_ICONS[category] || '📋';
  return L.divIcon({
    html: `
      <div style="
        background:${color};
        width:34px;height:34px;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
        border:2px solid white;
      ">
        <span style="transform:rotate(45deg);font-size:14px">${emoji}</span>
      </div>`,
    className:   '',
    iconSize:    [34, 34],
    iconAnchor:  [17, 34],
    popupAnchor: [0, -34],
  });
};

export default function MapView() {
  const [satellite, setSatellite] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['map-complaints'],
    queryFn:  () => complaintAPI.getMap().then(r => r.data.complaints),
  });

  const lat = parseFloat(import.meta.env.VITE_MAP_LAT || 20.5937);
  const lng = parseFloat(import.meta.env.VITE_MAP_LNG || 78.9629);

  const statusCounts = (data || []).reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Complaint Map</h1>
          <p className="page-subtitle">{data?.length || 0} issues mapped</p>
        </div>

        {/* Status count chips */}
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(statusCounts).map(([s, n]) => (
            <span
              key={s}
              className="text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-full text-slate-600 font-medium"
            >
              {s.replace('_', ' ')}: {n}
            </span>
          ))}
        </div>
      </div>

      {/* Satellite / Street toggle button — sits above the map */}
      <div className="flex justify-end">
        <button
          onClick={() => setSatellite(s => !s)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-card border transition-all duration-200 active:scale-95"
          style={{
            background:   satellite ? '#0F172A' : '#ffffff',
            color:        satellite ? '#ffffff' : '#1E293B',
            borderColor:  satellite ? '#334155' : '#E2E8F0',
          }}
        >
          {satellite ? (
            <>🗺️ Switch to Street View</>
          ) : (
            <>🛰️ Switch to Satellite View</>
          )}
        </button>
      </div>

      {/* Map */}
      {isLoading ? (
        <div className="card flex items-center justify-center" style={{ height: '60vh' }}>
          <Spinner size="lg" />
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-2xl shadow-card"
          style={{ height: '60vh' }}
        >
          <MapContainer
            center={[lat, lng]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
          >
            {/* ── Satellite mode: ESRI imagery + place name labels on top ── */}
            {satellite ? (
              <>
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Tiles &copy; Esri &mdash; Esri, Maxar, Earthstar Geographics"
                  maxZoom={19}
                />
                {/* Labels layer on top so street names and cities are visible */}
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                  attribution=""
                  maxZoom={19}
                  opacity={0.8}
                />
              </>
            ) : (
              /* ── Street mode: OpenStreetMap ── */
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                maxZoom={19}
              />
            )}

            {/* Complaint markers */}
            {data?.map(c => {
              const [lng2, lat2] = c.location?.coordinates || [];
              if (!lat2 || !lng2) return null;
              return (
                <Marker
                  key={c._id}
                  position={[lat2, lng2]}
                  icon={mkIcon(c.category, c.status)}
                >
                  <Popup>
                    <div style={{ minWidth: 190 }}>
                      <p style={{
                        fontSize: 10,
                        color: '#94A3B8',
                        fontFamily: 'monospace',
                        marginBottom: 2,
                      }}>
                        {c.complaintCode}
                      </p>
                      <p style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: '#1E293B',
                        marginBottom: 6,
                        lineHeight: 1.3,
                      }}>
                        {c.title}
                      </p>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                        <StatusBadge status={c.status} />
                        <span style={{ fontSize: 11, color: '#94A3B8' }}>
                          👍 {c.supportCount}
                        </span>
                      </div>
                      <Link
                        to={'/complaints/' + c._id}
                        style={{
                          display: 'block',
                          fontSize: 12,
                          color: '#2563EB',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        View Details →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      )}

      {/* Legend */}
      <div className="card p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <h3 className="text-xs font-bold text-slate-700">Map Legend</h3>
          <span className="text-xs text-slate-400 font-medium">
            {satellite ? '🛰️ Satellite View' : '🗺️ Street View'}
          </span>
        </div>
        <div className="flex gap-3 flex-wrap">
          {[
            ['pending',     '#F59E0B'],
            ['assigned',    '#3B82F6'],
            ['in_progress', '#8B5CF6'],
            ['resolved',    '#10B981'],
            ['escalated',   '#EF4444'],
          ].map(([s, c]) => (
            <div key={s} className="flex items-center gap-1.5 text-xs text-slate-600">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: c }}
              />
              {s.replace('_', ' ')}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}