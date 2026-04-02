/**
 * Script para sincronizar roles de todos los usuarios existentes
 * Uso: npx ts-node scripts/syncExistingRoles.ts
 * 
 * Este script:
 * 1. Obtiene todos los usuarios de la BD
 * 2. Para cada uno, actualiza su metadata en Clerk
 * 3. Genera un reporte de éxito/error
 */

import prisma from "../lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

interface SyncResult {
  userId: string;
  role: string;
  status: "success" | "error" | "no-role";
  message: string;
}

async function syncExistingRoles() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("🔄 Iniciando sincronización de roles de usuarios existentes");
  console.log("═══════════════════════════════════════════════════════\n");

  const results: SyncResult[] = [];
  let successCount = 0;
  let errorCount = 0;
  let noRoleCount = 0;

  try {
    // 1. Obtener todos los usuarios
    console.log("📊 Obteniendo usuarios de la base de datos...");
    const users = await prisma.userProfile.findMany({
      select: {
        userId: true,
        role: true,
        id: true,
      },
    });

    console.log(`✅ Se encontraron ${users.length} usuarios\n`);

    if (users.length === 0) {
      console.log("⚠️  No hay usuarios para sincronizar");
      return;
    }

    // 2. Inicializar cliente de Clerk
    console.log("🔑 Inicializando cliente de Clerk...");
    const clerk = await clerkClient();
    console.log("✅ Cliente de Clerk listo\n");

    // 3. Sincronizar cada usuario
    console.log(`🔄 Sincronizando ${users.length} usuarios...\n`);

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const progress = `[${i + 1}/${users.length}]`;

      try {
        if (!user.role) {
          console.log(`${progress} ⚠️  ${user.userId} - Sin rol asignado`);
          results.push({
            userId: user.userId,
            role: "N/A",
            status: "no-role",
            message: "Usuario sin rol en la BD",
          });
          noRoleCount++;
          continue;
        }

        console.log(
          `${progress} 🔄 Sincronizando ${user.userId} con rol: ${user.role}`
        );

        // Actualizar metadata en Clerk
        await clerk.users.updateUserMetadata(user.userId, {
          publicMetadata: {
            role: user.role,
          },
        });

        console.log(`${progress} ✅ ${user.userId} sincronizado correctamente`);
        results.push({
          userId: user.userId,
          role: user.role,
          status: "success",
          message: "Rol sincronizado en Clerk",
        });
        successCount++;
      } catch (error: any) {
        const errorMsg = error?.message || "Error desconocido";
        console.log(`${progress} ❌ ${user.userId} - Error: ${errorMsg}`);
        results.push({
          userId: user.userId,
          role: user.role || "N/A",
          status: "error",
          message: errorMsg,
        });
        errorCount++;
      }

      // Pequeña pausa entre requests para no sobrecargar
      if (i < users.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // 4. Generar reporte
    console.log("\n═══════════════════════════════════════════════════════");
    console.log("📋 REPORTE FINAL");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`✅ Sincronizados correctamente: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`⚠️  Sin rol: ${noRoleCount}`);
    console.log(`📊 Total procesados: ${users.length}`);
    console.log("═══════════════════════════════════════════════════════\n");

    // 5. Mostrar errores si los hay
    if (errorCount > 0) {
      console.log("⚠️  USUARIOS CON ERROR:");
      console.log("─────────────────────────────────────────────────────");
      results
        .filter((r) => r.status === "error")
        .forEach((r) => {
          console.log(`• ${r.userId}: ${r.message}`);
        });
      console.log("");
    }

    // 6. Mostrar usuarios sin rol
    if (noRoleCount > 0) {
      console.log("⚠️  USUARIOS SIN ROL:");
      console.log("─────────────────────────────────────────────────────");
      results
        .filter((r) => r.status === "no-role")
        .forEach((r) => {
          console.log(`• ${r.userId}`);
        });
      console.log("");
    }

    // 7. Resumen
    console.log("✅ SINCRONIZACIÓN COMPLETADA\n");
    if (successCount === users.length) {
      console.log("🎉 Todos los usuarios fueron sincronizados correctamente!");
    } else if (errorCount === 0 && noRoleCount === users.length) {
      console.log("⚠️  Todos los usuarios están sin rol. Completa el onboarding primero.");
    } else {
      console.log(
        `ℹ️  ${successCount} usuarios sincronizados, ${errorCount} con error, ${noRoleCount} sin rol.`
      );
    }
  } catch (error: any) {
    console.error("\n❌ ERROR CRÍTICO:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
syncExistingRoles();
