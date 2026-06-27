import { create } from "zustand";
import api from "../../config/axios";
import axios from "axios";
import type { ApiResponse } from "../../common/types/ApiResponse";
import type { CollectionItem } from "../types/CollectionItem";
import type { FolderItem } from "../types/FolderItem";
import type { RequestItem } from "../../request/types/RequestItem";
import type { CollectionState } from "../types/CollectionState";
import type { CollectionResponse } from "../types/CollectionResponse";
import type { FolderResponse } from "../types/FolderResponse";
import type { RequestItemResponse } from "../../request/types/RequestItemResponse";
import type { CollectionRequest } from "../types/CollectionRequest";
import type { FolderRequest } from "../types/FolderRequest";
import type { RequestItemRequest } from "../../request/types/RequestItemRequest";
import { useRequestStore } from "../../request/store/requestStore";
import { useWorkspaceStore } from "../../workspace/store/workspaceStore";

const updateFolderInList = (
  folders: FolderItem[],
  folderId: string,
  updater: (folder: FolderItem) => Partial<FolderItem>,
): FolderItem[] => {
  return folders.map((folder) => {
    if (folder.id === folderId) {
      return { ...folder, ...updater(folder) };
    }
    if (folder.subFolders && folder.subFolders.length > 0) {
      return {
        ...folder,
        subFolders: updateFolderInList(folder.subFolders, folderId, updater),
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
  expandedFolderIds: {},

  toggleFolderExpansionAction: (folderId, expand) => {
    set((state) => {
      const nextState = expand !== undefined ? expand : !state.expandedFolderIds[folderId];
      return {
        expandedFolderIds: {
          ...state.expandedFolderIds,
          [folderId]: nextState,
        },
      };
    });
  },

  fetchCollectionsAction: async () => {
    const wId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!wId) {
      set({ collections: [] });
      return { success: true };
    }
    try {
      const collectionsRes =
        await api.get<ApiResponse<CollectionResponse[]>>(`/workspaces/${wId}/collections`);
      if (collectionsRes.data.success && collectionsRes.data.data) {
        const collections: CollectionItem[] = collectionsRes.data.data.map(
          (collection) => ({
            id: collection.id,
            name: collection.name,
            description: collection.description || "",
            folderCount: collection.folderCount,
            folders: [],
            requestItems: [],
            isLoaded: false,
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
    const wId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!wId) {
      return { success: false, error: "No active workspace selected" };
    }
    set((state) => ({
      collections: updateCollectionInList(
        state.collections,
        collectionId,
        () => ({ isLoading: true }),
      ),
    }));

    try {
      const foldersRes = await api.get<ApiResponse<FolderResponse[]>>(
        `/workspaces/${wId}/collections/${collectionId}/folders`,
      );
      const requestsRes = await api.get<ApiResponse<RequestItemResponse[]>>(
        `/workspaces/${wId}/collections/${collectionId}/requests`,
      );

      const folders: FolderItem[] = (foldersRes.data.data || []).map((folder) => ({
        id: folder.id,
        name: folder.name,
        collectionId: collectionId,
        parentFolderId: null,
        subFolderCount: folder.subFolderCount,
        subFolders: [],
        requestItems: [],
        isLoaded: false,
      }));

      const requests: RequestItem[] = (requestsRes.data.data || []).map((request) => {
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
          folderId: null,
          collectionId: collectionId,
          timeoutMs: request.timeoutMs || 5000,
        };
      });

      set((state) => ({
        collections: updateCollectionInList(
          state.collections,
          collectionId,
          () => ({
            folders,
            requestItems: requests,
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
    const wId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!wId) {
      return { success: false, error: "No active workspace selected" };
    }
    try {
      const addCollectionRes = await api.post<ApiResponse<CollectionResponse>>(
        `/workspaces/${wId}/collections`,
        req,
      );
      if (addCollectionRes.data.success && addCollectionRes.data.data) {
        const newCollection: CollectionItem = {
          id: addCollectionRes.data.data.id,
          name: addCollectionRes.data.data.name,
          description: addCollectionRes.data.data.description || "",
          folderCount: 0,
          folders: [],
          requestItems: [],
          isLoaded: true,
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
    const wId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!wId) {
      return { success: false, error: "No active workspace selected" };
    }
    try {
      const updateCollectionRes = await api.put<
        ApiResponse<CollectionResponse>
      >(`/workspaces/${wId}/collections/${id}`, req);
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
    const wId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!wId) {
      return { success: false, error: "No active workspace selected" };
    }
    try {
      const deleteCollectionRes = await api.delete<ApiResponse<unknown>>(
        `/workspaces/${wId}/collections/${id}`,
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

      const requestStore = useRequestStore.getState();
      if (
        requestStore.activeRequest?.collectionId === id ||
        requestStore.activeCollectionId === id
      ) {
        requestStore.setActiveCollectionAction(null);
      }

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
    const wId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!wId) {
      return { success: false, error: "No active workspace selected" };
    }
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
        `/workspaces/${wId}/collections/${collectionId}/folders/${folderId}/subfolders`,
      );
      const requestsRes = await api.get<ApiResponse<RequestItemResponse[]>>(
        `/workspaces/${wId}/collections/${collectionId}/folders/${folderId}/requests`,
      );

      const subfolders: FolderItem[] = (subfoldersRes.data.data || []).map(
        (folder) => ({
          id: folder.id,
          name: folder.name,
          collectionId: collectionId,
          parentFolderId: folderId,
          subFolderCount: folder.subFolderCount,
          subFolders: [],
          requestItems: [],
          isLoaded: false,
        }),
      );

      const requests: RequestItem[] = (requestsRes.data.data || []).map((request) => {
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
          folderId: folderId,
          collectionId: collectionId,
          timeoutMs: request.timeoutMs || 5000,
        };
      });

      set((state) => {
        const collections = state.collections.map((collection) => {
          if (collection.id === collectionId && collection.folders) {
            return {
              ...collection,
              folders: updateFolderInList(collection.folders, folderId, () => ({
                subFolders: subfolders,
                requestItems: requests,
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
    const wId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!wId) {
      return { success: false, error: "No active workspace selected" };
    }
    try {
      const url = req.parentFolderId
        ? `/workspaces/${wId}/collections/${collectionId}/folders/${req.parentFolderId}/subfolders`
        : `/workspaces/${wId}/collections/${collectionId}/folders`;

      const addFolderRes = await api.post<ApiResponse<FolderResponse>>(
        url,
        { name: req.name }
      );

      if (addFolderRes.data.success && addFolderRes.data.data) {
        const newFolder: FolderItem = {
          id: addFolderRes.data.data.id,
          name: addFolderRes.data.data.name,
          collectionId: collectionId,
          parentFolderId: req.parentFolderId || null,
          subFolderCount: 0,
          subFolders: [],
          requestItems: [],
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
                      subFolders: [...(folder.subFolders || []), newFolder],
                      subFolderCount: (folder.subFolderCount || 0) + 1,
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
    const wId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!wId) {
      return { success: false, error: "No active workspace selected" };
    }
    try {
      const deleteFolderRes = await api.delete<ApiResponse<unknown>>(
        `/workspaces/${wId}/collections/${collectionId}/folders/${folderId}`,
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
              if (folder.subFolders && folder.subFolders.length > 0) {
                return {
                  ...folder,
                  subFolders: removeFolderFromList(folder.subFolders),
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

      const activeRequest = useRequestStore.getState().activeRequest;
      if (activeRequest) {
        const isRequestInDeletedFolderOrSub = (
          folders: FolderItem[],
          targetFolderId: string,
          activeReqId: string,
        ): boolean => {
          const findAndCheck = (list: FolderItem[]): boolean => {
            for (const folder of list) {
              if (folder.id === targetFolderId) {
                const checkInside = (f: FolderItem): boolean => {
                  if (f.requestItems?.some((r) => r.id === activeReqId)) return true;
                  if (f.subFolders) {
                    for (const sf of f.subFolders) {
                      if (checkInside(sf)) return true;
                    }
                  }
                  return false;
                };
                return checkInside(folder);
              }
              if (folder.subFolders) {
                if (findAndCheck(folder.subFolders)) return true;
              }
            }
            return false;
          };
          return findAndCheck(folders);
        };

        const collection = useCollectionStore.getState().collections.find((c: any) => c.id === collectionId);
        if (collection && collection.folders) {
          if (
            isRequestInDeletedFolderOrSub(
              collection.folders,
              folderId,
              activeRequest.id,
            )
          ) {
            useRequestStore.getState().setActiveRequestDirectlyAction(null);
          }
        }
      }

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
    const wId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!wId) {
      return { success: false, error: "No active workspace selected" };
    }
    try {
      const url = folderId
        ? `/workspaces/${wId}/collections/${collectionId}/folders/${folderId}/requests`
        : `/workspaces/${wId}/collections/${collectionId}/requests`;

      // Extract only valid fields for backend RequestItemRequest payload
      const payload = {
        name: req.name,
        method: req.method,
        url: req.url,
        body: req.body,
        headers: req.headers,
        authType: req.authType,
        authValue: req.authValue,
        timeoutMs: req.timeoutMs,
      };

      const addRequestRes = await api.post<ApiResponse<RequestItemResponse>>(
        url,
        payload,
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
          folderId: folderId,
          collectionId: collectionId,
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
                      requestItems: [...(folder.requestItems || []), newReq],
                    }),
                  ),
                };
              } else {
                return {
                  ...collection,
                  requestItems: [...(collection.requestItems || []), newReq],
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

  deleteRequestAction: async (collectionId, folderId, requestId) => {
    const wId = useWorkspaceStore.getState().activeWorkspaceId;
    if (!wId) {
      return { success: false, error: "No active workspace selected" };
    }
    try {
      const url = folderId
        ? `/workspaces/${wId}/collections/${collectionId}/folders/${folderId}/requests/${requestId}`
        : `/workspaces/${wId}/collections/${collectionId}/requests/${requestId}`;

      const deleteRequestRes = await api.delete<ApiResponse<unknown>>(url);
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
            requestItems: (folder.requestItems || []).filter(
              (request) => request.id !== requestId,
            ),
            subFolders: folder.subFolders
              ? removeRequestFromFolders(folder.subFolders)
              : [],
          }));
        };

        const collections = state.collections.map((collection) => ({
          ...collection,
          requestItems: (collection.requestItems || []).filter(
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
          requestItems: (folder.requestItems || []).map((request) =>
            request.id === updated.id ? updated : request,
          ),
          subFolders: folder.subFolders
            ? updateRequestInFolders(folder.subFolders)
            : [],
        }));
      };
      const collections = state.collections.map((collection) => ({
        ...collection,
        requestItems: (collection.requestItems || []).map((request) =>
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
