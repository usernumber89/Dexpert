// hooks/useUserRole.ts
import { useUser } from "@clerk/nextjs";

export function useUserRole() {
  const { user, isLoaded } = useUser();

  // Extraemos el rol de publicMetadata del objeto user
  const role = user?.publicMetadata?.role as "STUDENT" | "PYME" | undefined;

  return {
    role: role ?? null,
    isLoading: !isLoaded,
  };
}