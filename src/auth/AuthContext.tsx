import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthResponse, AuthUser, LoginPayload, SignupPayload } from "../types/auth";
import { useApi } from "../hooks/useApi";

type AuthContextType = {
  user: AuthUser | null;
  tokens: ReturnType<typeof useApi>["tokens"];
  loading: boolean;
  error: string | null;

  isAuthenticated: boolean;
  isDoctor: boolean;
  isPatient: boolean;
  isAdmin: boolean;

  login: (payload: LoginPayload) => Promise<void>;
  signupPatient: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void> | void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    login: apiLogin,
    signup: apiSignup,
    logout: apiLogout,
    tokens,
    loading,
    error,
  } = useApi();

  // Persist only the user object here; tokens are handled inside useApi
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem("auth_user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("auth_user", JSON.stringify(user));
    else localStorage.removeItem("auth_user");
  }, [user]);

  // --- Actions ---
  async function login(payload: LoginPayload): Promise<void> {
    const res: AuthResponse = await apiLogin(payload);
    setUser(res.user);
  }

  async function signupPatient(payload: SignupPayload): Promise<void> {
    // enforce public self-signup as Patient; doctor accounts via admin
    const res: AuthResponse = await apiSignup({
      ...payload,
      role: "Patient",
      patient_profile: payload.patient_profile ?? {
        family_history: "",
        risk_factors: "",
        insurance_provider: "",
      },
      doctor_profile: undefined,
    });
    setUser(res.user);
  }

  async function logout(): Promise<void> {
    await apiLogout();
    setUser(null);
  }

  const value: AuthContextType = useMemo(
    () => ({
      user,
      tokens,
      loading,
      error,
      isAuthenticated: !!tokens,
      isDoctor: user?.role === "Doctor",
      isPatient: user?.role === "Patient",
      isAdmin: user?.role === "Admin",
      login,
      signupPatient,
      logout,
    }),
    [user, tokens, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
