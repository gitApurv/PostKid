import type { RequestItem } from "./RequestItem";

export interface RequestItemResponse {
  id: string;
  name: string;
  method: RequestItem["method"];
  url: string;
  headers: Record<string, string> | null;
  body: string | null;
  collectionId: string;
  folderId: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}