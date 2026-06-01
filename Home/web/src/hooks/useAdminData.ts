import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { AdminUserDto, AppSettingsDto } from '../../../shared/api/types';

type AdminDataState = {
  users: AdminUserDto[];
  settings: AppSettingsDto | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
};

export function useAdminData() {
  const [state, setState] = useState<AdminDataState>({
    users: [],
    settings: null,
    isLoading: false,
    isSaving: false,
    error: null,
  });

  const loadUsers = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true, error: null }));
    try {
      const response = await api.getAdminUsers({ page: 1, limit: 100 });
      setState((current) => ({
        ...current,
        users: response.data?.users || [],
        isLoading: false,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load users',
      }));
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true, error: null }));
    try {
      const response = await api.getAppSettings();
      setState((current) => ({
        ...current,
        settings: response.data || null,
        isLoading: false,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load settings',
      }));
    }
  }, []);

  const saveSettings = useCallback(async (settings: Pick<AppSettingsDto, 'beforeImageUrl' | 'afterImageUrl'>) => {
    setState((current) => ({ ...current, isSaving: true, error: null }));
    try {
      const response = await api.updateAppSettings(settings);
      setState((current) => ({
        ...current,
        settings: response.data || current.settings,
        isSaving: false,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Failed to save settings',
      }));
      throw error;
    }
  }, []);

  useEffect(() => {
    loadSettings();
    if (localStorage.getItem('admin_password')) {
      loadUsers();
    }
  }, [loadSettings, loadUsers]);

  return {
    ...state,
    loadUsers,
    loadSettings,
    saveSettings,
  };
}
