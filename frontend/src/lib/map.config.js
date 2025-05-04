import L from 'leaflet';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

export const mapConfig = {
    defaultCenter: [7.8731, 80.7718],
    defaultZoom: 8,
    detailZoom: 16,
    tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

export const createLocationString = (lat, lng) => {
    return `${lat},${lng}`;
};

export const parseLocationString = (locationString) => {
    if (!locationString) return null;
    const [lat, lng] = locationString.split(',').map(Number);
    return { lat, lng };
};