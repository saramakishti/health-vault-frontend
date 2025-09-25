export type UsersListItem = {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  birthday?: string;
  gender?: "M" | "W";
  role: string;
  date_created?: string;
  date_last_updated?: string;
  doctor_profile?: Record<string, unknown>;
  patient_profile?: Record<string, unknown>;
};


export type UsersListResponse = {
  errors: any[];
  is_success: boolean;
  message: string | null;
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
    num_pages: number | null;
  };
  result: UsersListItem[];
};