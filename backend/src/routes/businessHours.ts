import { Hono } from 'hono';
import { db } from '../db/index.js';
import { businessHours } from '../db/schema.js';
import { eq, asc } from 'drizzle-orm';
import { BusinessHoursResponse, UpdateBusinessHoursRequest } from '../types/index.js';
import { sendSuccess, sendError } from '../utils/response.js';

const app = new Hono();

// 営業時間一覧取得
app.get('/', async (c) => {
  try {
    const result = await db
      .select({
        id: businessHours.id,
        dayOfWeek: businessHours.dayOfWeek,
        isOpen: businessHours.isOpen,
        openTime: businessHours.openTime,
        closeTime: businessHours.closeTime,
      })
      .from(businessHours)
      .orderBy(asc(businessHours.dayOfWeek));

    return sendSuccess(c, result, '営業時間一覧を取得しました');
  } catch (error) {
    console.error('営業時間一覧取得エラー:', error);
    return sendError(c, '営業時間一覧の取得に失敗しました', 500);
  }
});

// 特定曜日の営業時間取得
app.get('/:dayOfWeek', async (c) => {
  try {
    const dayOfWeek = parseInt(c.req.param('dayOfWeek'));
    
    if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return sendError(c, '曜日は0-6の範囲で指定してください', 400);
    }

    const result = await db
      .select({
        id: businessHours.id,
        dayOfWeek: businessHours.dayOfWeek,
        isOpen: businessHours.isOpen,
        openTime: businessHours.openTime,
        closeTime: businessHours.closeTime,
      })
      .from(businessHours)
      .where(eq(businessHours.dayOfWeek, dayOfWeek))
      .limit(1);

    if (result.length === 0) {
      return sendError(c, '営業時間が見つかりません', 404);
    }

    return sendSuccess(c, result[0], '営業時間を取得しました');
  } catch (error) {
    console.error('営業時間取得エラー:', error);
    return sendError(c, '営業時間の取得に失敗しました', 500);
  }
});

// 営業時間更新
app.put('/:dayOfWeek', async (c) => {
  try {
    const dayOfWeek = parseInt(c.req.param('dayOfWeek'));
    const body = await c.req.json() as UpdateBusinessHoursRequest;
    
    if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return sendError(c, '曜日は0-6の範囲で指定してください', 400);
    }

    // 営業時間の存在確認
    const existingHours = await db
      .select()
      .from(businessHours)
      .where(eq(businessHours.dayOfWeek, dayOfWeek))
      .limit(1);

    if (existingHours.length === 0) {
      return sendError(c, '営業時間が見つかりません', 404);
    }

    // 営業時間更新
    const updatedHours = await db
      .update(businessHours)
      .set({
        isOpen: body.isOpen,
        openTime: body.openTime,
        closeTime: body.closeTime,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(businessHours.dayOfWeek, dayOfWeek))
      .returning({
        id: businessHours.id,
        dayOfWeek: businessHours.dayOfWeek,
        isOpen: businessHours.isOpen,
        openTime: businessHours.openTime,
        closeTime: businessHours.closeTime,
      });

    return sendSuccess(c, updatedHours[0], '営業時間を更新しました');
  } catch (error) {
    console.error('営業時間更新エラー:', error);
    return sendError(c, '営業時間の更新に失敗しました', 500);
  }
});

export default app;