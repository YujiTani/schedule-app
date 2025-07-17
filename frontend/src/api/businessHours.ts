import { apiClient } from './client';
import { 
  BusinessHoursResponse,
  UpdateBusinessHoursRequest,
  ApiResponse 
} from './types';

export const businessHoursApi = {
  // 営業時間一覧取得
  getBusinessHours: async (): Promise<ApiResponse<BusinessHoursResponse[]>> => {
    return apiClient.get<BusinessHoursResponse[]>('/business-hours');
  },

  // 特定曜日の営業時間取得
  getBusinessHoursByDay: async (dayOfWeek: number): Promise<ApiResponse<BusinessHoursResponse>> => {
    return apiClient.get<BusinessHoursResponse>(`/business-hours/${dayOfWeek}`);
  },

  // 営業時間更新
  updateBusinessHours: async (
    dayOfWeek: number,
    data: UpdateBusinessHoursRequest
  ): Promise<ApiResponse<BusinessHoursResponse>> => {
    return apiClient.put<BusinessHoursResponse>(`/business-hours/${dayOfWeek}`, data);
  },
};