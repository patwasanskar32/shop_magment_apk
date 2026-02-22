// API configuration
// Priority: Vercel env variable → hardcoded Render URL → localhost for dev
const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    'https://shop-magment-apk.onrender.com';

export default API_BASE_URL;
