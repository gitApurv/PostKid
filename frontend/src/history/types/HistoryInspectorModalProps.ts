import type { HistoryItem } from "./HistoryItem";

export interface HistoryInspectorModalProps {
  item: HistoryItem | null;
  onClose: () => void;
}
