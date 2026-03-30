"use client";
import { useAuth } from "@clerk/nextjs";
import { useUserRole } from "@/hooks/useUserRole";

export function CallToAction() {
  const { isSignedIn } = useAuth();
  const { role } = useUserRole();

  const href = !isSignedIn ? "/sign-up" : role === "PYME" ? "/pyme" : "/student/projects";
  const label = !isSignedIn ? "Join us now!" : "Go to your panel";

  return (
    <section className="bg-[#0A2243] text-white py-16 px-6 text-center rounded-2xl max-w-4xl mx-auto my-12">
      <h2 className="text-3xl sm:text-4xl font-bold mb-4">
        Ready to take the first step?
      </h2>
      <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto text-white/80">
        Whether you're a young talent looking for experience or a small business needing real solutions — Dexpert is your bridge to growth.
      </p>
      
        href={href}
        className="inline-block bg-[#2196F3] text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-400 transition"
      >
        {label}
      </a>
      <p className="mt-6 text-sm text-white/60 italic">
        Your talent is enough. Experience starts here.
      </p>
    </section>
  );
}