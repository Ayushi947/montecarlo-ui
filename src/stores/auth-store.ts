import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * User interface for authentication state
 *
 * Maps to the backend User model:
 * - firstName / lastName (not a single "name")
 * - plan: "free" | "basic" | "pro" (backend plan names)
 */
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  emailVerified: boolean;
  plan: "free" | "basic" | "pro";
  simulationsUsed: number;
  simulationsLimit: number;
  portfoliosLimit: number;
}

/**
 * Authentication Store State
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  /** True after Zustand persist has restored state from localStorage */
  _hasHydrated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

/**
 * Set a lightweight auth cookie so Next.js middleware can gate routes
 * server-side (before JS executes).
 */
function setAuthCookie(active: boolean) {
  if (typeof document === "undefined") return;
  if (active) {
    document.cookie =
      "simulix-auth-active=true; path=/; max-age=604800; SameSite=Lax";
  } else {
    document.cookie = "simulix-auth-active=; path=/; max-age=0; SameSite=Lax";
  }
}

/**
 * Zustand Auth Store with localStorage persistence
 *
 * Manages:
 * - User authentication state
 * - JWT token (used by API interceptor in config/api.ts)
 * - User profile data
 * - Session persistence
 * - Hydration tracking for SSR-safe routing
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user, error: null }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      login: (user, token) => {
        setAuthCookie(true);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      logout: () => {
        setAuthCookie(false);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: "simulix-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * After store creation, listen for persist hydration completion.
 * Once localStorage values are restored, set `_hasHydrated = true`
 * so route guards know it's safe to check `isAuthenticated`.
 *
 * Also sync the auth cookie so middleware stays in sync after
 * page refresh (cookie may have expired).
 */
if (typeof window !== "undefined") {
  // If hydration already happened (e.g. HMR), set immediately
  if (useAuthStore.persist.hasHydrated()) {
    const { isAuthenticated } = useAuthStore.getState();
    setAuthCookie(isAuthenticated);
    useAuthStore.setState({ _hasHydrated: true });
  }

  // Listen for future hydration (first load)
  useAuthStore.persist.onFinishHydration(() => {
    const { isAuthenticated } = useAuthStore.getState();
    setAuthCookie(isAuthenticated);
    useAuthStore.setState({ _hasHydrated: true });
  });
}
