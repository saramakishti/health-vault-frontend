export type DoctorItem = {
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
  doctor_profile?: {
    specialization?: string;
    license_number?: string;
    hospital_affiliation?: string;
  }
};

export type DoctorsResponse = {
  errors: any[];
  is_success: boolean;
  message: string | null;
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
    num_pages: number | null;
  };
  result: DoctorItem[];
};