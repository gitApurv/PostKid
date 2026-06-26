import { create } from "zustand";
import api from "../../config/axios";
import axios from "axios";
import type { ApiResponse } from "../../common/types/ApiResponse";
import type { HistoryItem } from "../types/HistoryItem";
import type { HistoryState } from "../types/HistoryState";
import type { HistoryResponse } from "../types/HistoryResponse";

export const useHistoryStore = create<HistoryState>((set) => ({
  histories: [],

  fetchHistoriesAction: async () => {
    try {
      const response =
        await api.get<ApiResponse<{ content: HistoryResponse[] }>>("/history");
      if (response.data.success && response.data.data) {
        const historyItems: HistoryItem[] = (
          response.data.data.content || []
        ).map((history) => {
          return {
            id: history.id,
            userId: history.userId,
            requestItemId: history.requestItemId,
            collectionId: history.collectionId,
            method: history.method,
            url: history.url,
            requestHeaders: history.requestHeaders,
            requestBody: history.requestBody,
            authType: history.authType,
            authValue: history.authValue,
            timeoutSeconds: history.timeoutSeconds,
            statusCode: history.statusCode,
            responseHeaders: history.responseHeaders,
            responseBody: history.responseBody,
            durationMs: history.durationMs,
            success: history.success,
            errorMessage: history.errorMessage,
            executedAt: history.executedAt,
          };
        });
        set({ histories: historyItems });
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.message || "Failed to fetch history.",
        };
      }
    } catch (err: unknown) {
      console.error("Fetch history error: ", err);
      let errMsg = "An error occurred while fetching history.";
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.message || err.message || errMsg;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      return { success: false, error: errMsg };
    }
  },

  deleteHistoryAction: async (id: string) => {
    try {
      const response = await api.delete<ApiResponse<void>>(`/history/${id}`);
      if (response.data.success) {
        set((state) => ({
          histories: state.histories.filter((history) => history.id !== id),
        }));
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.message || "Failed to delete history item.",
        };
      }
    } catch (err: unknown) {
      console.error("Delete history item error: ", err);
      let errMsg = "An error occurred while deleting history item.";
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.message || err.message || errMsg;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      return { success: false, error: errMsg };
    }
  },

  clearHistoryAction: async () => {
    try {
      const response = await api.delete<ApiResponse<void>>("/history/clear");
      if (response.data.success) {
        set({ histories: [] });
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.message || "Failed to clear history.",
        };
      }
    } catch (err: unknown) {
      console.error("Clear history error: ", err);
      let errMsg = "An error occurred while clearing history.";
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.message || err.message || errMsg;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      return { success: false, error: errMsg };
    }
  },
}));
