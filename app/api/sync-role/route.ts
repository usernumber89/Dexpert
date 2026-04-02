import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.log("[SYNC-ROLE] No userId, devolviendo error 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[SYNC-ROLE] Iniciando sincronización para userId:", userId);

    // 1. Obtener el rol desde Clerk metadata
    const { sessionClaims } = await auth();
    const clerkRole = (sessionClaims as any)?.publicMetadata?.role;

    console.log("[SYNC-ROLE] Rol en Clerk metadata:", clerkRole);

    // 2. Obtener el rol desde la BD
    const dbUser = await prisma.userProfile.findUnique({
      where: { userId },
      select: { role: true }
    });

    console.log("[SYNC-ROLE] Rol en BD:", dbUser?.role);

    // 3. Determinar cuál es el rol correcto (prioridad: BD > Clerk)
    const correctRole = dbUser?.role || clerkRole;

    if (!correctRole) {
      console.log("[SYNC-ROLE] No hay rol en BD ni en Clerk");
      return NextResponse.json({ 
        error: "No role found in database or Clerk",
        message: "Por favor completa el onboarding nuevamente"
      }, { status: 400 });
    }

    console.log("[SYNC-ROLE] Rol correcto determinado:", correctRole);

    // 4. Asegurar que ambos esté en sincronía
    if (dbUser?.role !== correctRole) {
      console.log("[SYNC-ROLE] Actualizando BD con rol:", correctRole);
      await prisma.userProfile.update({
        where: { userId },
        data: { role: correctRole }
      });
    }

    if (clerkRole !== correctRole) {
      console.log("[SYNC-ROLE] Actualizando Clerk metadata con rol:", correctRole);
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { role: correctRole }
      });
    }

    console.log("[SYNC-ROLE] Sincronización completada exitosamente");

    return NextResponse.json({ 
      message: "Role synced successfully",
      role: correctRole,
      synced: {
        database: true,
        clerk: true
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("[SYNC-ROLE] Error:", error);
    return NextResponse.json({ 
      error: "Error durante la sincronización",
      details: error.message
    }, { status: 500 });
  }
}
