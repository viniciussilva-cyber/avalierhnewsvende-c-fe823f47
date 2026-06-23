import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Smile,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const EMOJIS = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "😎", "🤩", "🥳", "😅",
  "😉", "🙂", "🤔", "😴", "😇", "🙌", "👏", "👍", "👎", "🙏",
  "💪", "🤝", "👋", "✌️", "🤞", "❤️", "🧡", "💛", "💚", "💙",
  "💜", "🔥", "✨", "⭐", "🌟", "💡", "🎉", "🎊", "🎯", "🚀",
  "📈", "📊", "📌", "📣", "📢", "✅", "❌", "⚠️", "💰", "🏆",
  "🥇", "🎁", "📅", "⏰", "💼", "🤑", "😃", "💯", "👀", "🫶",
];

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [showEmojis, setShowEmojis] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: { class: "inline-block rounded-lg max-w-full h-auto my-3 align-middle" },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "tiptap prose prose-invert max-w-none min-h-[280px] px-4 py-3 focus:outline-none",
        "data-placeholder": "Escreva o conteúdo da newsletter…",
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        const images = Array.from(items).filter((item) => item.type.startsWith("image/"));
        if (images.length === 0) return false;
        event.preventDefault();
        images.forEach((item) => {
          const file = item.getAsFile();
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            const src = reader.result as string;
            editor?.chain().focus().setImage({ src }).run();
          };
          reader.readAsDataURL(file);
        });
        return true;
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;
        const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
        if (images.length === 0) return false;
        event.preventDefault();
        images.forEach((file) => {
          const reader = new FileReader();
          reader.onload = () => {
            const src = reader.result as string;
            editor?.chain().focus().setImage({ src }).run();
          };
          reader.readAsDataURL(file);
        });
        return true;
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });


  // Keep editor in sync when loading an existing edition into the form.
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  // Close emoji picker on outside click.
  useEffect(() => {
    if (!showEmojis) return;
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojis(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmojis]);

  if (!editor) return null;

  const Btn = ({
    active,
    onClick,
    label,
    children,
  }: {
    active?: boolean;
    onClick: () => void;
    label: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
        active && "bg-primary/15 text-primary"
      )}
    >
      {children}
    </button>
  );

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL do link:", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        editor.chain().focus().setImage({ src }).run();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const insertEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run();
    setShowEmojis(false);
  };


  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-header/60 p-1">
        <Btn label="Negrito" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </Btn>
        <Btn label="Itálico" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </Btn>
        <span className="mx-1 h-5 w-px bg-border" />
        <Btn label="Título" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </Btn>
        <Btn label="Subtítulo" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-4 w-4" />
        </Btn>
        <span className="mx-1 h-5 w-px bg-border" />
        <Btn label="Alinhar à esquerda" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="h-4 w-4" />
        </Btn>
        <Btn label="Centralizar" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="h-4 w-4" />
        </Btn>
        <Btn label="Alinhar à direita" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="h-4 w-4" />
        </Btn>
        <span className="mx-1 h-5 w-px bg-border" />
        <Btn label="Lista" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </Btn>
        <Btn label="Lista numerada" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </Btn>
        <Btn label="Citação" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </Btn>
        <Btn label="Link" active={editor.isActive("link")} onClick={setLink}>
          <LinkIcon className="h-4 w-4" />
        </Btn>
        <Btn label="Imagem" onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </Btn>
        <div className="relative" ref={emojiRef}>
          <Btn label="Emoji" active={showEmojis} onClick={() => setShowEmojis((s) => !s)}>
            <Smile className="h-4 w-4" />
          </Btn>
          {showEmojis && (
            <div className="absolute left-0 top-full z-20 mt-1 grid w-64 grid-cols-8 gap-0.5 rounded-lg border border-border bg-card p-2 shadow-lg">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="rounded-md p-1 text-lg leading-none transition-colors hover:bg-secondary"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="mx-1 h-5 w-px bg-border" />
        <Btn label="Desfazer" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-4 w-4" />
        </Btn>
        <Btn label="Refazer" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-4 w-4" />
        </Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
