import apiClient from './client';

export const commentApi = {
  getByGrievance: (grievanceId) => apiClient.get(`/grievances/${grievanceId}/comments`),
  addComment: (grievanceId, data) => apiClient.post(`/grievances/${grievanceId}/comments`, data),
};
