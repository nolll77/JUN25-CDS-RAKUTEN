import { useState, useRef, useCallback, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { GlowCard } from "@/components/GlowCard";
import { Upload, Zap, ImageIcon, X, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

// Simulation data removed to force real API testing
const IMAGE_PREDICTIONS = [];

export default function DemoImage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageResult, setImageResult] = useState<typeof IMAGE_PREDICTIONS | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [description, setDescription] = useState("");
  const [modelMode, setModelMode] = useState<string>("stacking");
  const [modeUsed, setModeUsed] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Récupérer le mode actif au chargement
  useEffect(() => {
    fetch(`${apiUrl}/model-status`)
      .then(r => r.json())
      .then(d => setModelMode(d.current_mode))
      .catch(() => {});
  }, []);

  const toggleModel = async () => {
    const newMode = modelMode === "stacking" ? "mlp" : "stacking";
    try {
      const res = await fetch(`${apiUrl}/set-model`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode }),
      });
      const data = await res.json();
      setModelMode(data.model_mode);
    } catch {
      setModelMode(newMode);
    }
  };

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

  const handleImagePredict = async () => {
    if (!imageFile) return;
    setImageLoading(true);
    setImageResult(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("text", description); // Description que l'utilisateur a saisie

      // Si la variable d'environnement manque on met un fallback
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      
      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error(await response.text());
        throw new Error("Erreur de connexion à l'API ML");
      }

      const data = await response.json();
      if (data.status === 'success') {
        setImageResult(data.predictions);
        setModeUsed(data.model_mode || modelMode);
      } else {
        throw new Error("Résultat API invalide");
      }
    } catch (error: any) {
      console.error("Prediction Error:", error);
      alert(`Erreur de connexion à l'IA : ${error.message}\nAssurez-vous que le serveur tourne sur ${apiUrl}`);
      setImageResult(null);
    } finally {
      setImageLoading(false);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageResult(null);
    setDescription("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <PageHeader
        icon={ImageIcon}
        title="Classification Multimodale"
        subtitle="Uploadez une image de produit et saisissez un titre pour prédire sa catégorie."
        step="Démo Classification Multimodale"
      />

      {/* Toggle Stacking / MLP */}
      <GlowCard delay={0.05} className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Modèle actif</span>
            <p className="text-sm font-semibold mt-1">
              {modelMode === "stacking" ? "Stacking Complet" : "MLP (roue de secours)"}
            </p>
            <p className="text-xs text-muted-foreground">
              {modelMode === "stacking"
                ? "LightGBM + CatBoost + LR + MLP → Meta Learner"
                : "Deep Learning MLP seul (plus rapide)"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleModel}
            className="flex items-center gap-2"
          >
            {modelMode === "stacking" ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            {modelMode === "stacking" ? "Basculer vers MLP" : "Basculer vers Stacking"}
          </Button>
        </div>
      </GlowCard>

      <GlowCard delay={0.1} className="mb-6">
        <label className="block font-mono text-xs text-muted-foreground mb-3 uppercase tracking-wider">
          Analyse Multimodale du Produit
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

        <div className="mt-4">
          <label className="block text-xs text-muted-foreground font-mono mb-2">
            Description / Titre du produit
          </label>
          <Textarea 
            placeholder="Ex: Console de jeu Playstation 5 Sony, état neuf avec manette..."
            className="w-full mb-4 border-border bg-secondary/20 focus-visible:ring-primary min-h-[80px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
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
                Prédire (Multimodal)
              </>
            )}
          </Button>
        </div>
      </GlowCard>

      <AnimatePresence>
        {imageResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GlowCard className="neon-border">
              <h3 className="font-mono text-sm font-semibold text-foreground mb-4">Prédictions Multimodales (Top 5)</h3>
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
