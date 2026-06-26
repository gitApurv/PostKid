import type { VariableResponse } from "./VariableResponse";
import type { EnvironmentColor } from "./EnvironmentColor";

export interface EnvironmentResponse {
  id: string;
  name: string;
  ownerId: string;
  environmentColor: EnvironmentColor;
  variables: VariableResponse[];
  createdAt: string;
  updatedAt: string;
}
