/**
 * UNIX時間を日付文字列に変換
 */
export function formatDate(unixTime: number): string {
  return new Date(unixTime * 1000).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * UNIX時間を時刻文字列に変換
 */
export function formatTime(unixTime: number): string {
  return new Date(unixTime * 1000).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * UNIX時間を日時文字列に変換
 */
export function formatDateTime(unixTime: number): string {
  return new Date(unixTime * 1000).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 日付をUNIX時間に変換
 */
export function toUnixTime(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * 今日の日付をUNIX時間で取得
 */
export function getTodayUnixTime(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return toUnixTime(today);
}

/**
 * 曜日を日本語で取得
 */
export function getDayOfWeekJa(dayOfWeek: number): string {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return days[dayOfWeek] || '';
}

/**
 * 時刻のUNIX時間を時:分形式に変換
 */
export function formatTimeFromUnix(unixTime: number | null): string {
  if (unixTime === null) return '';
  
  const hours = Math.floor(unixTime / 3600);
  const minutes = Math.floor((unixTime % 3600) / 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * 時:分形式をUNIX時間に変換
 */
export function timeToUnix(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 3600 + minutes * 60;
}