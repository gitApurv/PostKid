import type { RequestItem } from "./RequestItem";

export interface RequestItemRequest {
  name: string;
  method: RequestItem["method"];
  url: string;
  body?: string;
  headers?: Record<string, string>;
  collectionId: string;
  folderId?: string | null;
}
