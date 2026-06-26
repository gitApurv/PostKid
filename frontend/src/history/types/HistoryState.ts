import type { HistoryItem } from "./HistoryItem";

export interface HistoryState {
  histories: HistoryItem[];

  fetchHistoriesAction: () => Promise<{ success: boolean; error?: string }>;

  deleteHistoryAction: (
    id: string,
  ) => Promise<{ success: boolean; error?: string }>;

  clearHistoryAction: () => Promise<{ success: boolean; error?: string }>;
}
