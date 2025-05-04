import L from 'leaflet';

export const mapConfig = {
    defaultCenter: [7.8731, 80.7718], // Sri Lanka center coordinates
    defaultZoom: 8,
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