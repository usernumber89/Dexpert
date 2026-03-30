import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',        // ← faltaba
  '/api/create-user(.*)',  // ← faltaba
  '/api/uploadthing(.*)',
  '/api/get-role(.*)',
  '/api/project-analyzer(.*)',
  '/terms(.*)',
  '/privacy(.*)',
]);

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)']);
const isStudentRoute = createRouteMatcher(['/student(.*)']);
const isPymeRoute = createRouteMatcher(['/pyme(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims as any)?.role as string | undefined;
  const url = req.nextUrl.clone();

  // Rutas públicas: dejar pasar siempre
  if (isPublicRoute(req)) {
    // Si ya tiene rol y va a sign-in/sign-up → mandarlo a su dashboard
    if (userId && role && (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up'))) {
      url.pathname = role === 'STUDENT' ? '/student' : '/pyme';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Rutas privadas: debe estar autenticado
  if (!userId) {
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  // Autenticado sin rol → onboarding
  if (!role) {
    if (!isOnboardingRoute(req)) {
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Autenticado con rol → no puede volver a onboarding
  if (isOnboardingRoute(req)) {
    url.pathname = role === 'STUDENT' ? '/student' : '/pyme';
    return NextResponse.redirect(url);
  }

  // Protección cruzada de roles
  if (isStudentRoute(req) && role !== 'STUDENT') {
    url.pathname = '/pyme';
    return NextResponse.redirect(url);
  }

  if (isPymeRoute(req) && role !== 'PYME') {
    url.pathname = '/student';
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set('x-pathname', req.nextUrl.pathname);
  return res;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};