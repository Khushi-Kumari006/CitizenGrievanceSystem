import apiClient from './client';

export const departmentApi = {
  getAll: (params) => apiClient.get('/departments', { params }),
  getById: (id) => apiClient.get(`/departments/${id}`),
  create: (data) => apiClient.post('/departments', data),
  update: (id, data) => apiClient.put(`/departments/${id}`, data),
};
