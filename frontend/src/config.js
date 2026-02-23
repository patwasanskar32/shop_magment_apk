// API base URL — strip trailing slash to prevent //health double-slash bug
const API_BASE_URL = (
    import.meta.env.VITE_API_URL ||
    'https://shop-magment-apk.onrender.com'
).replace(/\/$/, '');

export default API_BASE_URL;
