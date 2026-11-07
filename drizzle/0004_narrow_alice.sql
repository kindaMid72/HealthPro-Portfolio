CREATE TABLE "location_exceptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_id" uuid,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"closed" boolean NOT NULL,
	"hours" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reason" text DEFAULT '' NOT NULL,
	"reason_en" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "location_exceptions_dates_check" CHECK ("location_exceptions"."end_date" >= "location_exceptions"."start_date"),
	CONSTRAINT "location_exceptions_hours_check" CHECK (("location_exceptions"."closed" AND jsonb_array_length("location_exceptions"."hours") = 0) OR (NOT "location_exceptions"."closed" AND jsonb_array_length("location_exceptions"."hours") > 0)),
	CONSTRAINT "location_exceptions_scope_check" CHECK ("location_exceptions"."location_id" IS NOT NULL OR "location_exceptions"."closed")
);
--> statement-breakpoint
CREATE TABLE "location_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_id" uuid NOT NULL,
	"day_of_week" smallint NOT NULL,
	"opens_minute" smallint NOT NULL,
	"closes_minute" smallint NOT NULL,
	CONSTRAINT "location_slots_day_check" CHECK ("location_slots"."day_of_week" between 0 and 6),
	CONSTRAINT "location_slots_opens_check" CHECK ("location_slots"."opens_minute" >= 0),
	CONSTRAINT "location_slots_closes_check" CHECK ("location_slots"."closes_minute" <= 1439),
	CONSTRAINT "location_slots_order_check" CHECK ("location_slots"."closes_minute" > "location_slots"."opens_minute")
);
--> statement-breakpoint
CREATE TABLE "location_translations" (
	"location_id" uuid NOT NULL,
	"locale" "content_locale" NOT NULL,
	"location_name" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"schedule_note" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "location_translations_location_id_locale_pk" PRIMARY KEY("location_id","locale")
);
--> statement-breakpoint
ALTER TABLE "locations" ALTER COLUMN "practice_hours" SET DEFAULT '-';--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "schedule_note" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "location_exceptions" ADD CONSTRAINT "location_exceptions_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_slots" ADD CONSTRAINT "location_slots_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_translations" ADD CONSTRAINT "location_translations_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "location_slots_location_day_opens_key" ON "location_slots" USING btree ("location_id","day_of_week","opens_minute");