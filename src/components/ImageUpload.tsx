import { useState } from "react";
import { Upload, Loader2, Image as ImageIcon, Check, X, ZoomIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);

  // Estados para o ajuste manual de zoom/posição
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setTempImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, selectedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

      setPreview(data.publicUrl);
      onChange(data.publicUrl);
      setTempImage(null);
    } catch (error: any) {
      alert(`Erro ao enviar foto: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
          {preview ? (
            <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
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
              {preview ? "Alterar foto" : "Selecionar foto"}
            </>
          )}
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={onFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Modal simples de pré-visualização */}
      {tempImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4">
              <h3 className="text-base font-bold text-foreground">Ajustar visualização</h3>
              <button
                type="button"
                onClick={() => setTempImage(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview circular */}
            <div className="flex justify-center py-4">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-primary bg-zinc-950">
                <img
                  src={tempImage}
                  alt="Pré-visualização"
                  className="h-full w-full object-cover transition-all"
                  style={{ transform: `scale(${zoom / 100})` }}
                />
              </div>
            </div>

            {/* Controle de Zoom */}
            <div className="mt-2 flex items-center gap-3 px-2">
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
              <input
                type="range"
                value={zoom}
                min={100}
                max={200}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTempImage(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
