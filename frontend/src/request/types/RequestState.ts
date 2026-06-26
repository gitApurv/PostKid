import type { RequestItem } from "./RequestItem";

export interface RequestState {
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

  setActiveRequestAction: (
    id: string | null,
  ) => Promise<{ success: boolean; error?: string }>;

  setActiveRequestDirectlyAction: (req: RequestItem | null) => {
    success: boolean;
    error?: string;
  };

  setActiveCollectionAction: (id: string | null) => {
    success: boolean;
    error?: string;
  };

  updateActiveRequestAction: (
    fields: Partial<RequestItem>,
  ) => Promise<{ success: boolean; error?: string }>;

  executeRequestAction: (
    activeEnvironmentId: string,
    environments: any[],
  ) => Promise<{ success: boolean; error?: string }>;
}
