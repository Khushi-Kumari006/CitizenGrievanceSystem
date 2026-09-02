import apiClient from './client';

export const adminApi = {
  getDashboard: () => apiClient.get('/admin/dashboard'),
};
