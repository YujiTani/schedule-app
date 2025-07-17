import { Context } from 'hono';
import { ApiResponse } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  requestId?: string
): ApiResponse<T> {
  return {
    data,
    message,
    request_id: requestId || uuidv4(),
    status: 'success'
  };
}

export function createErrorResponse(
  error: string,
  requestId?: string
): ApiResponse {
  return {
    error,
    request_id: requestId || uuidv4(),
    status: 'error'
  };
}

export function sendSuccess<T>(
  c: Context,
  data: T,
  message?: string,
  statusCode = 200
) {
  const requestId = c.get('requestId') || uuidv4();
  return c.json(createSuccessResponse(data, message, requestId), statusCode);
}

export function sendError(
  c: Context,
  error: string,
  statusCode = 400
) {
  const requestId = c.get('requestId') || uuidv4();
  return c.json(createErrorResponse(error, requestId), statusCode);
}