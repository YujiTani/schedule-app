import { z } from 'zod';

/**
 * 営業時間更新リクエストのバリデーションスキーマ
 */
export const updateBusinessHoursSchema = z.object({
  isOpen: z.boolean(),
  openTime: z.number().nullable().optional(),
  closeTime: z.number().nullable().optional(),
}).refine((data) => {
  if (data.isOpen && (data.openTime === null || data.closeTime === null)) {
    return false;
  }
  if (data.isOpen && data.openTime !== null && data.closeTime !== null) {
    return data.closeTime > data.openTime;
  }
  return true;
}, {
  message: '営業時間が設定されている場合、終了時間は開始時間より後である必要があります',
  path: ['closeTime'],
});

/**
 * 曜日パラメータのバリデーションスキーマ
 */
export const dayOfWeekSchema = z.number().int().min(0).max(6);

export type UpdateBusinessHoursInput = z.infer<typeof updateBusinessHoursSchema>;