export type PatientLike = {
  id: number;
  user?: { id?: number; email?: string; first_name?: string; last_name?: string };
  email?: string;
  first_name?: string;
  last_name?: string;
};

export type DoctorLike = {
  id: number;
  user?: { id?: number; email?: string; first_name?: string; last_name?: string };
  email?: string;
  first_name?: string;
  last_name?: string;
};
