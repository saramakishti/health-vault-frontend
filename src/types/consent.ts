export type ConsentItem = {
  id: number;
  scope?: string;
  expires_at?: string;
  is_active?: boolean;
  patient?: any;
  doctor?: any;
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