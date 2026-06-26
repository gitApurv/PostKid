import type { WorkspaceItem } from "./WorkspaceItem";
import type { WorkspaceRequest } from "./WorkspaceRequest";
import type { MemberResponse } from "./MemberResponse";
import type { InviteMemberRequest } from "./InviteMemberRequest";

export interface WorkspaceState {
  workspaces: WorkspaceItem[];
  activeWorkspaceId: string | null;

  fetchWorkspacesAction: () => Promise<{ success: boolean; error?: string }>;
  createWorkspaceAction: (request: WorkspaceRequest) => Promise<{ success: boolean; error?: string }>;
  updateWorkspaceAction: (workspaceId: string, request: WorkspaceRequest) => Promise<{ success: boolean; error?: string }>;
  deleteWorkspaceAction: (workspaceId: string) => Promise<{ success: boolean; error?: string }>;
  setActiveWorkspaceAction: (workspaceId: string | null) => Promise<{ success: boolean; error?: string }>;

  fetchMembersAction: (workspaceId: string) => Promise<{ success: boolean; data?: MemberResponse[]; error?: string }>;
  inviteMemberAction: (workspaceId: string, request: InviteMemberRequest) => Promise<{ success: boolean; data?: MemberResponse; error?: string }>;
  removeMemberAction: (workspaceId: string, userId: string) => Promise<{ success: boolean; error?: string }>;
}
