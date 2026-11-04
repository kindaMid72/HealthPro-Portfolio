'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { JSONContent } from '@tiptap/core';
import { useEditor } from '@tiptap/react';
import Alert from '@/components/admin/Alert';
import { Button, buttonClassName } from '@/components/admin/Button';
import Card from '@/components/admin/Card';
import { SelectField, TextAreaField, TextField } from '@/components/admin/Field';
import PageHeader from '@/components/admin/PageHeader';
import RichTextEditor, { RICH_TEXT_EDITOR_CLASS } from '@/components/admin/RichTextEditor';
import { toSlug } from '@/lib/slug';
import { countWords, getServiceTiptapExtensions } from '@/lib/tiptap';
import { ARTICLE_CATEGORIES, ARTICLE_CATEGORY_VALUES, type ArticleCategory } from '@/lib/types';
import { saveServiceAction } from '../../../services/actions';

export interface EditableService {
  id: string;
  serviceName: string;
  slug: string;
  serviceDescription: string;
  category: ArticleCategory | null;
  content: JSONContent;
}

export default function ServiceEditor({ initialService }: { initialService: EditableService }) {
  const [serviceName, setServiceName] = useState(initialService.serviceName);
  const [slug, setSlug] = useState(initialService.slug);
  const [serviceDescription, setServiceDescription] = useState(initialService.serviceDescription);
  const [category, setCategory] = useState<ArticleCategory | ''>(initialService.category ?? '');
  const [isDirty, setIsDirty] = useState(false);
  // Naik tiap ada suntingan; simpan hanya menghapus status "kotor" bila tak ada suntingan selama request.
  const revision = useRef(0);
  const markDirty = () => {
    revision.current += 1;
    setIsDirty(true);
  };
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [savedSlug, setSavedSlug] = useState(initialService.slug);
  const [savedHasContent, setSavedHasContent] = useState(countWords(initialService.content) > 0);

  const editor = useEditor({
    extensions: getServiceTiptapExtensions(),
    content: initialService.content,
    immediatelyRender: false,
    editorProps: { attributes: { class: RICH_TEXT_EDITOR_CLASS } },
    onUpdate: () => markDirty(),
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

  async function handleSave() {
    if (!editor) return;
    setSaving(true);
    setMessage(null);
    const revisionAtSave = revision.current;

    // attrs ProseMirror berprototipe null; salin ke plain object sebelum dikirim ke server action.
    const content = JSON.parse(JSON.stringify(editor.getJSON())) as JSONContent;
    const res = await saveServiceAction({
      id: initialService.id,
      serviceName,
      slug,
      serviceDescription,
      category: category || null,
      content,
    });
    setSaving(false);

    if (!res.success || !res.slug) {
      setMessage({ type: 'err', text: res.error ?? 'Gagal menyimpan layanan.' });
      return;
    }

    const adjusted = res.slug !== (toSlug(slug.trim()) || toSlug(serviceName));
    setSlug(res.slug);
    setSavedSlug(res.slug);
    setSavedHasContent(countWords(content) > 0);
    if (revision.current === revisionAtSave) setIsDirty(false);
    setMessage({
      type: 'ok',
      text: `Layanan disimpan.${adjusted ? ` Slug disesuaikan menjadi ${res.slug}.` : ''}`,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit layanan"
        description="Konten detail membuat halaman /layanan/slug muncul di website."
        actions={
          <>
            <Link href="/admin/services" className={buttonClassName('ghost')}>
              ← Daftar layanan
            </Link>
            {savedHasContent && (
              <Link href={`/layanan/${savedSlug}`} target="_blank" className={buttonClassName('secondary')}>
                Lihat halaman publik
              </Link>
            )}
            <Button pending={saving} onClick={() => void handleSave()}>
              Simpan layanan
            </Button>
          </>
        }
      />

      {message && <Alert tone={message.type === 'ok' ? 'success' : 'error'}>{message.text}</Alert>}

      <Card>
        <div className="space-y-4">
          <TextField
            label="Nama layanan"
            required
            value={serviceName}
            onChange={(e) => {
              setServiceName(e.target.value);
              markDirty();
            }}
          />

          <div>
            <TextField
              label="Slug URL"
              hint={`/layanan/${slug || '…'}`}
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                markDirty();
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              className="mt-1.5"
              onClick={() => {
                if (serviceName.trim()) {
                  setSlug(toSlug(serviceName));
                  markDirty();
                }
              }}
            >
              Buat dari nama
            </Button>
          </div>

          <TextAreaField
            label="Deskripsi singkat"
            hint="Tampil di kartu layanan beranda. Minimal 20 karakter agar ditampilkan."
            rows={2}
            value={serviceDescription}
            onChange={(e) => {
              setServiceDescription(e.target.value);
              markDirty();
            }}
          />

          <SelectField
            label="Topik artikel terkait"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as ArticleCategory | '');
              markDirty();
            }}
          >
            <option value="">Tidak ada</option>
            {ARTICLE_CATEGORY_VALUES.map((cat) => (
              <option key={cat} value={cat}>
                {ARTICLE_CATEGORIES[cat]}
              </option>
            ))}
          </SelectField>
        </div>
      </Card>

      <RichTextEditor
        editor={editor}
        label="layanan"
        allowImages={false}
        footer={`Halaman /layanan/${slug || '…'} hanya tampil di website bila konten ini diisi.`}
      />
    </div>
  );
}
