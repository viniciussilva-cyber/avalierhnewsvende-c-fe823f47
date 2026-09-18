import { useState } from "react";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Selecione uma imagem para enviar.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      // Nome limpo para evitar problemas de caracteres especiais
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = fileName;

      // 1. Tenta fazer o upload para o bucket avatars
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Erro detalhado do Supabase Storage:", uploadError);
        throw uploadError;
      }

      // 2. Obtém a URL pública da imagem enviada
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setPreview(data.publicUrl);
      onChange(data.publicUrl);
    } catch (error: any) {
      console.error("Catch Error:", error);
      const message = error?.message || error?.error_description || "Erro desconhecido";
      alert(`Falha no upload: ${message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
        {preview ? (
          <img src={preview} alt="Foto do Colaborador" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Enviando...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 text-primary" />
            {preview ? "Alterar foto PNG" : "Upload de foto PNG"}
          </>
        )}
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  );
}
