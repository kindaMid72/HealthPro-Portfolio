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
import { id as idDictionary } from '@/i18n/dictionaries/id';
import { toSlug } from '@/lib/slug';
import { countWords, EMPTY_TIPTAP_DOC, getServiceTiptapExtensions } from '@/lib/tiptap';
import { ARTICLE_CATEGORY_VALUES, type ArticleCategory } from '@/lib/types';
import { saveServiceAction } from '../../../services/actions';

export interface EditableService {
  id: string;
  serviceName: string;
  slug: string;
  serviceDescription: string;
  category: ArticleCategory | null;
  content: JSONContent;
  en?: {
    serviceName: string;
    serviceDescription: string;
    content: JSONContent;
  };
}

export default function ServiceEditor({ initialService }: { initialService: EditableService }) {
  const [editLang, setEditLang] = useState<'id' | 'en'>('id');
  const [serviceName, setServiceName] = useState(initialService.serviceName);
  const [slug, setSlug] = useState(initialService.slug);
  const [serviceDescription, setServiceDescription] = useState(initialService.serviceDescription);
  const [category, setCategory] = useState<ArticleCategory | ''>(initialService.category ?? '');

  const [enServiceName, setEnServiceName] = useState(initialService.en?.serviceName ?? '');
  const [enServiceDescription, setEnServiceDescription] = useState(
    initialService.en?.serviceDescription ?? '',
  );

  const [isDirty, setIsDirty] = useState(false);
  const revision = useRef(0);
  const markDirty = () => {
    revision.current += 1;
    setIsDirty(true);
  };

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [savedSlug, setSavedSlug] = useState(initialService.slug);
  const [savedHasContent, setSavedHasContent] = useState(countWords(initialService.content) > 0);
  const [savedHasEnContent, setSavedHasEnContent] = useState(
    Boolean(
      initialService.en?.serviceName?.trim() &&
        countWords(initialService.en?.content) > 0,
    ),
  );

  const idEditor = useEditor({
    extensions: getServiceTiptapExtensions(),
    content: initialService.content,
    immediatelyRender: false,
    editorProps: { attributes: { class: RICH_TEXT_EDITOR_CLASS } },
    onUpdate: () => markDirty(),
  });

  const enEditor = useEditor({
    extensions: getServiceTiptapExtensions(),
    content: initialService.en?.content ?? EMPTY_TIPTAP_DOC,
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
    if (!idEditor || !enEditor) return;
    setSaving(true);
    setMessage(null);
    const revisionAtSave = revision.current;

    const content = JSON.parse(JSON.stringify(idEditor.getJSON())) as JSONContent;
    const enContent = JSON.parse(JSON.stringify(enEditor.getJSON())) as JSONContent;

    const res = await saveServiceAction({
      id: initialService.id,
      serviceName,
      slug,
      serviceDescription,
      category: category || null,
      content,
      en: {
        serviceName: enServiceName,
        serviceDescription: enServiceDescription,
        content: enContent,
      },
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
    setSavedHasEnContent(Boolean(enServiceName.trim() && countWords(enContent) > 0));

    if (revision.current === revisionAtSave) setIsDirty(false);
    setMessage({
      type: 'ok',
      text: `Layanan disimpan.${adjusted ? ` Slug disesuaikan menjadi ${res.slug}.` : ''}`,
    });
  }

  const activeEditor = editLang === 'id' ? idEditor : enEditor;

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
                Lihat halaman publik (ID)
              </Link>
            )}
            {savedHasEnContent && (
              <Link href={`/en/layanan/${savedSlug}`} target="_blank" className={buttonClassName('secondary')}>
                Lihat halaman publik (EN)
              </Link>
            )}
            <Button pending={saving} onClick={() => void handleSave()}>
              Simpan layanan
            </Button>
          </>
        }
      />

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
          {enServiceName.trim() ? (
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
          ) : null}
        </button>
      </div>

      <Card>
        <div className="space-y-4">
          {editLang === 'id' ? (
            <>
              <TextField
                label="Nama layanan (Bahasa Indonesia)"
                required
                value={serviceName}
                onChange={(e) => {
                  setServiceName(e.target.value);
                  markDirty();
                }}
              />

              <TextAreaField
                label="Deskripsi singkat (Bahasa Indonesia)"
                hint="Tampil di kartu layanan beranda. Minimal 20 karakter agar ditampilkan."
                rows={2}
                value={serviceDescription}
                onChange={(e) => {
                  setServiceDescription(e.target.value);
                  markDirty();
                }}
              />
            </>
          ) : (
            <>
              <TextField
                label="Nama layanan (English)"
                placeholder="e.g. Ear Examination & Cleaning"
                value={enServiceName}
                onChange={(e) => {
                  setEnServiceName(e.target.value);
                  markDirty();
                }}
                hint="Dikosongkan = memakai nama Bahasa Indonesia di /en."
              />

              <TextAreaField
                label="Deskripsi singkat (English)"
                placeholder="Brief clinical description in English..."
                rows={2}
                value={enServiceDescription}
                onChange={(e) => {
                  setEnServiceDescription(e.target.value);
                  markDirty();
                }}
                hint="Dikosongkan = memakai deskripsi Bahasa Indonesia di /en."
              />
            </>
          )}

          {/* Konfigurasi Bersama (Slug & Kategori) */}
          <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <div>
              <TextField
                label="Slug URL (Bersama)"
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
                  {idDictionary.categories[cat]}
                </option>
              ))}
            </SelectField>
          </div>
        </div>
      </Card>

      <RichTextEditor
        editor={activeEditor}
        label={`layanan (${editLang === 'id' ? 'Indonesia' : 'English'})`}
        allowImages={false}
        footer={
          editLang === 'id'
            ? `Halaman /layanan/${slug || '…'} hanya tampil di website bila konten ini diisi.`
            : `Halaman /en/layanan/${slug || '…'} akan menampilkan versi terjemahan jika judul dan konten ini terisi.`
        }
      />
    </div>
  );
}
