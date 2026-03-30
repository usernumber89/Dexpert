"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const createUser = async () => {
      const role = searchParams.get("role") as "STUDENT" | "PYME" | null;

      if (!role || !["STUDENT", "PYME"].includes(role)) {
        console.error("No valid role in URL");
        router.push("/sign-up");
        return;
      }

      try {
        const res = await fetch("/api/create-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        });

        if (!res.ok) throw new Error("Failed to create user");

        // Redirigir al formulario de onboarding del rol
        router.push(role === "STUDENT" ? "/onboarding/student" : "/onboarding/pyme");
      } catch (error) {
        console.error("Error creating user:", error);
        router.push("/error");
      }
    };

    createUser();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xl font-medium text-gray-700">Creating your profile...</p>
    </div>
  );
}