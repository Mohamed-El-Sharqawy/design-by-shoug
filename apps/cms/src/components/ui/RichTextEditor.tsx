import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useState } from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading2,
  Heading3,
  Undo2,
  Redo2,
  Quote,
  Minus,
  Code,
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  dir?: 'ltr' | 'rtl'
  className?: string
}

function ToolbarButton({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean
  onClick: () => void
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${active
          ? 'bg-slate-900 text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
    >
      {children}
    </button>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  dir,
  className = '',
}: RichTextEditorProps) {
  const [sourceMode, setSourceMode] = useState(false)
  const [sourceValue, setSourceValue] = useState(value || '')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder || '',
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2',
      },
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (!editor) return
    if (editor.isDestroyed) return
    if (sourceMode) return
    const currentHTML = editor.getHTML()
    if (value !== currentHTML) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [value, editor, sourceMode])

  useEffect(() => {
    setSourceValue(value || '')
  }, [value])

  const toggleSourceMode = () => {
    if (sourceMode) {
      setSourceMode(false)
      if (editor && !editor.isDestroyed) {
        editor.commands.setContent(sourceValue || '', { emitUpdate: false })
        onChange(sourceValue)
      }
    } else {
      setSourceValue(editor?.getHTML() || value || '')
      setSourceMode(true)
    }
  }

  if (!editor) return null

  return (
    <div className={`border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent ${className}`}>
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50">
        {!sourceMode && (
          <>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive('underline')}
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive('strike')}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              title="Ordered List"
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              title="Blockquote"
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Horizontal Rule"
            >
              <Minus className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              active={editor.isActive({ textAlign: 'left' })}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              active={editor.isActive({ textAlign: 'center' })}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              active={editor.isActive({ textAlign: 'right' })}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </ToolbarButton>
          </>
        )}

        <div className={`${!sourceMode ? 'w-px h-5 bg-slate-200 mx-1' : ''}`} />

        <ToolbarButton
          onClick={toggleSourceMode}
          active={sourceMode}
          title={sourceMode ? 'Visual Editor' : 'Source Code'}
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {sourceMode ? (
        <textarea
          value={sourceValue}
          onChange={(e) => {
            setSourceValue(e.target.value)
            onChange(e.target.value)
          }}
          dir={dir}
          className="w-full min-h-[120px] px-3 py-2 font-mono text-sm text-slate-800 bg-slate-50 focus:outline-none resize-y"
          placeholder={placeholder}
          spellCheck={false}
        />
      ) : (
        <EditorContent editor={editor} dir={dir} />
      )}
    </div>
  )
}
