import { db } from './index.js';
import { businessHours, adminSettings } from './schema.js';
import { sql } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // デフォルト営業時間データ投入（全曜日作成、夜間営業想定：18-22時、土日休み）
    await db.insert(businessHours).values([
      { dayOfWeek: 0, isOpen: false, openTime: null, closeTime: null }, // 日曜
      { dayOfWeek: 1, isOpen: true, openTime: Math.floor(new Date('1970-01-01T18:00:00Z').getTime() / 1000), closeTime: Math.floor(new Date('1970-01-01T22:00:00Z').getTime() / 1000) }, // 月曜
      { dayOfWeek: 2, isOpen: true, openTime: Math.floor(new Date('1970-01-01T18:00:00Z').getTime() / 1000), closeTime: Math.floor(new Date('1970-01-01T22:00:00Z').getTime() / 1000) }, // 火曜
      { dayOfWeek: 3, isOpen: true, openTime: Math.floor(new Date('1970-01-01T18:00:00Z').getTime() / 1000), closeTime: Math.floor(new Date('1970-01-01T22:00:00Z').getTime() / 1000) }, // 水曜
      { dayOfWeek: 4, isOpen: true, openTime: Math.floor(new Date('1970-01-01T18:00:00Z').getTime() / 1000), closeTime: Math.floor(new Date('1970-01-01T22:00:00Z').getTime() / 1000) }, // 木曜
      { dayOfWeek: 5, isOpen: true, openTime: Math.floor(new Date('1970-01-01T18:00:00Z').getTime() / 1000), closeTime: Math.floor(new Date('1970-01-01T22:00:00Z').getTime() / 1000) }, // 金曜
      { dayOfWeek: 6, isOpen: false, openTime: null, closeTime: null }, // 土曜
    ]).onConflictDoNothing();

    // 管理者設定デフォルト値
    await db.insert(adminSettings).values([
      { settingKey: 'google_calendar_id', settingValue: '', description: 'Google Calendar ID for admin events' },
      { settingKey: 'google_holiday_calendar_id', settingValue: 'ja.japanese#holiday@group.v.calendar.google.com', description: 'Google Holiday Calendar ID for Japan' },
      { settingKey: 'admin_email', settingValue: 'admin@example.com', description: 'Administrator email address' },
      { settingKey: 'reservation_duration_minutes', settingValue: '60', description: 'Default reservation duration in minutes' },
      { settingKey: 'reservation_slot_interval_minutes', settingValue: '30', description: 'Time slot interval for future use (30min slots)' },
      { settingKey: 'sync_interval_hours', settingValue: '6', description: 'Google Calendar sync interval in hours' },
      { settingKey: 'reminder_hours_before', settingValue: '24', description: 'Hours before reservation to send reminder' },
      { settingKey: 'timezone', settingValue: 'Asia/Tokyo', description: 'Application timezone' },
      { settingKey: 'app_name', settingValue: '予約管理アプリ', description: 'Application name for emails' },
      { settingKey: 'smtp_host', settingValue: 'smtp.gmail.com', description: 'SMTP server host' },
      { settingKey: 'smtp_port', settingValue: '587', description: 'SMTP server port' },
      { settingKey: 'smtp_user', settingValue: '', description: 'SMTP username' },
      { settingKey: 'smtp_password', settingValue: '', description: 'SMTP password' },
    ]).onConflictDoNothing();

    console.log('✅ Seeding completed successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

seed();