import { api } from './api';

export interface DashboardData {
  summary: {
    date: string;
    totalSales: number;
    totalOrders: number;
    totalItemsSold: number;
    isCashierOpen: boolean;
  };
  paymentMethods: Array<{
    method: string;
    total: number;
    count: number;
    percentage: number;
  }>;
  bestSellingProducts: Array<any>;
  cashierStatus: any;
  lowStockProducts: Array<any>;
}

export const dashboardService = {
  getDashboard: async (): Promise<DashboardData> => {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      throw new Error('Erro ao carregar dados do dashboard');
    }
  },
};