import type { RequestItem } from "./RequestItem";

export interface RequestItemRequest {
  name: string;
  method: RequestItem["method"];
  url: string;
  body?: string;
  headers?: Record<string, string>;
  authType?: RequestItem["authType"];
  authValue?: RequestItem["authValue"];
  timeoutMs?: number;
}

