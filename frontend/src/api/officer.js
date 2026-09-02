import apiClient from './client';

export const officerApi = {
  getDashboard: () => apiClient.get('/officer/dashboard'),
  getAssignedGrievances: (params) => apiClient.get('/officer/grievances', { params }),
};
