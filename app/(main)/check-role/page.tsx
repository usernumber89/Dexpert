"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function RoleSyncPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "checking" | "syncing" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    const syncRole = async () => {
      try {
        setStatus("checking");
        setMessage("Verificando tu rol...");

        // Primero verificar estado actual
        const debugRes = await fetch("/api/debug-role");
        const debugData = await debugRes.json();
        
        console.log("[ROLE-SYNC] Debug info:", debugData);
        setMessage(`Rol actual - JWT: ${debugData.jwtRole}, BD: ${debugData.dbRole}`);

        setStatus("syncing");
        setMessage("Sincronizando tu rol...");

        // Llamar al endpoint de sincronización
        const syncRes = await fetch("/api/sync-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!syncRes.ok) {
          const error = await syncRes.json();
          throw new Error(error.error || "Error al sincronizar");
        }

        const syncData = await syncRes.json();
        console.log("[ROLE-SYNC] Respuesta:", syncData);

        setRole(syncData.role);
        setStatus("success");
        setMessage(`¡Perfecto! Tu rol (${syncData.role}) ha sido sincronizado correctamente.`);

        // Redirigir después de 3 segundos
        setTimeout(() => {
          window.location.href = syncData.role === "STUDENT" ? "/student" : "/pyme";
        }, 3000);

      } catch (error) {
        console.error("[ROLE-SYNC] Error:", error);
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Error desconocido");
      }
    };

    syncRole();
  }, [isLoaded, user, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {status === "loading" && (
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Cargando...</p>
          </div>
        )}

        {status === "checking" && (
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">{message}</p>
          </div>
        )}

        {status === "syncing" && (
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-green-600 mb-2">¡Listo!</h2>
            <p className="text-slate-600 mb-4">{message}</p>
            <p className="text-sm text-slate-500">Redirigiendo en 3 segundos...</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-slate-600 mb-4">{message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
