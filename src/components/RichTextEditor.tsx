import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Extension, mergeAttributes } from "@tiptap/core";
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
  Minus,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { importEditorImageFromUrl, uploadEditorImage } from "@/lib/storage";
import { toast } from "sonner";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

// Adds a `fontSize` attribute to the textStyle mark so text can be resized.
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.fontSize || null,
            renderHTML: (attributes: { fontSize?: string | null }) =>
              attributes.fontSize ? { style: `font-size: ${attributes.fontSize}` } : {},
          },
        },
      },
    ];
  },
});

// Extends Image so each image can carry a width and a placement (align).
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.style.width || element.getAttribute("width") || null,
      },
      align: {
        default: "block",
        parseHTML: (element: HTMLElement) => element.getAttribute("data-align") || "block",
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const { width, align, ...rest } = HTMLAttributes as Record<string, unknown>;
    let style = "max-width: 100%; height: auto;";
    if (width) style += ` width: ${width};`;
    switch (align) {
      case "left":
        style += " float: left; margin: 0.25rem 1.25rem 0.75rem 0;";
        break;
      case "right":
        style += " float: right; margin: 0.25rem 0 0.75rem 1.25rem;";
        break;
      case "center":
        style += " display: block; margin: 0.75rem auto;";
        break;
      case "inline":
        style += " display: inline-block; vertical-align: middle; margin: 0 0.35rem;";
        break;
      default:
        style += " display: block; margin: 0.75rem 0;";
    }
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, rest, {
        "data-align": align as string,
        style,
      }),
    ];
  },
});

const EMOJIS = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "😎", "🤩", "🥳", "😅",
  "😉", "🙂", "🤔", "😴", "😇", "🙌", "👏", "👍", "👎", "🙏",
  "💪", "🤝", "👋", "✌️", "🤞", "❤️", "🧡", "💛", "💚", "💙",
  "💜", "🔥", "✨", "⭐", "🌟", "💡", "🎉", "🎊", "🎯", "🚀",
  "📈", "📊", "📌", "📣", "📢", "✅", "❌", "⚠️", "💰", "🏆",
  "🥇", "🎁", "📅", "⏰", "💼", "🤑", "😃", "💯", "👀", "🫶",
];

const FONT_SIZES = [
  { label: "Pequeno", value: "13px" },
  { label: "Normal", value: "16px" },
  { label: "Médio", value: "20px" },
  { label: "Grande", value: "26px" },
  { label: "Enorme", value: "34px" },
];

const IMAGE_SIZES = [
  { label: "25%", value: "25%" },
  { label: "50%", value: "50%" },
  { label: "75%", value: "75%" },
  { label: "100%", value: "100%" },
];

const IMAGE_ALIGNS = [
  { label: "Esquerda (texto ao lado)", value: "left" },
  { label: "Centro", value: "center" },
  { label: "Direita (texto ao lado)", value: "right" },
  { label: "Entre o texto", value: "inline" },
  { label: "Embaixo (bloco)", value: "block" },
];

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [showEmojis, setShowEmojis] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);

  // Uploads an image to Storage and inserts its URL. Avoids inlining base64,
  // which would bloat the Firestore document and break saving (and reading).
  async function uploadAndInsert(file: File) {
    const toastId = toast.loading("Enviando imagem…");
    try {
      const src = await uploadEditorImage(file);
      editor?.chain().focus().setImage({ src }).run();
      toast.success("Imagem adicionada!", { id: toastId });
    } catch {
      toast.error("Não foi possível enviar a imagem.", { id: toastId });
    }
  }

  async function uploadDataUrl(src: string, index: number) {
    const res = await fetch(src);
    const blob = await res.blob();
    const ext = blob.type.split("/")[1]?.split("+")[0] || "png";
    return uploadEditorImage(new File([blob], `email-image-${index}.${ext}`, { type: blob.type }));
  }

  async function pasteHtmlWithImages(html: string, files: File[]) {
    const toastId = toast.loading("Importando imagens do e-mail…");
    let imported = 0;
    let skipped = 0;
    let fileIndex = 0;

    try {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const images = Array.from(doc.querySelectorAll("img"));

      for (const [index, image] of images.entries()) {
        const src = image.getAttribute("src")?.trim() ?? "";
        let nextSrc = "";

        try {
          if (src.startsWith("data:image/")) {
            nextSrc = await uploadDataUrl(src, index);
          } else if (src.startsWith("http://") || src.startsWith("https://")) {
            nextSrc = await importEditorImageFromUrl(src);
          } else if (src.startsWith("blob:")) {
            const res = await fetch(src);
            const blob = await res.blob();
            const ext = blob.type.split("/")[1]?.split("+")[0] || "png";
            nextSrc = await uploadEditorImage(
              new File([blob], `email-image-${index}.${ext}`, { type: blob.type })
            );
          } else if (files[fileIndex]) {
            nextSrc = await uploadEditorImage(files[fileIndex]);
            fileIndex += 1;
          }
        } catch {
          nextSrc = "";
        }

        if (nextSrc) {
          image.setAttribute("src", nextSrc);
          image.setAttribute("alt", image.getAttribute("alt") || "Imagem da newsletter");
          imported += 1;
        } else {
          image.remove();
          skipped += 1;
        }
      }

      editor?.chain().focus().insertContent(doc.body.innerHTML).run();

      if (skipped > 0) {
        toast.warning(
          `${imported} imagem(ns) importada(s). ${skipped} imagem(ns) não vieram no conteúdo copiado.`,
          { id: toastId }
        );
      } else {
        toast.success(`${imported} imagem(ns) importada(s)!`, { id: toastId });
      }
    } catch {
      toast.error("Não foi possível importar as imagens do e-mail.", { id: toastId });
    }
  }


  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      TextStyle,
      FontSize,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: { class: "rounded-lg max-w-full h-auto my-3" },
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
        const imageFiles = Array.from(items)
          .filter((item) => item.type.startsWith("image/"))
          .map((item) => item.getAsFile())
          .filter((file): file is File => !!file);
        const html = event.clipboardData?.getData("text/html") ?? "";
        if (html && /<img\b/i.test(html)) {
          event.preventDefault();
          pasteHtmlWithImages(html, imageFiles);
          return true;
        }
        const images = Array.from(items).filter((item) => item.type.startsWith("image/"));
        if (images.length === 0) return false;
        event.preventDefault();
        images.forEach((item) => {
          const file = item.getAsFile();
          if (file) uploadAndInsert(file);
        });
        return true;
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;
        const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
        if (images.length === 0) return false;
        event.preventDefault();
        images.forEach((file) => uploadAndInsert(file));
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

  // Close popovers on outside click.
  useEffect(() => {
    if (!showEmojis && !showSizes) return;
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojis(false);
      }
      if (sizeRef.current && !sizeRef.current.contains(e.target as Node)) {
        setShowSizes(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmojis, showSizes]);

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
      if (file) uploadAndInsert(file);
    };
    input.click();
  };

  const insertEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run();
    setShowEmojis(false);
  };

  const setFontSize = (size: string) => {
    if (size === "16px") {
      editor.chain().focus().setMark("textStyle", { fontSize: null }).run();
    } else {
      editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
    }
    setShowSizes(false);
  };

  const setImageWidth = (width: string) => {
    editor.chain().focus().updateAttributes("image", { width }).run();
  };

  const setImageAlign = (align: string) => {
    editor.chain().focus().updateAttributes("image", { align }).run();
  };

  const imageSelected = editor.isActive("image");
  const currentImageAlign = (editor.getAttributes("image").align as string) || "block";

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-header/60 p-1">
        <Btn label="Negrito" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </Btn>
        <Btn label="Itálico" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </Btn>

        {/* Text size picker */}
        <div className="relative" ref={sizeRef}>
          <Btn label="Tamanho do texto" active={showSizes} onClick={() => setShowSizes((s) => !s)}>
            <Type className="h-4 w-4" />
          </Btn>
          {showSizes && (
            <div className="absolute left-0 top-full z-20 mt-1 w-40 rounded-lg border border-border bg-card p-1 shadow-lg">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => setFontSize(size.value)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-foreground transition-colors hover:bg-secondary"
                >
                  <span style={{ fontSize: size.value }}>{size.label}</span>
                  <span className="text-xs text-muted-foreground">{size.value}</span>
                </button>
              ))}
            </div>
          )}
        </div>

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
        <Btn label="Linha divisória" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-4 w-4" />
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

      {/* Image controls — shown only when an image is selected */}
      {imageSelected && (
        <div className="flex flex-col gap-2 border-b border-border bg-secondary/40 px-3 py-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-28 shrink-0 text-muted-foreground">Tamanho:</span>
            {IMAGE_SIZES.map((size) => (
              <button
                key={size.value}
                type="button"
                onClick={() => setImageWidth(size.value)}
                className="rounded-md border border-border bg-background px-2.5 py-1 text-foreground transition-colors hover:bg-primary/15 hover:text-primary"
              >
                {size.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-28 shrink-0 text-muted-foreground">Posição:</span>
            {IMAGE_ALIGNS.map((align) => (
              <button
                key={align.value}
                type="button"
                onClick={() => setImageAlign(align.value)}
                className={cn(
                  "rounded-md border border-border bg-background px-2.5 py-1 text-foreground transition-colors hover:bg-primary/15 hover:text-primary",
                  currentImageAlign === align.value && "border-primary bg-primary/15 text-primary"
                )}
              >
                {align.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
