import { auth } from "@clerk/nextjs/server";

export async function getUserRole() {
  const { sessionClaims } = await auth();
  return (sessionClaims as any)?.role as "STUDENT" | "PYME" | null ?? null;
}