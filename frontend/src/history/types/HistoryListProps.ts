import type { HistoryItem } from "./HistoryItem";

export interface HistoryListProps {
  items: HistoryItem[];
  onInspect: (item: HistoryItem) => void;
}
