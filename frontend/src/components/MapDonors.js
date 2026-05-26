import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapDonors = () => {
  const [donors, setDonors] = useState([]);
  const [center, setCenter] = useState([-1.2, 116.8]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
        () => console.log('Gunakan default center')
      );
    }
    api.get('/donors').then(res => setDonors(res.data)).catch(err => console.error(err));
  }, []);

  return (
    <MapContainer center={center} zoom={10} className="leaflet-container">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
      {donors.map(d => (
        <Marker key={d.id} position={[d.lat, d.lng]}>
          <Popup><strong>{d.fullName}</strong><br />{d.bloodType}<br />{d.address}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapDonors;