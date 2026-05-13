export const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    const errMsg = error.error || error.message || `HTTP ${res.status}`;
    const err = new Error(errMsg) as any;
    err.code = error.code || null;
    err.statusCode = res.status;
    throw err;
  }

  return res.json();
}

export const api = {
  // Auth
  register: (data: { email: string; username: string; password: string }) =>
    request<{ success: boolean; data: { user: any; token: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ success: boolean; data: { user: any; token: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () =>
    request<{ success: boolean; data: any }>('/auth/profile'),

  // Styles
  getStyles: () =>
    request<{ success: boolean; data: any[] }>('/design/styles'),

  // Upload
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return request<{ success: boolean; data: any }>('/design/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Generate — now supports customPrompt
  generatePreview: (projectId: string, styles: string[], customPrompt?: string) =>
    request<{ success: boolean; data: any }>('/design/generate-preview', {
      method: 'POST',
      body: JSON.stringify({ projectId, styles, customPrompt }),
    }),

  generateFinal: (projectId: string, styleName: string, customPrompt?: string) =>
    request<{ success: boolean; data: any }>('/design/generate-final', {
      method: 'POST',
      body: JSON.stringify({ projectId, styleName, customPrompt }),
    }),

  // History
  getHistory: () =>
    request<{ success: boolean; data: any[] }>('/design/history'),

  getProject: (id: string) =>
    request<{ success: boolean; data: any }>(`/design/project/${id}`),

  deleteProject: (id: string) =>
    request<{ success: boolean }>(`/design/image/${id}`, { method: 'DELETE' }),

  // Credits
  getCredits: () =>
    request<{ success: boolean; data: { credits: number } }>('/design/credits'),

  // Community
  getCommunity: () =>
    request<{ success: boolean; data: any[] }>('/design/community'),

  // Share
  shareProject: (projectId: string) =>
    request<{ success: boolean; data: any }>('/design/share', {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    }),

  getSharedProject: (token: string) =>
    request<{ success: boolean; data: any }>(`/design/shared/${token}`),
};
