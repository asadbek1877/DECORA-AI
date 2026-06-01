import { ApiClient, createFetchTransport } from '../../../shared/api/apiClient';

export const API_BASE = '/api';

const sharedApi = new ApiClient(createFetchTransport({
  baseUrl: API_BASE,
  getToken: () => localStorage.getItem('token'),
  getAdminSecret: () => localStorage.getItem('admin_password'),
}));

export const api = {
  register: (data: { email: string; username: string; password: string }) =>
    sharedApi.register(data),

  login: (data: { email: string; password: string }) =>
    sharedApi.login(data),

  getProfile: () => sharedApi.getProfile(),
  getStyles: () => sharedApi.getStyles(),

  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return sharedApi.uploadImage(formData);
  },

  generatePreview: (projectId: string | null, styles: string[], customPrompt?: string) =>
    sharedApi.generatePreview({ projectId, styles, customPrompt }),

  generateFinal: (projectId: string, styleName: string, customPrompt?: string) =>
    sharedApi.generateFinal({ projectId, styleName, customPrompt }),

  getHistory: () => sharedApi.getHistory(),
  getProject: (id: string) => sharedApi.getProject(id),
  deleteProject: (id: string) => sharedApi.deleteProject(id),
  getCredits: () => sharedApi.getCredits(),
  getCommunity: () => sharedApi.getCommunity(),
  shareProject: (projectId: string) => sharedApi.shareProject(projectId),
  getSharedProject: (token: string) => sharedApi.getSharedProject(token),
  getAdminUsers: (filter?: { page?: number; limit?: number; search?: string; status?: string }) =>
    sharedApi.getAdminUsers(filter),
  getAppSettings: () => sharedApi.getAppSettings(),
  updateAppSettings: (data: { beforeImageUrl: string; afterImageUrl: string }) =>
    sharedApi.updateAppSettings(data),
};
