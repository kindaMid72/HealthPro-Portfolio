ALTER TABLE "profile" ADD COLUMN "hero_tagline" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "hero_booking_label" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "hero_whatsapp_label" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_translations" ADD COLUMN "hero_tagline" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_translations" ADD COLUMN "hero_booking_label" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_translations" ADD COLUMN "hero_whatsapp_label" text DEFAULT '' NOT NULL;