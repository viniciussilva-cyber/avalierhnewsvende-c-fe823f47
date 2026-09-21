import { useState } from "react";
import Cropper from "react-easy-crop";
import { Upload, Loader2, Image as ImageIcon, ZoomIn, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getCroppedImg } from "@/lib/cropImage";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);

  // Estados para o modal de recorte
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSaveCrop = async () => {
    try {
      setUploading(true);
      if (!imageSrc || !croppedAreaPixels) return;

      // Gera o Blob da região cortada
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.png`;

      // Faz o upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, croppedBlob, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

      setPreview(data.publicUrl);
      onChange(data.publicUrl);
      setImageSrc(null); // Fecha o modal de recorte
    } catch (error: any) {
      alert(`Erro ao recortar e enviar a imagem: ${error.message}`);
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
              Processando...
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

      {/* Modal Interativo para Recorte e Zoom */}
      {imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4">
              <h3 className="text-base font-bold text-foreground">Ajustar foto do colaborador</h3>
              <button
                type="button"
                onClick={() => setImageSrc(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Área do Cropper Circular */}
            <div className="relative h-64 w-full overflow-hidden rounded-xl bg-zinc-950">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Barra de Zoom */}
            <div className="mt-4 flex items-center gap-3 px-2">
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {/* Ações */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setImageSrc(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCrop}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Confirmar ajuste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
