import type { RequestItem } from "../../request/types/RequestItem";

export interface FolderItem {
  id: string;
  name: string;
  collectionId: string;
  parentFolderId?: string | null;
  subFolderCount: number;
  subFolders?: FolderItem[];
  requestItems?: RequestItem[];
  isLoaded?: boolean;
  isLoading?: boolean;
}

