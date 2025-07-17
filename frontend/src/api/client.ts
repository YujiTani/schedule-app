import { ApiResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * API エラークラス
 */
export class ApiError extends Error {
  /**
   * API エラーを作成
   * 
   * @param message - エラーメッセージ
   * @param status - HTTPステータスコード
   * @param requestId - リクエストID（デフォルト値: undefined）
   */
  constructor(
    message: string,
    public status: number,
    public requestId?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API クライアントクラス
 */
export class ApiClient {
  private baseURL: string;

  /**
   * API クライアントを作成
   * 
   * @param baseURL - ベースURL（デフォルト値: API_BASE_URL）
   */
  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * HTTP リクエストを送信
   * 
   * @param endpoint - エンドポイント
   * @param options - リクエストオプション（デフォルト値: {}）
   * @returns APIレスポンス
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}/api${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();

      if (!response.ok || data.status === 'error') {
        throw new ApiError(
          data.error || `HTTP ${response.status}`,
          response.status,
          data.request_id
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : '不明なエラーが発生しました',
        0
      );
    }
  }

  /**
   * GET リクエストを送信
   * 
   * @param endpoint - エンドポイント
   * @returns APIレスポンス
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST リクエストを送信
   * 
   * @param endpoint - エンドポイント
   * @param data - 送信データ（デフォルト値: undefined）
   * @returns APIレスポンス
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT リクエストを送信
   * 
   * @param endpoint - エンドポイント
   * @param data - 送信データ（デフォルト値: undefined）
   * @returns APIレスポンス
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE リクエストを送信
   * 
   * @param endpoint - エンドポイント
   * @returns APIレスポンス
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// シングルトンインスタンス
export const apiClient = new ApiClient();