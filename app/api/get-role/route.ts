import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    // Si no hay sesión de Clerk, devolvemos null sin error 401
    if (!userId) {
      return NextResponse.json({ role: null }, { status: 200 });
    }

    // Buscamos en tu tabla de perfiles
    // Nota: Asegúrate que el modelo sea 'userProfile' o 'User' según tu schema.prisma
    const user = await prisma.userProfile.findUnique({
      where: { userId: userId },
      select: { role: true },
    });

    // Si el usuario no existe en la DB (pero sí en Clerk), devolvemos null
    // Esto es vital para que el usuario pueda entrar a /onboarding
    return NextResponse.json({ 
      role: user?.role || null 
    }, { status: 200 });

  } catch (error: any) {
    console.error("[GET-ROLE API ERROR]:", error.message);
    return NextResponse.json({ 
      role: null, 
      error: "Internal Server Error" 
    }, { status: 500 });
  }
}