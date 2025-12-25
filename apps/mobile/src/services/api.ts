import axios from 'axios';

// Replace with your local IP if running on device, or localhost for emulator
// const BASE_URL = 'http://10.0.2.2:3000'; // Android Emulator
const BASE_URL = 'http://192.168.31.9:3000'; // iOS Simulator / Web / Physical Device

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

export const setAuthToken = (token: string) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const AuthService = {
    login: async (userId: string) => {
        const response = await api.post('/auth/login', { userId });
        return response.data; // { access_token }
    },
};

export const SessionService = {
    start: async (storeId: string = 'STORE-TEST-001') => {
        const response = await api.post('/session/start', { storeId });
        return response.data; // { id, ... }
    },
    addItem: async (sessionId: string, productCode: string, quantity: number = 1) => {
        const response = await api.patch(`/session/${sessionId}/cart`, { productCode, quantity });
        return response.data; // { id, total, items, ... } (Snapshot)
    },
    close: async (sessionId: string) => {
        const response = await api.post(`/session/${sessionId}/close`);
        return response.data;
    },
};

export const SalesService = {
    createFromSession: async (sessionId: string) => {
        const response = await api.post(`/sales/from-session/${sessionId}`);
        return response.data; // { id, ... }
    },
};

export default api;
