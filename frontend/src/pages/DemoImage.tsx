import { useState, useRef, useCallback } from "react";
import { PageHeader } from "@/components/PageHeader";
import { GlowCard } from "@/components/GlowCard";
import { Upload, Zap, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const IMAGE_PREDICTIONS = [
  { code: 1281, label: "Jeux vidéo", proba: 0.65 },
  { code: 2705, label: "Livres", proba: 0.12 },
  { code: 2522, label: "Papeterie", proba: 0.10 },
  { code: 1940, label: "Alimentation", proba: 0.08 },
  { code: 2060, label: "Décoration murale", proba: 0.05 },
];

export default function DemoImage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageResult, setImageResult] = useState<typeof IMAGE_PREDICTIONS | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImageFile(file);
    setImageResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processImage(file);
  }, [processImage]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  const handleImagePredict = () => {
    if (!imageFile) return;
    setImageLoading(true);
    setImageResult(null);
    setTimeout(() => {
      const seed = imageFile.name.length % 5;
      const shifted = [...IMAGE_PREDICTIONS];
      if (seed > 0) {
        const first = shifted.splice(seed, 1);
        shifted.unshift(...first);
        const probas = [0.61, 0.15, 0.11, 0.08, 0.05];
        shifted.forEach((s, i) => (s.proba = probas[i]));
      }
      setImageResult(shifted);
      setImageLoading(false);
    }, 1500);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <PageHeader
        icon={ImageIcon}
        title="Classification Image"
        subtitle="Uploadez une image de produit pour prédire sa catégorie."
        step="Démo interactive"
      />

      <GlowCard delay={0.1} className="mb-6">
        <label className="block font-mono text-xs text-muted-foreground mb-3 uppercase tracking-wider">
          Classification par image
        </label>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !imagePreview && fileInputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed transition-all duration-200
            ${!imagePreview ? "cursor-pointer" : ""}
            ${isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/40 hover:bg-secondary/30"
            }
          `}
        >
          {!imagePreview ? (
            <>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? "bg-primary/10" : "bg-secondary"}`}>
                <ImageIcon className={`h-7 w-7 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {isDragging ? "Déposez l'image ici" : "Glissez-déposez une image"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ou <span className="text-primary underline underline-offset-2">parcourir depuis le PC</span>
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono">PNG, JPG, WEBP</p>
            </>
          ) : (
            <div className="space-y-4 flex flex-col items-center">
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-56 rounded-lg border border-border object-contain"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); clearImage(); }}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/80 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground font-mono">{imageFile?.name}</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div className="flex items-center gap-3 mt-4">
          <Button
            onClick={handleImagePredict}
            disabled={!imageFile || imageLoading}
            className="font-mono bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {imageLoading ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Inference...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Prédire (image)
              </>
            )}
          </Button>
        </div>
      </GlowCard>

      <AnimatePresence>
        {imageResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GlowCard className="neon-border">
              <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Prédictions image (Top 5)</h3>
              <div className="space-y-3">
                {imageResult.map((pred, i) => (
                  <div key={pred.code} className="flex items-center gap-3">
                    <span className={`font-mono text-xs w-6 ${i === 0 ? "text-primary font-bold" : "text-muted-foreground"}`}>
                      #{i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-mono text-xs ${i === 0 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                          {pred.code} – {pred.label}
                        </span>
                        <span className={`font-mono text-xs ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
                          {(pred.proba * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pred.proba * 100}%` }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                          className={`h-full rounded-full ${i === 0 ? "bg-primary" : "bg-muted-foreground/30"}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlowCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
