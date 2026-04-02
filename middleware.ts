import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
  '/api/create-user(.*)',
  '/api/uploadthing(.*)',
  '/api/get-role(.*)',
  '/api/sync-role(.*)',
  '/api/debug-role(.*)',
  '/api/project-analyzer(.*)',
  '/terms(.*)',
  '/privacy(.*)',
]);

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)']);
const isStudentRoute = createRouteMatcher(['/student(.*)']);
const isPymeRoute = createRouteMatcher(['/pyme(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const url = req.nextUrl.clone();
  
  console.log("[MIDDLEWARE] Path:", req.nextUrl.pathname, "userId:", userId);
  
  // 1. REGLA DE ORO: Las APIs no se redireccionan para evitar loops de fetch
  if (req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 2. Rutas públicas: Dejar pasar libremente
  if (isPublicRoute(req)) {
    console.log("[MIDDLEWARE] Ruta pública permitida");
    return NextResponse.next(); 
  }

  // 3. Protección de autenticación: Si no hay userId, al login
  if (!userId) {
    console.log("[MIDDLEWARE] Sin userId, redirigiendo a sign-in");
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  // 4. Obtener rol de los claims (JWT)
  let role = (sessionClaims as any)?.publicMetadata?.role as string | undefined;
  console.log("[MIDDLEWARE] Rol desde JWT:", role);

  // 5. Si no está en el JWT, intentamos fetch a la API interna
  if (!role) {
    console.log("[MIDDLEWARE] No hay rol en JWT, intentando fetch a /api/get-role");
    try {
      const baseUrl = req.nextUrl.origin;
      const response = await fetch(`${baseUrl}/api/get-role`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'cookie': req.headers.get('cookie') || '', 
        },
      });

      if (response.ok) {
        const data = await response.json();
        role = data.role; // Puede ser null si es usuario nuevo
        console.log("[MIDDLEWARE] Rol desde API:", role);
      } else {
        console.log("[MIDDLEWARE] API retornó status:", response.status);
      }
    } catch (error) {
      console.error('[MIDDLEWARE] Error al obtener rol:', error);
    }
  }

  // 6. LÓGICA DE REDIRECCIÓN BASADA EN ROL
  
  // Si NO tiene rol: mandarlo a onboarding (si no está ya ahí)
  if (!role) {
    console.log("[MIDDLEWARE] Sin rol asignado");
    if (isOnboardingRoute(req)) {
      console.log("[MIDDLEWARE] Ya está en onboarding, permitiendo acceso");
      return NextResponse.next();
    }
    console.log("[MIDDLEWARE] Redirigiendo a onboarding");
    url.pathname = '/onboarding';
    return NextResponse.redirect(url);
  }

  // Si TIENE rol: no puede entrar a onboarding
  if (isOnboardingRoute(req)) {
    console.log("[MIDDLEWARE] Usuario con rol intenta entrar a onboarding, redirigiendo");
    url.pathname = role === 'STUDENT' ? '/student' : '/pyme';
    return NextResponse.redirect(url);
  }

  // 7. PROTECCIÓN DE RUTAS POR ROL
  if (isStudentRoute(req) && role !== 'STUDENT') {
    console.log("[MIDDLEWARE] Usuario PYME intenta acceder a /student, redirigiendo");
    url.pathname = '/pyme';
    return NextResponse.redirect(url);
  }

  if (isPymeRoute(req) && role !== 'PYME') {
    console.log("[MIDDLEWARE] Usuario STUDENT intenta acceder a /pyme, redirigiendo");
    url.pathname = '/student';
    return NextResponse.redirect(url);
  }

  console.log("[MIDDLEWARE] Acceso permitido como:", role);
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};