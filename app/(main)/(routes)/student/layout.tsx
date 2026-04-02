// app/student/layout.tsx
import type { Metadata } from "next";
import { getUserRole } from "@/lib/getUserRole";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server"; // Importante

export const metadata: Metadata = {
  title: "Student | Dexpert",
  description: "Student dashboard for managing projects and skills",
};

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  
  // Si ni siquiera hay usuario, al login
  if (!userId) {
    console.log("[StudentLayout] Sin userId, redirigiendo a sign-in");
    redirect("/sign-in");
  }

  console.log("[StudentLayout] Verificando rol para userId:", userId);
  const role = await getUserRole();

  console.log("[StudentLayout] Rol detectado:", role);

  // Si el rol no es STUDENT, lo mandamos a not-authorized
  if (role !== "STUDENT") {
    // Si no tiene rol, mandarlo a onboarding
    if (!role) {
      console.log("[StudentLayout] Sin rol, redirigiendo a onboarding");
      redirect("/onboarding?role=STUDENT");
    }
    
    // Si tiene otro rol, mandarlo a la ruta correspondiente
    console.log("[StudentLayout] ERROR: Rol no es STUDENT, es:", role, "- Redirigiendo a", role === "PYME" ? "/pyme" : "/not-authorized");
    redirect(role === "PYME" ? "/pyme" : "/not-authorized");
  }

  console.log("[StudentLayout] Rol verificado correctamente como STUDENT");
  return <>{children}</>;
}