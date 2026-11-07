import {
  type AnyPgColumn,
  check,
  customType,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import type { JSONContent } from '@tiptap/core';

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => 'bytea',
});

export const articleStatus = pgEnum('article_status', ['draft', 'in_review', 'published']);
export const articleCategory = pgEnum('article_category', [
  'telinga',
  'hidung',
  'tenggorok',
  'kepala-leher',
  'umum',
]);
export const contentLocale = pgEnum('content_locale', ['en']);


const tsz = (name: string) => timestamp(name, { withTimezone: true });

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: tsz('created_at').notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(), // SHA-256 hex of the session cookie token
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: tsz('expires_at').notNull(),
  createdAt: tsz('created_at').notNull().defaultNow(),
});

export const loginAttempts = pgTable(
  'login_attempts',
  {
    // 'a0'..'a1023' = sha256(email) mod 1024. Email is not stored; total account keys capped at 1024.
    accountKey: text('account_key').notNull(),
    ip: text('ip').notNull(), // Valid IP address, or '*' = combined bucket per account key
    attempts: integer('attempts').notNull().default(0),
    windowStart: tsz('window_start').notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.accountKey, t.ip] }),
    index('login_attempts_window_idx').on(t.windowStart), // Purge expired rows without seq scan
  ],
);

export const images = pgTable('images', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id').references((): AnyPgColumn => articles.id, { onDelete: 'cascade' }),
  mimeType: text('mime_type').notNull(),
  data: bytea('data').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  byteSize: integer('byte_size').notNull(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: tsz('created_at').notNull().defaultNow(),
});

export const profile = pgTable(
  'profile',
  {
    id: integer('id').primaryKey(),
    fullName: text('full_name').notNull().default(''),
    specialty: text('specialty').notNull().default(''),
    subSpecialty: text('sub_specialty').notNull().default(''),
    strSipDisplay: text('str_sip_display').notNull().default(''),
    education: text('education').notNull().default(''),
    certifications: text('certifications').notNull().default(''),
    experienceHistory: text('experience_history').notNull().default(''),
    organizations: text('organizations').notNull().default(''),
    bookingUrl: text('booking_url').notNull().default(''),
    email: text('email').notNull().default(''),
    socialLinks: text('social_links').notNull().default(''),
    personalStory: text('personal_story').notNull().default(''),
    photoImageId: uuid('photo_image_id').references(() => images.id, { onDelete: 'set null' }),
    updatedAt: tsz('updated_at').notNull().defaultNow(),
  },
  (t) => [check('profile_singleton', sql`${t.id} = 1`)],
);
export const profileTranslations = pgTable('profile_translations', {
  locale: contentLocale('locale').primaryKey(),
  specialty: text('specialty').notNull().default(''),
  subSpecialty: text('sub_specialty').notNull().default(''),
  education: text('education').notNull().default(''),
  certifications: text('certifications').notNull().default(''),
  experienceHistory: text('experience_history').notNull().default(''),
  organizations: text('organizations').notNull().default(''),
  personalStory: text('personal_story').notNull().default(''),
  updatedAt: tsz('updated_at').notNull().defaultNow(),
});


export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  sortOrder: integer('sort_order').notNull(),
  locationName: text('location_name').notNull(),
  address: text('address').notNull(),
  practiceHours: text('practice_hours').notNull(),
  whatsapp: text('whatsapp').notNull().default(''),
  phone: text('phone').notNull().default(''),
  bookingUrlOverride: text('booking_url_override').notNull().default(''),
  updatedAt: tsz('updated_at').notNull().defaultNow(),
});

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  sortOrder: integer('sort_order').notNull(),
  serviceName: text('service_name').notNull(),
  serviceDescription: text('service_description').notNull().default(''),
  slug: text('slug').notNull().unique(),
  content: jsonb('content')
    .$type<JSONContent>()
    .notNull()
    .default(sql`'{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb`),
  /** Related article topic on /layanan/[slug]; null = no related articles. */
  category: articleCategory('category'),
  updatedAt: tsz('updated_at').notNull().defaultNow(),
});
export const serviceTranslations = pgTable(
  'service_translations',
  {
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    locale: contentLocale('locale').notNull(),
    serviceName: text('service_name').notNull().default(''),
    serviceDescription: text('service_description').notNull().default(''),
    content: jsonb('content')
      .$type<JSONContent>()
      .notNull()
      .default(sql`'{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb`),
    updatedAt: tsz('updated_at').notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.serviceId, t.locale] })],
);


export const articles = pgTable(
  'articles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull().default(''),
    excerpt: text('excerpt').notNull().default(''),
    category: articleCategory('category').notNull().default('umum'),
    coverImageId: uuid('cover_image_id').references(() => images.id, { onDelete: 'set null' }),
    coverAlt: text('cover_alt').notNull().default(''),
    content: jsonb('content').$type<JSONContent>().notNull(),
    status: articleStatus('status').notNull().default('draft'),
    reviewNote: text('review_note').notNull().default(''),
    readingTimeMinutes: integer('reading_time_minutes').notNull().default(1),
    viewCount: integer('view_count').notNull().default(0),
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
    updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: tsz('created_at').notNull().defaultNow(),
    updatedAt: tsz('updated_at').notNull().defaultNow(),
    publishedAt: tsz('published_at'),
  },
  (t) => [
    index('articles_status_published_idx').on(t.status, t.publishedAt),
    index('articles_category_status_idx').on(t.category, t.status),
  ],
);
export const articleTranslations = pgTable(
  'article_translations',
  {
    articleId: uuid('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    locale: contentLocale('locale').notNull(),
    title: text('title').notNull().default(''),
    excerpt: text('excerpt').notNull().default(''),
    coverAlt: text('cover_alt').notNull().default(''),
    content: jsonb('content')
      .$type<JSONContent>()
      .notNull()
      .default(sql`'{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb`),
    readingTimeMinutes: integer('reading_time_minutes').notNull().default(1),
    updatedAt: tsz('updated_at').notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.articleId, t.locale] })],
);

export const articleViews = pgTable(
  'article_views',
  {
    day: date('day', { mode: 'string' }).notNull(), // UTC, 'YYYY-MM-DD'
    articleId: uuid('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    visitorBucket: integer('visitor_bucket').notNull(), // 0..4095 = HMAC(ip, day) mod 4096; not full IP hash
  },
  (t) => [primaryKey({ columns: [t.day, t.articleId, t.visitorBucket] })], // Day first: purge `day < x` using index
);


export type ArticleRow = typeof articles.$inferSelect;
export type UserRow = typeof users.$inferSelect;
export type ProfileTranslationRow = typeof profileTranslations.$inferSelect;
export type ServiceTranslationRow = typeof serviceTranslations.$inferSelect;
export type ArticleTranslationRow = typeof articleTranslations.$inferSelect;
