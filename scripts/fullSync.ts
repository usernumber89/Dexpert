/**
 * Script completo de sincronización y limpieza
 * Uso: npx ts-node scripts/fullSync.ts
 * 
 * Este script:
 * 1. Sincroniza roles de BD -> Clerk
 * 2. Verifica integridad de datos
 * 3. Reporta problemas encontrados
 */

import prisma from "../lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

interface UserStatus {
  userId: string;
  dbRole?: string;
  clerkRole?: string;
  status: "synced" | "db-only" | "clerk-only" | "mismatch" | "error";
  message: string;
}

async function fullSync() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║     🔄 SINCRONIZACIÓN COMPLETA DE USUARIOS             ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  const statuses: UserStatus[] = [];
  let syncedCount = 0;
  let mismatchCount = 0;
  let fixedCount = 0;

  try {
    // 1. Obtener datos de BD
    console.log("📊 FASE 1: Obteniendo datos de la base de datos...");
    const dbUsers = await prisma.userProfile.findMany({
      select: {
        userId: true,
        role: true,
      },
    });
    console.log(`✅ Se encontraron ${dbUsers.length} usuarios en la BD\n`);

    // 2. Inicializar Clerk
    console.log("🔑 FASE 2: Inicializando cliente de Clerk...");
    const clerk = await clerkClient();
    console.log("✅ Cliente de Clerk listo\n");

    // 3. Procesar cada usuario
    console.log(`🔄 FASE 3: Verificando y sincronizando ${dbUsers.length} usuarios...\n`);

    for (let i = 0; i < dbUsers.length; i++) {
      const dbUser = dbUsers[i];
      const progress = `[${String(i + 1).padStart(String(dbUsers.length).length, " ")}/${dbUsers.length}]`;

      try {
        if (!dbUser.role) {
          statuses.push({
            userId: dbUser.userId,
            dbRole: undefined,
            status: "db-only",
            message: "Usuario sin rol en BD",
          });
          console.log(`${progress} ⚠️  ${dbUser.userId} - SIN ROL EN BD`);
          continue;
        }

        // Obtener usuario de Clerk
        const clerkUser = await clerk.users.getUser(dbUser.userId).catch(() => null);

        if (!clerkUser) {
          statuses.push({
            userId: dbUser.userId,
            dbRole: dbUser.role,
            status: "error",
            message: "Usuario no encontrado en Clerk",
          });
          console.log(`${progress} ❌ ${dbUser.userId} - NO EXISTE EN CLERK`);
          continue;
        }

        const clerkRole = (clerkUser.publicMetadata as any)?.role;

        // Verificar sincronización
        if (clerkRole === dbUser.role) {
          statuses.push({
            userId: dbUser.userId,
            dbRole: dbUser.role,
            clerkRole: clerkRole,
            status: "synced",
            message: "Correctamente sincronizado",
          });
          console.log(`${progress} ✅ ${dbUser.userId} - Sincronizado`);
          syncedCount++;
        } else {
          // Intenta arreglar la desincronización
          console.log(
            `${progress} 🔧 ${dbUser.userId} - DESINCRONIZACIÓN (BD: ${dbUser.role}, Clerk: ${clerkRole || "NONE"})`
          );

          try {
            await clerk.users.updateUserMetadata(dbUser.userId, {
              publicMetadata: {
                role: dbUser.role,
              },
            });

            statuses.push({
              userId: dbUser.userId,
              dbRole: dbUser.role,
              clerkRole: clerkRole,
              status: "mismatch",
              message: `Reparado: Clerk actualizado de ${clerkRole || "NONE"} a ${dbUser.role}`,
            });

            console.log(
              `${progress} ✅ ${dbUser.userId} - REPARADO (${clerkRole || "NONE"} → ${dbUser.role})`
            );
            fixedCount++;
            mismatchCount++;
          } catch (updateError: any) {
            statuses.push({
              userId: dbUser.userId,
              dbRole: dbUser.role,
              clerkRole: clerkRole,
              status: "error",
              message: `Error al reparar: ${updateError?.message}`,
            });
            console.log(
              `${progress} ❌ ERROR: No se pudo reparar - ${updateError?.message}`
            );
          }
        }
      } catch (error: any) {
        statuses.push({
          userId: dbUser.userId,
          dbRole: dbUser.role,
          status: "error",
          message: error?.message || "Error desconocido",
        });
        console.log(`${progress} ❌ ERROR: ${error?.message || "Desconocido"}`);
      }

      // Pequeña pausa
      if (i < dbUsers.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    // 4. Generar reporte final
    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║                  📋 REPORTE FINAL                      ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    console.log("📊 ESTADÍSTICAS:");
    console.log(`  ✅ Correctamente sincronizados: ${syncedCount}`);
    console.log(`  🔧 Reparados: ${fixedCount}`);
    console.log(`  ⚠️  Desincronizaciones detectadas: ${mismatchCount}`);
    console.log(`  📌 Total procesados: ${dbUsers.length}\n`);

    // Errores
    const errorUsers = statuses.filter((s) => s.status === "error");
    if (errorUsers.length > 0) {
      console.log("❌ USUARIOS CON ERROR:");
      errorUsers.forEach((u) => {
        console.log(`  • ${u.userId}: ${u.message}`);
      });
      console.log("");
    }

    // Sin rol
    const noRoleUsers = statuses.filter((s) => s.status === "db-only");
    if (noRoleUsers.length > 0) {
      console.log("⚠️  USUARIOS SIN ROL:");
      noRoleUsers.forEach((u) => {
        console.log(`  • ${u.userId}`);
      });
      console.log("");
    }

    // Resumen final
    console.log("╔════════════════════════════════════════════════════════╗");
    if (errorUsers.length === 0 && noRoleUsers.length === 0) {
      console.log("║           🎉 SINCRONIZACIÓN EXITOSA                     ║");
      console.log("║     Todos los usuarios están correctamente sincronizados ║");
    } else if (fixedCount > 0) {
      console.log("║      ✅ SINCRONIZACIÓN PARCIALMENTE COMPLETADA         ║");
      console.log(`║         Se repararon ${fixedCount} desincronizaciones      ║`);
    } else {
      console.log("║            ⚠️  SINCRONIZACIÓN CON ADVERTENCIAS          ║");
    }
    console.log("╚════════════════════════════════════════════════════════╝\n");
  } catch (error: any) {
    console.error("\n╔════════════════════════════════════════════════════════╗");
    console.error("║               ❌ ERROR CRÍTICO                         ║");
    console.error("╚════════════════════════════════════════════════════════╝\n");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
fullSync();
