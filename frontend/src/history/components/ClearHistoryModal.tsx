import { useState, useEffect } from "react";
import { useHistoryStore } from "../store/historyStore";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { ModalProps } from "../../common/types/ModalProps";

export default function ClearHistoryModal({ isOpen, onClose }: ModalProps) {
  const clearHistoryAction = useHistoryStore(
    (state) => state.clearHistoryAction,
  );

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleClear = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    const response = await clearHistoryAction();
    if (!response.success) {
      setError(response.error || "Failed to clear history.");
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-sm rounded-xl p-6 shadow-2xl relative text-center">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-error" />

        <div className="w-12 h-12 rounded-full bg-brand-error/10 border border-brand-error/20 flex items-center justify-center mx-auto mb-4 text-brand-error animate-pulse">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-sm font-bold font-display text-white uppercase tracking-wider mb-2">
          Prune History?
        </h3>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          This action deletes all locally cached dispatch variables and latency
          sparks. This operation is permanent.
        </p>

        {error && (
          <div className="text-[11px] text-brand-error bg-brand-error/5 border border-brand-error/20 rounded-lg p-2.5 mb-4 text-center">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 hover:bg-white/5 rounded-lg text-xs font-semibold text-slate-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="px-4 py-2 bg-brand-error hover:bg-brand-error/90 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isLoading ? "Pruning..." : "Prune History"}
          </button>
        </div>
      </div>
    </div>
  );
}
