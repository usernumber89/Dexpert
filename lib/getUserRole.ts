// lib/getUserRole.ts
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function getUserRole() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    console.log("[getUserRole] No userId");
    return null;
  }

  console.log("[getUserRole] userId:", userId);

  // 1. Obtener del JWT
  const jwtRole = (sessionClaims as any)?.publicMetadata?.role;
  console.log("[getUserRole] Rol desde JWT:", jwtRole);

  // 2. Obtener de Prisma
  console.log("[getUserRole] Buscando en Prisma...");
  const profile = await prisma.userProfile.findUnique({
    where: { userId: userId },
    select: { role: true }
  });

  const dbRole = profile?.role;
  console.log("[getUserRole] Rol desde Prisma:", dbRole);

  // 3. Lógica de decisión (prioridad: JWT > DB)
  const finalRole = jwtRole || dbRole;
  console.log("[getUserRole] Rol final:", finalRole);

  // 4. Si hay desincronización, intentar arreglarlo automáticamente
  if (jwtRole && dbRole && jwtRole !== dbRole) {
    console.log("[getUserRole] DESINCRONIZACIÓN DETECTADA - JWT:", jwtRole, "DB:", dbRole);
    try {
      // Usar el rol de JWT como fuente de verdad
      console.log("[getUserRole] Actualizando BD con rol del JWT:", jwtRole);
      await prisma.userProfile.update({
        where: { userId },
        data: { role: jwtRole }
      });
      console.log("[getUserRole] BD actualizada correctamente");
    } catch (error) {
      console.error("[getUserRole] Error al actualizar BD:", error);
    }
  }

  // 5. Si solo hay rol en JWT pero no en DB, crear entrada en DB
  if (jwtRole && !dbRole) {
    console.log("[getUserRole] Rol en JWT pero no en BD, creando...");
    try {
      await prisma.userProfile.create({
        data: {
          userId: userId,
          role: jwtRole
        }
      });
      console.log("[getUserRole] UserProfile creado en BD");
    } catch (error) {
      console.error("[getUserRole] Error al crear UserProfile:", error);
    }
  }

  // 6. Si hay rol en DB pero no en JWT, actualizar JWT
  if (dbRole && !jwtRole) {
    console.log("[getUserRole] Rol en BD pero no en JWT, actualizando Clerk...");
    try {
      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: { role: dbRole }
      });
      console.log("[getUserRole] Clerk actualizado correctamente");
    } catch (error) {
      console.error("[getUserRole] Error al actualizar Clerk:", error);
    }
  }

  return finalRole ? (finalRole as "STUDENT" | "PYME") : null;
}