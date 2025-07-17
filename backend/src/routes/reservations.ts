import { Hono } from 'hono';
import { db } from '../db/index.js';
import { reservations, reservationStatuses } from '../db/schema.js';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { CreateReservationRequest, ReservationResponse } from '../types/index.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { v4 as uuidv4 } from 'uuid';
import { validateBody, validateParam } from '../middleware/validation.js';
import { createReservationSchema, updateReservationSchema } from '../validators/reservation.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

const app = new Hono();

// 予約一覧取得
app.get('/', async (c) => {
  try {
    const result = await db
      .select({
        uuid: reservations.uuid,
        name: reservations.name,
        content: reservations.content,
        email: reservations.email,
        reservationDate: reservations.reservationDate,
        startTime: reservations.startTime,
        endTime: reservations.endTime,
        durationMinutes: reservations.durationMinutes,
      })
      .from(reservations)
      .where(isNull(reservations.deletedAt))
      .orderBy(desc(reservations.startTime));

    return sendSuccess(c, result, '予約一覧を取得しました');
  } catch (error) {
    const requestId = c.get('requestId');
    logger.error('予約一覧取得エラー', { error: error instanceof Error ? error.message : error }, requestId);
    return sendError(c, '予約一覧の取得に失敗しました', 500);
  }
});

// 予約詳細取得
app.get('/:uuid', validateParam('uuid', z.string().uuid('有効なUUIDを指定してください')), async (c) => {
  try {
    const uuid = c.req.param('uuid');
    
    const result = await db
      .select({
        uuid: reservations.uuid,
        name: reservations.name,
        content: reservations.content,
        email: reservations.email,
        reservationDate: reservations.reservationDate,
        startTime: reservations.startTime,
        endTime: reservations.endTime,
        durationMinutes: reservations.durationMinutes,
      })
      .from(reservations)
      .where(
        and(
          eq(reservations.uuid, uuid),
          isNull(reservations.deletedAt)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return sendError(c, '予約が見つかりません', 404);
    }

    return sendSuccess(c, result[0], '予約詳細を取得しました');
  } catch (error) {
    const requestId = c.get('requestId');
    logger.error('予約詳細取得エラー', { error: error instanceof Error ? error.message : error }, requestId);
    return sendError(c, '予約詳細の取得に失敗しました', 500);
  }
});

// 予約作成
app.post('/', validateBody(createReservationSchema), async (c) => {
  try {
    const body = c.get('validatedData') as CreateReservationRequest;

    // 予約作成
    const newReservation = await db
      .insert(reservations)
      .values({
        email: body.email,
        name: body.name,
        content: body.content,
        reservationDate: body.reservationDate,
        startTime: body.startTime,
        endTime: body.endTime,
        durationMinutes: body.durationMinutes || 60,
      })
      .returning({
        uuid: reservations.uuid,
        name: reservations.name,
        content: reservations.content,
        email: reservations.email,
        reservationDate: reservations.reservationDate,
        startTime: reservations.startTime,
        endTime: reservations.endTime,
        durationMinutes: reservations.durationMinutes,
      });

    // 初期ステータスを設定
    await db.insert(reservationStatuses).values({
      reservationUuid: newReservation[0].uuid,
      status: 'pending',
    });

    return sendSuccess(c, newReservation[0], '予約を作成しました', 201);
  } catch (error) {
    const requestId = c.get('requestId');
    logger.error('予約作成エラー', { error: error instanceof Error ? error.message : error }, requestId);
    return sendError(c, '予約の作成に失敗しました', 500);
  }
});

// 予約更新
app.put('/:uuid', 
  validateParam('uuid', z.string().uuid('有効なUUIDを指定してください')), 
  validateBody(updateReservationSchema), 
  async (c) => {
  try {
    const uuid = c.req.param('uuid');
    const body = c.get('validatedData') as Partial<CreateReservationRequest>;
    
    // 予約の存在確認
    const existingReservation = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.uuid, uuid),
          isNull(reservations.deletedAt)
        )
      )
      .limit(1);

    if (existingReservation.length === 0) {
      return sendError(c, '予約が見つかりません', 404);
    }

    // 予約更新
    const updatedReservation = await db
      .update(reservations)
      .set({
        ...body,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(reservations.uuid, uuid))
      .returning({
        uuid: reservations.uuid,
        name: reservations.name,
        content: reservations.content,
        email: reservations.email,
        reservationDate: reservations.reservationDate,
        startTime: reservations.startTime,
        endTime: reservations.endTime,
        durationMinutes: reservations.durationMinutes,
      });

    return sendSuccess(c, updatedReservation[0], '予約を更新しました');
  } catch (error) {
    const requestId = c.get('requestId');
    logger.error('予約更新エラー', { error: error instanceof Error ? error.message : error }, requestId);
    return sendError(c, '予約の更新に失敗しました', 500);
  }
});

// 予約削除（論理削除）
app.delete('/:uuid', validateParam('uuid', z.string().uuid('有効なUUIDを指定してください')), async (c) => {
  try {
    const uuid = c.req.param('uuid');
    
    // 予約の存在確認
    const existingReservation = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.uuid, uuid),
          isNull(reservations.deletedAt)
        )
      )
      .limit(1);

    if (existingReservation.length === 0) {
      return sendError(c, '予約が見つかりません', 404);
    }

    // 論理削除
    await db
      .update(reservations)
      .set({
        deletedAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(reservations.uuid, uuid));

    // キャンセルステータスを追加
    await db.insert(reservationStatuses).values({
      reservationUuid: uuid,
      status: 'cancelled',
      reason: '管理者によるキャンセル',
    });

    return sendSuccess(c, null, '予約をキャンセルしました');
  } catch (error) {
    const requestId = c.get('requestId');
    logger.error('予約削除エラー', { error: error instanceof Error ? error.message : error }, requestId);
    return sendError(c, '予約のキャンセルに失敗しました', 500);
  }
});

export default app;