import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();

    console.log("[DEBUG-ROLE] userId:", userId);
    console.log("[DEBUG-ROLE] sessionClaims?.publicMetadata?.role:", (sessionClaims as any)?.publicMetadata?.role);

    if (!userId) {
      return NextResponse.json({ 
        error: "No userId",
        userId: null,
        jwtRole: null,
        dbRole: null
      }, { status: 200 });
    }

    // Obtener del JWT
    const jwtRole = (sessionClaims as any)?.publicMetadata?.role;

    // Obtener de la BD
    const user = await prisma.userProfile.findUnique({
      where: { userId: userId },
      select: { role: true, userId: true, id: true }
    });

    console.log("[DEBUG-ROLE] Resultado de Prisma:", user);

    return NextResponse.json({ 
      userId: userId,
      jwtRole: jwtRole || null,
      dbRole: user?.role || null,
      userInDb: !!user,
      dbUser: user
    }, { status: 200 });

  } catch (error: any) {
    console.error("[DEBUG-ROLE] Error:", error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
