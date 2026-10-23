'use client';

/**
 * app/admin/(panel)/articles/[id]/ArticleEditor.tsx — Client component untuk editor artikel Tiptap.
 */

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import type { JSONContent } from '@tiptap/core';
import type { ArticleStatus } from '@/lib/articles';
import {
  saveArticleAction,
  deleteArticleAction,
  type SaveArticleInput,
} from '@/app/admin/articles/actions';

interface ArticleEditorProps {
  initialArticle: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    coverImageId: string | null;
    coverAlt: string;
    content: JSONContent;
    status: ArticleStatus;
    reviewNote: string;
    publishedAt: Date | null;
    updatedAt: Date | string;
  };
}

export function ArticleEditor({ initialArticle }: ArticleEditorProps) {
  const [title, setTitle] = useState(initialArticle.title);
  const [slug, setSlug] = useState(initialArticle.slug);
  const [excerpt, setExcerpt] = useState(initialArticle.excerpt);
  const [coverImageId, setCoverImageId] = useState<string | null>(initialArticle.coverImageId);
  const [coverAlt, setCoverAlt] = useState(initialArticle.coverAlt);
  const [status, setStatus] = useState<ArticleStatus>(initialArticle.status);
  const [reviewNote, setReviewNote] = useState(initialArticle.reviewNote);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>(
    new Date(initialArticle.updatedAt).toISOString()
  );
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingInline, setIsUploadingInline] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      ImageExtension.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    content: initialArticle.content,
    editorProps: {
      attributes: {
        class:
          'prose prose-primary max-w-none min-h-[360px] p-4 focus:outline-none border border-gray-200 rounded-b-lg bg-white',
      },
    },
    immediatelyRender: false,
  });

  const handleSave = (targetStatus?: ArticleStatus) => {
    if (!editor) return;
    setFeedback(null);

    const nextStatus = targetStatus ?? status;
    const input: SaveArticleInput = {
      id: initialArticle.id,
      title,
      slug,
      excerpt,
      coverImageId,
      coverAlt,
      content: editor.getJSON(),
      status: nextStatus,
      reviewNote,
      expectedUpdatedAt: lastUpdatedAt,
    };

    startTransition(async () => {
      const res = await saveArticleAction(input);
      if (res.success && res.saved) {
        setStatus(res.saved.status as ArticleStatus);
        setSlug(res.saved.slug);
        if (res.saved.updatedAt) {
          setLastUpdatedAt(new Date(res.saved.updatedAt).toISOString());
        }
        setFeedback({
          type: 'success',
          message:
            targetStatus === 'published'
              ? 'Artikel berhasil diterbitkan!'
              : targetStatus === 'in_review'
                ? 'Artikel diajukan untuk review.'
                : 'Perubahan berhasil disimpan.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Gagal menyimpan perubahan.',
        });
      }
    });
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('articleId', initialArticle.id);

      const res = await fetch('/api/admin/images', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Gagal mengunggah cover');
      }

      const data = await res.json();
      setCoverImageId(data.id);
      setFeedback({ type: 'success', message: 'Cover gambar berhasil diunggah.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal upload gambar';
      setFeedback({ type: 'error', message });
    } finally {
      setIsUploadingCover(false);
      e.target.value = '';
    }
  };

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setIsUploadingInline(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('articleId', initialArticle.id);

      const res = await fetch('/api/admin/images', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Gagal mengunggah gambar');
      }

      const data = await res.json();
      editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyisipkan gambar';
      setFeedback({ type: 'error', message });
    } finally {
      setIsUploadingInline(false);
      e.target.value = '';
    }
  };

  const handleDelete = () => {
    if (confirm('Yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan.')) {
      startTransition(async () => {
        await deleteArticleAction(initialArticle.id);
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Bar atas navigasi & aksi */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            ← Kembali ke Daftar Artikel
          </Link>
          <span className="text-xs font-semibold text-gray-400">•</span>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            Status: {status}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/articles/${initialArticle.id}/preview`}
            target="_blank"
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Lihat Preview ↗
          </Link>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSave()}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {status === 'published' ? 'Simpan Perubahan' : 'Simpan Draft'}
          </button>

          {status !== 'in_review' && status !== 'published' && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSave('in_review')}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              Ajukan Review
            </button>
          )}

          {status !== 'published' && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSave('published')}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              Terbitkan
            </button>
          )}

          {status === 'published' && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSave('draft')}
              className="rounded-lg bg-gray-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              Tarik ke Draft
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          role="alert"
          className={`rounded-lg p-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Form Metadata */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600">
              Judul Artikel
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Gejala dan Penanganan Sinusitis Akut"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-base font-medium shadow-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600">
              Slug URL
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="penanganan-sinusitis-akut"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-mono text-gray-700 shadow-sm focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              URL publik: /artikel/{slug || '[slug]'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600">
              Ringkasan (Excerpt)
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="1-2 kalimat pengantar untuk kartu artikel dan ringkasan SEO..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* Editor Konten Tiptap */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
              Isi Konten Artikel
            </label>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-gray-200 bg-gray-50 p-2 text-xs">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`rounded px-2 py-1 font-bold ${
                  editor?.isActive('bold') ? 'bg-gray-300 text-black' : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                B
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`rounded px-2 py-1 italic ${
                  editor?.isActive('italic') ? 'bg-gray-300 text-black' : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                I
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`rounded px-2 py-1 font-semibold ${
                  editor?.isActive('heading', { level: 2 })
                    ? 'bg-gray-300 text-black'
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`rounded px-2 py-1 font-semibold ${
                  editor?.isActive('heading', { level: 3 })
                    ? 'bg-gray-300 text-black'
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                H3
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`rounded px-2 py-1 ${
                  editor?.isActive('bulletList')
                    ? 'bg-gray-300 text-black'
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                • List
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={`rounded px-2 py-1 ${
                  editor?.isActive('orderedList')
                    ? 'bg-gray-300 text-black'
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                1. List
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className={`rounded px-2 py-1 ${
                  editor?.isActive('blockquote')
                    ? 'bg-gray-300 text-black'
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                Quote
              </button>
              <span className="text-gray-300">|</span>
              <label className="cursor-pointer rounded px-2 py-1 hover:bg-gray-200 text-gray-700">
                {isUploadingInline ? 'Mengunggah...' : '+ Sisipkan Gambar'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleInlineImageUpload}
                  disabled={isUploadingInline}
                  className="hidden"
                />
              </label>
            </div>

            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Kolom Samping: Cover Image & Review Note */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase text-gray-600">
              Cover Gambar Artikel
            </h3>

            {coverImageId ? (
              <div className="mt-3 space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/media/${coverImageId}`}
                  alt={coverAlt || 'Cover artikel'}
                  className="h-40 w-full rounded-md object-cover border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setCoverImageId(null)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Hapus cover
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 text-center hover:bg-gray-50">
                  <span className="text-xs text-gray-500">
                    {isUploadingCover ? 'Mengompresi & mengunggah...' : '+ Unggah Cover'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={isUploadingCover}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            <div className="mt-3">
              <label className="block text-xs text-gray-600">
                Alt Text Gambar Cover
              </label>
              <input
                type="text"
                value={coverAlt}
                onChange={(e) => setCoverAlt(e.target.value)}
                placeholder="Deskripsi singkat gambar untuk aksesibilitas"
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs shadow-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase text-gray-600">
              Catatan Review
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Catatan internal perbaikan sebelum artikel disetujui untuk terbit.
            </p>
            <textarea
              rows={3}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Misal: Perlu tambahan penjelasan tentang dosis obat..."
              className="mt-2 w-full rounded border border-gray-300 px-2 py-1 text-xs shadow-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <h3 className="text-xs font-semibold uppercase text-red-800">
              Hapus Artikel
            </h3>
            <p className="mt-1 text-xs text-red-700">
              Menghapus artikel ini dari sistem secara permanen.
            </p>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="mt-3 rounded border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              Hapus Artikel Ini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
