import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Undo2,
  Redo2,
  Palette,
  Image as ImageIcon,
  X,
  Upload,
  Crop as CropIcon,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { api } from '../services/api';
import ResizableImage from '../extensions/ResizableImage';
import CropModal from './CropModal';
import { docToPlainText } from '../utils/editorUtils';

const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (el) => el.style.fontSize || null,
        renderHTML: (attrs) =>
          attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
      },
    };
  },
  addCommands() {
    return {
      setFontSize:
        (size) =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null }).run(),
    };
  },
});

const SIZES = ['12', '14', '16', '18', '20', '24', '32'];
const FAMILIES = [
  ['Inter, sans-serif', 'Inter'],
  ['Georgia, serif', 'Serif'],
  ['Courier New, monospace', 'Mono'],
  ['system-ui, sans-serif', 'System'],
];
const COLORS = ['#000000', '#7c3aed', '#2563eb', '#0891b2', '#059669', '#ea580c', '#dc2626', '#e11d48'];

function ToolButton({ active, onClick, label, disabled, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`rounded-md p-1.5 transition ${
        active
          ? 'bg-brand-500 text-white'
          : 'text-neutral-600 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700'
      } disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange }) {
  const [imagePanel, setImagePanel] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageBusy, setImageBusy] = useState(false);
  const [cropping, setCropping] = useState(false);
  const [cropSrc, setCropSrc] = useState('');
  const cropPos = useRef(null);
  const fileRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      FontFamily,
      ResizableImage.configure({ allowBase64: true }),
      FontSize,
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange?.(editor.getJSON()),
  });

  if (!editor) return null;

  const addImageByUrl = (e) => {
    e.preventDefault();
    const src = imageUrl.trim();
    if (!src) return;
    editor.chain().focus().setImage({ src }).run();
    setImageUrl('');
    setImagePanel(false);
  };

  const addImageFromFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      window.alert('Please choose an image under 5 MB.');
      e.target.value = '';
      return;
    }
    setImageBusy(true);
    try {
      // Real mode stores the file in Cloudinary; mock mode returns a data URL.
      const { url } = await api.uploadImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      setImagePanel(false);
    } catch (err) {
      window.alert(err.message || 'Image upload failed.');
    } finally {
      setImageBusy(false);
      e.target.value = '';
    }
  };

  const openCrop = () => {
    const attrs = editor.getAttributes('image');
    if (!attrs || !attrs.src) return;
    cropPos.current = editor.state.selection.$from.pos;
    setCropSrc(attrs.src);
    setCropping(true);
  };

  const applyCrop = async (dataUrl) => {
    setCropping(false);
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
      // Cropped images are stored in Cloudinary (real backend) like any upload.
      const { url } = await api.uploadImage(file);
      if (cropPos.current != null) {
        editor
          .chain()
          .focus()
          .setNodeSelection(cropPos.current)
          .updateAttributes('image', { src: url })
          .run();
      }
    } catch (err) {
      window.alert(err.message || 'Failed to save cropped image.');
    }
  };

  const isImageSelected = editor.isActive('image');

  const setLink = () => {
    const prev = editor.getAttributes('link')?.href || '';
    const url = window.prompt('Link URL', prev);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const currentSize = editor.getAttributes('textStyle').fontSize;
  const currentFont = editor.getAttributes('textStyle').fontFamily;
  const currentColor = editor.getAttributes('textStyle').color || '#000000';

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-neutral-200 px-2 py-1.5 dark:border-neutral-700">
        <ToolButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} label="Bold">
          <Bold className="h-4 w-4" />
        </ToolButton>
        <ToolButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} label="Italic">
          <Italic className="h-4 w-4" />
        </ToolButton>
        <ToolButton active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} label="Underline">
          <UnderlineIcon className="h-4 w-4" />
        </ToolButton>
        <ToolButton active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} label="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </ToolButton>

        <span className="mx-1 h-5 w-px bg-neutral-200 dark:bg-neutral-700" />

        <ToolButton active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} label="Heading 1">
          <Heading1 className="h-4 w-4" />
        </ToolButton>
        <ToolButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} label="Heading 2">
          <Heading2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} label="Heading 3">
          <Heading3 className="h-4 w-4" />
        </ToolButton>

        <span className="mx-1 h-5 w-px bg-neutral-200 dark:bg-neutral-700" />

        <ToolButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} label="Bulleted list">
          <List className="h-4 w-4" />
        </ToolButton>
        <ToolButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="Numbered list">
          <ListOrdered className="h-4 w-4" />
        </ToolButton>

        <span className="mx-1 h-5 w-px bg-neutral-200 dark:bg-neutral-700" />

        <ToolButton active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} label="Align left">
          <AlignLeft className="h-4 w-4" />
        </ToolButton>
        <ToolButton active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} label="Align center">
          <AlignCenter className="h-4 w-4" />
        </ToolButton>
        <ToolButton active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} label="Align right">
          <AlignRight className="h-4 w-4" />
        </ToolButton>

        <ToolButton onClick={setLink} label="Insert link">
          <Link2 className="h-4 w-4" />
        </ToolButton>

        <ToolButton
          active={imagePanel}
          onClick={() => setImagePanel((v) => !v)}
          label="Insert image"
        >
          <ImageIcon className="h-4 w-4" />
        </ToolButton>

        <ToolButton
          active={false}
          onClick={openCrop}
          disabled={!isImageSelected}
          label="Crop selected image"
        >
          <CropIcon className="h-4 w-4" />
        </ToolButton>

        {imagePanel && (
          <div className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-600 dark:bg-neutral-700">
            <form onSubmit={addImageByUrl} className="flex items-center gap-1.5">
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste image URL…"
                className="w-40 rounded border border-neutral-200 bg-white px-2 py-1 text-xs focus:border-brand-400 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              />
              <button type="submit" className="rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-neutral-200 dark:text-brand-400 dark:hover:bg-neutral-600">
                Add
              </button>
            </form>
            <span className="text-neutral-300 dark:text-neutral-500">|</span>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={imageBusy}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-200 disabled:opacity-60 dark:text-neutral-200 dark:hover:bg-neutral-600"
              title="Upload from device"
            >
              <Upload className="h-3.5 w-3.5" /> {imageBusy ? 'Uploading…' : 'Upload'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={addImageFromFile}
              className="hidden"
            />
            <button
              onClick={() => setImagePanel(false)}
              className="rounded p-1 text-neutral-400 hover:text-neutral-600"
              aria-label="Close image panel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <span className="mx-1 h-5 w-px bg-neutral-200 dark:bg-neutral-700" />

        <label className="relative flex items-center rounded-md p-1.5 text-neutral-600 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700" title="Text color">
          <input
            type="color"
            value={currentColor}
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Text color"
          />
          <Palette className="h-4 w-4" />
        </label>

        <select
          value={currentSize || '16'}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '16') editor.chain().focus().unsetFontSize().run();
            else editor.chain().focus().setFontSize(v + 'px').run();
          }}
          className="rounded-md border border-neutral-200 bg-transparent px-1.5 py-1 text-xs text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
          aria-label="Font size"
        >
          <option value="12">12</option>
          <option value="14">14</option>
          <option value="16">16</option>
          <option value="18">18</option>
          <option value="20">20</option>
          <option value="24">24</option>
          <option value="32">32</option>
        </select>

        <select
          value={currentFont || ''}
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
          className="rounded-md border border-neutral-200 bg-transparent px-1.5 py-1 text-xs text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
          aria-label="Font family"
        >
          <option value="">Font</option>
          {FAMILIES.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>

        <span className="mx-1 h-5 w-px bg-neutral-200 dark:bg-neutral-700" />

        <ToolButton label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 className="h-4 w-4" />
        </ToolButton>
      </div>

      <div className="px-4 py-3">
        <EditorContent editor={editor} />
      </div>

      {cropping && (
        <CropModal
          image={cropSrc}
          onCancel={() => setCropping(false)}
          onApply={applyCrop}
        />
      )}
    </div>
  );
}