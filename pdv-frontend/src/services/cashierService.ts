import { api } from './api';

export interface CashierOperation {
  id: number;
  type: 'open' | 'close';
  amount: number;
  balance?: number;
  difference?: number;
  createdAt: string;
  openedAt?: string;
  closedAt?: string;
}

export interface OpenCashierData {
  initialBalance: number;
}

export interface CloseCashierData {
  finalBalance: number;
}

export const cashierService = {
  openCashier: async (data: OpenCashierData): Promise<CashierOperation> => {
    const response = await api.post('/cashier/open', data);
    return response.data;
  },

  closeCashier: async (data: CloseCashierData): Promise<CashierOperation> => {
    const response = await api.post('/cashier/close', data);
    return response.data;
  },

  getCashierStatus: async () => {
    const response = await api.get('/cashier/status');
    return response.data;
  },

  getCashierHistory: async (): Promise<CashierOperation[]> => {
    const response = await api.get('/cashier/history');
    return response.data;
  },
};