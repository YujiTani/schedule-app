import { Hono } from 'hono';
import { db } from '../db/index.js';
import { adminSettings } from '../db/schema.js';
import { eq, asc } from 'drizzle-orm';
import { AdminSettingResponse, UpdateAdminSettingRequest } from '../types/index.js';
import { sendSuccess, sendError } from '../utils/response.js';

const app = new Hono();

// 管理者設定一覧取得
app.get('/settings', async (c) => {
  try {
    const result = await db
      .select({
        id: adminSettings.id,
        settingKey: adminSettings.settingKey,
        settingValue: adminSettings.settingValue,
        description: adminSettings.description,
      })
      .from(adminSettings)
      .orderBy(asc(adminSettings.settingKey));

    return sendSuccess(c, result, '管理者設定一覧を取得しました');
  } catch (error) {
    console.error('管理者設定一覧取得エラー:', error);
    return sendError(c, '管理者設定一覧の取得に失敗しました', 500);
  }
});

// 特定設定取得
app.get('/settings/:key', async (c) => {
  try {
    const settingKey = c.req.param('key');
    
    const result = await db
      .select({
        id: adminSettings.id,
        settingKey: adminSettings.settingKey,
        settingValue: adminSettings.settingValue,
        description: adminSettings.description,
      })
      .from(adminSettings)
      .where(eq(adminSettings.settingKey, settingKey))
      .limit(1);

    if (result.length === 0) {
      return sendError(c, '設定が見つかりません', 404);
    }

    return sendSuccess(c, result[0], '設定を取得しました');
  } catch (error) {
    console.error('設定取得エラー:', error);
    return sendError(c, '設定の取得に失敗しました', 500);
  }
});

// 設定更新
app.put('/settings/:key', async (c) => {
  try {
    const settingKey = c.req.param('key');
    const body = await c.req.json() as UpdateAdminSettingRequest;
    
    // 設定の存在確認
    const existingSetting = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.settingKey, settingKey))
      .limit(1);

    if (existingSetting.length === 0) {
      return sendError(c, '設定が見つかりません', 404);
    }

    // 設定更新
    const updatedSetting = await db
      .update(adminSettings)
      .set({
        settingValue: body.settingValue,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(adminSettings.settingKey, settingKey))
      .returning({
        id: adminSettings.id,
        settingKey: adminSettings.settingKey,
        settingValue: adminSettings.settingValue,
        description: adminSettings.description,
      });

    return sendSuccess(c, updatedSetting[0], '設定を更新しました');
  } catch (error) {
    console.error('設定更新エラー:', error);
    return sendError(c, '設定の更新に失敗しました', 500);
  }
});

export default app;