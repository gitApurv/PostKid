import { useState, useEffect } from "react";
import { useEnvironmentStore } from "../../store/environmentStore";
import { FolderPlus, Loader2 } from "lucide-react";
import type { EnvironmentColor } from "../../types/environment/EnvironmentColor";

interface CreateEnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateEnvironmentModal({
  isOpen,
  onClose,
}: CreateEnvironmentModalProps) {
  const addEnvironmentAction = useEnvironmentStore(
    (state) => state.addEnvironmentAction,
  );

  const [newEnvName, setNewEnvName] = useState("");
  const [selectedColor, setSelectedColor] =
    useState<EnvironmentColor>("EMERALD");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewEnvName("");
      setSelectedColor("EMERALD");
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleAddEnv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvName.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    const result = await addEnvironmentAction({
      name: newEnvName.trim(),
      environmentColor: selectedColor,
    });

    if (result.success) {
      setNewEnvName("");
      setSelectedColor("EMERALD");
      setIsLoading(false);
      onClose();
    } else {
      setError(result.error || "Failed to create environment.");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-sm rounded-xl p-6 shadow-2xl relative animate-float">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-primary to-brand-secondary" />

        <h3 className="text-base font-semibold font-display text-white flex items-center gap-2 mb-2">
          <FolderPlus className="w-5 h-5 text-brand-primary" />
          Initialize Fresh Environment
        </h3>
        <p className="text-[11px] text-slate-400 mb-6">
          Create a scoping container for environment keys.
        </p>

        <form onSubmit={handleAddEnv} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Environment Name
            </label>
            <input
              type="text"
              required
              value={newEnvName}
              onChange={(e) => setNewEnvName(e.target.value)}
              placeholder="e.g. UAT Sandbox"
              className="block w-full px-3 py-2 bg-brand-layer-2 border border-white/5 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Environment Color
            </label>
            <div className="flex items-center gap-3 bg-brand-layer-2/50 p-2.5 rounded-lg border border-white/5">
              {(["EMERALD", "AMBER", "GREY", "BLUE", "ROSE"] as const).map(
                (color) => {
                  const colorMap = {
                    EMERALD:
                      "bg-brand-success shadow-[0_0_8px_rgba(16,185,129,0.3)]",
                    AMBER:
                      "bg-brand-warning shadow-[0_0_8px_rgba(245,158,11,0.3)]",
                    BLUE: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]",
                    ROSE: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]",
                    GREY: "bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.3)]",
                  };
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-6 h-6 rounded-full transition-all cursor-pointer flex items-center justify-center border-2 ${
                        isSelected
                          ? "border-white scale-110"
                          : "border-transparent hover:scale-105"
                      } ${colorMap[color]}`}
                      title={color.toUpperCase()}
                    >
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {error && (
            <div className="text-[11px] text-rose-400 bg-rose-950/20 border border-rose-900/30 rounded-lg p-2.5">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-3.5 py-2 hover:bg-white/5 rounded-lg text-xs font-semibold text-slate-400 transition-standard cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg text-xs font-semibold hover:shadow-[0_0_12px_rgba(99,102,241,0.3)] transition-standard cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isLoading ? "Initializing..." : "Initialize Scope"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
