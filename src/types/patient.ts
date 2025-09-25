export type PatientItem = {
  id: number;
  user?: {
    id?: number;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  email?: string;
  first_name?: string;
  last_name?: string;
  birthday?: string;
  patient_profile?: {
    family_history?: string;
    risk_factors?: string;
    insurance_provider?: string;
  }
};

export type PatientsResponse = {
  errors: any[];
  is_success: boolean;
  message: string | null;
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
    num_pages: number | null;
  };
  result: PatientItem[];
};