import { useState, useEffect } from "react";
import { useCollectionStore } from "../../store/collectionStore";
import { useRequestStore } from "../../store/requestStore";
import type { RequestItem } from "../../types/request/RequestItem";
import FolderTreeItem from "./FolderTreeItem";
import RequestTreeItem from "./RequestTreeItem";
import {
  ChevronRight,
  Trash2,
  FileCode,
  FolderPlus,
  FilePlus,
  RefreshCw,
  Plus,
} from "lucide-react";

export default function CollectionSidebar() {
  const collections = useCollectionStore((state) => state.collections);
  const fetchCollectionsAction = useCollectionStore(
    (state) => state.fetchCollectionsAction,
  );
  const fetchCollectionDetailsAction = useCollectionStore(
    (state) => state.fetchCollectionDetailsAction,
  );
  const addCollectionAction = useCollectionStore(
    (state) => state.addCollectionAction,
  );
  const deleteCollectionAction = useCollectionStore(
    (state) => state.deleteCollectionAction,
  );
  const addFolderAction = useCollectionStore((state) => state.addFolderAction);
  const addRequestAction = useCollectionStore(
    (state) => state.addRequestAction,
  );
  const deleteRequestAction = useCollectionStore(
    (state) => state.deleteRequestAction,
  );

  const activeCollectionId = useRequestStore(
    (state) => state.activeCollectionId,
  );
  const setActiveCollectionAction = useRequestStore(
    (state) => state.setActiveCollectionAction,
  );

  const [expandedCollections, setExpandedCollections] = useState<
    Record<string, boolean>
  >({});
  const [showAddModal, setShowAddModal] = useState<{
    type: "collection" | "folder" | "request";
    collectionId?: string;
    folderId?: string | null;
  } | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newRequestType, setNewRequestType] =
    useState<RequestItem["method"]>("GET");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCollections = async () => {
      const response = await fetchCollectionsAction();
      if (response && !response.success) {
        alert(response.error || "Failed to fetch collections.");
      }
    };
    loadCollections();
  }, []);

  useEffect(() => {
    setError(null);
    setIsLoading(false);
  }, [showAddModal]);

  const toggleCollection = async (collectionId: string) => {
    const nextState = !expandedCollections[collectionId];
    setExpandedCollections((prev) => ({
      ...prev,
      [collectionId]: nextState,
    }));

    const collection = collections.find(
      (collection) => collection.id === collectionId,
    );
    if (
      nextState &&
      collection &&
      !collection.isLoaded &&
      !collection.isLoading
    ) {
      const response = await fetchCollectionDetailsAction(collectionId);
      if (response && !response.success) {
        alert(response.error || "Failed to fetch collection details.");
      }
    }
  };

  const handleAddNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !showAddModal || isLoading) return;

    setIsLoading(true);
    setError(null);

    const { type, collectionId, folderId } = showAddModal;
    let response;
    if (type === "collection") {
      response = await addCollectionAction({
        name: newItemName,
        description: newItemDescription,
      });
    } else if (type === "folder" && collectionId) {
      response = await addFolderAction(collectionId, {
        name: newItemName,
        parentFolderId: folderId || null,
      });
    } else if (type === "request" && collectionId) {
      response = await addRequestAction(collectionId, folderId || null, {
        name: newItemName,
        method: newRequestType,
        url: "{{base_url}}/endpoint",
        collectionId,
        folderId: folderId || null,
      });
    }

    if (response && !response.success) {
      setError(response.error || `Failed to add ${type}.`);
      setIsLoading(false);
    } else {
      setNewItemName("");
      setNewItemDescription("");
      setIsLoading(false);
      setShowAddModal(null);
    }
  };

  const handleCloseModal = () => {
    setNewItemName("");
    setNewItemDescription("");
    setNewRequestType("GET");
    setError(null);
    setIsLoading(false);
    setShowAddModal(null);
  };

  const handleDeleteCollection = async (collectionId: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to permanently delete collection '${name}' and all its folders/requests?`,
      )
    ) {
      const res = await deleteCollectionAction(collectionId);
      if (res && !res.success) {
        alert(res.error || "Failed to delete collection.");
      } else if (activeCollectionId === collectionId) {
        setActiveCollectionAction(null);
      }
    }
  };

  const handleDeleteRequest = async (reqId: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to permanently delete API request '${name}'?`,
      )
    ) {
      const res = await deleteRequestAction(reqId);
      if (res && !res.success) {
        alert(res.error || "Failed to delete request.");
      }
    }
  };

  return (
    <div className="w-64 bg-[#0B0F19] border-r border-white/5 h-full flex flex-col shrink-0 overflow-hidden relative z-30">
      {/* Search and Imports Header */}
      <div className="p-4 border-b border-white/5 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-brand-primary" />
            Collections
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowAddModal({ type: "collection" })}
              className="flex items-center gap-1 bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 px-2 py-1 rounded text-[10px] font-semibold text-slate-300 transition-standard cursor-pointer"
              title="New Collection"
            >
              <Plus className="w-3 text-brand-primary" />
              New
            </button>
          </div>
        </div>
      </div>

      {/* Reactive Collections Accordion Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {collections.map((collection) => {
          const isExpanded = !!expandedCollections[collection.id];
          const isActive = collection.id === activeCollectionId;

          return (
            <div key={collection.id} className="space-y-1">
              {/* Collection Title Panel */}
              <div
                className={`flex items-center justify-between px-2 py-1.5 rounded-md group relative transition-standard ${
                  isActive
                    ? "bg-brand-primary/10 text-white font-semibold"
                    : "hover:bg-white/[0.01]"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-[2px] bg-brand-primary rounded-r" />
                )}

                <span
                  onClick={() => {
                    setActiveCollectionAction(collection.id);
                    if (!isExpanded) {
                      toggleCollection(collection.id);
                    }
                  }}
                  className={`text-xs font-bold truncate tracking-wide flex items-center gap-1.5 cursor-pointer flex-1 min-w-0 ${
                    isActive ? "text-white" : "text-slate-300 hover:text-white"
                  }`}
                >
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCollection(collection.id);
                    }}
                    className="p-0.5 hover:bg-white/5 rounded text-slate-500 hover:text-slate-300 shrink-0"
                  >
                    <ChevronRight
                      className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                  </span>
                  📦 {collection.name}
                </span>

                {collection.isLoading && (
                  <RefreshCw className="w-3 h-3 text-slate-500 animate-spin mr-1.5 shrink-0" />
                )}

                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddModal({
                        type: "folder",
                        collectionId: collection.id,
                        folderId: null,
                      });
                    }}
                    className="p-0.5 hover:bg-white/5 rounded text-slate-500 hover:text-slate-300 transition-standard cursor-pointer"
                    title="Create Folder"
                    aria-label={`Create folder in ${collection.name}`}
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddModal({
                        type: "request",
                        collectionId: collection.id,
                        folderId: null,
                      });
                    }}
                    className="p-0.5 hover:bg-white/5 rounded text-slate-500 hover:text-slate-300 transition-standard cursor-pointer"
                    title="Create Request"
                    aria-label={`Create request in ${collection.name}`}
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCollection(collection.id, collection.name);
                    }}
                    className="p-0.5 hover:bg-brand-error/10 rounded text-slate-500 hover:text-brand-error transition-standard cursor-pointer"
                    title="Delete Collection"
                    aria-label={`Delete collection ${collection.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Folders & Requests tree structure */}
              {isExpanded && (
                <div className="pl-2 ml-2 border-l border-slate-800/60 space-y-1.5">
                  {/* Folders list */}
                  {collection.folders &&
                    collection.folders.map((folder) => (
                      <FolderTreeItem
                        key={folder.id}
                        folder={folder}
                        collectionId={collection.id}
                        level={0}
                        onAddFolder={(collectionId, folderId) =>
                          setShowAddModal({
                            type: "folder",
                            collectionId: collectionId,
                            folderId: folderId,
                          })
                        }
                        onAddRequest={(collectionId, folderId) =>
                          setShowAddModal({
                            type: "request",
                            collectionId: collectionId,
                            folderId: folderId,
                          })
                        }
                      />
                    ))}

                  {/* Root requests list */}
                  {collection.requests &&
                    collection.requests.map((request) => (
                      <RequestTreeItem
                        key={request.id}
                        request={request}
                        onDelete={handleDeleteRequest}
                      />
                    ))}

                  {(!collection.folders || collection.folders.length === 0) &&
                    (!collection.requests ||
                      collection.requests.length === 0) && (
                      <div className="text-[10px] text-slate-600 italic py-1 pl-2">
                        Empty collection
                      </div>
                    )}
                </div>
              )}
            </div>
          );
        })}
        {collections.length === 0 && (
          <div className="text-[11px] text-slate-500 italic text-center py-8">
            No collections found. Click "New" to create one.
          </div>
        )}
      </div>

      {/* 5. Create Folders / Request Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm rounded-xl p-5 shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-primary" />

            <h3 className="text-xs font-bold font-display text-white uppercase tracking-wider mb-4">
              Add New {showAddModal.type}
            </h3>

            <form onSubmit={handleAddNewItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {showAddModal.type} name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  disabled={isLoading}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={
                    showAddModal.type === "collection"
                      ? "User Service APIs"
                      : showAddModal.type === "folder"
                        ? "Authentication Suite"
                        : "Post Authenticate"
                  }
                  className="block w-full px-3 py-2 bg-brand-layer-2 border border-white/5 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-primary disabled:opacity-50"
                />
              </div>

              {showAddModal.type === "collection" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Collection description
                  </label>
                  <textarea
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                    placeholder="Describe the purpose of this collection..."
                    rows={3}
                    disabled={isLoading}
                    className="block w-full px-3 py-2 bg-brand-layer-2 border border-white/5 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-primary resize-none disabled:opacity-50"
                  />
                </div>
              )}

              {showAddModal.type === "request" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    HTTP method
                  </label>
                  <select
                    value={newRequestType}
                    disabled={isLoading}
                    onChange={(e) =>
                      setNewRequestType(e.target.value as RequestItem["method"])
                    }
                    className="block w-full bg-brand-layer-2 border border-white/5 rounded-lg text-xs text-slate-300 p-2 focus:outline-none focus:border-brand-primary disabled:opacity-50"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>
              )}

              {error && (
                <div className="text-[11px] text-rose-400 bg-rose-950/20 border border-rose-900/30 rounded-lg p-2.5">
                  {error}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                  className="px-3 py-1.5 hover:bg-white/5 rounded-lg text-[11px] font-semibold text-slate-400 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-3.5 py-1.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg text-[11px] font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Adding..." : "Confirm Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
