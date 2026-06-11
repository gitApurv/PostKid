import { useEffect, useState } from "react";
import { useHistoryStore } from "../store/historyStore";
import type { HistoryItem } from "../types/history/HistoryItem";
import { History, Trash2 } from "lucide-react";
import HistoryList from "../components/history/HistoryList";
import ClearHistoryModal from "../components/history/ClearHistoryModal";
import HistoryInspectorModal from "../components/history/HistoryInspectorModal";

export default function HistoryPage() {
  const histories = useHistoryStore((state) => state.histories);
  const fetchHistoriesAction = useHistoryStore((state) => state.fetchHistoriesAction);

  useEffect(() => {
    fetchHistoriesAction();
  }, [fetchHistoriesAction]);

  // States
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [inspectItem, setInspectItem] = useState<HistoryItem | null>(null);

  return (
    <div className="space-y-6 font-sans relative p-6 h-full overflow-y-auto">
      {/* Header and Bulk Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl tracking-tight text-white flex items-center gap-2">
            <History className="w-6 h-6 text-brand-primary" />
            Timeline Execution History
          </h1>
          <p className="text-xs text-slate-400">
            Timeline log auditing previously dispatched API request
            parameters.
          </p>
        </div>

        {histories.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 bg-brand-error/10 hover:bg-brand-error border border-brand-error/20 hover:border-brand-error text-brand-error hover:text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-standard cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Clear Log TIMELINES
          </button>
        )}
      </div>

      {/* Axis timeline grid */}
      <HistoryList
        items={histories}
        onInspect={(item) => setInspectItem(item)}
      />

      {/* Prune confirmation modal */}
      <ClearHistoryModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
      />

      {/* Detail Inspector Modal */}
      <HistoryInspectorModal
        item={inspectItem}
        onClose={() => setInspectItem(null)}
      />
    </div>
  );
}
