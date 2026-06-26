import type { RequestItem } from "../../request/types/RequestItem";

export interface RequestTreeItemProps {
  request: RequestItem;
  onDelete: (id: string, name: string) => void;
}
