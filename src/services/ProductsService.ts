import api from './httpClient';

export const ProductsService = {
  getAll: async () => {
    const response = await api.get('/admin/products');
    return response.data;
  },
  create: async (productData: Record<string, unknown>) => {
    const response = await api.post('/admin/products', productData);
    return response.data;
  },
  update: async (id: string, productData: Record<string, unknown>) => {
    const response = await api.put(`/admin/products/${id}`, productData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  }
};


