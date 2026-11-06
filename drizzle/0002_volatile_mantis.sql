CREATE TYPE "public"."content_locale" AS ENUM('en');--> statement-breakpoint
CREATE TABLE "article_translations" (
	"article_id" uuid NOT NULL,
	"locale" "content_locale" NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"cover_alt" text DEFAULT '' NOT NULL,
	"content" jsonb DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb NOT NULL,
	"reading_time_minutes" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "article_translations_article_id_locale_pk" PRIMARY KEY("article_id","locale")
);
--> statement-breakpoint
CREATE TABLE "profile_translations" (
	"locale" "content_locale" PRIMARY KEY NOT NULL,
	"specialty" text DEFAULT '' NOT NULL,
	"sub_specialty" text DEFAULT '' NOT NULL,
	"education" text DEFAULT '' NOT NULL,
	"certifications" text DEFAULT '' NOT NULL,
	"experience_history" text DEFAULT '' NOT NULL,
	"organizations" text DEFAULT '' NOT NULL,
	"personal_story" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_translations" (
	"service_id" uuid NOT NULL,
	"locale" "content_locale" NOT NULL,
	"service_name" text DEFAULT '' NOT NULL,
	"service_description" text DEFAULT '' NOT NULL,
	"content" jsonb DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_translations_service_id_locale_pk" PRIMARY KEY("service_id","locale")
);
--> statement-breakpoint
ALTER TABLE "article_translations" ADD CONSTRAINT "article_translations_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_translations" ADD CONSTRAINT "service_translations_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;