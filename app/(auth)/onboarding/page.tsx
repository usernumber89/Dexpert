"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useUser } from "@clerk/nextjs"; // Importamos useUser

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const hasCalledApi = useRef(false); // Para evitar doble ejecución en StrictMode

  useEffect(() => {
    // 1. Esperar a que Clerk cargue y evitar múltiples llamadas
    if (!isLoaded || !user || hasCalledApi.current) return;

    const role = searchParams.get("role") as "STUDENT" | "PYME" | null;

    if (!role || !["STUDENT", "PYME"].includes(role)) {
      router.push("/sign-up");
      return;
    }

    const createUser = async () => {
      hasCalledApi.current = true;
      
      try {
        const res = await fetch("/api/create-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        });

        if (!res.ok) throw new Error("Failed to create user");

        // 2. LA CLAVE: Forzar a Clerk a refrescar la sesión en el cliente
        // Esto descarga el nuevo JWT que ya contiene el publicMetadata.role
        await user.reload();

        // 3. Redirigir inmediatamente después del refresco exitoso
        router.push(role === "STUDENT" ? "/student" : "/pyme");
        
      } catch (error) {
        console.error("Error creating user:", error);
        hasCalledApi.current = false; // Permitir reintento
        // Reintento opcional tras error
        setTimeout(createUser, 3000);
      }
    };

    createUser();
  }, [isLoaded, user, router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-6">
      <div className="relative flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-blue-100 rounded-full animate-pulse" />
        <div className="absolute w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Preparando tu espacio</h2>
        <p className="text-slate-500 animate-pulse text-lg">Configurando tu perfil de {searchParams.get("role")?.toLowerCase()}...</p>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}