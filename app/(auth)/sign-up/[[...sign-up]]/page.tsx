"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function SignUpPage() {
  const [role, setRole] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Solo verificamos localStorage, no necesitamos la API aquí
    // porque si el usuario está en esta página es porque NO tiene cuenta.
    const storedRole = localStorage.getItem("selectedRole");
    if (storedRole === "STUDENT" || storedRole === "PYME") {
      setRole(storedRole);
    }
    setIsReady(true);
  }, []);

  if (!isReady) return null; // Evita parpadeos (hydration)

  // PASO 1: Selección de Rol
  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-slate-100">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">¡Bienvenido!</h1>
          <p className="text-slate-500 mb-8">¿Cómo quieres usar Dexpert?</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => {
                localStorage.setItem("selectedRole", "STUDENT");
                setRole("STUDENT");
              }}
              className="w-full p-4 text-left border-2 border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <span className="block font-bold text-slate-700 group-hover:text-blue-700">Soy Estudiante</span>
              <span className="text-sm text-slate-500">Busco proyectos para ganar experiencia.</span>
            </button>

            <button 
              onClick={() => {
                localStorage.setItem("selectedRole", "PYME");
                setRole("PYME");
              }}
              className="w-full p-4 text-left border-2 border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <span className="block font-bold text-slate-700 group-hover:text-blue-700">Soy una PYME</span>
              <span className="text-sm text-slate-500">Busco talento para digitalizar mi negocio.</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PASO 2: Mostrar Clerk SignUp
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <button 
            onClick={() => {
              localStorage.removeItem("selectedRole");
              setRole(null);
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Cambiar rol ({role})
          </button>
        </div>
        
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          forceRedirectUrl={`/onboarding?role=${role}`}
        />
      </div>
    </div>
  );
}