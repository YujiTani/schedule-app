/**
 * ログレベル定義
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

/**
 * ログ情報の型定義
 */
interface LogInfo {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

/**
 * ログ出力のフォーマット
 * @param info - ログ情報
 * @returns フォーマット済みログ文字列
 */
function formatLog(info: LogInfo): string {
  const { level, message, timestamp, requestId, metadata } = info;
  const metadataStr = metadata ? ` ${JSON.stringify(metadata)}` : '';
  const requestIdStr = requestId ? ` [${requestId}]` : '';
  
  return `[${timestamp}] ${level.toUpperCase()}${requestIdStr}: ${message}${metadataStr}`;
}

/**
 * ログ出力クラス
 */
class Logger {
  private shouldLog(level: LogLevel): boolean {
    // 本番環境では DEBUG と TRACE は出力しない
    if (process.env.NODE_ENV === 'production') {
      return level !== LogLevel.DEBUG && level !== LogLevel.TRACE;
    }
    return true;
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>, requestId?: string): void {
    if (!this.shouldLog(level)) return;

    const info: LogInfo = {
      level,
      message,
      timestamp: new Date().toISOString(),
      requestId,
      metadata,
    };

    const formattedLog = formatLog(info);
    
    // エラーレベルの場合は stderr に出力
    if (level === LogLevel.ERROR) {
      console.error(formattedLog);
    } else {
      console.log(formattedLog);
    }
  }

  /**
   * エラーログ出力
   * @param message - ログメッセージ
   * @param metadata - メタデータ
   * @param requestId - リクエストID
   */
  error(message: string, metadata?: Record<string, any>, requestId?: string): void {
    this.log(LogLevel.ERROR, message, metadata, requestId);
  }

  /**
   * 警告ログ出力
   * @param message - ログメッセージ
   * @param metadata - メタデータ
   * @param requestId - リクエストID
   */
  warn(message: string, metadata?: Record<string, any>, requestId?: string): void {
    this.log(LogLevel.WARN, message, metadata, requestId);
  }

  /**
   * 情報ログ出力
   * @param message - ログメッセージ
   * @param metadata - メタデータ
   * @param requestId - リクエストID
   */
  info(message: string, metadata?: Record<string, any>, requestId?: string): void {
    this.log(LogLevel.INFO, message, metadata, requestId);
  }

  /**
   * デバッグログ出力
   * @param message - ログメッセージ
   * @param metadata - メタデータ
   * @param requestId - リクエストID
   */
  debug(message: string, metadata?: Record<string, any>, requestId?: string): void {
    this.log(LogLevel.DEBUG, message, metadata, requestId);
  }

  /**
   * トレースログ出力
   * @param message - ログメッセージ
   * @param metadata - メタデータ
   * @param requestId - リクエストID
   */
  trace(message: string, metadata?: Record<string, any>, requestId?: string): void {
    this.log(LogLevel.TRACE, message, metadata, requestId);
  }
}

export const logger = new Logger();