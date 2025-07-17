import { 
  pgTable, 
  serial, 
  uuid, 
  text, 
  bigint, 
  integer, 
  boolean, 
  jsonb,
  uniqueIndex,
  index,
  foreignKey
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// 予約基本情報テーブル
export const reservations = pgTable('reservations', {
  id: serial('id'),
  uuid: uuid('uuid').primaryKey().default(sql`uuid_generate_v4()`),
  email: text('email').notNull(),
  name: text('name').notNull(),
  content: text('content').notNull(),
  reservationDate: bigint('reservation_date', { mode: 'number' }).notNull(),
  startTime: bigint('start_time', { mode: 'number' }).notNull(),
  endTime: bigint('end_time', { mode: 'number' }).notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(60),
  deletedAt: bigint('deleted_at', { mode: 'number' }),
  createdAt: bigint('created_at', { mode: 'number' }).default(sql`EXTRACT(EPOCH FROM NOW())`),
  updatedAt: bigint('updated_at', { mode: 'number' }).default(sql`EXTRACT(EPOCH FROM NOW())`),
}, (table) => ({
  dateTimeIdx: index('idx_reservations_date_time').on(table.reservationDate, table.startTime).where(sql`deleted_at IS NULL`),
  emailIdx: index('idx_reservations_email').on(table.email).where(sql`deleted_at IS NULL`),
  deletedAtIdx: index('idx_reservations_deleted_at').on(table.deletedAt),
}));

// 予約ステータス履歴テーブル
export const reservationStatuses = pgTable('reservation_statuses', {
  id: serial('id'),
  uuid: uuid('uuid').primaryKey().default(sql`uuid_generate_v4()`),
  reservationUuid: uuid('reservation_uuid').notNull(),
  status: text('status').notNull(),
  reason: text('reason'),
  changedAt: bigint('changed_at', { mode: 'number' }).default(sql`EXTRACT(EPOCH FROM NOW())`),
}, (table) => ({
  reservationIdx: index('idx_reservation_statuses_reservation').on(table.reservationUuid),
  changedAtIdx: index('idx_reservation_statuses_changed_at').on(table.changedAt),
  reservationFk: foreignKey({
    columns: [table.reservationUuid],
    foreignColumns: [reservations.uuid],
    name: 'fk_reservation_statuses_reservations'
  }),
}));

// 営業時間テーブル
export const businessHours = pgTable('business_hours', {
  id: serial('id').primaryKey(),
  dayOfWeek: integer('day_of_week').notNull().unique(),
  isOpen: boolean('is_open').default(true),
  openTime: bigint('open_time', { mode: 'number' }),
  closeTime: bigint('close_time', { mode: 'number' }),
  createdAt: bigint('created_at', { mode: 'number' }).default(sql`EXTRACT(EPOCH FROM NOW())`),
  updatedAt: bigint('updated_at', { mode: 'number' }).default(sql`EXTRACT(EPOCH FROM NOW())`),
}, (table) => ({
  dayIdx: index('idx_business_hours_day').on(table.dayOfWeek),
}));

// Googleカレンダー予定テーブル
export const googleCalendarEvents = pgTable('google_calendar_events', {
  id: serial('id').primaryKey(),
  googleEventId: text('google_event_id').notNull().unique(),
  title: text('title'),
  description: text('description'),
  startDatetime: bigint('start_datetime', { mode: 'number' }).notNull(),
  endDatetime: bigint('end_datetime', { mode: 'number' }).notNull(),
  isAllDay: boolean('is_all_day').default(false),
  calendarId: text('calendar_id').notNull(),
  deletedAt: bigint('deleted_at', { mode: 'number' }),
  createdAt: bigint('created_at', { mode: 'number' }).default(sql`EXTRACT(EPOCH FROM NOW())`),
  updatedAt: bigint('updated_at', { mode: 'number' }).default(sql`EXTRACT(EPOCH FROM NOW())`),
}, (table) => ({
  datetimeIdx: index('idx_google_events_datetime').on(table.startDatetime, table.endDatetime).where(sql`deleted_at IS NULL`),
  calendarIdx: index('idx_google_events_calendar').on(table.calendarId).where(sql`deleted_at IS NULL`),
  deletedAtIdx: index('idx_google_events_deleted_at').on(table.deletedAt),
}));

// 管理者設定テーブル
export const adminSettings = pgTable('admin_settings', {
  id: serial('id').primaryKey(),
  settingKey: text('setting_key').notNull().unique(),
  settingValue: text('setting_value'),
  description: text('description'),
  createdAt: bigint('created_at', { mode: 'number' }).default(sql`EXTRACT(EPOCH FROM NOW())`),
  updatedAt: bigint('updated_at', { mode: 'number' }).default(sql`EXTRACT(EPOCH FROM NOW())`),
}, (table) => ({
  keyIdx: index('idx_admin_settings_key').on(table.settingKey),
}));

// メール通知ログテーブル
export const notificationLogs = pgTable('notification_logs', {
  id: serial('id').primaryKey(),
  reservationUuid: uuid('reservation_uuid'),
  notificationType: text('notification_type').notNull(),
  recipientEmail: text('recipient_email').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  sentAt: bigint('sent_at', { mode: 'number' }).default(sql`EXTRACT(EPOCH FROM NOW())`),
  status: text('status').default('sent'),
}, (table) => ({
  reservationIdx: index('idx_notification_logs_reservation').on(table.reservationUuid),
  typeIdx: index('idx_notification_logs_type').on(table.notificationType),
  reservationFk: foreignKey({
    columns: [table.reservationUuid],
    foreignColumns: [reservations.uuid],
    name: 'fk_notification_logs_reservations'
  }),
}));

// 履歴管理テーブル
export const changeHistories = pgTable('change_histories', {
  id: serial('id').primaryKey(),
  tableName: text('table_name').notNull(),
  recordUuid: text('record_uuid').notNull(),
  action: text('action').notNull(),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  changedAt: bigint('changed_at', { mode: 'number' }).default(sql`EXTRACT(EPOCH FROM NOW())`),
}, (table) => ({
  tableRecordIdx: index('idx_change_histories_table_record').on(table.tableName, table.recordUuid),
  changedAtIdx: index('idx_change_histories_changed_at').on(table.changedAt),
}));