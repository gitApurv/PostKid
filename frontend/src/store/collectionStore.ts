import { create } from "zustand";
import api from "../lib/axios";
import axios from "axios";
import type { ApiResponse } from "../types/common/ApiResponse";
import type { CollectionItem } from "../types/collection/CollectionItem";
import type { FolderItem } from "../types/collection/FolderItem";
import type { RequestItem } from "../types/request/RequestItem";
import type { CollectionState } from "../types/collection/CollectionState";
import type { CollectionResponse } from "../types/collection/CollectionResponse";
import type { FolderResponse } from "../types/collection/FolderResponse";
import type { RequestItemResponse } from "../types/request/RequestItemResponse";
import type { CollectionRequest } from "../types/collection/CollectionRequest";
import type { FolderRequest } from "../types/collection/FolderRequest";
import type { RequestItemRequest } from "../types/request/RequestItemRequest";
import { useRequestStore } from "./requestStore";

const updateFolderInList = (
  folders: FolderItem[],
  folderId: string,
  updater: (folder: FolderItem) => Partial<FolderItem>,
): FolderItem[] => {
  return folders.map((folder) => {
    if (folder.id === folderId) {
      return { ...folder, ...updater(folder) };
    }
    if (folder.subfolders && folder.subfolders.length > 0) {
      return {
        ...folder,
        subfolders: updateFolderInList(folder.subfolders, folderId, updater),
      };
    }
    return folder;
  });
};

const updateCollectionInList = (
  collections: CollectionItem[],
  collectionId: string,
  updater: (collection: CollectionItem) => Partial<CollectionItem>,
): CollectionItem[] => {
  return collections.map((collection) => {
    if (collection.id === collectionId) {
      return { ...collection, ...updater(collection) };
    }
    return collection;
  });
};

export const useCollectionStore = create<CollectionState>((set) => ({
  collections: [],

  fetchCollectionsAction: async () => {
    try {
      const collectionsRes =
        await api.get<ApiResponse<CollectionResponse[]>>("/collections");
      if (collectionsRes.data.success && collectionsRes.data.data) {
        const collections: CollectionItem[] = collectionsRes.data.data.map(
          (collection) => ({
            id: collection.id,
            name: collection.name,
            description: collection.description || "",
            folderCount: collection.folderCount,
            folders: [],
            requests: [],
            isLoaded: false,
            ownerUsername: collection.ownerUsername,
            createdAt: collection.createdAt,
            updatedAt: collection.updatedAt,
          }),
        );
        set({ collections });
        return { success: true };
      } else {
        return {
          success: false,
          error: collectionsRes.data.message || "Failed to fetch collections.",
        };
      }
    } catch (error) {
      console.error("Failed to fetch collections:", error);
      let errorMessage = "Failed to fetch collections.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  fetchCollectionDetailsAction: async (collectionId) => {
    set((state) => ({
      collections: updateCollectionInList(
        state.collections,
        collectionId,
        () => ({ isLoading: true }),
      ),
    }));

    try {
      const foldersRes = await api.get<ApiResponse<FolderResponse[]>>(
        `/collections/${collectionId}/folders`,
      );
      const requestsRes = await api.get<ApiResponse<RequestItemResponse[]>>(
        `/requests/collection/${collectionId}/root`,
      );

      const folders: FolderItem[] = foldersRes.data.data.map((folder) => ({
        id: folder.id,
        name: folder.name,
        collectionId: folder.collectionId,
        parentFolderId: folder.parentFolderId,
        subfolderCount: folder.subFolderCount,
        subfolders: [],
        requests: [],
        isLoaded: false,
      }));

      const requests: RequestItem[] = requestsRes.data.data.map((request) => {
        const urlObj = request.url ? request.url.split("?") : [""];
        const paramString = urlObj[1] || "";
        const params = paramString
          .split("&")
          .filter(Boolean)
          .map((param) => {
            const [key, value] = param.split("=");
            return {
              key,
              value: decodeURIComponent(value || ""),
              active: true,
            };
          });

        const headers = request.headers
          ? Object.entries(request.headers).map(([key, value]) => ({
              key,
              value: value as string,
              active: true,
            }))
          : [];

        return {
          id: request.id,
          name: request.name,
          method: request.method,
          url: request.url || "",
          params,
          headers,
          bodyType: request.body ? "json" : "none",
          bodyJson: request.body || "",
          authType: request.authType || "none",
          authValue: request.authValue || {},
          folderId: request.folderId,
          collectionId: request.collectionId,
          timeoutMs: request.timeoutMs || 5000,
        };
      });

      set((state) => ({
        collections: updateCollectionInList(
          state.collections,
          collectionId,
          () => ({
            folders,
            requests,
            isLoaded: true,
            isLoading: false,
          }),
        ),
      }));
      return { success: true };
    } catch (error) {
      console.error("Failed to fetch collection details:", error);
      set((state) => ({
        collections: updateCollectionInList(
          state.collections,
          collectionId,
          () => ({ isLoading: false }),
        ),
      }));
      let errorMessage = "Failed to fetch collection details.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  addCollectionAction: async (req: CollectionRequest) => {
    try {
      const addCollectionRes = await api.post<ApiResponse<CollectionResponse>>(
        "/collections",
        req,
      );
      if (addCollectionRes.data.success && addCollectionRes.data.data) {
        const newCollection: CollectionItem = {
          id: addCollectionRes.data.data.id,
          name: addCollectionRes.data.data.name,
          description: addCollectionRes.data.data.description || "",
          folderCount: 0,
          folders: [],
          requests: [],
          isLoaded: true,
          ownerUsername: addCollectionRes.data.data.ownerUsername,
          createdAt: addCollectionRes.data.data.createdAt,
          updatedAt: addCollectionRes.data.data.updatedAt,
        };
        set((state) => ({
          collections: [...state.collections, newCollection],
        }));
        return { success: true };
      } else {
        return {
          success: false,
          error: addCollectionRes.data.message || "Failed to add collection.",
        };
      }
    } catch (error) {
      console.error("Failed to add collection:", error);
      let errorMessage = "Failed to add collection.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  updateCollectionAction: async (id, req: CollectionRequest) => {
    try {
      const updateCollectionRes = await api.put<
        ApiResponse<CollectionResponse>
      >(`/collections/${id}`, req);
      if (updateCollectionRes.data.success && updateCollectionRes.data.data) {
        const updated = updateCollectionRes.data.data;
        set((state) => ({
          collections: updateCollectionInList(state.collections, id, () => ({
            name: updated.name,
            description: updated.description || "",
            updatedAt: updated.updatedAt,
          })),
        }));
        return { success: true };
      } else {
        return {
          success: false,
          error:
            updateCollectionRes.data.message || "Failed to update collection.",
        };
      }
    } catch (error) {
      console.error("Failed to update collection:", error);
      let errorMessage = "Failed to update collection.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  deleteCollectionAction: async (id) => {
    try {
      const deleteCollectionRes = await api.delete<ApiResponse<unknown>>(
        `/collections/${id}`,
      );
      if (
        deleteCollectionRes.data &&
        deleteCollectionRes.data.success === false
      ) {
        return {
          success: false,
          error:
            deleteCollectionRes.data.message || "Failed to delete collection.",
        };
      }
      set((state) => ({
        collections: state.collections.filter(
          (collection) => collection.id !== id,
        ),
      }));
      return { success: true };
    } catch (error) {
      console.error("Failed to delete collection:", error);
      let errorMessage = "Failed to delete collection.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  fetchFolderDetailsAction: async (collectionId, folderId) => {
    set((state) => {
      const collections = state.collections.map((collection) => {
        if (collection.id === collectionId && collection.folders) {
          return {
            ...collection,
            folders: updateFolderInList(collection.folders, folderId, () => ({
              isLoading: true,
            })),
          };
        }
        return collection;
      });
      return { collections };
    });

    try {
      const subfoldersRes = await api.get<ApiResponse<FolderResponse[]>>(
        `/collections/${collectionId}/folders/${folderId}/subfolders`,
      );
      const requestsRes = await api.get<ApiResponse<RequestItemResponse[]>>(
        `/requests/collection/${collectionId}/folders/${folderId}`,
      );

      const subfolders: FolderItem[] = subfoldersRes.data.data.map(
        (folder) => ({
          id: folder.id,
          name: folder.name,
          collectionId: folder.collectionId,
          parentFolderId: folder.parentFolderId,
          subfolderCount: folder.subFolderCount,
          subfolders: [],
          requests: [],
          isLoaded: false,
        }),
      );

      const requests: RequestItem[] = requestsRes.data.data.map((request) => {
        const urlObj = request.url ? request.url.split("?") : [""];
        const paramString = urlObj[1] || "";
        const params = paramString
          .split("&")
          .filter(Boolean)
          .map((param) => {
            const [key, value] = param.split("=");
            return {
              key,
              value: decodeURIComponent(value || ""),
              active: true,
            };
          });

        const headers = request.headers
          ? Object.entries(request.headers).map(([key, value]) => ({
              key,
              value: value as string,
              active: true,
            }))
          : [];

        return {
          id: request.id,
          name: request.name,
          method: request.method,
          url: request.url || "",
          params,
          headers,
          bodyType: request.body ? "json" : "none",
          bodyJson: request.body || "",
          authType: request.authType || "none",
          authValue: request.authValue || {},
          folderId: request.folderId,
          collectionId: request.collectionId,
          timeoutMs: request.timeoutMs || 5000,
        };
      });

      set((state) => {
        const collections = state.collections.map((collection) => {
          if (collection.id === collectionId && collection.folders) {
            return {
              ...collection,
              folders: updateFolderInList(collection.folders, folderId, () => ({
                subfolders,
                requests,
                isLoaded: true,
                isLoading: false,
              })),
            };
          }
          return collection;
        });
        return { collections };
      });
      return { success: true };
    } catch (error) {
      console.error("Failed to fetch folder details:", error);
      set((state) => {
        const collections = state.collections.map((collection) => {
          if (collection.id === collectionId && collection.folders) {
            return {
              ...collection,
              folders: updateFolderInList(collection.folders, folderId, () => ({
                isLoading: false,
              })),
            };
          }
          return collection;
        });
        return { collections };
      });
      let errorMessage = "Failed to fetch folder details.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  addFolderAction: async (collectionId, req: FolderRequest) => {
    try {
      const addFolderRes = await api.post<ApiResponse<FolderResponse>>(
        `/collections/${collectionId}/folders`,
        req,
      );

      if (addFolderRes.data.success && addFolderRes.data.data) {
        const newFolder: FolderItem = {
          id: addFolderRes.data.data.id,
          name: addFolderRes.data.data.name,
          collectionId: addFolderRes.data.data.collectionId,
          parentFolderId: addFolderRes.data.data.parentFolderId,
          subfolderCount: 0,
          subfolders: [],
          requests: [],
          isLoaded: true,
        };

        set((state) => {
          const collections = state.collections.map((collection) => {
            if (collection.id === collectionId) {
              if (req.parentFolderId) {
                return {
                  ...collection,
                  folders: updateFolderInList(
                    collection.folders || [],
                    req.parentFolderId,
                    (folder) => ({
                      subfolders: [...(folder.subfolders || []), newFolder],
                      subfolderCount: (folder.subfolderCount || 0) + 1,
                    }),
                  ),
                };
              } else {
                return {
                  ...collection,
                  folders: [...(collection.folders || []), newFolder],
                  folderCount: (collection.folderCount || 0) + 1,
                };
              }
            }
            return collection;
          });
          return { collections };
        });
        return { success: true };
      } else {
        return {
          success: false,
          error: addFolderRes.data.message || "Failed to add folder.",
        };
      }
    } catch (error) {
      console.error("Failed to add folder:", error);
      let errorMessage = "Failed to add folder.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  deleteFolderAction: async (collectionId, folderId) => {
    try {
      const deleteFolderRes = await api.delete<ApiResponse<unknown>>(
        `/collections/${collectionId}/folders/${folderId}`,
      );
      if (deleteFolderRes.data && deleteFolderRes.data.success === false) {
        return {
          success: false,
          error: deleteFolderRes.data.message || "Failed to delete folder.",
        };
      }

      set((state) => {
        const removeFolderFromList = (list: FolderItem[]): FolderItem[] => {
          return list
            .filter((folder) => folder.id !== folderId)
            .map((folder) => {
              if (folder.subfolders && folder.subfolders.length > 0) {
                return {
                  ...folder,
                  subfolders: removeFolderFromList(folder.subfolders),
                };
              }
              return folder;
            });
        };

        const collections = state.collections.map((collection) => {
          if (collection.id === collectionId && collection.folders) {
            return {
              ...collection,
              folders: removeFolderFromList(collection.folders),
              folderCount: Math.max(0, (collection.folderCount || 0) - 1),
            };
          }
          return collection;
        });

        return { collections };
      });
      return { success: true };
    } catch (error) {
      console.error("Failed to delete folder:", error);
      let errorMessage = "Failed to delete folder.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  addRequestAction: async (collectionId, folderId, req: RequestItemRequest) => {
    try {
      const addRequestRes = await api.post<ApiResponse<RequestItemResponse>>(
        "/requests",
        req,
      );
      if (addRequestRes.data.success && addRequestRes.data.data) {
        const requestResponse = addRequestRes.data.data;
        const urlObj = requestResponse.url
          ? requestResponse.url.split("?")
          : [""];
        const paramString = urlObj[1] || "";
        const params = paramString
          .split("&")
          .filter(Boolean)
          .map((param) => {
            const [key, val] = param.split("=");
            return { key, value: decodeURIComponent(val || ""), active: true };
          });

        const headers = requestResponse.headers
          ? Object.entries(requestResponse.headers).map(([key, value]) => ({
              key,
              value: value as string,
              active: true,
            }))
          : [];

        const newReq: RequestItem = {
          id: requestResponse.id,
          name: requestResponse.name,
          method: requestResponse.method,
          url: requestResponse.url || "",
          params,
          headers,
          bodyType: requestResponse.body ? "json" : "none",
          bodyJson: requestResponse.body || "",
          authType: requestResponse.authType || "none",
          authValue: requestResponse.authValue || {},
          folderId: requestResponse.folderId,
          collectionId: requestResponse.collectionId,
          timeoutMs: requestResponse.timeoutMs || 5000,
        };
        set((state) => {
          const collections = state.collections.map((collection) => {
            if (collection.id === collectionId) {
              if (folderId) {
                return {
                  ...collection,
                  folders: updateFolderInList(
                    collection.folders || [],
                    folderId,
                    (folder) => ({
                      requests: [...(folder.requests || []), newReq],
                    }),
                  ),
                };
              } else {
                return {
                  ...collection,
                  requests: [...(collection.requests || []), newReq],
                };
              }
            }
            return collection;
          });
          return { collections };
        });

        useRequestStore.getState().setActiveRequestDirectlyAction(newReq);
        return { success: true };
      } else {
        return {
          success: false,
          error: addRequestRes.data.message || "Failed to add request.",
        };
      }
    } catch (error) {
      console.error("Failed to add request:", error);
      let errorMessage = "Failed to add request.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  deleteRequestAction: async (requestId) => {
    try {
      const deleteRequestRes = await api.delete<ApiResponse<unknown>>(
        `/requests/${requestId}`,
      );
      if (deleteRequestRes.data && deleteRequestRes.data.success === false) {
        return {
          success: false,
          error: deleteRequestRes.data.message || "Failed to delete request.",
        };
      }

      set((state) => {
        const removeRequestFromFolders = (
          folders: FolderItem[],
        ): FolderItem[] => {
          return folders.map((folder) => ({
            ...folder,
            requests: (folder.requests || []).filter(
              (request) => request.id !== requestId,
            ),
            subfolders: folder.subfolders
              ? removeRequestFromFolders(folder.subfolders)
              : [],
          }));
        };

        const collections = state.collections.map((collection) => ({
          ...collection,
          requests: (collection.requests || []).filter(
            (request) => request.id !== requestId,
          ),
          folders: collection.folders
            ? removeRequestFromFolders(collection.folders)
            : [],
        }));

        return { collections };
      });

      if (useRequestStore.getState().activeRequestId === requestId) {
        useRequestStore.getState().setActiveRequestDirectlyAction(null);
      }
      return { success: true };
    } catch (error) {
      console.error("Failed to delete request:", error);
      let errorMessage = "Failed to delete request.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  syncRequestInTreeAction: (updated) => {
    set((state) => {
      const updateRequestInFolders = (folders: FolderItem[]): FolderItem[] => {
        return folders.map((folder) => ({
          ...folder,
          requests: (folder.requests || []).map((request) =>
            request.id === updated.id ? updated : request,
          ),
          subfolders: folder.subfolders
            ? updateRequestInFolders(folder.subfolders)
            : [],
        }));
      };
      const collections = state.collections.map((collection) => ({
        ...collection,
        requests: (collection.requests || []).map((request) =>
          request.id === updated.id ? updated : request,
        ),
        folders: collection.folders
          ? updateRequestInFolders(collection.folders)
          : [],
      }));
      return { collections };
    });
    return { success: true };
  },
}));
