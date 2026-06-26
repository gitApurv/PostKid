import type { FolderItem } from "./FolderItem";

export interface FolderTreeItemProps {
  folder: FolderItem;
  collectionId: string;
  level: number;
  onAddFolder: (collectionId: string, folderId: string) => void;
  onAddRequest: (collectionId: string, folderId: string) => void;
}
