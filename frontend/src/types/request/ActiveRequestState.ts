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

  setActiveRequestAction: (id: string | null) => Promise<void>;
  setActiveRequestDirectlyAction: (req: RequestItem | null) => void;
  setActiveCollectionAction: (id: string | null) => void;
  updateActiveRequestAction: (fields: Partial<RequestItem>) => Promise<void>;
  executeRequestAction: (activeEnvironmentId: string, environments: any[]) => Promise<void>;
}