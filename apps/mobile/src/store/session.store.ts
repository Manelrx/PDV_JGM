import { create } from 'zustand';
import { SessionService, AuthService, SalesService, setAuthToken } from '../services/api';
import Toast from 'react-native-toast-message';

interface CartItem {
    productCode: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface SessionState {
    token: string | null;
    sessionId: string | null;
    cartItems: CartItem[];
    valTotal: number;
    isLoading: boolean;
    error: string | null;

    login: (userId: string) => Promise<void>;
    startSession: () => Promise<void>;
    addItem: (productCode: string) => Promise<void>;
    finishShopping: () => Promise<string>; // Returns Sale ID
}

export const useSessionStore = create<SessionState>((set, get) => ({
    token: null,
    sessionId: null,
    cartItems: [],
    valTotal: 0,
    isLoading: false,
    error: null,

    login: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const { access_token } = await AuthService.login(userId);
            setAuthToken(access_token);
            set({ token: access_token, isLoading: false });
        } catch (e: any) {
            console.log('Login Error:', e);
            if (e.response) {
                console.log('Status:', e.response.status);
                console.log('Data:', JSON.stringify(e.response.data));
            } else if (e.request) {
                console.log('Network Error - Sem resposta do servidor. Verifique o IP e Firewall.');
            }
            set({ error: 'Login Failed', isLoading: false });
            throw e;
        }
    },

    startSession: async () => {
        set({ isLoading: true, error: null });
        try {
            const session = await SessionService.start();
            set({ sessionId: session.id, cartItems: [], valTotal: 0, isLoading: false });
        } catch (e: any) {
            set({ error: 'Failed to start session', isLoading: false });
            throw e;
        }
    },

    addItem: async (productCode: string) => {
        const { sessionId } = get();
        if (!sessionId) return;

        set({ isLoading: true, error: null });
        try {
            const updatedSession = await SessionService.addItem(sessionId, productCode, 1);
            set({
                cartItems: updatedSession.items || [],
                valTotal: updatedSession.total || 0,
                isLoading: false
            });
            Toast.show({ type: 'success', text1: 'Item Added' });
        } catch (e: any) {
            set({ error: 'Item not found or Scan failed', isLoading: false });
            Toast.show({ type: 'error', text1: 'Scan Failed', text2: e.response?.data?.message || 'Unknown error' });
        }
    },

    finishShopping: async () => {
        const { sessionId } = get();
        if (!sessionId) throw new Error('No active session');

        set({ isLoading: true, error: null });
        try {
            await SessionService.close(sessionId);
            const sale = await SalesService.createFromSession(sessionId);
            set({ sessionId: null, cartItems: [], valTotal: 0, isLoading: false });
            return sale.id;
        } catch (e: any) {
            set({ error: 'Checkout failed', isLoading: false });
            throw e;
        }
    },
}));
