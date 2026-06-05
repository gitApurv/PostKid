export interface FolderResponse {
  id: string;
  name: string;
  collectionId: string;
  parentFolderId: string | null;
  subFolderCount: number;
  createdAt: string;
}