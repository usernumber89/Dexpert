

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ExperienceBanner, Footer, Header,Faq,Guide,Plans,CallToAction,Testimony, Aboutus } from "./(main)/(routes)/(root)/components";
import ProjectsView from "./(main)/(routes)/(root)/components/ProjectsView/ProjectsView";

export default function Home() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const checkUserRole = async () => {
      try {
        const response = await fetch('/api/get-role');
        const data = await response.json();
        
        if (data.role) {
          // Redirigir al dashboard según el rol
          router.push(data.role === 'STUDENT' ? '/student' : '/pyme');
        }
      } catch (error) {
        console.error('Error checking role:', error);
      }
    };

    checkUserRole();
  }, [isLoaded, user, router]);

  // No mostrar nada mientras redirije
  if (isLoaded && user) {
    return null;
  }

  return (
    <div>
      
      <Header/>

      <ExperienceBanner/>
      <Aboutus/>

      <Guide/>

      <Plans/>
      <Testimony/>
      <Faq/>
      <CallToAction/>
      <Footer/>




    </div>
  );
}
