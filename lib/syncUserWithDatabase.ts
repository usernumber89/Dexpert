import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function syncUserWithDatabase(role: "STUDENT" | "PYME") {
  const { userId } = await auth();

  if (!userId) throw new Error("No user logged in");

  // 1. Guardar en Prisma (igual que antes)
  await prisma.userProfile.upsert({
    where: { userId },
    update: {},
    create: { userId, role },
  });

  // 2. Escribir rol en Clerk public metadata → viaja en JWT
  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });
}