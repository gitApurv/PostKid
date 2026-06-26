import type { FolderItem } from "./FolderItem";
import type { RequestItem } from "../../request/types/RequestItem";

export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  folderCount: number;
  folders?: FolderItem[];
  requestItems?: RequestItem[];
  isLoaded?: boolean;
  isLoading?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

