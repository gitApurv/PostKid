import type { RequestItem } from "../request/RequestItem";

export interface RequestTreeItemProps {
  request: Pick<RequestItem, "id" | "name" | "method">;
  onDelete: (id: string, name: string) => void;
}