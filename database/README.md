# データベース設計

## テーブル構成

### 1. reservations（予約テーブル）
| カラム名 | 型 | 説明 |
|---------|---|------|
| id | SERIAL | 予約ID（主キー）|
| email | VARCHAR(255) | 予約者メールアドレス |
| name | VARCHAR(100) | 予約者名 |
| content | TEXT | 予約内容 |
| reservation_date | DATE | 予約日 |
| start_time | TIME | 開始時刻 |
| end_time | TIME | 終了時刻 |
| status | VARCHAR(20) | ステータス（confirmed/cancelled/pending） |
| cancel_reason | TEXT | キャンセル理由 |
| cancel_requested_at | TIMESTAMP | キャンセル依頼日時 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

### 2. business_hours（営業時間テーブル）
| カラム名 | 型 | 説明 |
|---------|---|------|
| id | SERIAL | ID（主キー）|
| day_of_week | INTEGER | 曜日（0=日曜〜6=土曜） |
| is_open | BOOLEAN | 営業日フラグ |
| open_time | TIME | 開店時刻 |
| close_time | TIME | 閉店時刻 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

### 3. google_calendar_events（Googleカレンダー予定テーブル）
| カラム名 | 型 | 説明 |
|---------|---|------|
| id | SERIAL | ID（主キー）|
| google_event_id | VARCHAR(255) | GoogleイベントID |
| title | VARCHAR(255) | イベントタイトル |
| description | TEXT | イベント説明 |
| start_datetime | TIMESTAMP | 開始日時 |
| end_datetime | TIMESTAMP | 終了日時 |
| is_all_day | BOOLEAN | 終日イベントフラグ |
| calendar_id | VARCHAR(255) | カレンダーID |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

### 4. admin_settings（管理者設定テーブル）
| カラム名 | 型 | 説明 |
|---------|---|------|
| id | SERIAL | ID（主キー）|
| setting_key | VARCHAR(100) | 設定キー |
| setting_value | TEXT | 設定値 |
| description | TEXT | 設定説明 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

## デフォルトデータ

### 営業時間
- 平日（月〜金）: 9:00-17:00
- 土日: 休業

### 管理者設定
- google_calendar_id: （空）
- admin_email: admin@example.com
- reservation_duration_hours: 1
- sync_interval_hours: 6
- timezone: Asia/Tokyo

## インデックス

- 予約日時での検索最適化
- メールアドレスでの検索最適化
- ステータスでの検索最適化
- Googleカレンダー予定の日時検索最適化