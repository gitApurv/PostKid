import { create } from "zustand";
import type { Environment } from "../types/environment/Environment";
import type { EnvironmentState } from "../types/environment/EnvironmentState";
import api from "../lib/axios";
import type { ApiResponse } from "../types/common/ApiResponse";
import axios from "axios";
import type { EnvironmentResponse } from "../types/environment/EnvironmentResponse";
import type { EnvironmentRequest } from "../types/environment/EnvironmentRequest";
import type { VariableRequest } from "../types/environment/VariableRequest";
import type { VariableResponse } from "../types/environment/VariableResponse";

export const useEnvironmentStore = create<EnvironmentState>((set) => ({
  environments: [],
  activeEnvironmentId: "",

  setActiveEnvironmentAction: (environmentId: string) => {
    set({ activeEnvironmentId: environmentId });
    return { success: true };
  },

  fetchEnvironmentsAction: async () => {
    try {
      const fetchEnvironmentsResponse =
        await api.get<ApiResponse<EnvironmentResponse[]>>("/environments");
      if (
        fetchEnvironmentsResponse.data.success &&
        fetchEnvironmentsResponse.data.data
      ) {
        const environments: Environment[] =
          fetchEnvironmentsResponse.data.data.map((environment) => ({
            id: environment.id,
            name: environment.name,
            color: environment.environmentColor,
            variables: environment.variables.map((variable) => ({
              id: variable.id,
              key: variable.key,
              value: variable.value,
            })),
          }));
        set({ environments });
        return { success: true };
      } else {
        return {
          success: false,
          error:
            fetchEnvironmentsResponse.data.message ||
            "Failed to fetch environments.",
        };
      }
    } catch (error) {
      console.error("Failed to fetch environments:", error);
      let errorMessage = "Failed to fetch environments.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  addEnvironmentAction: async (request: EnvironmentRequest) => {
    try {
      const addEnvironmentResponse = await api.post<
        ApiResponse<EnvironmentResponse>
      >("/environments", request);
      if (
        addEnvironmentResponse.data.success &&
        addEnvironmentResponse.data.data
      ) {
        const environment: Environment = {
          id: addEnvironmentResponse.data.data.id,
          name: addEnvironmentResponse.data.data.name,
          color: addEnvironmentResponse.data.data.environmentColor,
          variables: addEnvironmentResponse.data.data.variables.map(
            (variable) => ({
              id: variable.id,
              key: variable.key,
              value: variable.value,
            }),
          ),
        };
        set((state) => ({
          environments: [...state.environments, environment],
          activeEnvironmentId: environment.id,
        }));
        return { success: true };
      }
      return {
        success: false,
        error:
          addEnvironmentResponse.data.message || "Failed to add environment.",
      };
    } catch (error) {
      console.error("Failed to add environment:", error);
      let errorMessage = "Failed to add environment.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  editEnvironmentAction: async (
    environmentId: string,
    request: EnvironmentRequest,
  ) => {
    try {
      const editEnvironmentResponse = await api.put<
        ApiResponse<EnvironmentResponse>
      >(`/environments/${environmentId}`, request);
      if (
        editEnvironmentResponse.data.success &&
        editEnvironmentResponse.data.data
      ) {
        const updatedEnv: Environment = {
          id: editEnvironmentResponse.data.data.id,
          name: editEnvironmentResponse.data.data.name,
          color: editEnvironmentResponse.data.data.environmentColor,
          variables: editEnvironmentResponse.data.data.variables.map(
            (variable) => ({
              id: variable.id,
              key: variable.key,
              value: variable.value,
            }),
          ),
        };
        set((state) => ({
          environments: state.environments.map((environment) =>
            environment.id === environmentId ? updatedEnv : environment,
          ),
        }));
        return { success: true };
      }
      return {
        success: false,
        error:
          editEnvironmentResponse.data.message ||
          "Failed to update environment.",
      };
    } catch (error) {
      console.error("Failed to update environment:", error);
      let errorMessage = "Failed to update environment.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  deleteEnvironmentAction: async (environmentId: string) => {
    try {
      const deleteEnvironmentResponse = await api.delete<ApiResponse<void>>(
        `/environments/${environmentId}`,
      );
      if (deleteEnvironmentResponse.data.success) {
        set((state) => ({
          environments: state.environments.filter(
            (environment) => environment.id !== environmentId,
          ),
          activeEnvironmentId:
            state.activeEnvironmentId === environmentId
              ? ""
              : state.activeEnvironmentId,
        }));
        return { success: true };
      }
      return {
        success: false,
        error:
          deleteEnvironmentResponse.data.message ||
          "Failed to delete environment.",
      };
    } catch (error) {
      console.error("Failed to delete environment:", error);
      let errorMessage = "Failed to delete environment.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  addVariableAction: async (
    environmentId: string,
    request: VariableRequest,
  ) => {
    try {
      const addVariableResponse = await api.post<ApiResponse<VariableResponse>>(
        `/environments/${environmentId}/variables`,
        request,
      );
      if (addVariableResponse.data.success && addVariableResponse.data.data) {
        const newVariable = {
          id: addVariableResponse.data.data.id,
          key: addVariableResponse.data.data.key,
          value: addVariableResponse.data.data.value,
        };
        set((state) => ({
          environments: state.environments.map((environment) => {
            if (environment.id === environmentId) {
              return {
                ...environment,
                variables: [...environment.variables, newVariable],
              };
            }
            return environment;
          }),
        }));
        return { success: true };
      }
      return {
        success: false,
        error: addVariableResponse.data.message || "Failed to add variable.",
      };
    } catch (error) {
      console.error("Failed to add variable:", error);
      let errorMessage = "Failed to add variable.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  updateVariableAction: async (
    environmentId: string,
    variableId: string,
    request: VariableRequest,
  ) => {
    try {
      const updateVariableResponse = await api.put<
        ApiResponse<VariableResponse>
      >(`/environments/${environmentId}/variables/${variableId}`, request);
      if (
        updateVariableResponse.data.success &&
        updateVariableResponse.data.data
      ) {
        const updatedVariable = {
          id: updateVariableResponse.data.data.id,
          key: updateVariableResponse.data.data.key,
          value: updateVariableResponse.data.data.value,
        };
        set((state) => ({
          environments: state.environments.map((environment) => {
            if (environment.id === environmentId) {
              return {
                ...environment,
                variables: environment.variables.map((variable) =>
                  variable.id === variableId ? updatedVariable : variable,
                ),
              };
            }
            return environment;
          }),
        }));
        return { success: true };
      }
      return {
        success: false,
        error:
          updateVariableResponse.data.message || "Failed to update variable.",
      };
    } catch (error) {
      console.error("Failed to update variable:", error);
      let errorMessage = "Failed to update variable.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },

  deleteVariableAction: async (environmentId: string, variableId: string) => {
    try {
      const deleteVariableResponse = await api.delete<ApiResponse<void>>(
        `/environments/${environmentId}/variables/${variableId}`,
      );
      if (deleteVariableResponse.data.success) {
        set((state) => ({
          environments: state.environments.map((environment) => {
            if (environment.id === environmentId) {
              return {
                ...environment,
                variables: environment.variables.filter(
                  (variable) => variable.id !== variableId,
                ),
              };
            }
            return environment;
          }),
        }));
        return { success: true };
      }
      return {
        success: false,
        error:
          deleteVariableResponse.data.message || "Failed to delete variable.",
      };
    } catch (error) {
      console.error("Failed to delete variable:", error);
      let errorMessage = "Failed to delete variable.";
      if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  },
}));
