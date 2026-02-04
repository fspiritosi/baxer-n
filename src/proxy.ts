import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Proxy de autenticación con Clerk (Next.js 16)
 *
 * Rutas públicas: /, /sign-in, /sign-up, /eq/[id]
 * Rutas protegidas: Todo lo demás (incluyendo /dashboard/*)
 */

// Rutas que NO requieren autenticación
const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)', '/eq/(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
