export interface Group {
  id?: string | undefined;
  name: string;
}

export interface GroupSearchResult {
  id: string;
  name: string;
  status: "pending" | "approved" | "rejected" | undefined;
}

export interface GroupCreate {
  name: string;
  approveMembers: boolean;
}