"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useUser } from "@clerk/nextjs";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const hasCalledApi = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Iniciando...");

  useEffect(() => {
    if (!isLoaded || !user || hasCalledApi.current) return;

    const role = searchParams.get("role") as "STUDENT" | "PYME" | null;

    if (!role || !["STUDENT", "PYME"].includes(role)) {
      setError("Rol inválido. Por favor vuelve a intentar."); 
      router.push("/sign-up");
      return;
    }

    const createUser = async () => {
      hasCalledApi.current = true;
      try {
        setStatus("Creando perfil...");
        
        const res = await fetch("/api/create-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Error en el servidor");
        }

        const responseData = await res.json();
        console.log("[ONBOARDING] Respuesta de create-user:", responseData);

        setStatus("Actualizando sesión...");
        // Esperar a que Clerk actualice los metadatos en el JWT
        await user.reload();
        
        // Esperar 1 segundo para que el token se propague completamente
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStatus("Verificando permisos...");
        // Hacer múltiples checks para asegurar que la BD y JWT estén sincronizados
        for (let i = 0; i < 3; i++) {
          const roleCheck = await fetch("/api/get-role", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          
          const roleData = await roleCheck.json();
          console.log(`[ONBOARDING] Intento ${i + 1} - Rol verificado:`, roleData);
          
          // También hacer debug check
          const debugCheck = await fetch("/api/debug-role", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          const debugData = await debugCheck.json();
          console.log(`[ONBOARDING] Debug info (intento ${i + 1}):`, debugData);
          
          if (roleData.role === role && debugData.dbRole === role) {
            console.log("[ONBOARDING] Rol sincronizado correctamente en BD y JWT");
            break;
          }
          
          // Si no coincide, esperar un poco más
          if (i < 2) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        setStatus("Redirigiendo...");
        // Redirección forzada para asegurar que el Middleware lea el nuevo token
        setTimeout(() => {
          console.log("[ONBOARDING] Redirigiendo a:", role === "STUDENT" ? "/student" : "/pyme");
          window.location.href = role === "STUDENT" ? "/student" : "/pyme";
        }, 1000);
        
      } catch (error) {
        console.error("[ONBOARDING] Error:", error);
        setError(error instanceof Error ? error.message : "Error desconocido");
        hasCalledApi.current = false;
      }
    };

    createUser();
  }, [isLoaded, user, router, searchParams]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = "/sign-up"}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Volver a intentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-6">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">Finalizando configuración</h2>
        <p className="text-slate-500">{status}</p>
        <p className="text-xs text-slate-400 mt-4">Estamos preparando tu perfil de {searchParams.get("role")}...</p>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Cargando...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}