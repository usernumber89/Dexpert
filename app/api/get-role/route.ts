import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.warn("[GET-ROLE] Usuario no autenticado");
      return new Response(
        JSON.stringify({ error: "Unauthorized", role: null }),
        { status: 401 }
      );
    }

    console.log("[GET-ROLE] Buscando role para userId:", userId);

    const user = await prisma.userProfile.findUnique({
      where: { userId },
      select: { role: true },
    });

    if (!user || !user.role) {
      console.warn("[GET-ROLE] No se encontró perfil o role para userId:", userId);
      return new Response(
        JSON.stringify({ error: "User profile not found", role: null }),
        { status: 404 }
      );
    }

    console.log("[GET-ROLE] Role encontrado:", user.role);

    return new Response(JSON.stringify({ role: user.role }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[GET-ROLE] Error inesperado:", error.message);
    return new Response(
      JSON.stringify({ error: "Internal server error", role: null }),
      { status: 500 }
    );
  }
}
