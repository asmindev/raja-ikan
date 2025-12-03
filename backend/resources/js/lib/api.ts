import axios from 'axios';

const api = axios.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Add CSRF token to requests
api.interceptors.request.use((config) => {
    const token = document.head.querySelector<HTMLMetaElement>(
        'meta[name="csrf-token"]',
    );
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token.content;
    }
    return config;
});

export default api;
