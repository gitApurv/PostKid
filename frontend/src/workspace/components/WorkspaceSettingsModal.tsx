import { useState } from "react";
import { useWorkspaceStore } from "../store/workspaceStore";
import { Plus, Trash2, Edit3, Check, X, Loader2, Settings, Users, UserPlus } from "lucide-react";
import type { WorkspaceRole, MemberResponse } from "../types/MemberResponse";

export interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkspaceSettingsModal({
  isOpen,
  onClose,
}: WorkspaceSettingsModalProps) {
  const {
    workspaces,
    activeWorkspaceId,
    createWorkspaceAction,
    updateWorkspaceAction,
    deleteWorkspaceAction,
    fetchMembersAction,
    inviteMemberAction,
    removeMemberAction,
  } = useWorkspaceStore();

  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Members Management State
  const [expandedWorkspaceId, setExpandedWorkspaceId] = useState<string | null>(null);
  const [membersMap, setMembersMap] = useState<Record<string, MemberResponse[]>>({});
  const [loadingMembers, setLoadingMembers] = useState<Record<string, boolean>>({});
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("MEMBER");
  const [isInviting, setIsInviting] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim() || isCreating) return;

    setIsCreating(true);
    setErrorMsg("");

    const res = await createWorkspaceAction({
      name: newWorkspaceName.trim(),
      description: newWorkspaceDescription.trim() || undefined,
    });

    if (res.success) {
      setNewWorkspaceName("");
      setNewWorkspaceDescription("");
      setIsCreating(false);
    } else {
      setErrorMsg(res.error || "Failed to create workspace.");
      setIsCreating(false);
    }
  };

  const handleStartEdit = (id: string, name: string, desc: string | null) => {
    setEditingId(id);
    setEditName(name);
    setEditDescription(desc || "");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim() || isSaving) return;

    setIsSaving(true);
    const res = await updateWorkspaceAction(id, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
    });

    if (res.success) {
      setEditingId(null);
      setIsSaving(false);
    } else {
      alert(res.error || "Failed to update workspace.");
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete workspace "${name}"?`)) {
      const res = await deleteWorkspaceAction(id);
      if (!res.success) {
        alert(res.error || "Failed to delete workspace.");
      }
    }
  };

  const handleToggleMembers = async (workspaceId: string) => {
    if (expandedWorkspaceId === workspaceId) {
      setExpandedWorkspaceId(null);
      return;
    }

    setExpandedWorkspaceId(workspaceId);
    setInviteEmail("");
    setInviteRole("MEMBER");

    // Fetch members if not already fetched or to refresh
    setLoadingMembers((prev) => ({ ...prev, [workspaceId]: true }));
    const res = await fetchMembersAction(workspaceId);
    if (res.success && res.data) {
      setMembersMap((prev) => ({ ...prev, [workspaceId]: res.data! }));
    } else {
      alert(res.error || "Failed to fetch workspace members.");
    }
    setLoadingMembers((prev) => ({ ...prev, [workspaceId]: false }));
  };

  const handleInvite = async (e: React.FormEvent, workspaceId: string) => {
    e.preventDefault();
    if (!inviteEmail.trim() || isInviting) return;

    setIsInviting(true);
    const res = await inviteMemberAction(workspaceId, {
      email: inviteEmail.trim(),
      role: inviteRole,
    });

    if (res.success && res.data) {
      // Append new member locally
      setMembersMap((prev) => ({
        ...prev,
        [workspaceId]: [...(prev[workspaceId] || []), res.data!],
      }));
      setInviteEmail("");
      setInviteRole("MEMBER");
    } else {
      alert(res.error || "Failed to invite member.");
    }
    setIsInviting(false);
  };

  const handleRemoveMember = async (workspaceId: string, userId: string, username: string) => {
    if (confirm(`Are you sure you want to remove member "${username}" from this workspace?`)) {
      const res = await removeMemberAction(workspaceId, userId);
      if (res.success) {
        // Remove member locally
        setMembersMap((prev) => ({
          ...prev,
          [workspaceId]: (prev[workspaceId] || []).filter((m) => m.userId !== userId),
        }));
      } else {
        alert(res.error || "Failed to remove member.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="glass-panel w-full max-w-2xl rounded-xl p-6 shadow-2xl relative flex flex-col max-h-[85vh] animate-float z-10">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-primary to-brand-secondary" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 shrink-0">
          <h3 className="text-base font-semibold font-display text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-primary" />
            Workspace Settings
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-standard cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* Workspaces List */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Active Workspaces
            </h4>
            <div className="space-y-2.5">
              {workspaces.map((workspace) => {
                const isEditingThis = editingId === workspace.id;
                const isCurrentActive = workspace.id === activeWorkspaceId;
                const isMembersExpanded = expandedWorkspaceId === workspace.id;
                const workspaceMembers = membersMap[workspace.id] || [];
                const isMembersLoading = loadingMembers[workspace.id] || false;

                return (
                  <div
                    key={workspace.id}
                    className={`p-3 rounded-lg border transition-all space-y-3 ${isCurrentActive
                        ? "bg-brand-primary/5 border-brand-primary/20"
                        : "bg-white/[0.01] border-white/5"
                      }`}
                  >
                    {isEditingThis ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="block w-full px-3 py-1.5 bg-brand-layer-2 border border-white/5 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                        />
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={2}
                          className="block w-full px-3 py-1.5 bg-brand-layer-2 border border-white/5 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                          placeholder="Description..."
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-slate-200 transition-standard cursor-pointer flex items-center gap-1 text-xs"
                          >
                            <X className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(workspace.id)}
                            disabled={isSaving}
                            className="px-2.5 py-1 bg-brand-primary hover:bg-brand-secondary text-white rounded transition-standard cursor-pointer flex items-center gap-1 text-xs"
                          >
                            {isSaving ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-white truncate">
                              {workspace.name}
                            </span>
                            {workspace.isDefault && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide bg-brand-primary/10 text-brand-primary border border-brand-primary/20 leading-none">
                                Default
                              </span>
                            )}
                            {isCurrentActive && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide bg-brand-success/10 text-brand-success border border-brand-success/20 leading-none">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2">
                            {workspace.description || "No description provided."}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {workspace.memberCount} member(s)
                            </span>
                            <span>•</span>
                            <span>Owner: {workspace.ownerUsername}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleToggleMembers(workspace.id)}
                            className={`p-1 rounded transition-standard cursor-pointer ${isMembersExpanded ? "bg-brand-primary/10 text-brand-primary" : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
                              }`}
                            title="Manage Members"
                          >
                            <Users className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              handleStartEdit(
                                workspace.id,
                                workspace.name,
                                workspace.description
                              )
                            }
                            className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-slate-200 transition-standard cursor-pointer"
                            title="Edit Workspace"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {!workspace.isDefault && (
                            <button
                              onClick={() => handleDelete(workspace.id, workspace.name)}
                              className="p-1 hover:bg-brand-error/10 rounded text-slate-400 hover:text-brand-error transition-standard cursor-pointer"
                              title="Delete Workspace"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Members Collapsible Panel */}
                    {isMembersExpanded && (
                      <div className="border-t border-white/5 pt-3 mt-3 space-y-3 pl-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            Workspace Members
                          </span>
                        </div>

                        {isMembersLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {/* Invite Form */}
                            <form
                              onSubmit={(e) => handleInvite(e, workspace.id)}
                              className="flex gap-2 items-center bg-white/[0.02] p-2 rounded-lg border border-white/5"
                            >
                              <input
                                type="email"
                                required
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="collaborator@email.com"
                                className="block flex-1 min-w-0 px-2 py-1 bg-brand-layer-2 border border-white/5 rounded-md text-[11px] text-slate-200 focus:outline-none focus:border-brand-primary"
                              />
                              <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                                className="bg-brand-layer-2 border border-white/5 rounded-md text-[11px] text-slate-200 px-2 py-1 focus:outline-none focus:border-brand-primary"
                              >
                                <option value="ADMIN">ADMIN</option>
                                <option value="MEMBER">MEMBER</option>
                                <option value="VIEWER">VIEWER</option>
                              </select>
                              <button
                                type="submit"
                                disabled={isInviting || !inviteEmail}
                                className="px-2.5 py-1 bg-brand-primary hover:bg-brand-secondary text-white rounded-md text-[11px] font-semibold transition-standard cursor-pointer flex items-center gap-1 disabled:opacity-50"
                              >
                                {isInviting ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <UserPlus className="w-3 h-3" />
                                )}
                                Invite
                              </button>
                            </form>

                            {/* Members list */}
                            <div className="max-h-[160px] overflow-y-auto space-y-1.5 divide-y divide-white/5 pr-1">
                              {workspaceMembers.map((member) => (
                                <div
                                  key={member.userId}
                                  className="flex items-center justify-between text-xs py-1.5 first:pt-0"
                                >
                                  <div className="min-w-0 pr-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-semibold text-slate-200 truncate">
                                        {member.username}
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-mono">
                                        ({member.role})
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 truncate">{member.email}</p>
                                  </div>

                                  {/* Delete member button */}
                                  {workspace.ownerUsername !== member.username && (
                                    <button
                                      onClick={() =>
                                        handleRemoveMember(workspace.id, member.userId, member.username)
                                      }
                                      className="p-1 hover:bg-brand-error/10 text-slate-500 hover:text-brand-error rounded transition-standard cursor-pointer shrink-0"
                                      title="Remove Member"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              {workspaceMembers.length === 0 && (
                                <div className="text-[11px] text-slate-500 italic py-2">
                                  No members found
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Create Workspace Form */}
          <div className="border-t border-white/5 pt-4 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Create New Workspace
            </h4>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Workspace Name"
                  className="block w-full px-3 py-2 bg-brand-layer-2 border border-white/5 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                />
                <input
                  type="text"
                  value={newWorkspaceDescription}
                  onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                  placeholder="Description (Optional)"
                  className="block w-full px-3 py-2 bg-brand-layer-2 border border-white/5 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                />
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-400 bg-rose-950/20 border border-rose-900/30 rounded-lg p-2.5">
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg text-xs font-semibold hover:shadow-[0_0_12px_rgba(99,102,241,0.3)] transition-standard cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Plus className="w-4 h-4" />
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
