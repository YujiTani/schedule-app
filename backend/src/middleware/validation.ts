import { Context, Next } from 'hono';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response.js';

/**
 * リクエストボディのバリデーションミドルウェア
 * @param schema - Zodバリデーションスキーマ
 * @returns バリデーションミドルウェア
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const validatedData = schema.parse(body);
      c.set('validatedData', validatedData);
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        return sendError(c, `バリデーションエラー: ${errorMessages}`, 400);
      }
      return sendError(c, 'リクエストデータの解析に失敗しました', 400);
    }
  };
}

/**
 * パスパラメータのバリデーションミドルウェア
 * @param paramName - パラメータ名
 * @param schema - Zodバリデーションスキーマ
 * @returns バリデーションミドルウェア
 */
export function validateParam<T>(paramName: string, schema: ZodSchema<T>) {
  return async (c: Context, next: Next) => {
    try {
      const param = c.req.param(paramName);
      // 数値の場合は変換を試行
      const value = !isNaN(Number(param)) ? Number(param) : param;
      const validatedParam = schema.parse(value);
      c.set(`validated${paramName}`, validatedParam);
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => err.message).join(', ');
        return sendError(c, `パラメータエラー: ${errorMessages}`, 400);
      }
      return sendError(c, 'パラメータの解析に失敗しました', 400);
    }
  };
}