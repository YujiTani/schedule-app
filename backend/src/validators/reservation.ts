import { z } from 'zod';

/**
 * 予約作成リクエストのバリデーションスキーマ
 */
export const createReservationSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  name: z.string().min(1, '名前を入力してください').max(100, '名前は100文字以内で入力してください'),
  content: z.string().min(1, '内容を入力してください').max(500, '内容は500文字以内で入力してください'),
  reservationDate: z.number().positive('予約日は正の数値である必要があります'),
  startTime: z.number().positive('開始時間は正の数値である必要があります'),
  endTime: z.number().positive('終了時間は正の数値である必要があります'),
  durationMinutes: z.number().positive('予約時間は正の数値である必要があります').optional(),
}).refine((data) => data.endTime > data.startTime, {
  message: '終了時間は開始時間より後である必要があります',
  path: ['endTime'],
});

/**
 * 予約更新リクエストのバリデーションスキーマ
 */
export const updateReservationSchema = createReservationSchema.partial();

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;