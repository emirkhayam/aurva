import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Code,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'rich-text-editor-content',
        style: 'min-height: 200px; padding: 12px; outline: none;',
      },
    },
  });

  // Sync external value changes (e.g. when editing a different news item)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL ссылки:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('URL изображения:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const toolbarButtons = [
    {
      icon: <Bold className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      title: 'Жирный',
    },
    {
      icon: <Italic className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      title: 'Курсив',
    },
    {
      icon: <Strikethrough className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
      title: 'Зачёркнутый',
    },
    {
      icon: <Code className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive('code'),
      title: 'Код',
    },
    { type: 'separator' as const },
    {
      icon: <Heading2 className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      title: 'Заголовок 2',
    },
    {
      icon: <Heading3 className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
      title: 'Заголовок 3',
    },
    { type: 'separator' as const },
    {
      icon: <List className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      title: 'Маркированный список',
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      title: 'Нумерованный список',
    },
    {
      icon: <Quote className="h-4 w-4" />,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      title: 'Цитата',
    },
    { type: 'separator' as const },
    {
      icon: <LinkIcon className="h-4 w-4" />,
      action: setLink,
      isActive: editor.isActive('link'),
      title: 'Ссылка',
    },
    {
      icon: <ImageIcon className="h-4 w-4" />,
      action: addImage,
      isActive: false,
      title: 'Изображение',
    },
    { type: 'separator' as const },
    {
      icon: <Undo className="h-4 w-4" />,
      action: () => editor.chain().focus().undo().run(),
      isActive: false,
      title: 'Отменить',
    },
    {
      icon: <Redo className="h-4 w-4" />,
      action: () => editor.chain().focus().redo().run(),
      isActive: false,
      title: 'Повторить',
    },
  ];

  return (
    <div className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] overflow-hidden">
      <style>{`
        .rich-text-editor-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem;
          color: rgb(var(--text));
        }
        .rich-text-editor-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.75rem 0 0.5rem;
          color: rgb(var(--text));
        }
        .rich-text-editor-content ul {
          list-style: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .rich-text-editor-content ol {
          list-style: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .rich-text-editor-content blockquote {
          border-left: 3px solid rgb(var(--accent));
          padding-left: 1rem;
          margin: 0.75rem 0;
          color: rgb(var(--text-muted));
          font-style: italic;
        }
        .rich-text-editor-content a {
          color: rgb(var(--accent));
          text-decoration: underline;
          cursor: pointer;
        }
        .rich-text-editor-content img {
          max-width: 100%;
          border-radius: 0.5rem;
          margin: 0.75rem 0;
        }
        .rich-text-editor-content code {
          background: rgb(var(--border) / 0.3);
          padding: 0.15rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        .rich-text-editor-content p {
          margin: 0.25rem 0;
        }
        .rich-text-editor-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: rgb(var(--text-muted));
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]">
        {toolbarButtons.map((btn, i) => {
          if ('type' in btn && btn.type === 'separator') {
            return (
              <div
                key={`sep-${i}`}
                className="w-px h-6 bg-[rgb(var(--border))] mx-1"
              />
            );
          }
          const { icon, action, isActive, title } = btn as {
            icon: React.ReactNode;
            action: () => void;
            isActive: boolean;
            title: string;
          };
          return (
            <Button
              key={title}
              type="button"
              variant="ghost"
              size="sm"
              onClick={action}
              title={title}
              className={`h-8 w-8 p-0 ${
                isActive
                  ? 'bg-[rgb(var(--accent)/0.1)] text-[rgb(var(--accent))]'
                  : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]'
              }`}
            >
              {icon}
            </Button>
          );
        })}
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        placeholder={placeholder}
        className="text-[rgb(var(--text))] text-sm"
      />
    </div>
  );
}
