import { useHistoryStore } from "../../store/historyStore";
import { AlertTriangle } from "lucide-react";

interface ClearHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClearHistoryModal({
  isOpen,
  onClose,
}: ClearHistoryModalProps) {
  const clearHistoryAction = useHistoryStore((state) => state.clearHistoryAction);

  const handleClear = async () => {
    await clearHistoryAction();
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
          Prune Timelines Audits?
        </h3>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          This action deletes all locally cached dispatch variables and latency
          sparks. This operation is permanent.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 hover:bg-white/5 rounded-lg text-xs font-semibold text-slate-400 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 bg-brand-error hover:bg-brand-error/90 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Prune History
          </button>
        </div>
      </div>
    </div>
  );
}
