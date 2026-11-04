'use client';

import { useRef, useState, type ReactNode } from 'react';
import { EditorContent, useEditorState } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Table,
  Underline,
  Undo2,
} from 'lucide-react';
import { Button } from './Button';
import Dialog from './Dialog';
import { TextField } from './Field';

/** Kelas konten editor: tampilan menulis sama dengan tampilan publik. */
export const RICH_TEXT_EDITOR_CLASS =
  'prose prose-lg article-prose font-reading max-w-none min-h-[420px] p-5 focus:outline-none prose-headings:font-sans';

interface RichTextEditorProps {
  editor: Editor | null;
  label: string;
  allowImages: boolean;
  onUploadImage?: (file: File) => Promise<{ id: string; url: string } | null>;
  fallbackAlt?: string;
  footer?: ReactNode;
}

interface ToolbarButtonProps {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

function ToolbarButton({ label, onClick, active, disabled, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active === undefined ? undefined : active}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-lg disabled:opacity-50 ${
        active ? 'bg-primary text-white' : 'text-text-body hover:bg-primary-tint hover:text-primary'
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div aria-hidden="true" className="mx-1 h-6 w-px bg-border" />;
}

const ICON = { size: 18, 'aria-hidden': true } as const;

export default function RichTextEditor({
  editor,
  label,
  allowImages,
  onUploadImage,
  fallbackAlt = 'Ilustrasi medis',
  footer,
}: RichTextEditorProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: ed }) => ({
      bold: ed?.isActive('bold') ?? false,
      italic: ed?.isActive('italic') ?? false,
      underline: ed?.isActive('underline') ?? false,
      strike: ed?.isActive('strike') ?? false,
      h2: ed?.isActive('heading', { level: 2 }) ?? false,
      h3: ed?.isActive('heading', { level: 3 }) ?? false,
      bulletList: ed?.isActive('bulletList') ?? false,
      orderedList: ed?.isActive('orderedList') ?? false,
      blockquote: ed?.isActive('blockquote') ?? false,
      link: ed?.isActive('link') ?? false,
      inTable: ed?.isActive('table') ?? false,
    }),
  });

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkError, setLinkError] = useState<string | undefined>();

  const [pendingImage, setPendingImage] = useState<{ id: string; url: string } | null>(null);
  const [imageAlt, setImageAlt] = useState('');
  const [imageCaption, setImageCaption] = useState('');

  const chain = () => editor?.chain().focus();

  function openLinkDialog() {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    setLinkUrl(prev ?? 'https://');
    setLinkError(undefined);
    setLinkOpen(true);
  }

  function saveLink() {
    const url = linkUrl.trim();
    if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) {
      setLinkError('Gunakan URL yang diawali https:// atau /');
      return;
    }
    chain()?.extendMarkRange('link').setLink({ href: url }).run();
    setLinkOpen(false);
  }

  function removeLink() {
    chain()?.extendMarkRange('link').unsetLink().run();
    setLinkOpen(false);
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !onUploadImage) return;

    setUploading(true);
    try {
      const uploaded = await onUploadImage(file);
      if (uploaded) {
        setImageAlt('');
        setImageCaption('');
        setPendingImage(uploaded);
      }
    } finally {
      setUploading(false);
    }
  }

  /** Gambar sudah terunggah; batal tetap menyisipkannya dengan alt cadangan (GC artikel membersihkan bila tak terpakai). */
  function insertImage(withDetails: boolean) {
    if (!pendingImage) return;
    chain()
      ?.setImage({
        src: pendingImage.url,
        alt: (withDetails && imageAlt.trim()) || fallbackAlt,
        title: (withDetails && imageCaption.trim()) || undefined,
      })
      .run();
    setPendingImage(null);
  }

  const disabled = !editor;

  return (
    <div className="rounded-xl border border-border bg-surface focus-within:ring-2 focus-within:ring-primary/30">
      <div
        role="toolbar"
        aria-label={`Format ${label}`}
        className="sticky top-14 z-10 flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-border bg-surface p-2 lg:top-0"
      >
        <ToolbarButton label="Tebal" active={state?.bold} disabled={disabled} onClick={() => chain()?.toggleBold().run()}>
          <Bold {...ICON} />
        </ToolbarButton>
        <ToolbarButton label="Miring" active={state?.italic} disabled={disabled} onClick={() => chain()?.toggleItalic().run()}>
          <Italic {...ICON} />
        </ToolbarButton>
        <ToolbarButton label="Garis bawah" active={state?.underline} disabled={disabled} onClick={() => chain()?.toggleUnderline().run()}>
          <Underline {...ICON} />
        </ToolbarButton>
        <ToolbarButton label="Coret" active={state?.strike} disabled={disabled} onClick={() => chain()?.toggleStrike().run()}>
          <Strikethrough {...ICON} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton label="Subjudul H2" active={state?.h2} disabled={disabled} onClick={() => chain()?.toggleHeading({ level: 2 }).run()}>
          <Heading2 {...ICON} />
        </ToolbarButton>
        <ToolbarButton label="Subjudul H3" active={state?.h3} disabled={disabled} onClick={() => chain()?.toggleHeading({ level: 3 }).run()}>
          <Heading3 {...ICON} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton label="Daftar poin" active={state?.bulletList} disabled={disabled} onClick={() => chain()?.toggleBulletList().run()}>
          <List {...ICON} />
        </ToolbarButton>
        <ToolbarButton label="Daftar bernomor" active={state?.orderedList} disabled={disabled} onClick={() => chain()?.toggleOrderedList().run()}>
          <ListOrdered {...ICON} />
        </ToolbarButton>
        <ToolbarButton label="Kutipan" active={state?.blockquote} disabled={disabled} onClick={() => chain()?.toggleBlockquote().run()}>
          <Quote {...ICON} />
        </ToolbarButton>
        <ToolbarButton label="Garis pemisah" disabled={disabled} onClick={() => chain()?.setHorizontalRule().run()}>
          <Minus {...ICON} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton label="Tautan" active={state?.link} disabled={disabled} onClick={openLinkDialog}>
          <Link2 {...ICON} />
        </ToolbarButton>
        <ToolbarButton
          label="Sisipkan tabel"
          disabled={disabled}
          onClick={() => chain()?.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          <Table {...ICON} />
        </ToolbarButton>
        {allowImages && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              onChange={onFileSelected}
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
            />
            <ToolbarButton
              label={uploading ? 'Mengunggah gambar…' : 'Sisipkan gambar'}
              disabled={disabled || uploading}
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus {...ICON} />
            </ToolbarButton>
          </>
        )}

        <Divider />

        <ToolbarButton label="Urungkan" disabled={disabled} onClick={() => chain()?.undo().run()}>
          <Undo2 {...ICON} />
        </ToolbarButton>
        <ToolbarButton label="Ulangi" disabled={disabled} onClick={() => chain()?.redo().run()}>
          <Redo2 {...ICON} />
        </ToolbarButton>

        {state?.inTable && (
          <div
            role="group"
            aria-label="Aksi tabel"
            className="ml-2 flex flex-wrap items-center gap-1 rounded-lg border border-primary/20 bg-primary-tint px-1.5 py-1"
          >
            <Button size="sm" variant="ghost" onClick={() => chain()?.addRowAfter().run()}>
              +Baris
            </Button>
            <Button size="sm" variant="ghost" onClick={() => chain()?.deleteRow().run()}>
              −Baris
            </Button>
            <Button size="sm" variant="ghost" onClick={() => chain()?.addColumnAfter().run()}>
              +Kolom
            </Button>
            <Button size="sm" variant="ghost" onClick={() => chain()?.deleteColumn().run()}>
              −Kolom
            </Button>
            <Button size="sm" variant="ghost" className="text-red-700" onClick={() => chain()?.deleteTable().run()}>
              Hapus tabel
            </Button>
          </div>
        )}
      </div>

      <EditorContent editor={editor} />

      {footer && (
        <div className="rounded-b-xl border-t border-border bg-bg px-4 py-2.5 text-sm text-text-muted">{footer}</div>
      )}

      <Dialog
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        title="Tautan"
        description="Teks yang dipilih akan menjadi tautan ke alamat ini."
        footer={
          <>
            {state?.link && (
              <Button variant="ghost" onClick={removeLink} className="mr-auto">
                Hapus tautan
              </Button>
            )}
            <Button variant="secondary" onClick={() => setLinkOpen(false)}>
              Batal
            </Button>
            <Button onClick={saveLink}>Simpan</Button>
          </>
        }
      >
        <TextField
          label="URL"
          type="url"
          inputMode="url"
          value={linkUrl}
          error={linkError}
          onChange={(e) => {
            setLinkUrl(e.target.value);
            setLinkError(undefined);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              saveLink();
            }
          }}
        />
      </Dialog>

      <Dialog
        open={pendingImage !== null}
        onClose={() => insertImage(false)}
        title="Detail gambar"
        description="Gambar sudah diunggah. Lengkapi detail berikut agar mudah diakses."
        footer={
          <>
            <Button variant="secondary" onClick={() => insertImage(false)}>
              Batal
            </Button>
            <Button onClick={() => insertImage(true)}>Sisipkan</Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextField
            label="Teks alternatif"
            hint="Jelaskan isi gambar untuk pembaca layar."
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
          />
          <TextField
            label="Keterangan (opsional)"
            value={imageCaption}
            onChange={(e) => setImageCaption(e.target.value)}
          />
        </div>
      </Dialog>
    </div>
  );
}
