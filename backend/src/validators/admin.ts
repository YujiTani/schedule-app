import { z } from 'zod';

/**
 * 管理者設定更新リクエストのバリデーションスキーマ
 */
export const updateAdminSettingSchema = z.object({
  settingValue: z.string().max(1000, '設定値は1000文字以内で入力してください'),
});

/**
 * 設定キーのバリデーションスキーマ
 */
export const settingKeySchema = z.string().min(1, '設定キーを指定してください');

export type UpdateAdminSettingInput = z.infer<typeof updateAdminSettingSchema>;