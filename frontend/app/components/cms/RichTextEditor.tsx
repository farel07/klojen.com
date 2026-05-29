'use client';

import { useState, useRef } from 'react';
import { Bold, Italic, List, ListOrdered, Heading2, Heading3, Link2, ImageIcon, AlignLeft, AlignCenter, Quote, Code } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

type FormatCommand =
  | 'bold'
  | 'italic'
  | 'insertUnorderedList'
  | 'insertOrderedList'
  | 'justifyLeft'
  | 'justifyCenter'
  | 'formatBlock'
  | 'createLink';

interface ToolbarButton {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  command: FormatCommand;
  value?: string;
}

const TOOLBAR_BUTTONS: ToolbarButton[] = [
  { id: 'bold', label: 'Tebal', icon: Bold, command: 'bold' },
  { id: 'italic', label: 'Miring', icon: Italic, command: 'italic' },
  { id: 'h2', label: 'Heading 2', icon: Heading2, command: 'formatBlock', value: 'h2' },
  { id: 'h3', label: 'Heading 3', icon: Heading3, command: 'formatBlock', value: 'h3' },
  { id: 'ul', label: 'Daftar Poin', icon: List, command: 'insertUnorderedList' },
  { id: 'ol', label: 'Daftar Nomor', icon: ListOrdered, command: 'insertOrderedList' },
  { id: 'alignLeft', label: 'Rata Kiri', icon: AlignLeft, command: 'justifyLeft' },
  { id: 'alignCenter', label: 'Rata Tengah', icon: AlignCenter, command: 'justifyCenter' },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Mulai tulis konten berita di sini...',
  minHeight = 400,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  const execCommand = (command: FormatCommand, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    const active = new Set<string>();
    if (document.queryCommandState('bold')) active.add('bold');
    if (document.queryCommandState('italic')) active.add('italic');
    if (document.queryCommandState('insertUnorderedList')) active.add('ul');
    if (document.queryCommandState('insertOrderedList')) active.add('ol');
    setActiveFormats(active);
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      updateActiveFormats();
    }
  };

  const handleLinkInsert = () => {
    const url = window.prompt('Masukkan URL:');
    if (url) execCommand('createLink', url);
  };

  const handleQuote = () => {
    execCommand('formatBlock', 'blockquote');
  };

  return (
    <div
      className={`
        border rounded-2xl overflow-hidden transition-all duration-200
        ${isFocused ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'}
      `}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2.5 bg-gray-50 border-b border-gray-100">
        {TOOLBAR_BUTTONS.map((btn) => {
          const Icon = btn.icon;
          const isActive = activeFormats.has(btn.id);
          return (
            <button
              key={btn.id}
              id={`rte-${btn.id}`}
              type="button"
              title={btn.label}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent focus loss
                execCommand(btn.command, btn.value);
              }}
              className={`
                p-2 rounded-lg transition-colors duration-150
                ${isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'
                }
              `}
            >
              <Icon size={16} />
            </button>
          );
        })}

        {/* Separator */}
        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Link */}
        <button
          id="rte-link"
          type="button"
          title="Sisipkan Link"
          onMouseDown={(e) => { e.preventDefault(); handleLinkInsert(); }}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
        >
          <Link2 size={16} />
        </button>

        {/* Blockquote */}
        <button
          id="rte-quote"
          type="button"
          title="Kutipan"
          onMouseDown={(e) => { e.preventDefault(); handleQuote(); }}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
        >
          <Quote size={16} />
        </button>

        {/* Code */}
        <button
          id="rte-code"
          type="button"
          title="Kode"
          onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', 'pre'); }}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
        >
          <Code size={16} />
        </button>
      </div>

      {/* Editable Area */}
      <div className="relative bg-white">
        {/* Placeholder */}
        {!value && !isFocused && (
          <div
            className="absolute top-4 left-5 text-gray-400 text-sm pointer-events-none select-none"
          >
            {placeholder}
          </div>
        )}

        <div
          ref={editorRef}
          id="rte-content"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          dangerouslySetInnerHTML={{ __html: value }}
          style={{ minHeight }}
          className="
            px-5 py-4 outline-none text-gray-800 text-sm leading-relaxed
            [&>h2]:text-xl [&>h2]:font-bold [&>h2]:my-3 [&>h2]:text-gray-900
            [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:my-2 [&>h3]:text-gray-800
            [&>p]:my-2
            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:my-2
            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:my-2
            [&>blockquote]:border-l-4 [&>blockquote]:border-blue-400
            [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-500
            [&>blockquote]:my-3
            [&>pre]:bg-gray-900 [&>pre]:text-green-400 [&>pre]:p-4
            [&>pre]:rounded-xl [&>pre]:text-xs [&>pre]:font-mono [&>pre]:my-3
            [&>a]:text-blue-600 [&>a]:underline
          "
        />
      </div>

      {/* Footer: char count */}
      <div className="px-5 py-2 bg-gray-50 border-t border-gray-100 flex justify-end">
        <span className="text-xs text-gray-400">
          {value.replace(/<[^>]+>/g, '').length} karakter
        </span>
      </div>
    </div>
  );
}
