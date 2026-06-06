/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RequestItem } from "./RequestItem";

export interface ActiveRequestState {
  activeRequestId: string | null;
  activeRequest: RequestItem | null;
  activeCollectionId: string | null;
  isExecuting: boolean;
  lastResponse: {
    status: number;
    statusText: string;
    latency: number;
    size: string;
    headers: Record<string, string>;
    body: string;
  } | null;

  setActiveRequest: (id: string | null) => Promise<void>;
  setActiveRequestDirectly: (req: RequestItem | null) => void;
  setActiveCollection: (id: string | null) => void;
  updateActiveRequest: (fields: Partial<RequestItem>) => Promise<void>;
  executeRequest: (activeEnvironmentId: string, environments: any[]) => Promise<void>;
}