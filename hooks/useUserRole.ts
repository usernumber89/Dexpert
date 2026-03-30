import { useAuth } from "@clerk/nextjs";

export function useUserRole() {
  const { isLoaded, sessionClaims } = useAuth();
  const role = (sessionClaims as any)?.role as "STUDENT" | "PYME" | undefined;

  return {
    role: role ?? null,
    isLoading: !isLoaded,
  };
}