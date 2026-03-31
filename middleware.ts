import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
  '/api/create-user(.*)',
  '/api/uploadthing(.*)',
  '/api/get-role(.*)', // <--- IMPORTANTE: Debe ser pública para el fetch del middleware
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
  
  // 1. SI ES UNA RUTA DE API, NO REDIRIGIR NUNCA (Evita bucles en fetch)
  if (req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  let role = (sessionClaims as any)?.publicMetadata?.role as string | undefined;

  // 2. Rutas públicas: dejar pasar
  if (isPublicRoute(req)) {
    if (userId && role && (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up'))) {
      url.pathname = role === 'STUDENT' ? '/student' : '/pyme';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 3. Si no está autenticado y no es pública
  if (!userId) {
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  // 4. Intento de recuperar rol si no está en claims
  if (!role) {
    try {
      const baseUrl = req.nextUrl.origin;
      const response = await fetch(`${baseUrl}/api/get-role`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId, // Enviamos el ID para que la API sepa quién es
          'cookie': req.headers.get('cookie') || '', // PASAR COOKIES ES VITAL
        },
      });

      if (response.ok) {
        const data = await response.json();
        role = data.role;
      }
    } catch (error) {
      console.error('[Middleware] Error al obtener rol:', error);
    }
  }

  // 5. LÓGICA DE REDIRECCIÓN FINAL (Solo para páginas, no APIs)
  
  // Si después de todo no hay rol -> Onboarding (si no está ya ahí)
  if (!role) {
    if (!isOnboardingRoute(req)) {
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Si tiene rol, no puede estar en onboarding
  if (isOnboardingRoute(req)) {
    url.pathname = role === 'STUDENT' ? '/student' : '/pyme';
    return NextResponse.redirect(url);
  }

  // Protección de rutas por rol
  if (isStudentRoute(req) && role !== 'STUDENT') {
    url.pathname = '/pyme';
    return NextResponse.redirect(url);
  }

  if (isPymeRoute(req) && role !== 'PYME') {
    url.pathname = '/student';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};