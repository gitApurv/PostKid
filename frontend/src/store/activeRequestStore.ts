import { create } from "zustand";
import api from "../lib/axios";
import axios from "axios";
import type { ApiResponse } from "../types/common/ApiResponse";
import type { RequestItem } from "../types/request/RequestItem";
import type { RequestItemResponse } from "../types/request/RequestItemResponse";
import type { ExecutionResponse } from "../types/request/ExecutionResponse";
import { useCollectionTreeStore } from "./collectionTreeStore";
import type { ActiveRequestState } from "../types/request/ActiveRequestState";

export const useActiveRequestStore = create<ActiveRequestState>((set, get) => ({
  activeRequestId: null,
  activeRequest: null,
  isExecuting: false,
  lastResponse: null,

  setActiveRequest: async (id) => {
    if (!id) {
      set({ activeRequestId: null, activeRequest: null, lastResponse: null });
      return;
    }
    try {
      set({ lastResponse: null });
      const requestRes = await api.get<ApiResponse<RequestItemResponse>>(`/requests/${id}`);
      if (requestRes.data.success && requestRes.data.data) {
        const res = requestRes.data.data;
        const urlObj = res.url ? res.url.split("?") : [""];
        const paramString = urlObj[1] || "";
        const params = paramString
          .split("&")
          .filter(Boolean)
          .map((p) => {
            const [key, val] = p.split("=");
            return { key, value: decodeURIComponent(val || ""), active: true };
          });

        const headers = res.headers
          ? Object.entries(res.headers).map(([key, value]) => ({
            key,
            value: value as string,
            active: true,
          }))
          : [];

        const req: RequestItem = {
          id: res.id,
          name: res.name,
          method: res.method,
          url: res.url || "",
          params,
          headers,
          bodyType: res.body ? "json" : "none",
          bodyJson: res.body || "",
          authType: "none",
          authValue: {},
          folderId: res.folderId,
          collectionId: res.collectionId,
          timeoutMs: 5000,
        };
        set({ activeRequestId: id, activeRequest: req });
      }
    } catch (e) {
      console.error("Failed to set active request:", e);
    }
  },

  setActiveRequestDirectly: (req) => {
    set({
      activeRequestId: req ? req.id : null,
      activeRequest: req,
      lastResponse: null,
    });
  },

  updateActiveRequest: async (fields) => {
    const active = get().activeRequest;
    if (!active) return;

    const updated = { ...active, ...fields };
    set({ activeRequest: updated });

    let url = updated.url.split("?")[0];
    const query = updated.params
      .filter((p) => p.active && p.key)
      .map((p) => `${p.key}=${encodeURIComponent(p.value)}`)
      .join("&");
    if (query) {
      url += `?${query}`;
    }

    const headersMap: Record<string, string> = {};
    updated.headers.forEach((h) => {
      if (h.active && h.key) {
        headersMap[h.key] = h.value;
      }
    });

    const payload = {
      name: updated.name,
      method: updated.method,
      url,
      body: updated.bodyJson,
      headers: headersMap,
      collectionId: updated.collectionId,
      folderId: updated.folderId || undefined,
    };

    try {
      await api.put(`/requests/${updated.id}`, payload);

      // Sync the request updates to the collection tree store
      useCollectionTreeStore.getState().syncRequestInTree(updated);
    } catch (e) {
      console.error("Failed to save active request updates:", e);
    }
  },

  executeRequest: async (activeEnvironmentId, environments) => {
    const req = get().activeRequest;
    if (!req) return;

    set({ isExecuting: true });

    const activeEnv = environments.find((environment: any) => environment.id === activeEnvironmentId);
    let resolvedUrl = req.url;
    if (activeEnv) {
      activeEnv.variables.forEach((variable: any) => {
        if (variable.key) {
          resolvedUrl = resolvedUrl.replaceAll(`{{${variable.key}}}`, variable.value);
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

    if (req.authType === "bearer" && req.authValue?.token) {
      headersMap["Authorization"] = `Bearer ${req.authValue.token}`;
    } else if (req.authType === "basic" && req.authValue?.username && req.authValue?.password) {
      const credentials = btoa(`${req.authValue.username}:${req.authValue.password}`);
      headersMap["Authorization"] = `Basic ${credentials}`;
    }

    const timeoutSeconds = Math.max(1, Math.round((req.timeoutMs || 5000) / 1000));

    try {
      const requestExecuteRes = await api.post<ApiResponse<ExecutionResponse>>("/requests/execute", {
        url: resolvedUrl,
        method: req.method,
        headers: headersMap,
        body: req.bodyJson || "",
        timeoutSeconds: timeoutSeconds,
      });

      if (requestExecuteRes.data.success && requestExecuteRes.data.data) {
        const responseData = requestExecuteRes.data.data;
        const headersRecord: Record<string, string> = {};
        if (responseData.responseHeaders) {
          Object.entries(responseData.responseHeaders).forEach(([key, value]) => {
            headersRecord[key] = value as string;
          });
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
    }
  },
}));
