# Scripts de Sincronización de Usuarios

Estos scripts ayudan a sincronizar los roles de usuarios existentes entre la base de datos y Clerk.

## 🚀 Uso

### 1. Script Simple (Recomendado para empezar)

```bash
npx ts-node scripts/syncExistingRoles.ts
```

**¿Qué hace?**
- Obtiene todos los usuarios de la base de datos
- Sincroniza el rol de cada usuario con Clerk
- Genera un reporte de éxito/error

**Cuándo usar:** Cuando quieres sincronizar todos los usuarios existentes de forma sencilla.

---

### 2. Script Completo (Más detallado)

```bash
npx ts-node scripts/fullSync.ts
```

**¿Qué hace?**
- Verifica a cada usuario en BD y Clerk
- Detecta desincronizaciones automáticamente
- Intenta reparar desincronizaciones
- Genera un reporte detallado con estadísticas

**Cuándo usar:** Para un diagnóstico completo y reparar problemas.

---

## 📊 Ejemplos de Salida

### Script Simple
```
═══════════════════════════════════════════════════════
🔄 Iniciando sincronización de roles de usuarios existentes
═══════════════════════════════════════════════════════

📊 Obteniendo usuarios de la base de datos...
✅ Se encontraron 5 usuarios

🔑 Inicializando cliente de Clerk...
✅ Cliente de Clerk listo

🔄 Sincronizando 5 usuarios...

[1/5] 🔄 Sincronizando user_abc123 con rol: STUDENT
[1/5] ✅ user_abc123 sincronizado correctamente
[2/5] 🔄 Sincronizando user_def456 con rol: PYME
[2/5] ✅ user_def456 sincronizado correctamente
...

═══════════════════════════════════════════════════════
📋 REPORTE FINAL
═══════════════════════════════════════════════════════
✅ Sincronizados correctamente: 5
❌ Errores: 0
⚠️  Sin rol: 0
📊 Total procesados: 5
═══════════════════════════════════════════════════════

✅ SINCRONIZACIÓN COMPLETADA
🎉 Todos los usuarios fueron sincronizados correctamente!
```

### Script Completo
```
╔════════════════════════════════════════════════════════╗
║     🔄 SINCRONIZACIÓN COMPLETA DE USUARIOS             ║
╚════════════════════════════════════════════════════════╝

📊 FASE 1: Obteniendo datos de la base de datos...
✅ Se encontraron 5 usuarios en la BD

🔑 FASE 2: Inicializando cliente de Clerk...
✅ Cliente de Clerk listo

🔄 FASE 3: Verificando y sincronizando 5 usuarios...

[1/5] ✅ user_abc123 - Sincronizado
[2/5] 🔧 user_def456 - DESINCRONIZACIÓN (BD: STUDENT, Clerk: PYME)
[2/5] ✅ user_def456 - REPARADO (PYME → STUDENT)
...

╔════════════════════════════════════════════════════════╗
║                  📋 REPORTE FINAL                      ║
╚════════════════════════════════════════════════════════╝

📊 ESTADÍSTICAS:
  ✅ Correctamente sincronizados: 4
  🔧 Reparados: 1
  ⚠️  Desincronizaciones detectadas: 1
  📌 Total procesados: 5

╔════════════════════════════════════════════════════════╗
║      ✅ SINCRONIZACIÓN PARCIALMENTE COMPLETADA         ║
║         Se repararon 1 desincronizaciones              ║
╚════════════════════════════════════════════════════════╝
```

---

## ⚙️ Requisitos

- Node.js instalado
- TypeScript configurado (`tsconfig.json` presente)
- Variables de entorno configuradas (`.env.local`):
  - `DATABASE_URL`
  - `CLERK_SECRET_KEY`

---

## 🔧 Solución de Problemas

### Error: "Cannot find module '@/lib/prisma'"
Asegúrate de estar ejecutando desde la raíz del proyecto:
```bash
cd c:\Users\MINEDUCYT\Desktop\Dexpert
npx ts-node scripts/fullSync.ts
```

### Error: "Unauthorized" de Clerk
Verifica que `CLERK_SECRET_KEY` esté configurada correctamente en `.env.local`:
```env
CLERK_SECRET_KEY=sk_live_... (tu clave secreta)
```

### Error: "connect ECONNREFUSED" en Prisma
Verifica que:
1. La BD está corriendo
2. `DATABASE_URL` en `.env.local` es correcta
3. Prisma está configurado correctamente

---

## 📝 Notas Importantes

- Los scripts **NO** borran datos, solo sincronizaciónan
- Ambos scripts están **seguros** para ejecutar múltiples veces
- Recomendamos ejecutar `fullSync.ts` primero para diagnóstico
- Los scripts generan **logs detallados** para debugging

---

## 🎯 Flujo Recomendado

1. **Ejecuta** `fullSync.ts` para ver el estado actual
2. **Revisa** el reporte y qué usuarios tienen problemas
3. **Si hay errores**, investiga por qué (verifica logs de Clerk)
4. **Ejecuta nuevamente** para confirmar que se arreglaron

---

## ✅ Verificación Post-Sincronización

Después de ejecutar los scripts:

1. Un usuario se registra y completa onboarding
2. Debe ir directamente a `/student` o `/pyme`
3. **NO** debe ver `/not-authorized`
4. Puede visitar `/check-role` para verificar su estado

Si aún hay problemas, revisa los logs del servidor en tiempo real para debugging.
