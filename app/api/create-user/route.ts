import { auth, clerkClient } from "@clerk/nextjs/server";
import { syncUserWithDatabase } from "@/lib/syncUserWithDatabase";

export async function POST(req: Request) {
  try {
    const { userId } = await auth(); // Obtenemos el ID del usuario autenticado
    const { role } = await req.json();

    console.log("[CREATE-USER] Iniciando - userId:", userId, "role:", role);

    if (!userId) {
      console.error("[CREATE-USER] No userId found");
      return new Response("Unauthorized", { status: 401 });
    }

    if (!["STUDENT", "PYME"].includes(role)) {
      console.error("[CREATE-USER] Invalid role:", role);
      return new Response("Invalid role", { status: 400 });
    }

    // 1. Sincronizar con tu base de datos (Prisma)
    console.log("[CREATE-USER] Sincronizando con BD...");
    await syncUserWithDatabase(role);
    console.log("[CREATE-USER] BD sincronizada correctamente");

    // 2. ACTUALIZAR CLERK (Vital para el Middleware)
    console.log("[CREATE-USER] Actualizando metadata de Clerk...");
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role,
      },
    });
    console.log("[CREATE-USER] Metadata de Clerk actualizada correctamente");

    return new Response(JSON.stringify({ message: "User created and role synced", role: role, userId: userId }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (e: any) {
    console.error("[CREATE-USER] ERROR completo:", e);
    console.error("[CREATE-USER] Stack:", e.stack);
    return new Response(JSON.stringify({ error: "Error al procesar el usuario", details: e.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}