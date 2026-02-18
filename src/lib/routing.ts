export const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/onboarding',
  '/extension-guide',
];

export const AUTH_ROUTES = [
  '/register',
  '/auth/login',
];

const PUBLIC_ROUTES = [
  '/auth/confirm-email',
  '/register/confirm',
  '/auth/callback',
  '/auth/forgot-password',
];

function isProtected(pathname: string): boolean {
  return PROTECTED_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));
}

function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));
}

export interface RoutingDecision {
  redirect: string | null;
}

export function getRoutingDecision(
  pathname: string,
  userId: string | null,
  onboardingCompleted: boolean
): RoutingDecision {
  const isAuthenticated = userId !== null;

  if (pathname === '/') {
    if (!isAuthenticated) return { redirect: '/register' };
    if (onboardingCompleted) return { redirect: '/dashboard' };
    return { redirect: '/onboarding' };
  }

  if (isPublic(pathname)) {
    return { redirect: null };
  }

  if (!isAuthenticated && isProtected(pathname)) {
    const encoded = encodeURIComponent(pathname);
    return { redirect: `/register?redirectTo=${encoded}` };
  }

  if (isAuthenticated && isAuthRoute(pathname)) {
    if (!onboardingCompleted) return { redirect: '/onboarding' };
    return { redirect: '/dashboard' };
  }

  return { redirect: null };
}
