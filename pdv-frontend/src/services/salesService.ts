import { api } from './api';

export interface SaleItem {
  productId: number;
  quantity: number;
}

export interface CreateSaleData {
  items: SaleItem[];
  paymentMethod?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  cost?: number;
  isActive: boolean;
  categoryId?: number;
}

export const salesService = {
  createSale: async (saleData: CreateSaleData) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },

  getProducts: async (): Promise<Product[]> => {
    try {
      console.log('🔄 Buscando produtos da API...');
      const response = await api.get('/products');
      console.log('✅ Produtos carregados:', response.data);
      const productsWithNumberPrices = response.data
        .map((product: any) => ({
          ...product,
          price: Number(product.price),
          cost: product.cost ? Number(product.cost) : undefined
        }));

    return productsWithNumberPrices;
    } catch (error: any) {
      console.error('❌ Erro ao carregar produtos:', error);
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Back-end não está respondendo. Verifique se está rodando na porta 3000.');
      } else if (error.response?.status === 404) {
        throw new Error('Endpoint não encontrado. Verifique a URL da API.');
      } else {
        throw new Error(error.response?.data?.message || 'Erro ao carregar produtos');
      }
    }
  },    

  getSales: async () => {
    const response = await api.get('/sales');
    return response.data;
  },
  
  createProduct: async (productData: Omit<Product, 'id' | 'isActive'>) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id: number, productData: Partial<Product>) => {
    const response = await api.patch(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: number) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};