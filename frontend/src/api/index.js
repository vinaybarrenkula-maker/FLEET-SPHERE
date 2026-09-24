import api from './axios';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  registerDriver: (data) => api.post('/auth/register-driver', data),
  getOrgBranches: () => api.get('/auth/org-branches'),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const vehicleApi = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  updateStatus: (id, status) => api.patch(`/vehicles/${id}/status`, { status }),
  delete: (id) => api.delete(`/vehicles/${id}`),
  export: (params) => api.get('/vehicles', { params: { ...params, export: 'csv' }, responseType: 'blob' }),
};

export const driverApi = {
  getAll: (params) => api.get('/drivers', { params }),
  getById: (id) => api.get(`/drivers/${id}`),
  getMyProfile: () => api.get('/drivers/my-profile'),
  create: (data) => api.post('/drivers', data),
  update: (id, data) => api.put(`/drivers/${id}`, data),
  delete: (id) => api.delete(`/drivers/${id}`),
  export: (params) => api.get('/drivers', { params: { ...params, export: 'csv' }, responseType: 'blob' }),
};

export const tripApi = {
  getAll: (params) => api.get('/trips', { params }),
  getById: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post('/trips', data),
  update: (id, data) => api.put(`/trips/${id}`, data),
  updateStatus: (id, data) => api.patch(`/trips/${id}/status`, data),
  delete: (id) => api.delete(`/trips/${id}`),
  export: (params) => api.get('/trips', { params: { ...params, export: 'csv' }, responseType: 'blob' }),
};

export const routeApi = {
  getAll: (params) => api.get('/routes', { params }),
  getById: (id) => api.get(`/routes/${id}`),
  create: (data) => api.post('/routes', data),
  update: (id, data) => api.put(`/routes/${id}`, data),
  delete: (id) => api.delete(`/routes/${id}`),
};

export const fuelApi = {
  getAll: (params) => api.get('/fuel', { params }),
  getById: (id) => api.get(`/fuel/${id}`),
  create: (data) => api.post('/fuel', data),
  update: (id, data) => api.put(`/fuel/${id}`, data),
  delete: (id) => api.delete(`/fuel/${id}`),
  export: (params) => api.get('/fuel', { params: { ...params, export: 'csv' }, responseType: 'blob' }),
};

export const maintenanceApi = {
  getAll: (params) => api.get('/maintenance', { params }),
  getById: (id) => api.get(`/maintenance/${id}`),
  create: (data) => api.post('/maintenance', data),
  update: (id, data) => api.put(`/maintenance/${id}`, data),
  delete: (id) => api.delete(`/maintenance/${id}`),
  export: (params) => api.get('/maintenance', { params: { ...params, export: 'csv' }, responseType: 'blob' }),
};

export const incidentApi = {
  getAll: (params) => api.get('/incidents', { params }),
  getById: (id) => api.get(`/incidents/${id}`),
  create: (data) => api.post('/incidents', data),
  update: (id, data) => api.put(`/incidents/${id}`, data),
  delete: (id) => api.delete(`/incidents/${id}`),
  export: (params) => api.get('/incidents', { params: { ...params, export: 'csv' }, responseType: 'blob' }),
};

export const expenseApi = {
  getAll: (params) => api.get('/expenses', { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  approve: (id) => api.patch(`/expenses/${id}/approve`),
  reject: (id, data) => api.patch(`/expenses/${id}/reject`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  export: (params) => api.get('/expenses', { params: { ...params, export: 'csv' }, responseType: 'blob' }),
};

export const documentApi = {
  getAll: (params) => api.get('/documents', { params }),
  upload: (formData) => api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/documents/${id}`),
};

export const notificationApi = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const dashboardApi = {
  getOverview: () => api.get('/dashboard/overview'),
  getFuelAnalytics: (params) => api.get('/dashboard/fuel-analytics', { params }),
  getMaintenanceAnalytics: (params) => api.get('/dashboard/maintenance-analytics', { params }),
  getTripAnalytics: (params) => api.get('/dashboard/trip-analytics', { params }),
  getExpenseAnalytics: (params) => api.get('/dashboard/expense-analytics', { params }),
};

export const organizationApi = {
  getAll: (params) => api.get('/organizations', { params }),
  getById: (id) => api.get(`/organizations/${id}`),
  create: (data) => api.post('/organizations', data),
  update: (id, data) => api.put(`/organizations/${id}`, data),
  delete: (id) => api.delete(`/organizations/${id}`),
};

export const branchApi = {
  getAll: (params) => api.get('/branches', { params }),
  getById: (id) => api.get(`/branches/${id}`),
  create: (data) => api.post('/branches', data),
  update: (id, data) => api.put(`/branches/${id}`, data),
  delete: (id) => api.delete(`/branches/${id}`),
};

export const userApi = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const auditApi = {
  getAll: (params) => api.get('/audit-logs', { params }),
};

// Helper to trigger CSV download from blob response
export const downloadCSV = (response, filename) => {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename || 'export.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
