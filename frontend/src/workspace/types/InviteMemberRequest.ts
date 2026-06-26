import type { WorkspaceRole } from "./MemberResponse";

export interface InviteMemberRequest {
  email: string;
  role: WorkspaceRole;
}
