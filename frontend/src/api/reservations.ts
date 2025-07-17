import { apiClient } from './client';
import { 
  CreateReservationRequest, 
  ReservationResponse,
  ApiResponse 
} from './types';

export const reservationApi = {
  // 予約一覧取得
  getReservations: async (): Promise<ApiResponse<ReservationResponse[]>> => {
    return apiClient.get<ReservationResponse[]>('/reservations');
  },

  // 予約詳細取得
  getReservation: async (uuid: string): Promise<ApiResponse<ReservationResponse>> => {
    return apiClient.get<ReservationResponse>(`/reservations/${uuid}`);
  },

  // 予約作成
  createReservation: async (
    data: CreateReservationRequest
  ): Promise<ApiResponse<ReservationResponse>> => {
    return apiClient.post<ReservationResponse>('/reservations', data);
  },

  // 予約更新
  updateReservation: async (
    uuid: string,
    data: Partial<CreateReservationRequest>
  ): Promise<ApiResponse<ReservationResponse>> => {
    return apiClient.put<ReservationResponse>(`/reservations/${uuid}`, data);
  },

  // 予約削除
  deleteReservation: async (uuid: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<null>(`/reservations/${uuid}`);
  },
};