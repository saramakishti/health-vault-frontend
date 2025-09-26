export type ConsentItem = {
  date_created?: string;
  date_last_updated?: string;
  doctor?: any;
  doctor_email?: string;
  expires_at?: string;
  id: number;
  is_active?: boolean;
  scope?: string;
  patient?: any;
  patient_email?: string;
  created_at?: string;
  updated_at?: string;
};

export type ConsentListResponse = {
  errors: any[];
  is_success: boolean;
  message: string | null;
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
    num_pages: number | null;
  };
  result: ConsentItem[];
};