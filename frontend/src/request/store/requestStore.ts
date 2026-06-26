import { create } from "zustand";
import api from "../../config/axios";
import axios from "axios";
import type { ApiResponse } from "../../common/types/ApiResponse";
import type { RequestItem } from "../types/RequestItem";
import type { RequestItemResponse } from "../types/RequestItemResponse";
import type { ExecutionResponse } from "../types/ExecutionResponse";
import { useCollectionStore } from "../../collection/store/collectionStore";
import type { RequestState } from "../types/RequestState";

export const useRequestStore = create<RequestState>((set, get) => ({
  activeRequestId: null,
  activeRequest: null,
  activeCollectionId: null,
  isExecuting: false,
  lastResponse: null,

  setActiveRequestAction: async (id) => {
    if (!id) {
      set({ activeRequestId: null, activeRequest: null, lastResponse: null });
      return { success: true };
    }

    try {
      set({ lastResponse: null, activeCollectionId: null });
      const requestRes = await api.get<ApiResponse<RequestItemResponse>>(
        `/requests/${id}`,
      );
      if (requestRes.data.success && requestRes.data.data) {
        const response = requestRes.data.data;
        const urlObj = response.url ? response.url.split("?") : [""];
        const paramString = urlObj[1] || "";
        const params = paramString
          .split("&")
          .filter(Boolean)
          .map((param) => {
            const [key, value] = param.split("=");
            return {
              key,
              value: decodeURIComponent(value || ""),
              active: true,
            };
          });

        const headers = response.headers
          ? Object.entries(response.headers).map(([key, value]) => ({
              key,
              value: value as string,
              active: true,
            }))
          : [];

        const req: RequestItem = {
          id: response.id,
          name: response.name,
          method: response.method,
          url: response.url || "",
          params,
          headers,
          bodyType: response.body ? "json" : "none",
          bodyJson: response.body || "",
          authType: response.authType || "none",
          authValue: response.authValue || {},
          folderId: response.folderId,
          collectionId: response.collectionId,
          timeoutMs: response.timeoutMs || 5000,
        };
        set({
          activeRequestId: id,
          activeRequest: req,
          activeCollectionId: null,
        });
        return { success: true };
      } else {
        return {
          success: false,
          error: requestRes.data.message || "Failed to load request details.",
        };
      }
    } catch (e) {
      console.error("Failed to set active request:", e);
      let errorMessage = "Failed to load request details.";
      if (axios.isAxiosError(e)) {
        errorMessage = e.response?.data?.message || e.message || errorMessage;
      } else if (e instanceof Error) {
        errorMessage = e.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  setActiveRequestDirectlyAction: (req) => {
    set({
      activeRequestId: req ? req.id : null,
      activeRequest: req,
      activeCollectionId: null,
      lastResponse: null,
    });
    return { success: true };
  },

  setActiveCollectionAction: (id) => {
    set({
      activeCollectionId: id,
      activeRequestId: null,
      activeRequest: null,
      lastResponse: null,
    });
    return { success: true };
  },

  updateActiveRequestAction: async (fields) => {
    const active = get().activeRequest;
    if (!active)
      return { success: false, error: "No active request to update" };

    const updated = { ...active, ...fields };
    set({ activeRequest: updated });

    let url = updated.url.split("?")[0];
    const query = updated.params
      .filter((param) => param.active && param.key)
      .map((param) => `${param.key}=${encodeURIComponent(param.value)}`)
      .join("&");
    if (query) {
      url += `?${query}`;
    }

    const headersMap: Record<string, string> = {};
    updated.headers.forEach((header) => {
      if (header.active && header.key) {
        headersMap[header.key] = header.value;
      }
    });

    const payload = {
      name: updated.name,
      method: updated.method,
      url,
      body: updated.bodyJson,
      headers: headersMap,
      authType: updated.authType,
      authValue: updated.authValue,
      timeoutMs: updated.timeoutMs,
      collectionId: updated.collectionId,
      folderId: updated.folderId || undefined,
    };

    try {
      await api.put(`/requests/${updated.id}`, payload);

      useCollectionStore.getState().syncRequestInTreeAction(updated);
      return { success: true };
    } catch (e) {
      console.error("Failed to save active request updates:", e);
      let errorMessage = "Failed to update request details.";
      if (axios.isAxiosError(e)) {
        errorMessage = e.response?.data?.message || e.message || errorMessage;
      } else if (e instanceof Error) {
        errorMessage = e.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  executeRequestAction: async (activeEnvironmentId, environments) => {
    const req = get().activeRequest;
    if (!req) return { success: false, error: "No active request to execute" };

    set({ isExecuting: true });

    const activeEnv = environments.find(
      (environment: any) => environment.id === activeEnvironmentId,
    );
    let resolvedUrl = req.url;
    if (activeEnv) {
      activeEnv.variables.forEach((variable: any) => {
        if (variable.key) {
          resolvedUrl = resolvedUrl.replaceAll(
            `{{${variable.key}}}`,
            variable.value,
          );
        }
      });
    }

    const headersMap: Record<string, string> = {};
    req.headers.forEach((header) => {
      if (header.active && header.key) {
        let val = header.value;
        if (activeEnv) {
          activeEnv.variables.forEach((variable: any) => {
            if (variable.key) {
              val = val.replaceAll(`{{${variable.key}}}`, variable.value);
            }
          });
        }
        headersMap[header.key] = val;
      }
    });

    const timeoutSeconds = Math.max(
      1,
      Math.round((req.timeoutMs || 5000) / 1000),
    );

    try {
      const requestExecuteRes = await api.post<ApiResponse<ExecutionResponse>>(
        "/requests/execute",
        {
          url: resolvedUrl,
          method: req.method,
          headers: headersMap,
          body: req.bodyJson || "",
          authType: req.authType,
          authValue: req.authValue,
          timeoutSeconds: timeoutSeconds,
        },
      );

      if (requestExecuteRes.data.success && requestExecuteRes.data.data) {
        const responseData = requestExecuteRes.data.data;
        const headersRecord: Record<string, string> = {};
        if (responseData.responseHeaders) {
          Object.entries(responseData.responseHeaders).forEach(
            ([key, value]) => {
              headersRecord[key] = value as string;
            },
          );
        }

        set({
          isExecuting: false,
          lastResponse: {
            status: responseData.statusCode,
            statusText: responseData.success ? "OK" : "Error",
            latency: responseData.durationMs,
            size: `${(JSON.stringify(responseData.responseBody || "").length / 1024).toFixed(2)} KB`,
            headers: headersRecord,
            body: responseData.responseBody || "",
          },
        });
        return { success: true };
      } else {
        const errorMessage =
          requestExecuteRes.data.message || "Execution failed";
        set({
          isExecuting: false,
          lastResponse: {
            status: 500,
            statusText: "Error",
            latency: 0,
            size: "0 B",
            headers: {},
            body: errorMessage,
          },
        });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error("Execution failed:", error);
      let status = 500;
      let body = "Execution failed";
      if (axios.isAxiosError(error)) {
        status = error.response?.status || status;
        body = error.response?.data?.message || error.message || body;
      } else if (error instanceof Error) {
        body = error.message;
      }
      set({
        isExecuting: false,
        lastResponse: {
          status,
          statusText: "Error",
          latency: 0,
          size: "0 B",
          headers: {},
          body,
        },
      });
      return { success: false, error: body };
    }
  },
}));
