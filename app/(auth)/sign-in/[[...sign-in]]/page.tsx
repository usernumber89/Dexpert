"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
      <h1 className="text-3xl text-[#0a2243] font-bold">Welcome back</h1>
      {/* 
        NO especificar forceRedirectUrl aquí - dejar que el middleware maneje 
        la lógica de redirección basada en el rol del usuario.
        Esto evita redirecciones incorrectas.
      */}
      <SignIn 
        fallbackRedirectUrl="/"
        signUpUrl="/sign-up"
      />
      <p className="text-sm text-gray-500">
        Don't have an account?{" "}
        <a href="/sign-up" className="text-blue-500 hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
}
