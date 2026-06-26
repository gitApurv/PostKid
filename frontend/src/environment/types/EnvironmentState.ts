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

  fetchEnvironmentsAction: () => Promise<{ success: boolean; error?: string }>;

  addEnvironmentAction: (
    request: EnvironmentRequest,
  ) => Promise<{ success: boolean; error?: string }>;

  editEnvironmentAction: (
    environmentId: string,
    request: EnvironmentRequest,
  ) => Promise<{ success: boolean; error?: string }>;

  deleteEnvironmentAction: (
    environmentId: string,
  ) => Promise<{ success: boolean; error?: string }>;

  addVariableAction: (
    environmentId: string,
    request: VariableRequest,
  ) => Promise<{ success: boolean; error?: string }>;

  updateVariableAction: (
    environmentId: string,
    variableId: string,
    request: VariableRequest,
  ) => Promise<{ success: boolean; error?: string }>;

  deleteVariableAction: (
    environmentId: string,
    variableId: string,
  ) => Promise<{ success: boolean; error?: string }>;
}
