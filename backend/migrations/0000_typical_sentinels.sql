CREATE TABLE "admin_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"setting_key" text NOT NULL,
	"setting_value" text,
	"description" text,
	"created_at" bigint DEFAULT EXTRACT(EPOCH FROM NOW()),
	"updated_at" bigint DEFAULT EXTRACT(EPOCH FROM NOW()),
	CONSTRAINT "admin_settings_setting_key_unique" UNIQUE("setting_key")
);
--> statement-breakpoint
CREATE TABLE "business_hours" (
	"id" serial PRIMARY KEY NOT NULL,
	"day_of_week" integer NOT NULL,
	"is_open" boolean DEFAULT true,
	"open_time" bigint,
	"close_time" bigint,
	"created_at" bigint DEFAULT EXTRACT(EPOCH FROM NOW()),
	"updated_at" bigint DEFAULT EXTRACT(EPOCH FROM NOW()),
	CONSTRAINT "business_hours_day_of_week_unique" UNIQUE("day_of_week")
);
--> statement-breakpoint
CREATE TABLE "change_histories" (
	"id" serial PRIMARY KEY NOT NULL,
	"table_name" text NOT NULL,
	"record_uuid" text NOT NULL,
	"action" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_at" bigint DEFAULT EXTRACT(EPOCH FROM NOW())
);
--> statement-breakpoint
CREATE TABLE "google_calendar_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"google_event_id" text NOT NULL,
	"title" text,
	"description" text,
	"start_datetime" bigint NOT NULL,
	"end_datetime" bigint NOT NULL,
	"is_all_day" boolean DEFAULT false,
	"calendar_id" text NOT NULL,
	"deleted_at" bigint,
	"created_at" bigint DEFAULT EXTRACT(EPOCH FROM NOW()),
	"updated_at" bigint DEFAULT EXTRACT(EPOCH FROM NOW()),
	CONSTRAINT "google_calendar_events_google_event_id_unique" UNIQUE("google_event_id")
);
--> statement-breakpoint
CREATE TABLE "notification_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"reservation_uuid" uuid,
	"notification_type" text NOT NULL,
	"recipient_email" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"sent_at" bigint DEFAULT EXTRACT(EPOCH FROM NOW()),
	"status" text DEFAULT 'sent'
);
--> statement-breakpoint
CREATE TABLE "reservation_statuses" (
	"id" serial NOT NULL,
	"uuid" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"reservation_uuid" uuid NOT NULL,
	"status" text NOT NULL,
	"reason" text,
	"changed_at" bigint DEFAULT EXTRACT(EPOCH FROM NOW())
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" serial NOT NULL,
	"uuid" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL,
	"reservation_date" bigint NOT NULL,
	"start_time" bigint NOT NULL,
	"end_time" bigint NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"deleted_at" bigint,
	"created_at" bigint DEFAULT EXTRACT(EPOCH FROM NOW()),
	"updated_at" bigint DEFAULT EXTRACT(EPOCH FROM NOW())
);
--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "fk_notification_logs_reservations" FOREIGN KEY ("reservation_uuid") REFERENCES "public"."reservations"("uuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_statuses" ADD CONSTRAINT "fk_reservation_statuses_reservations" FOREIGN KEY ("reservation_uuid") REFERENCES "public"."reservations"("uuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_admin_settings_key" ON "admin_settings" USING btree ("setting_key");--> statement-breakpoint
CREATE INDEX "idx_business_hours_day" ON "business_hours" USING btree ("day_of_week");--> statement-breakpoint
CREATE INDEX "idx_change_histories_table_record" ON "change_histories" USING btree ("table_name","record_uuid");--> statement-breakpoint
CREATE INDEX "idx_change_histories_changed_at" ON "change_histories" USING btree ("changed_at");--> statement-breakpoint
CREATE INDEX "idx_google_events_datetime" ON "google_calendar_events" USING btree ("start_datetime","end_datetime") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_google_events_calendar" ON "google_calendar_events" USING btree ("calendar_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_google_events_deleted_at" ON "google_calendar_events" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_notification_logs_reservation" ON "notification_logs" USING btree ("reservation_uuid");--> statement-breakpoint
CREATE INDEX "idx_notification_logs_type" ON "notification_logs" USING btree ("notification_type");--> statement-breakpoint
CREATE INDEX "idx_reservation_statuses_reservation" ON "reservation_statuses" USING btree ("reservation_uuid");--> statement-breakpoint
CREATE INDEX "idx_reservation_statuses_changed_at" ON "reservation_statuses" USING btree ("changed_at");--> statement-breakpoint
CREATE INDEX "idx_reservations_date_time" ON "reservations" USING btree ("reservation_date","start_time") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_reservations_email" ON "reservations" USING btree ("email") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_reservations_deleted_at" ON "reservations" USING btree ("deleted_at");