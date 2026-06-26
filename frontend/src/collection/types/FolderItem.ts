import type { RequestItem } from "../../request/types/RequestItem";

export interface FolderItem {
  id: string;
  name: string;
  collectionId: string;
  parentFolderId?: string | null;
  subfolderCount: number;
  subfolders?: FolderItem[];
  requests?: RequestItem[];
  isLoaded?: boolean;
  isLoading?: boolean;
}
