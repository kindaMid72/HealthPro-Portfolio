'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { JSONContent } from '@tiptap/core';
import { useEditor } from '@tiptap/react';
import { ExternalLink, ImagePlus } from 'lucide-react';
import Alert from '@/components/admin/Alert';
import { Button, buttonClassName } from '@/components/admin/Button';
import Card from '@/components/admin/Card';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { SelectField, TextAreaField, TextField } from '@/components/admin/Field';
import RichTextEditor, { RICH_TEXT_EDITOR_CLASS } from '@/components/admin/RichTextEditor';
import StatusBadge, { ARTICLE_STATUS_META } from '@/components/admin/StatusBadge';
import { id as idDictionary } from '@/i18n/dictionaries/id';
import { toSlug } from '@/lib/slug';
import {
  type ArticleStatus,
  calculateReadingTimeMinutes,
  countWords,
  EMPTY_TIPTAP_DOC,
  getArticleTiptapExtensions,
} from '@/lib/tiptap';
import { ARTICLE_CATEGORY_VALUES, type ArticleCategory } from '@/lib/types';
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
  en?: {
    title: string;
    excerpt: string;
    coverAlt: string;
    content: JSONContent;
  };
}

const PUBLISH_STEPS: ArticleStatus[] = ['draft', 'in_review', 'published'];

export default function ArticleEditor({
  initialArticle,
}: {
  initialArticle: EditableArticle;
}) {
  const router = useRouter();
  const [editLang, setEditLang] = useState<'id' | 'en'>('id');

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

  // Field versi bahasa Inggris (opsional)
  const [enTitle, setEnTitle] = useState(initialArticle.en?.title ?? '');
  const [enExcerpt, setEnExcerpt] = useState(initialArticle.en?.excerpt ?? '');
  const [enCoverAlt, setEnCoverAlt] = useState(initialArticle.en?.coverAlt ?? '');

  const [wordCount, setWordCount] = useState(() =>
    countWords(initialArticle.content),
  );
  const [readingTime, setReadingTime] = useState(() =>
    calculateReadingTimeMinutes(initialArticle.content),
  );

  const [enWordCount, setEnWordCount] = useState(() =>
    countWords(initialArticle.en?.content),
  );
  const [enReadingTime, setEnReadingTime] = useState(() =>
    calculateReadingTimeMinutes(initialArticle.en?.content),
  );

  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);
  const [lastSavedTimeLabel, setLastSavedTimeLabel] = useState<string | null>(
    null,
  );

  const coverImageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: getArticleTiptapExtensions(),
    content: initialArticle.content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: RICH_TEXT_EDITOR_CLASS,
      },
    },
    onUpdate: ({ editor: ed }) => {
      const json = ed.getJSON();
      setWordCount(countWords(json));
      setReadingTime(calculateReadingTimeMinutes(json));
      setIsDirty(true);
    },
  });

  const enEditor = useEditor({
    extensions: getArticleTiptapExtensions(),
    content: initialArticle.en?.content ?? EMPTY_TIPTAP_DOC,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: RICH_TEXT_EDITOR_CLASS,
      },
    },
    onUpdate: ({ editor: ed }) => {
      const json = ed.getJSON();
      setEnWordCount(countWords(json));
      setEnReadingTime(calculateReadingTimeMinutes(json));
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
      if (!editor || !enEditor) return;
      if (isAuto) {
        setAutoSaving(true);
      } else {
        setSaving(true);
        setMessage(null);
      }

      const content = JSON.parse(JSON.stringify(editor.getJSON()));
      const enContent = JSON.parse(JSON.stringify(enEditor.getJSON()));

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
        en: {
          title: enTitle,
          excerpt: enExcerpt,
          coverAlt: enCoverAlt,
          content: enContent,
        },
      });

      if (isAuto) {
        setAutoSaving(false);
      } else {
        setSaving(false);
      }

      if (!result.success || !result.saved) {
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
      enCoverAlt,
      enEditor,
      enExcerpt,
      enTitle,
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
      setMessage({ type: 'err', text: 'Gagal mengunggah gambar.' });
      return null;
    }
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

  async function handleDelete() {
    setDeleting(true);
    await deleteArticleAction(initialArticle.id);
    setDeleting(false);
    setConfirmDelete(false);
  }

  const statusIndex = PUBLISH_STEPS.indexOf(status);
  const activeEditor = editLang === 'id' ? editor : enEditor;
  const currentWordCount = editLang === 'id' ? wordCount : enWordCount;
  const currentReadingTime = editLang === 'id' ? readingTime : enReadingTime;

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-border bg-surface p-4 shadow-card md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/admin/articles" className="text-sm font-semibold text-text-muted hover:text-primary">
              ← Daftar artikel
            </Link>
            <StatusBadge status={status} />
            <span aria-live="polite" className="text-sm text-text-muted">
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
              className={buttonClassName('secondary')}
            >
              Pratinjau
            </Link>
            <Link
              href={`/admin/articles/${initialArticle.id}/preview?lang=en`}
              className={buttonClassName('secondary')}
            >
              Pratinjau EN
            </Link>
            {status === 'published' && (
              <>
                <Link
                  href={`/artikel/${slug}`}
                  target="_blank"
                  className={buttonClassName('secondary')}
                >
                  Lihat publik
                  <ExternalLink size={14} aria-hidden="true" />
                </Link>
                {enTitle.trim() && (
                  <Link
                    href={`/en/artikel/${slug}`}
                    target="_blank"
                    className={buttonClassName('secondary')}
                  >
                    Lihat EN
                    <ExternalLink size={14} aria-hidden="true" />
                  </Link>
                )}
              </>
            )}
            <Button variant="secondary" pending={saving} onClick={() => void performSave(status)}>
              {status === 'draft' ? 'Simpan draft' : 'Simpan perubahan'}
            </Button>
            {status !== 'in_review' && (
              <Button
                variant="secondary"
                disabled={saving}
                className="text-amber-800"
                onClick={() => void performSave('in_review')}
              >
                Ajukan review
              </Button>
            )}
            {status !== 'published' ? (
              <Button disabled={saving} onClick={() => void performSave('published')}>
                Terbitkan
              </Button>
            ) : (
              <Button variant="secondary" disabled={saving} onClick={() => void performSave('draft')}>
                Tarik ke draft
              </Button>
            )}
          </div>
        </div>

        <ol aria-label="Alur publikasi" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {PUBLISH_STEPS.map((step, i) => {
            const done = i < statusIndex;
            const current = i === statusIndex;
            return (
              <li key={step} className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    done
                      ? 'bg-emerald-500 text-white'
                      : current
                        ? 'bg-primary text-white'
                        : 'bg-bg-subtle text-text-muted'
                  }`}
                >
                  {i + 1}
                </span>
                <span className={current ? 'font-semibold text-text-heading' : 'text-text-muted'}>
                  {ARTICLE_STATUS_META[step].label}
                </span>
                {i < PUBLISH_STEPS.length - 1 && <span className="text-border">→</span>}
              </li>
            );
          })}
        </ol>
      </div>

      {message && <Alert tone={message.type === 'ok' ? 'success' : 'error'}>{message.text}</Alert>}

      {/* Tabs Bahasa */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setEditLang('id')}
          className={`border-b-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
            editLang === 'id'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-heading'
          }`}
        >
          Bahasa Indonesia
        </button>
        <button
          type="button"
          onClick={() => setEditLang('en')}
          className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
            editLang === 'en'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-heading'
          }`}
        >
          English (Versi Bahasa Inggris)
          {enTitle.trim() ? (
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
          ) : null}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Card>
            <div className="space-y-4">
              {editLang === 'id' ? (
                <>
                  <TextField
                    label="Judul artikel (Bahasa Indonesia)"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Contoh: Mengenal Polip Hidung: Gejala dan Penanganannya"
                  />

                  <TextAreaField
                    label="Ringkasan singkat (Bahasa Indonesia)"
                    hint={`${excerpt.length}/160 karakter (otomatis terisi bila dikosongkan)`}
                    rows={2}
                    value={excerpt}
                    onChange={(e) => {
                      setExcerpt(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Ringkasan 1-2 kalimat yang muncul di kartu artikel dan hasil pencarian Google..."
                  />
                </>
              ) : (
                <>
                  <TextField
                    label="Judul artikel (English)"
                    value={enTitle}
                    onChange={(e) => {
                      setEnTitle(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. Understanding Nasal Polyps: Symptoms and Management"
                    hint="Dikosongkan = artikel di /en menampilkan versi Bahasa Indonesia dengan badge 'Indonesian only'."
                  />

                  <TextAreaField
                    label="Ringkasan singkat (English)"
                    hint={`${enExcerpt.length}/160 karakter (otomatis terisi dari teks Inggris bila dikosongkan)`}
                    rows={2}
                    value={enExcerpt}
                    onChange={(e) => {
                      setEnExcerpt(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="1-2 sentence summary in English..."
                  />
                </>
              )}

              {/* Konfigurasi Bersama (Slug & Kategori) */}
              <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
                <div>
                  <TextField
                    label="Slug URL (/artikel/...)"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsDirty(true);
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-1.5"
                    onClick={() => {
                      if (title.trim()) {
                        setSlug(toSlug(title));
                        setIsDirty(true);
                      }
                    }}
                  >
                    Sinkronkan dari judul
                  </Button>
                </div>

                <SelectField
                  label="Kategori topik THT"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value as ArticleCategory);
                    setIsDirty(true);
                  }}
                >
                  {ARTICLE_CATEGORY_VALUES.map((cat) => (
                    <option key={cat} value={cat}>
                      {idDictionary.categories[cat]}
                    </option>
                  ))}
                </SelectField>
              </div>
            </div>
          </Card>

          <RichTextEditor
            editor={activeEditor}
            label={`artikel (${editLang === 'id' ? 'Indonesia' : 'English'})`}
            allowImages
            onUploadImage={handleUploadImage}
            fallbackAlt={
              editLang === 'id'
                ? title || 'Ilustrasi medis'
                : enTitle || title || 'Medical illustration'
            }
            footer={
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>
                    <strong className="font-semibold text-text-heading">{currentWordCount}</strong>{' '}
                    kata
                  </span>
                  <span>Estimasi ~{currentReadingTime} menit baca</span>
                  <span>
                    Gunakan <strong>H2 / H3</strong> untuk membentuk Daftar Isi otomatis
                  </span>
                </div>
                {status === 'draft' && <span>Autosave draft aktif (setiap 25 detik)</span>}
              </div>
            }
          />
        </div>

        <div className="space-y-6 lg:col-span-4">
          <Card title="Gambar sampul (cover)" description="Otomatis dikompresi ke format WebP oleh server.">
            {coverImageId ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-xl border border-border bg-bg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/media/${coverImageId}`}
                    alt={coverAlt || title}
                    className="aspect-[16/9] w-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    pending={uploadingCover}
                    onClick={() => coverImageInputRef.current?.click()}
                  >
                    Ganti sampul
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setCoverImageId(null);
                      setIsDirty(true);
                    }}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploadingCover}
                onClick={() => coverImageInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-strong px-4 py-6 text-sm font-semibold text-primary hover:border-primary hover:bg-primary-tint disabled:opacity-50"
              >
                <ImagePlus size={20} aria-hidden="true" />
                {uploadingCover ? 'Mengunggah & mengompresi...' : 'Unggah gambar sampul'}
              </button>
            )}

            <input
              ref={coverImageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              onChange={onCoverSelected}
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
            />

            <div className="mt-4 space-y-3">
              <TextField
                label="Alt text sampul (Bahasa Indonesia)"
                value={coverAlt}
                onChange={(e) => {
                  setCoverAlt(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Deskripsi gambar sampul..."
              />

              <TextField
                label="Alt text sampul (English)"
                value={enCoverAlt}
                onChange={(e) => {
                  setEnCoverAlt(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Cover image description in English..."
              />
            </div>
          </Card>

          <Card
            title="Catatan review kolaboratif"
            description="Gunakan untuk meninggalkan pesan atau poin revisi antar-akun sebelum artikel diterbitkan."
          >
            <TextAreaField
              label="Catatan review"
              rows={3}
              value={reviewNote}
              onChange={(e) => {
                setReviewNote(e.target.value);
                setIsDirty(true);
              }}
              placeholder="Contoh: Mohon dr. Yuliana cek bagian dosis obat semprot hidung..."
            />
          </Card>

          <Card title="Informasi artikel">
            <dl className="space-y-1.5 text-sm text-text-muted">
              <div className="flex justify-between">
                <dt>Penulis awal:</dt>
                <dd className="font-medium text-text-heading">{initialArticle.authorName}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Total dibaca:</dt>
                <dd className="font-medium text-text-heading">
                  {initialArticle.viewCount.toLocaleString('id-ID')} kali
                </dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-border pt-4">
              <Button variant="danger" className="w-full" onClick={() => setConfirmDelete(true)}>
                Hapus artikel ini
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Hapus artikel?"
        description={`Hapus permanen artikel "${title || slug}" beserta seluruh gambarnya? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus permanen"
        pending={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
