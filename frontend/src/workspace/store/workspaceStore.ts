import { create } from "zustand";
import api from "../../config/axios";
import axios from "axios";
import type { ApiResponse } from "../../common/types/ApiResponse";
import type { WorkspaceState } from "../types/WorkspaceState";
import type { WorkspaceItem } from "../types/WorkspaceItem";
import type { WorkspaceRequest } from "../types/WorkspaceRequest";
import type { WorkspaceResponse } from "../types/WorkspaceResponse";
import type { MemberResponse } from "../types/MemberResponse";
import type { InviteMemberRequest } from "../types/InviteMemberRequest";
import { useCollectionStore } from "../../collection/store/collectionStore";
import { useEnvironmentStore } from "../../environment/store/environmentStore";

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,

  fetchWorkspacesAction: async () => {
    try {
      const fetchWorkspaceResponse = await api.get<ApiResponse<WorkspaceResponse[]>>("/workspaces");
      if (fetchWorkspaceResponse.data.success && fetchWorkspaceResponse.data.data) {
        const workspaces: WorkspaceItem[] = fetchWorkspaceResponse.data.data.map((workspace) => ({
          ...workspace,
          isLoading: false,
        }));
        set({ workspaces });

        const { activeWorkspaceId } = get();
        if (workspaces.length > 0) {
          const activeExists = workspaces.some((workspace) => workspace.id === activeWorkspaceId);
          if (!activeWorkspaceId || !activeExists) {
            await get().setActiveWorkspaceAction(workspaces[0].id);
          }
        } else {
          if (activeWorkspaceId !== null) {
            await get().setActiveWorkspaceAction(null);
          }
        }

        return { success: true };
      } else {
        return {
          success: false,
          error: fetchWorkspaceResponse.data.message || "Failed to fetch workspaces.",
        };
      }
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
      let errorMessage = "Failed to fetch workspaces.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  createWorkspaceAction: async (request: WorkspaceRequest) => {
    try {
      const createWorkspaceResponse = await api.post<ApiResponse<WorkspaceResponse>>("/workspaces", request);
      if (createWorkspaceResponse.data.success && createWorkspaceResponse.data.data) {
        const newWorkspace: WorkspaceItem = {
          ...createWorkspaceResponse.data.data,
          isLoading: false,
        };
        set((state) => ({
          workspaces: [...state.workspaces, newWorkspace],
        }));
        if (!get().activeWorkspaceId) {
          await get().setActiveWorkspaceAction(newWorkspace.id);
        }
        return { success: true };
      } else {
        return {
          success: false,
          error: createWorkspaceResponse.data.message || "Failed to create workspace.",
        };
      }
    } catch (error) {
      console.error("Failed to create workspace:", error);
      let errorMessage = "Failed to create workspace.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  updateWorkspaceAction: async (workspaceId: string, request: WorkspaceRequest) => {
    try {
      const updateWorkspaceResponse = await api.put<ApiResponse<WorkspaceResponse>>(`/workspaces/${workspaceId}`, request);
      if (updateWorkspaceResponse.data.success && updateWorkspaceResponse.data.data) {
        const updatedWorkspace = updateWorkspaceResponse.data.data;
        set((state) => ({
          workspaces: state.workspaces.map((workspace) =>
            workspace.id === workspaceId ? { ...workspace, ...updatedWorkspace } : workspace
          ),
        }));
        return { success: true };
      } else {
        return {
          success: false,
          error: updateWorkspaceResponse.data.message || "Failed to update workspace.",
        };
      }
    } catch (error) {
      console.error("Failed to update workspace:", error);
      let errorMessage = "Failed to update workspace.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  deleteWorkspaceAction: async (workspaceId: string) => {
    try {
      const deleteWorkspaceResponse = await api.delete<ApiResponse<void>>(`/workspaces/${workspaceId}`);
      if (deleteWorkspaceResponse.data.success) {
        set((state) => ({
          workspaces: state.workspaces.filter((workspace) => workspace.id !== workspaceId),
        }));
        const { activeWorkspaceId, workspaces } = get();
        if (activeWorkspaceId === workspaceId) {
          const remaining = workspaces.filter((workspace) => workspace.id !== workspaceId);
          if (remaining.length > 0) {
            await get().setActiveWorkspaceAction(remaining[0].id);
          } else {
            await get().setActiveWorkspaceAction(null);
          }
        }
        return { success: true };
      } else {
        return {
          success: false,
          error: deleteWorkspaceResponse.data.message || "Failed to delete workspace.",
        };
      }
    } catch (error) {
      console.error("Failed to delete workspace:", error);
      let errorMessage = "Failed to delete workspace.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  setActiveWorkspaceAction: async (workspaceId: string | null) => {
    set({ activeWorkspaceId: workspaceId });

    // Clear environments state as they are scoped to a collection
    useEnvironmentStore.setState({ environments: [], activeEnvironmentId: "" });

    await useCollectionStore.getState().fetchCollectionsAction();

    return { success: true };
  },

  fetchMembersAction: async (workspaceId: string) => {
    try {
      const res = await api.get<ApiResponse<MemberResponse[]>>(`/workspaces/${workspaceId}/members`);
      if (res.data.success && res.data.data) {
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data.message || "Failed to fetch members." };
    } catch (error) {
      console.error("Failed to fetch members:", error);
      let errorMessage = "Failed to fetch members.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  inviteMemberAction: async (workspaceId: string, request: InviteMemberRequest) => {
    try {
      const res = await api.post<ApiResponse<MemberResponse>>(`/workspaces/${workspaceId}/members`, request);
      if (res.data.success && res.data.data) {
        // Also increment memberCount in workspaces list
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId ? { ...w, memberCount: w.memberCount + 1 } : w
          ),
        }));
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data.message || "Failed to invite member." };
    } catch (error) {
      console.error("Failed to invite member:", error);
      let errorMessage = "Failed to invite member.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  removeMemberAction: async (workspaceId: string, userId: string) => {
    try {
      const res = await api.delete<ApiResponse<void>>(`/workspaces/${workspaceId}/members/${userId}`);
      if (res.data.success) {
        // Decrement memberCount in workspaces list
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId ? { ...w, memberCount: Math.max(1, w.memberCount - 1) } : w
          ),
        }));
        return { success: true };
      }
      return { success: false, error: res.data.message || "Failed to remove member." };
    } catch (error) {
      console.error("Failed to remove member:", error);
      let errorMessage = "Failed to remove member.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },
}));
