export type WorkspaceRole = "ADMIN" | "MEMBER" | "VIEWER";

export interface MemberResponse {
  userId: string;
  username: string;
  email: string;
  role: WorkspaceRole;
  joinedAt: string;
}
