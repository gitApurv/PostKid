import { useCollectionStore } from "../store/collectionStore";
import RequestTreeItem from "./RequestTreeItem";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Trash2,
  FolderPlus,
  FilePlus,
  RefreshCw,
} from "lucide-react";
import type { FolderTreeItemProps } from "../types/FolderTreeItemProps";

export default function FolderTreeItem({
  folder,
  collectionId,
  level,
  onAddFolder,
  onAddRequest,
}: FolderTreeItemProps) {
  const deleteRequestAction = useCollectionStore(
    (state) => state.deleteRequestAction,
  );
  const deleteFolderAction = useCollectionStore(
    (state) => state.deleteFolderAction,
  );
  const fetchFolderDetailsAction = useCollectionStore(
    (state) => state.fetchFolderDetailsAction,
  );

  const isExpanded = useCollectionStore(
    (state) => !!state.expandedFolderIds[folder.id],
  );
  const toggleFolderExpansionAction = useCollectionStore(
    (state) => state.toggleFolderExpansionAction,
  );

  const handleExpandToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isExpanded;
    toggleFolderExpansionAction(folder.id, nextState);
    if (nextState && !folder.isLoaded && !folder.isLoading) {
      const response = await fetchFolderDetailsAction(collectionId, folder.id);
      if (response && !response.success) {
        alert(response.error || "Failed to fetch folder details.");
      }
    }
  };

  const handleDeleteFolder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      confirm(
        `Are you sure you want to permanently delete folder '${folder.name}' and all its contents?`,
      )
    ) {
      const response = await deleteFolderAction(collectionId, folder.id);
      if (response && !response.success) {
        alert(response.error || "Failed to delete folder.");
      }
    }
  };

  const handleDeleteRequest = async (reqId: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to permanently delete API request '${name}'?`,
      )
    ) {
      const response = await deleteRequestAction(
        collectionId,
        folder.id,
        reqId,
      );
      if (response && !response.success) {
        alert(response.error || "Failed to delete request.");
      }
    }
  };

  const paddingLeft = `${level * 12 + 8}px`;

  return (
    <div className="space-y-1">
      {/* Folder Header */}
      <div
        onClick={handleExpandToggle}
        style={{ paddingLeft }}
        className="flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] transition-standard group relative"
      >
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        )}

        {isExpanded ? (
          <FolderOpen className="w-3.5 h-3.5 text-brand-primary shrink-0" />
        ) : (
          <Folder className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        )}

        <span className="text-xs font-medium truncate flex-1">
          {folder.name}
        </span>

        {folder.isLoading && (
          <RefreshCw className="w-3 h-3 text-slate-500 animate-spin shrink-0 mr-1" />
        )}

        {/* Folder context triggers */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddFolder(collectionId, folder.id);
            }}
            className="p-0.5 hover:bg-white/5 rounded text-slate-500 hover:text-slate-300 transition-standard cursor-pointer"
            title="Add Subfolder"
            aria-label={`Add subfolder to ${folder.name}`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddRequest(collectionId, folder.id);
            }}
            className="p-0.5 hover:bg-white/5 rounded text-slate-500 hover:text-slate-300 transition-standard cursor-pointer"
            title="Add Request"
            aria-label={`Add request to ${folder.name}`}
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDeleteFolder}
            className="p-0.5 hover:bg-brand-error/10 rounded text-slate-500 hover:text-brand-error transition-standard cursor-pointer"
            title="Delete Folder"
            aria-label={`Delete folder ${folder.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded sub-elements */}
      {isExpanded && (
        <div className="space-y-1">
          {/* Subfolders */}
          {folder.subFolders &&
            folder.subFolders.map((subFolder) => (
              <FolderTreeItem
                key={subFolder.id}
                folder={subFolder}
                collectionId={collectionId}
                level={level + 1}
                onAddFolder={onAddFolder}
                onAddRequest={onAddRequest}
              />
            ))}

          {/* Requests */}
          <div
            style={{ paddingLeft: `${(level + 1) * 12 + 16}px` }}
            className="space-y-0.5"
          >
            {folder.requestItems &&
              folder.requestItems.map((request) => (
                <RequestTreeItem
                  key={request.id}
                  request={request}
                  onDelete={handleDeleteRequest}
                />
              ))}

            {(!folder.subFolders || folder.subFolders.length === 0) &&
              (!folder.requestItems || folder.requestItems.length === 0) && (
                <div className="text-[10px] text-slate-600 italic py-1 pl-4">
                  Empty suite
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
