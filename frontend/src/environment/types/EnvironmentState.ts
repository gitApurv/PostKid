import type { Environment } from "./Environment";
import type { EnvironmentRequest } from "./EnvironmentRequest";
import type { VariableRequest } from "./VariableRequest";

export interface EnvironmentState {
  environments: Environment[];
  activeEnvironmentId: string;

  setActiveEnvironmentAction: (environmentId: string) => {
    success: boolean;
    error?: string;
  };

  fetchEnvironmentsAction: (
    collectionId: string,
  ) => Promise<{ success: boolean; error?: string }>;

  addEnvironmentAction: (
    collectionId: string,
    request: EnvironmentRequest,
  ) => Promise<{ success: boolean; error?: string }>;

  editEnvironmentAction: (
    collectionId: string,
    environmentId: string,
    request: EnvironmentRequest,
  ) => Promise<{ success: boolean; error?: string }>;

  deleteEnvironmentAction: (
    collectionId: string,
    environmentId: string,
  ) => Promise<{ success: boolean; error?: string }>;

  addVariableAction: (
    collectionId: string,
    environmentId: string,
    request: VariableRequest,
  ) => Promise<{ success: boolean; error?: string }>;

  updateVariableAction: (
    collectionId: string,
    environmentId: string,
    variableId: string,
    request: VariableRequest,
  ) => Promise<{ success: boolean; error?: string }>;

  deleteVariableAction: (
    collectionId: string,
    environmentId: string,
    variableId: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

