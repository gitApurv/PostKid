export interface CollectionResponse {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  ownerUsername: string;
  folderCount: number;
  createdAt: string;
  updatedAt: string;
}
