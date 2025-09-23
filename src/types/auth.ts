export type Role = "Admin" | "Doctor" | "Patient";
export type Gender = "M" | "W";

export type AuthUser = {
  id?: number;
  email: string;
  role: Role;
  first_name?: string;
  last_name?: string;
  phone?: string;
  birthday?: string;
  gender?: Gender;
  date_created?: string;
  date_last_updated?: string;
  doctor_profile?: Record<string, unknown>;
  patient_profile?: Record<string, unknown>;
};

export type AuthTokens =
  | { token: string; access?: never; refresh?: never }
  | { token?: never; access: string; refresh?: string };

export type AuthResponse = AuthTokens & { user: AuthUser };

export type LoginPayload = {
  email: string;
  password: string;
};

// Public signup (patient or doctor). For patient self-signup you’ll send role: "Patient"
// and include only patient_profile; for doctor (admin will create doctor profiles) include doctor_profile.
export type SignupPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  birthday: string;
  gender: Gender;
  role: Role;
  doctor_profile?: {
    specialization?: string;
    license_number?: string;
    hospital_affiliation?: string;
    [k: string]: unknown;
  };
  patient_profile?: {
    family_history?: string;
    risk_factors?: string;
    insurance_provider?: string;
    [k: string]: unknown;
  };
};

export type RefreshPayload = { refresh: string };
export type LogoutResponse = { detail?: string };
export type ApiError =
  | { detail: string }
  | { non_field_errors?: string[] } & Record<string, string[]>;
