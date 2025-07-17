import { apiClient } from './client';
import { 
  AdminSettingResponse,
  UpdateAdminSettingRequest,
  ApiResponse 
} from './types';

export const adminApi = {
  // 管理者設定一覧取得
  getSettings: async (): Promise<ApiResponse<AdminSettingResponse[]>> => {
    return apiClient.get<AdminSettingResponse[]>('/admin/settings');
  },

  // 特定設定取得
  getSetting: async (key: string): Promise<ApiResponse<AdminSettingResponse>> => {
    return apiClient.get<AdminSettingResponse>(`/admin/settings/${key}`);
  },

  // 設定更新
  updateSetting: async (
    key: string,
    data: UpdateAdminSettingRequest
  ): Promise<ApiResponse<AdminSettingResponse>> => {
    return apiClient.put<AdminSettingResponse>(`/admin/settings/${key}`, data);
  },
};