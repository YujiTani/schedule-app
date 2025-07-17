// API レスポンス型
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  request_id: string;
  status: 'success' | 'error';
  error?: string;
}

// 予約関連の型
export interface CreateReservationRequest {
  email: string;
  name: string;
  content: string;
  reservationDate: number; // UNIX timestamp
  startTime: number; // UNIX timestamp
  endTime: number; // UNIX timestamp
  durationMinutes?: number;
}

export interface ReservationResponse {
  name: string;
  content: string;
  email: string;
  reservationDate: number;
  startTime: number;
  endTime: number;
  durationMinutes: number;
}

// 営業時間関連の型
export interface BusinessHoursResponse {
  id: number;
  dayOfWeek: number; // 0=日曜, 1=月曜, ..., 6=土曜
  isOpen: boolean;
  openTime: number | null;
  closeTime: number | null;
}

export interface UpdateBusinessHoursRequest {
  isOpen: boolean;
  openTime?: number | null;
  closeTime?: number | null;
}

// 管理者設定関連の型
export interface AdminSettingResponse {
  id: number;
  settingKey: string;
  settingValue: string | null;
  description: string | null;
}

export interface UpdateAdminSettingRequest {
  settingValue: string;
}

// 予約ステータス
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

// 通知タイプ
export type NotificationType = 'reservation_confirmed' | 'reservation_cancelled' | 'reminder';