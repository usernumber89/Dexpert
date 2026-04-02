#!/usr/bin/env node

/**
 * Script para limpiar usuarios huérfanos (existen en BD pero no en Clerk)
 */

const { PrismaClient } = require("@prisma/client");
const { clerkClient } = require("@clerk/nextjs/server");
require("dotenv").config({ path: ".env.local" });

const prisma = new PrismaClient();

// Usuarios identificados como no existentes en Clerk
const ORPHANED_USERS = [
  "user_2xZQXypwNYnY45FBjZ1jrlGXssq",
  "user_2y1jsN08EG93BsEGjL4uz99If8U",
  "user_2yWBTJJCZRXOA36Wue3QpkC36Mg",
  "user_2yYkXTpgndjri4KKNVrsjFldyb5",
  "user_2zCVJX3nmvcLymQXq7R22yDuk76",
];

async function cleanupOrphanedUsers() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║     🧹 LIMPIEZA DE USUARIOS HUÉRFANOS                 ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  console.log(`Usuarios a eliminar: ${ORPHANED_USERS.length}\n`);

  try {
    for (let i = 0; i < ORPHANED_USERS.length; i++) {
      const userId = ORPHANED_USERS[i];
      const progress = `[${i + 1}/${ORPHANED_USERS.length}]`;

      try {
        console.log(`${progress} 🗑️  Eliminando ${userId}...`);

        // Primero eliminar cualquier relación (Student, etc)
        await prisma.student.deleteMany({
          where: { userId },
        });

        // Luego eliminar el usuario de Prisma
        await prisma.userProfile.delete({
          where: { userId },
        });

        console.log(`${progress} ✅ Eliminado correctamente\n`);
      } catch (error) {
        console.log(`${progress} ❌ Error: ${error?.message}\n`);
      }
    }

    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║              ✅ LIMPIEZA COMPLETADA                   ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");
  } catch (error) {
    console.error("\n❌ ERROR:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanedUsers();
