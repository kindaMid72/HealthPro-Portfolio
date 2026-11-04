'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { JSONContent } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import {
  type ArticleStatus,
  calculateReadingTimeMinutes,
  countWords,
  getArticleTiptapExtensions,
} from '@/lib/tiptap';
import {
  ARTICLE_CATEGORIES,
  ARTICLE_CATEGORY_VALUES,
  type ArticleCategory,
} from '@/lib/types';
import {
  deleteArticleAction,
  saveArticleAction,
} from '../../../articles/actions';

export interface EditableArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  coverImageId: string | null;
  coverAlt: string;
  content: JSONContent;
  status: ArticleStatus;
  reviewNote: string;
  readingTimeMinutes: number;
  viewCount: number;
  authorName: string;
  updatedAt: string;
  publishedAt: string | null;
}

function localSlugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

const STATUS_BADGE: Record<
  ArticleStatus,
  { label: string; className: string }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  in_review: {
    label: 'Menunggu Review',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  published: {
    label: 'Dipublikasikan',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

export default function ArticleEditor({
  initialArticle,
}: {
  initialArticle: EditableArticle;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialArticle.title);
  const [slug, setSlug] = useState(initialArticle.slug);
  const [excerpt, setExcerpt] = useState(initialArticle.excerpt);
  const [category, setCategory] = useState<ArticleCategory>(
    initialArticle.category,
  );
  const [coverImageId, setCoverImageId] = useState<string | null>(
    initialArticle.coverImageId,
  );
  const [coverAlt, setCoverAlt] = useState(initialArticle.coverAlt);
  const [status, setStatus] = useState<ArticleStatus>(initialArticle.status);
  const [reviewNote, setReviewNote] = useState(initialArticle.reviewNote);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(initialArticle.updatedAt);

  const [wordCount, setWordCount] = useState(() =>
    countWords(initialArticle.content),
  );
  const [readingTime, setReadingTime] = useState(() =>
    calculateReadingTimeMinutes(initialArticle.content),
  );
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  const [message, setMessage] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);
  const [lastSavedTimeLabel, setLastSavedTimeLabel] = useState<string | null>(
    null,
  );

  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: getArticleTiptapExtensions(),
    content: initialArticle.content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'prose prose-slate article-prose max-w-none min-h-[420px] p-5 focus:outline-none',
      },
    },
    onUpdate: ({ editor: ed }) => {
      const json = ed.getJSON();
      setWordCount(countWords(json));
      setReadingTime(calculateReadingTimeMinutes(json));
      setIsDirty(true);
    },
  });

  // Peringatan sebelum menutup tab jika ada perubahan yang belum disimpan
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const performSave = useCallback(
    async (targetStatus: ArticleStatus, isAuto = false) => {
      if (!editor) return;
      if (isAuto) {
        setAutoSaving(true);
      } else {
        setSaving(true);
        setMessage(null);
      }

      // attrs ProseMirror berprototipe null; server action akan menyandikannya
      // sebagai temporary reference ("$T") dan menghilangkan level/href/src.
      // Salin ke plain object sebelum dikirim.
      const content = JSON.parse(JSON.stringify(editor.getJSON()));
      const result = await saveArticleAction({
        id: initialArticle.id,
        title,
        slug,
        excerpt,
        category,
        coverImageId,
        coverAlt,
        content,
        status: targetStatus,
        reviewNote,
        expectedUpdatedAt: lastUpdatedAt,
      });

      if (isAuto) {
        setAutoSaving(false);
      } else {
        setSaving(false);
      }

      if (!result.success || !result.saved) {
        // Autosave gagal juga harus terlihat; kalau tidak, label "Tersimpan"
        // lama terus tampil padahal tidak ada yang tersimpan.
        setMessage({
          type: 'err',
          text: isAuto
            ? `Autosimpan gagal: ${result.error ?? 'terjadi kesalahan.'}`
            : (result.error ?? 'Gagal menyimpan artikel.'),
        });
        return;
      }

      setSlug(result.saved.slug);
      setStatus(result.saved.status);
      setExcerpt(result.saved.excerpt);
      setReadingTime(result.saved.readingTimeMinutes);
      setLastUpdatedAt(result.saved.updatedAt);
      setIsDirty(false);

      const timeStr = new Date(result.saved.updatedAt).toLocaleTimeString(
        'id-ID',
        {
          hour: '2-digit',
          minute: '2-digit',
        },
      );
      setLastSavedTimeLabel(timeStr);

      if (!isAuto) {
        const statusMsg =
          targetStatus === 'published'
            ? 'Artikel berhasil diterbitkan ke halaman publik!'
            : targetStatus === 'in_review'
              ? 'Artikel disimpan dan diajukan untuk review.'
              : 'Perubahan artikel berhasil disimpan.';
        setMessage({ type: 'ok', text: statusMsg });
        router.refresh();
      }
    },
    [
      category,
      coverAlt,
      coverImageId,
      editor,
      excerpt,
      initialArticle.id,
      lastUpdatedAt,
      reviewNote,
      router,
      slug,
      title,
    ],
  );

  // Autosave setiap 25 detik khusus saat artikel berstatus draft dan ada perubahan
  useEffect(() => {
    if (status !== 'draft' || !isDirty || saving || autoSaving) return;

    const timer = setTimeout(() => {
      void performSave('draft', true);
    }, 25000);

    return () => clearTimeout(timer);
  }, [autoSaving, isDirty, performSave, saving, status]);

  async function handleUploadImage(file: File): Promise<{
    id: string;
    url: string;
  } | null> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('articleId', initialArticle.id);

    try {
      const res = await fetch('/api/admin/images', {
        method: 'POST',
        body: formData,
      });
      // Respons error dari platform (mis. 413 HTML) bukan JSON; jangan sampai
      // parse gagal dan membuat indikator unggah macet.
      const data = (await res.json().catch(() => null)) as {
        id?: string;
        url?: string;
        error?: string;
      } | null;
      if (!res.ok || !data?.id || !data.url) {
        setMessage({
          type: 'err',
          text:
            data?.error ??
            (res.status === 413
              ? 'Ukuran gambar terlalu besar untuk diunggah. Kecilkan gambar lalu coba lagi.'
              : 'Gagal mengunggah gambar.'),
        });
        return null;
      }
      return { id: data.id, url: data.url };
    } catch {
      setMessage({
        type: 'err',
        text: 'Gagal mengunggah gambar. Periksa koneksi internet lalu coba lagi.',
      });
      return null;
    }
  }

  async function onInlineImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editor) return;

    setUploadingInline(true);
    setMessage(null);
    let uploaded: { id: string; url: string } | null = null;
    try {
      uploaded = await handleUploadImage(file);
    } finally {
      setUploadingInline(false);
    }

    if (!uploaded) return;

    const altInput =
      window.prompt('Deskripsi gambar (Alt Text) untuk aksesibilitas/SEO:', '') ??
      '';
    const captionInput =
      window.prompt(
        'Keterangan di bawah gambar (Caption - opsional, kosongkan bila tidak perlu):',
        '',
      ) ?? '';

    editor
      .chain()
      .focus()
      .setImage({
        src: uploaded.url,
        alt: altInput.trim() || title || 'Ilustrasi medis',
        title: captionInput.trim() || undefined,
      })
      .run();
    setIsDirty(true);
  }

  async function onCoverSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadingCover(true);
    setMessage(null);
    let uploaded: { id: string; url: string } | null = null;
    try {
      uploaded = await handleUploadImage(file);
    } finally {
      setUploadingCover(false);
    }

    if (!uploaded) return;
    setCoverImageId(uploaded.id);
    setIsDirty(true);
  }

  function handleSetLink() {
    if (!editor) return;
    const prevUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Masukkan URL tautan (https://...):', prevUrl ?? 'https://');
    if (url === null) return;
    const trimmed = url.trim();
    if (trimmed === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith('/')) {
      window.alert('Gunakan URL yang diawali https:// atau /');
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: trimmed })
      .run();
  }

  async function handleDelete() {
    const ok = window.confirm(
      `Hapus permanen artikel "${title || slug}" beserta seluruh gambarnya? Tindakan ini tidak dapat dibatalkan.`,
    );
    if (!ok) return;
    await deleteArticleAction(initialArticle.id);
  }

  const badge = STATUS_BADGE[status];
  const isInTable = editor?.isActive('table') ?? false;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/articles"
            className="text-xs font-semibold text-text-muted hover:text-primary"
          >
            ← Daftar Artikel
          </Link>
          <span aria-hidden="true" className="text-border">
            |
          </span>
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}
          >
            {badge.label}
          </span>
          <span className="text-xs text-text-muted">
            {autoSaving
              ? 'Menyimpan otomatis...'
              : isDirty
                ? '• Belum disimpan'
                : lastSavedTimeLabel
                  ? `Tersimpan pukul ${lastSavedTimeLabel}`
                  : 'Tersimpan'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/articles/${initialArticle.id}/preview`}
            className="rounded-xl border border-border bg-bg px-3.5 py-2 text-xs font-semibold text-primary-dark hover:border-primary hover:text-primary"
          >
            Pratinjau
          </Link>

          {status === 'published' && (
            <Link
              href={`/artikel/${slug}`}
              target="_blank"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
            >
              Lihat Publik ↗
            </Link>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={() => void performSave(status)}
            className="rounded-xl border border-primary bg-white px-4 py-2 font-heading text-xs font-semibold text-primary hover:bg-primary/5 disabled:opacity-50"
          >
            {saving
              ? 'Menyimpan...'
              : status === 'draft'
                ? 'Simpan Draft'
                : 'Simpan Perubahan'}
          </button>

          {status !== 'in_review' && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void performSave('in_review')}
              className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 font-heading text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
            >
              Ajukan Review
            </button>
          )}

          {status !== 'published' ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => void performSave('published')}
              className="rounded-xl bg-primary px-4 py-2 font-heading text-xs font-semibold text-white shadow-xs hover:bg-primary-dark disabled:opacity-50"
            >
              Terbitkan
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => void performSave('draft')}
              className="rounded-xl border border-slate-300 bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              Tarik ke Draft
            </button>
          )}
        </div>
      </div>

      {message && (
        <div
          role="alert"
          className={`rounded-xl border px-4 py-3 text-xs font-medium ${
            message.type === 'ok'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Kolom Utama: Metadata & Editor Kaya Tiptap */}
        <div className="space-y-6 lg:col-span-8">
          <div className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-xs">
            <div>
              <label
                htmlFor="article-title"
                className="mb-1.5 block font-heading text-xs font-semibold text-primary-dark"
              >
                Judul Artikel
              </label>
              <input
                id="article-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Contoh: Mengenal Gejala Sinusitis Kronis dan Kapan Harus ke Dokter THT"
                className="w-full rounded-xl border border-border bg-bg px-4 py-2.5 font-heading text-base font-bold text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="article-slug"
                    className="font-heading text-xs font-semibold text-primary-dark"
                  >
                    Slug URL (/artikel/...)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (title.trim()) {
                        setSlug(localSlugify(title));
                        setIsDirty(true);
                      }
                    }}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Sinkronkan dari Judul
                  </button>
                </div>
                <input
                  id="article-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="article-category"
                  className="mb-1.5 block font-heading text-xs font-semibold text-primary-dark"
                >
                  Kategori Topik THT
                </label>
                <select
                  id="article-category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value as ArticleCategory);
                    setIsDirty(true);
                  }}
                  className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs font-medium text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
                >
                  {ARTICLE_CATEGORY_VALUES.map((cat) => (
                    <option key={cat} value={cat}>
                      {ARTICLE_CATEGORIES[cat]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="article-excerpt"
                  className="font-heading text-xs font-semibold text-primary-dark"
                >
                  Ringkasan Singkat (Excerpt & Meta Description SEO)
                </label>
                <span className="text-[11px] text-text-muted">
                  {excerpt.length}/160 karakter (otomatis terisi bila dikosongkan)
                </span>
              </div>
              <textarea
                id="article-excerpt"
                rows={2}
                value={excerpt}
                onChange={(e) => {
                  setExcerpt(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Ringkasan 1-2 kalimat yang muncul di kartu artikel dan hasil pencarian Google..."
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs leading-relaxed text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Tiptap Rich Editor Card */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b border-border bg-bg/70 p-2.5 text-xs">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`rounded-lg px-2.5 py-1.5 font-bold ${
                  editor?.isActive('bold')
                    ? 'bg-primary text-white'
                    : 'hover:bg-primary/10'
                }`}
                title="Tebal (Bold)"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`rounded-lg px-2.5 py-1.5 italic ${
                  editor?.isActive('italic')
                    ? 'bg-primary text-white'
                    : 'hover:bg-primary/10'
                }`}
                title="Miring (Italic)"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                className={`rounded-lg px-2.5 py-1.5 underline ${
                  editor?.isActive('underline')
                    ? 'bg-primary text-white'
                    : 'hover:bg-primary/10'
                }`}
                title="Garis Bawah (Underline)"
              >
                U
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                className={`rounded-lg px-2.5 py-1.5 line-through ${
                  editor?.isActive('strike')
                    ? 'bg-primary text-white'
                    : 'hover:bg-primary/10'
                }`}
                title="Coret (Strikethrough)"
              >
                S
              </button>

              <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />

              <button
                type="button"
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={`rounded-lg px-2.5 py-1.5 font-heading font-bold ${
                  editor?.isActive('heading', { level: 2 })
                    ? 'bg-primary text-white'
                    : 'hover:bg-primary/10'
                }`}
                title="Subjudul Utama (H2 - Masuk Daftar Isi)"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={`rounded-lg px-2.5 py-1.5 font-heading font-semibold ${
                  editor?.isActive('heading', { level: 3 })
                    ? 'bg-primary text-white'
                    : 'hover:bg-primary/10'
                }`}
                title="Subjudul Anak (H3 - Masuk Daftar Isi)"
              >
                H3
              </button>

              <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />

              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`rounded-lg px-2.5 py-1.5 ${
                  editor?.isActive('bulletList')
                    ? 'bg-primary text-white'
                    : 'hover:bg-primary/10'
                }`}
              >
                • List
              </button>
              <button
                type="button"
                onClick={() =>
                  editor?.chain().focus().toggleOrderedList().run()
                }
                className={`rounded-lg px-2.5 py-1.5 ${
                  editor?.isActive('orderedList')
                    ? 'bg-primary text-white'
                    : 'hover:bg-primary/10'
                }`}
              >
                1. List
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className={`rounded-lg px-2.5 py-1.5 ${
                  editor?.isActive('blockquote')
                    ? 'bg-primary text-white'
                    : 'hover:bg-primary/10'
                }`}
              >
                ❝ Kutipan
              </button>
              <button
                type="button"
                onClick={() =>
                  editor?.chain().focus().setHorizontalRule().run()
                }
                className="rounded-lg px-2.5 py-1.5 hover:bg-primary/10"
                title="Garis Pemisah"
              >
                ― Garis
              </button>

              <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />

              <button
                type="button"
                onClick={handleSetLink}
                className={`rounded-lg px-2.5 py-1.5 ${
                  editor?.isActive('link')
                    ? 'bg-primary text-white'
                    : 'hover:bg-primary/10'
                }`}
              >
                🔗 Tautan
              </button>

              <button
                type="button"
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run()
                }
                className="rounded-lg px-2.5 py-1.5 hover:bg-primary/10"
              >
                📊 + Tabel
              </button>

              {isInTable && (
                <div className="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-1.5 py-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      editor?.chain().focus().addRowAfter().run()
                    }
                    className="rounded px-1.5 py-1 text-[11px] hover:bg-primary/15"
                  >
                    +Baris
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().deleteRow().run()}
                    className="rounded px-1.5 py-1 text-[11px] hover:bg-primary/15"
                  >
                    -Baris
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor?.chain().focus().addColumnAfter().run()
                    }
                    className="rounded px-1.5 py-1 text-[11px] hover:bg-primary/15"
                  >
                    +Kolom
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor?.chain().focus().deleteColumn().run()
                    }
                    className="rounded px-1.5 py-1 text-[11px] hover:bg-primary/15"
                  >
                    -Kolom
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor?.chain().focus().deleteTable().run()
                    }
                    className="rounded px-1.5 py-1 text-[11px] text-red-700 hover:bg-red-100"
                  >
                    Hapus Tabel
                  </button>
                </div>
              )}

              <input
                ref={inlineImageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                onChange={onInlineImageSelected}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploadingInline}
                onClick={() => inlineImageInputRef.current?.click()}
                className="rounded-lg bg-primary/10 px-2.5 py-1.5 font-semibold text-primary hover:bg-primary/20 disabled:opacity-50"
              >
                {uploadingInline ? 'Mengunggah...' : '🖼️ + Sisipkan Gambar'}
              </button>

              <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />

              <button
                type="button"
                onClick={() => editor?.chain().focus().undo().run()}
                className="rounded-lg px-2 py-1.5 hover:bg-primary/10"
                title="Undo"
              >
                ↶
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().redo().run()}
                className="rounded-lg px-2 py-1.5 hover:bg-primary/10"
                title="Redo"
              >
                ↷
              </button>
            </div>

            {/* Editor Area */}
            <EditorContent editor={editor} />

            {/* Footer Status Editor */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-bg/60 px-4 py-2.5 text-xs text-text-muted">
              <div className="flex items-center gap-3">
                <span>
                  <strong className="font-semibold text-primary-dark">
                    {wordCount}
                  </strong>{' '}
                  kata
                </span>
                <span>•</span>
                <span>Estimasi ~{readingTime} menit baca</span>
                <span>•</span>
                <span>
                  Gunakan <strong>H2 / H3</strong> untuk membentuk Daftar Isi
                  otomatis
                </span>
              </div>
              <div>
                {status === 'draft' && (
                  <span>Autosave draft aktif (setiap 25 detik)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Samping: Cover, Catatan Review, Info & Hapus */}
        <div className="space-y-6 lg:col-span-4">
          {/* Cover Gambar */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
            <h2 className="font-heading text-sm font-bold text-primary-dark">
              Gambar Sampul (Cover)
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              Otomatis dikompresi ke format WebP oleh server.
            </p>

            {coverImageId ? (
              <div className="mt-3 space-y-3">
                <div className="overflow-hidden rounded-xl border border-border bg-bg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/media/${coverImageId}`}
                    alt={coverAlt || title}
                    className="aspect-[16/9] w-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={uploadingCover}
                    onClick={() => coverImageInputRef.current?.click()}
                    className="rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-semibold text-primary-dark hover:border-primary"
                  >
                    Ganti Sampul
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImageId(null);
                      setIsDirty(true);
                    }}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <button
                  type="button"
                  disabled={uploadingCover}
                  onClick={() => coverImageInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-bg/50 px-4 py-6 text-xs font-semibold text-primary hover:border-primary hover:bg-primary/5"
                >
                  {uploadingCover
                    ? 'Mengunggah & mengompresi...'
                    : '+ Unggah Gambar Sampul'}
                </button>
              </div>
            )}

            <input
              ref={coverImageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              onChange={onCoverSelected}
              className="hidden"
            />

            <div className="mt-4">
              <label
                htmlFor="cover-alt"
                className="mb-1 block text-xs font-semibold text-primary-dark"
              >
                Keterangan / Alt Text Sampul
              </label>
              <input
                id="cover-alt"
                type="text"
                value={coverAlt}
                onChange={(e) => {
                  setCoverAlt(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Deskripsi gambar sampul..."
                className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Catatan Review */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
            <h2 className="font-heading text-sm font-bold text-primary-dark">
              Catatan Review Kolaboratif
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              Gunakan untuk meninggalkan pesan atau poin revisi antar-akun
              sebelum artikel diterbitkan.
            </p>
            <textarea
              rows={3}
              value={reviewNote}
              onChange={(e) => {
                setReviewNote(e.target.value);
                setIsDirty(true);
              }}
              placeholder="Contoh: Mohon dr. Yuliana cek bagian dosis obat semprot hidung..."
              className="mt-3 w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs leading-relaxed text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          {/* Info & Hapus */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
            <h2 className="font-heading text-sm font-bold text-primary-dark">
              Informasi Artikel
            </h2>
            <dl className="mt-2 space-y-1.5 text-xs text-text-muted">
              <div className="flex justify-between">
                <dt>Penulis Awal:</dt>
                <dd className="font-medium text-primary-dark">
                  {initialArticle.authorName}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Total Dibaca:</dt>
                <dd className="font-medium text-primary-dark">
                  {initialArticle.viewCount.toLocaleString('id-ID')} kali
                </dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => void handleDelete()}
                className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
              >
                Hapus Artikel Ini
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
