"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export function PaymentFeedback() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (params.get("success") === "true") {
      const plan = params.get("plan") ?? "Basic";
      toast.success(`¡Pago exitoso! Tu plan ${plan} está activo.`);
      // Limpiar los params de la URL sin recargar
      router.replace(pathname);
    }
    if (params.get("canceled") === "true") {
      toast.error("Pago cancelado. Puedes intentarlo de nuevo cuando quieras.");
      router.replace(pathname);
    }
  }, [params, router, pathname]);

  return null;
}