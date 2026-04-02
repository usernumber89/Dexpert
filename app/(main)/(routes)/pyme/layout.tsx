import { Metadata } from "next";
import { getUserRole } from "@/lib/getUserRole";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: "Pyme | Dexpert",
  description: "Pyme dashboard for managing projects, applicants and more",
};

export default async function PymeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    console.log("[PymeLayout] Sin userId, redirigiendo a sign-in");
    redirect("/sign-in");
  }

  console.log("[PymeLayout] Verificando rol para userId:", userId);
  const role = await getUserRole();
  
  console.log("[PymeLayout] Rol detectado:", role);

  if (role !== "PYME") {
    // Si no tiene rol, mandarlo a onboarding
    if (!role) {
      console.log("[PymeLayout] Sin rol, redirigiendo a onboarding");
      redirect("/onboarding?role=PYME");
    }
    
    // Si tiene otro rol, mandarlo a la ruta correspondiente
    console.log("[PymeLayout] ERROR: Rol no es PYME, es:", role, "- Redirigiendo a", role === "STUDENT" ? "/student" : "/not-authorized");
    redirect(role === "STUDENT" ? "/student" : "/not-authorized");
  }

  console.log("[PymeLayout] Rol verificado correctamente como PYME");
  return <>{children}</>;
}
