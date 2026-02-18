import { getRoutingDecision, PROTECTED_ROUTES, AUTH_ROUTES } from '../../src/lib/routing';

describe('getRoutingDecision', () => {
  describe('unauthenticated user', () => {
    it('should redirect / to /register', () => {
      const result = getRoutingDecision('/', null, false);
      expect(result).toEqual({ redirect: '/register' });
    });

    it('should redirect /dashboard to /register', () => {
      const result = getRoutingDecision('/dashboard', null, false);
      expect(result).toEqual({ redirect: '/register?redirectTo=%2Fdashboard' });
    });

    it('should redirect /profile to /register', () => {
      const result = getRoutingDecision('/profile', null, false);
      expect(result).toEqual({ redirect: '/register?redirectTo=%2Fprofile' });
    });

    it('should redirect /onboarding to /register', () => {
      const result = getRoutingDecision('/onboarding', null, false);
      expect(result).toEqual({ redirect: '/register?redirectTo=%2Fonboarding' });
    });

    it('should redirect /extension-guide to /register', () => {
      const result = getRoutingDecision('/extension-guide', null, false);
      expect(result).toEqual({ redirect: '/register?redirectTo=%2Fextension-guide' });
    });

    it('should allow /register through', () => {
      const result = getRoutingDecision('/register', null, false);
      expect(result).toEqual({ redirect: null });
    });

    it('should allow /auth/login through', () => {
      const result = getRoutingDecision('/auth/login', null, false);
      expect(result).toEqual({ redirect: null });
    });

    it('should allow /auth/confirm-email through', () => {
      const result = getRoutingDecision('/auth/confirm-email', null, false);
      expect(result).toEqual({ redirect: null });
    });

    it('should allow /register/confirm through', () => {
      const result = getRoutingDecision('/register/confirm', null, false);
      expect(result).toEqual({ redirect: null });
    });
  });

  describe('authenticated user — onboarding complete', () => {
    const userId = 'user-123';

    it('should redirect / to /dashboard', () => {
      const result = getRoutingDecision('/', userId, true);
      expect(result).toEqual({ redirect: '/dashboard' });
    });

    it('should redirect /register to /dashboard', () => {
      const result = getRoutingDecision('/register', userId, true);
      expect(result).toEqual({ redirect: '/dashboard' });
    });

    it('should redirect /auth/login to /dashboard', () => {
      const result = getRoutingDecision('/auth/login', userId, true);
      expect(result).toEqual({ redirect: '/dashboard' });
    });

    it('should allow /dashboard through', () => {
      const result = getRoutingDecision('/dashboard', userId, true);
      expect(result).toEqual({ redirect: null });
    });

    it('should allow /profile through', () => {
      const result = getRoutingDecision('/profile', userId, true);
      expect(result).toEqual({ redirect: null });
    });

    it('should allow /onboarding through (can revisit)', () => {
      const result = getRoutingDecision('/onboarding', userId, true);
      expect(result).toEqual({ redirect: null });
    });
  });

  describe('authenticated user — onboarding NOT complete', () => {
    const userId = 'user-456';

    it('should redirect / to /onboarding', () => {
      const result = getRoutingDecision('/', userId, false);
      expect(result).toEqual({ redirect: '/onboarding' });
    });

    it('should redirect /register to /onboarding', () => {
      const result = getRoutingDecision('/register', userId, false);
      expect(result).toEqual({ redirect: '/onboarding' });
    });

    it('should redirect /auth/login to /onboarding', () => {
      const result = getRoutingDecision('/auth/login', userId, false);
      expect(result).toEqual({ redirect: '/onboarding' });
    });

    it('should allow /onboarding through', () => {
      const result = getRoutingDecision('/onboarding', userId, false);
      expect(result).toEqual({ redirect: null });
    });

    it('should allow /onboarding/import through', () => {
      const result = getRoutingDecision('/onboarding/import', userId, false);
      expect(result).toEqual({ redirect: null });
    });

    it('should allow /dashboard through (already onboarded check done elsewhere)', () => {
      const result = getRoutingDecision('/dashboard', userId, false);
      expect(result).toEqual({ redirect: null });
    });
  });

  describe('PROTECTED_ROUTES', () => {
    it('should include /dashboard', () => {
      expect(PROTECTED_ROUTES.some(r => '/dashboard'.startsWith(r))).toBe(true);
    });

    it('should include /profile', () => {
      expect(PROTECTED_ROUTES.some(r => '/profile'.startsWith(r))).toBe(true);
    });

    it('should include /onboarding', () => {
      expect(PROTECTED_ROUTES.some(r => '/onboarding'.startsWith(r))).toBe(true);
    });
  });

  describe('AUTH_ROUTES', () => {
    it('should include /register', () => {
      expect(AUTH_ROUTES.some(r => '/register'.startsWith(r))).toBe(true);
    });

    it('should include /auth/login', () => {
      expect(AUTH_ROUTES.some(r => '/auth/login'.startsWith(r))).toBe(true);
    });
  });
});
