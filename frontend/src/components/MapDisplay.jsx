import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapDisplay = ({ coords, locationName }) => {
  if (!coords) return null;

  return (
    <div 
      className="map-container-wrapper u-glass" 
      role="region" 
      aria-label={`Geographic location: ${locationName || 'Polling Station in Assam'}`}
    >
      <MapContainer 
        center={coords} 
        zoom={15} 
        scrollWheelZoom={false} 
        className="leaflet-map-instance"
        placeholder={<div>Loading Map...</div>}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={coords}>
          <Popup>
            <strong style={{ fontFamily: 'var(--font-display)' }}>{locationName || 'Polling Location'}</strong>
            <p style={{ fontSize: '0.8rem', margin: '4px 0 0' }}>Assam Election Booth</p>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapDisplay;
