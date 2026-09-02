import apiClient from './client';

export const grievanceApi = {
  create: (data) => apiClient.post('/grievances', data),
  getAll: (params) => apiClient.get('/grievances', { params }),
  getMy: () => apiClient.get('/grievances/my'),
  getById: (id) => apiClient.get(`/grievances/${id}`),
  update: (id, data) => apiClient.put(`/grievances/${id}`, data),
  updateStatus: (id, data) => apiClient.patch(`/grievances/${id}/status`, data),
  assignOfficer: (id, data) => apiClient.patch(`/grievances/${id}/assign`, data),
  getHistory: (id) => apiClient.get(`/grievances/${id}/history`),
};
