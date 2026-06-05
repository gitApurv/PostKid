import type { FolderItem } from "./FolderItem";
import type { RequestItem } from "../request/RequestItem";

export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  folderCount: number;
  folders?: FolderItem[];
  requests?: RequestItem[];
  isLoaded?: boolean;
  isLoading?: boolean;
}