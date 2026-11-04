ALTER TABLE "services" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "content" jsonb DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "category" "article_category";--> statement-breakpoint
WITH base AS (
  SELECT id, COALESCE(NULLIF(trim(both '-' from regexp_replace(lower(service_name), '[^a-z0-9]+', '-', 'g')), ''), 'layanan') AS s, sort_order FROM services
), numbered AS (
  SELECT id, s, row_number() OVER (PARTITION BY s ORDER BY sort_order) AS n FROM base
)
UPDATE services SET slug = CASE WHEN numbered.n = 1 THEN numbered.s ELSE numbered.s || '-' || numbered.n END FROM numbered WHERE services.id = numbered.id;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_slug_unique" UNIQUE("slug");
