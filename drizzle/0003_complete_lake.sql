CREATE TABLE "article_views" (
	"day" date NOT NULL,
	"article_id" uuid NOT NULL,
	"visitor_bucket" integer NOT NULL,
	CONSTRAINT "article_views_day_article_id_visitor_bucket_pk" PRIMARY KEY("day","article_id","visitor_bucket")
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"account_key" text NOT NULL,
	"ip" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"window_start" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "login_attempts_account_key_ip_pk" PRIMARY KEY("account_key","ip")
);
--> statement-breakpoint
ALTER TABLE "article_views" ADD CONSTRAINT "article_views_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "login_attempts_window_idx" ON "login_attempts" USING btree ("window_start");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "failed_login_count";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "locked_until";