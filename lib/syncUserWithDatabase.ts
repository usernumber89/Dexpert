import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function syncUserWithDatabase(role: "STUDENT" | "PYME") {
  const { userId } = await auth();

  if (!userId) throw new Error("No user logged in");

  console.log("[syncUserWithDatabase] Iniciando sincronización para userId:", userId, "role:", role);

  // 1. Guardar en Prisma (igual que antes)
  try {
    const result = await prisma.userProfile.upsert({
      where: { userId: userId }, // ID de Clerk
      update: { role: role },
      create: {
        userId: userId, // ID de Clerk
        role: role,
      },
    });
    console.log("[syncUserWithDatabase] Guardado en Prisma exitosamente:", result);
  } catch (error) {
    console.error("[syncUserWithDatabase] Error al guardar en Prisma:", error);
    throw error;
  }

  // 2. Escribir rol en Clerk public metadata → viaja en JWT
  try {
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });
    console.log("[syncUserWithDatabase] Metadata de Clerk actualizada exitosamente");
  } catch (error) {
    console.error("[syncUserWithDatabase] Error al actualizar Clerk:", error);
    throw error;
  }
}
