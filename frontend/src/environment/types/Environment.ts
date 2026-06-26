import type { Variable } from "./Variable";
import type { EnvironmentColor } from "./EnvironmentColor";

export interface Environment {
  id: string;
  name: string;
  color: EnvironmentColor;
  variables: Variable[];
}
