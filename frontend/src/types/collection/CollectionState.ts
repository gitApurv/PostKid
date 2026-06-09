import type { CollectionItem } from "./CollectionItem";
import type { RequestItem } from "../request/RequestItem";
import type { CollectionRequest } from "./CollectionRequest";
import type { FolderRequest } from "./FolderRequest";
import type { RequestItemRequest } from "../request/RequestItemRequest";

export interface CollectionState {
  collections: CollectionItem[];
  fetchCollectionsAction: () => Promise<{ success: boolean; error?: string }>;
  fetchCollectionDetailsAction: (collectionId: string) => Promise<{ success: boolean; error?: string }>;
  addCollectionAction: (req: CollectionRequest) => Promise<{ success: boolean; error?: string }>;
  updateCollectionAction: (id: string, req: CollectionRequest) => Promise<{ success: boolean; error?: string }>;
  deleteCollectionAction: (id: string) => Promise<{ success: boolean; error?: string }>;
  fetchFolderDetailsAction: (collectionId: string, folderId: string) => Promise<{ success: boolean; error?: string }>;
  addFolderAction: (collectionId: string, req: FolderRequest) => Promise<{ success: boolean; error?: string }>;
  deleteFolderAction: (collectionId: string, folderId: string) => Promise<{ success: boolean; error?: string }>;
  addRequestAction: (collectionId: string, folderId: string | null, req: RequestItemRequest) => Promise<{ success: boolean; error?: string }>;
  deleteRequestAction: (requestId: string) => Promise<{ success: boolean; error?: string }>;
  syncRequestInTreeAction: (updated: RequestItem) => void;
}