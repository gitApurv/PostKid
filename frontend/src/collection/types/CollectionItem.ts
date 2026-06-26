import type { FolderItem } from "./FolderItem";
import type { RequestItem } from "../../request/types/RequestItem";

export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  folderCount: number;
  folders?: FolderItem[];
  requests?: RequestItem[];
  isLoaded?: boolean;
  isLoading?: boolean;
  ownerUsername?: string;
  createdAt?: string;
  updatedAt?: string;
}
