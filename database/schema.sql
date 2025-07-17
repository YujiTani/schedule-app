-- 予約管理アプリ データベーススキーマ（最終版v3）

-- UUID拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 予約基本情報テーブル
CREATE TABLE reservations (
  id SERIAL,
  uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  reservation_date BIGINT NOT NULL, -- UNIX時間（日付）
  start_time BIGINT NOT NULL, -- UNIX時間
  end_time BIGINT NOT NULL, -- UNIX時間
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  deleted_at BIGINT,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()),
  updated_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())
);

-- 予約ステータス履歴テーブル
CREATE TABLE reservation_statuses (
  id SERIAL,
  uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_uuid UUID NOT NULL,
  status TEXT NOT NULL, -- confirmed/cancelled/pending
  reason TEXT, -- 理由（キャンセル理由など）
  changed_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()),
  
  CONSTRAINT fk_reservation_statuses_reservations 
    FOREIGN KEY (reservation_uuid) REFERENCES reservations(uuid)
);

-- 営業時間テーブル
CREATE TABLE business_hours (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER UNIQUE NOT NULL, -- 0=日曜, 1=月曜, ..., 6=土曜
  is_open BOOLEAN DEFAULT true,
  open_time BIGINT, -- UNIX時間（時刻のみ）
  close_time BIGINT, -- UNIX時間（時刻のみ）
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()),
  updated_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())
);

-- Googleカレンダー予定テーブル
CREATE TABLE google_calendar_events (
  id SERIAL PRIMARY KEY,
  google_event_id TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  start_datetime BIGINT NOT NULL, -- UNIX時間
  end_datetime BIGINT NOT NULL, -- UNIX時間
  is_all_day BOOLEAN DEFAULT false,
  calendar_id TEXT NOT NULL,
  deleted_at BIGINT,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()),
  updated_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())
);

-- 管理者設定テーブル
CREATE TABLE admin_settings (
  id SERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()),
  updated_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())
);

-- メール通知ログテーブル
CREATE TABLE notification_logs (
  id SERIAL PRIMARY KEY,
  reservation_uuid UUID,
  notification_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()),
  status TEXT DEFAULT 'sent',
  
  -- 外部キー
  CONSTRAINT fk_notification_logs_reservations 
    FOREIGN KEY (reservation_uuid) REFERENCES reservations(uuid)
);

-- 履歴管理テーブル
CREATE TABLE change_histories (
  id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_uuid TEXT NOT NULL, -- UUIDまたはID文字列
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())
);

-- インデックス作成
CREATE INDEX idx_reservations_date_time ON reservations(reservation_date, start_time) WHERE deleted_at IS NULL;
CREATE INDEX idx_reservations_email ON reservations(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_reservations_deleted_at ON reservations(deleted_at);

CREATE INDEX idx_reservation_statuses_reservation ON reservation_statuses(reservation_uuid);
CREATE INDEX idx_reservation_statuses_changed_at ON reservation_statuses(changed_at);

CREATE INDEX idx_business_hours_day ON business_hours(day_of_week);

CREATE INDEX idx_google_events_datetime ON google_calendar_events(start_datetime, end_datetime) WHERE deleted_at IS NULL;
CREATE INDEX idx_google_events_calendar ON google_calendar_events(calendar_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_google_events_deleted_at ON google_calendar_events(deleted_at);

CREATE INDEX idx_admin_settings_key ON admin_settings(setting_key);

CREATE INDEX idx_notification_logs_reservation ON notification_logs(reservation_uuid);
CREATE INDEX idx_notification_logs_type ON notification_logs(notification_type);

CREATE INDEX idx_change_histories_table_record ON change_histories(table_name, record_uuid);
CREATE INDEX idx_change_histories_changed_at ON change_histories(changed_at);

-- デフォルト営業時間データ投入（全曜日作成、夜間営業想定：18-22時、土日休み）
INSERT INTO business_hours (day_of_week, is_open, open_time, close_time) VALUES
(0, false, null, null), -- 日曜
(1, true, EXTRACT(EPOCH FROM '18:00'::time), EXTRACT(EPOCH FROM '22:00'::time)), -- 月曜
(2, true, EXTRACT(EPOCH FROM '18:00'::time), EXTRACT(EPOCH FROM '22:00'::time)), -- 火曜
(3, true, EXTRACT(EPOCH FROM '18:00'::time), EXTRACT(EPOCH FROM '22:00'::time)), -- 水曜
(4, true, EXTRACT(EPOCH FROM '18:00'::time), EXTRACT(EPOCH FROM '22:00'::time)), -- 木曜
(5, true, EXTRACT(EPOCH FROM '18:00'::time), EXTRACT(EPOCH FROM '22:00'::time)), -- 金曜
(6, false, null, null); -- 土曜

-- 管理者設定デフォルト値
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
('google_calendar_id', '', 'Google Calendar ID for admin events'),
('google_holiday_calendar_id', 'ja.japanese#holiday@group.v.calendar.google.com', 'Google Holiday Calendar ID for Japan'),
('admin_email', 'admin@example.com', 'Administrator email address'),
('reservation_duration_minutes', '60', 'Default reservation duration in minutes'),
('reservation_slot_interval_minutes', '30', 'Time slot interval for future use (30min slots)'),
('sync_interval_hours', '6', 'Google Calendar sync interval in hours'),
('reminder_hours_before', '24', 'Hours before reservation to send reminder'),
('timezone', 'Asia/Tokyo', 'Application timezone'),
('app_name', '予約管理アプリ', 'Application name for emails'),
('smtp_host', 'smtp.gmail.com', 'SMTP server host'),
('smtp_port', '587', 'SMTP server port'),
('smtp_user', '', 'SMTP username'),
('smtp_password', '', 'SMTP password');

-- 更新時刻自動更新のトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = EXTRACT(EPOCH FROM NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 履歴管理トリガー関数（UUIDとIDの混在対応）
CREATE OR REPLACE FUNCTION log_change_history()
RETURNS TRIGGER AS $$
DECLARE
    record_id TEXT;
BEGIN
    -- UUIDカラムがあるかチェックして適切なIDを取得
    IF TG_OP = 'DELETE' THEN
        record_id := COALESCE(OLD.uuid::TEXT, OLD.id::TEXT);
        INSERT INTO change_histories (table_name, record_uuid, action, old_values)
        VALUES (TG_TABLE_NAME, record_id, TG_OP, row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        record_id := COALESCE(NEW.uuid::TEXT, NEW.id::TEXT);
        INSERT INTO change_histories (table_name, record_uuid, action, old_values, new_values)
        VALUES (TG_TABLE_NAME, record_id, TG_OP, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        record_id := COALESCE(NEW.uuid::TEXT, NEW.id::TEXT);
        INSERT INTO change_histories (table_name, record_uuid, action, new_values)
        VALUES (TG_TABLE_NAME, record_id, TG_OP, row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 各テーブルに更新時刻トリガーを設定
CREATE TRIGGER update_reservations_updated_at 
    BEFORE UPDATE ON reservations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_hours_updated_at 
    BEFORE UPDATE ON business_hours 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_calendar_events_updated_at 
    BEFORE UPDATE ON google_calendar_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at 
    BEFORE UPDATE ON admin_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 履歴管理トリガー設定
CREATE TRIGGER log_reservations_changes 
    AFTER INSERT OR UPDATE OR DELETE ON reservations 
    FOR EACH ROW EXECUTE FUNCTION log_change_history();

CREATE TRIGGER log_business_hours_changes 
    AFTER INSERT OR UPDATE OR DELETE ON business_hours 
    FOR EACH ROW EXECUTE FUNCTION log_change_history();

CREATE TRIGGER log_google_calendar_events_changes 
    AFTER INSERT OR UPDATE OR DELETE ON google_calendar_events 
    FOR EACH ROW EXECUTE FUNCTION log_change_history();

CREATE TRIGGER log_admin_settings_changes 
    AFTER INSERT OR UPDATE OR DELETE ON admin_settings 
    FOR EACH ROW EXECUTE FUNCTION log_change_history();