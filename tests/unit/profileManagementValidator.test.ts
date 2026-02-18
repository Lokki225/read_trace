import {
  validateUsername,
  validateDisplayName,
  validateBio,
  validateAvatarUrl,
  validateUserPreferences,
  validateProfileUpdate
} from '@/backend/services/auth/profileValidator';

describe('Profile Management Validator', () => {
  describe('validateUsername', () => {
    it('should accept valid usernames', () => {
      const validUsernames = [
        'john_doe',
        'user123',
        'test_user',
        'alice',
        'bob123',
        'user_name_123'
      ];

      validUsernames.forEach(username => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject usernames that are too short', () => {
      const result = validateUsername('ab');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username must be at least 3 characters');
    });

    it('should reject usernames that are too long', () => {
      const result = validateUsername('a'.repeat(31));
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username must be at most 30 characters');
    });

    it('should reject usernames with invalid characters', () => {
      const invalidUsernames = [
        'user@name',
        'user name',
        'user-name',
        'user.name',
        'user#name'
      ];

      invalidUsernames.forEach(username => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Username can only contain letters, numbers, and underscores');
      });
    });

    it('should reject reserved usernames', () => {
      const reservedUsernames = [
        'admin',
        'root',
        'system',
        'api',
        'www',
        'user',
        'test'
      ];

      reservedUsernames.forEach(username => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Username is reserved and cannot be used');
      });
    });

    it('should reject usernames with consecutive underscores', () => {
      const result = validateUsername('user__name');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username cannot contain consecutive underscores');
    });

    it('should reject usernames starting or ending with underscore', () => {
      const startResult = validateUsername('_username');
      expect(startResult.isValid).toBe(false);
      expect(startResult.errors).toContain('Username cannot start or end with an underscore');

      const endResult = validateUsername('username_');
      expect(endResult.isValid).toBe(false);
      expect(endResult.errors).toContain('Username cannot start or end with an underscore');
    });

    it('should reject empty usernames', () => {
      const result = validateUsername('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username is required');
    });

    it('should handle whitespace correctly', () => {
      const result = validateUsername('  username  ');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateDisplayName', () => {
    it('should accept valid display names', () => {
      const validNames = [
        'John Doe',
        'Alice',
        'Bob Smith',
        '用户名', // Chinese characters
        'مرحبا', // Arabic characters
        '👋 User', // Emoji
        'John "The Man" Doe'
      ];

      validNames.forEach(name => {
        const result = validateDisplayName(name);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject empty display names', () => {
      const result = validateDisplayName('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Display name is required');
    });

    it('should reject display names that are too long', () => {
      const result = validateDisplayName('a'.repeat(101));
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Display name must be at most 100 characters');
    });

    it('should reject display names with control characters', () => {
      const result = validateDisplayName('John\x00Doe');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Display name contains invalid characters');
    });

    it('should reject display names with excessive whitespace', () => {
      const result = validateDisplayName('John   Doe');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Display name cannot contain excessive whitespace');
    });

    it('should handle whitespace correctly', () => {
      const result = validateDisplayName('  John Doe  ');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateBio', () => {
    it('should accept valid bios', () => {
      const validBios = [
        'Software developer who loves coding',
        'Just a regular user',
        '',
        'Bio with special chars: !@#$%^&*()',
        'Simple line break bio'
      ];

      validBios.forEach(bio => {
        const result = validateBio(bio || '');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should handle multiline bios correctly', () => {
      // Note: Newline characters (\n) are control characters and will be rejected
      const multilineBio = 'Multi\nline\nbio';
      const result = validateBio(multilineBio);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Bio contains invalid characters');
    });

    it('should reject bios that are too long', () => {
      const result = validateBio('a'.repeat(501));
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Bio must be at most 500 characters');
    });

    it('should reject bios with control characters', () => {
      const result = validateBio('Bio\x00with control chars');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Bio contains invalid characters');
    });
  });

  describe('validateAvatarUrl', () => {
    it('should accept valid avatar URLs', () => {
      const validUrls = [
        'https://example.com/avatar.jpg',
        'http://example.com/avatar.png',
        'https://cdn.example.com/images/avatar.gif',
        'https://example.com/avatar.webp',
        'https://example.com/avatar.svg'
      ];

      validUrls.forEach(url => {
        const result = validateAvatarUrl(url);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should accept empty avatar URL (optional field)', () => {
      const result = validateAvatarUrl('');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid URLs', () => {
      const result = validateAvatarUrl('not-a-url');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Avatar URL must be a valid URL');
    });

    it('should reject non-HTTP/HTTPS protocols', () => {
      const result = validateAvatarUrl('ftp://example.com/avatar.jpg');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Avatar URL must use HTTP or HTTPS protocol');
    });

    it('should reject URLs without valid image extensions', () => {
      const invalidUrls = [
        'https://example.com/file.txt',
        'https://example.com/document.pdf',
        'https://example.com/video.mp4'
      ];

      invalidUrls.forEach(url => {
        const result = validateAvatarUrl(url);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Avatar URL must point to an image file (jpg, png, gif, webp, or svg)');
      });
    });
  });

  describe('validateUserPreferences', () => {
    it('should accept valid preferences', () => {
      const validPreferences = [
        { theme: 'light', email_notifications: true },
        { theme: 'dark', email_notifications: false },
        { theme: 'system', email_notifications: true },
        { email_notifications: false },
        { default_scan_site: undefined },
        { default_scan_site: 'example.com' },
        {}
      ];

      validPreferences.forEach(prefs => {
        const result = validateUserPreferences(prefs);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject invalid theme', () => {
      const result = validateUserPreferences({ theme: 'invalid' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Theme must be one of: light, dark, system');
    });

    it('should reject invalid email_notifications type', () => {
      // Create an object with wrong type that bypasses TypeScript
      const invalidPrefs = { email_notifications: 'true' } as any;
      const result = validateUserPreferences(invalidPrefs);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email notifications preference must be a boolean');
    });

    it('should reject invalid default_scan_site type', () => {
      // Create an object with wrong type that bypasses TypeScript
      const invalidPrefs = { default_scan_site: 123 } as any;
      const result = validateUserPreferences(invalidPrefs);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Default scan site must be a string or null');
    });
  });

  describe('validateProfileUpdate', () => {
    it('should accept valid complete profile update', () => {
      const data = {
        username: 'newusername',
        display_name: 'New Display Name',
        bio: 'Updated bio',
        avatar_url: 'https://example.com/avatar.jpg',
        preferences: {
          theme: 'dark',
          email_notifications: true
        }
      };

      const result = validateProfileUpdate(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept partial profile update', () => {
      const data = {
        username: 'newusername'
      };

      const result = validateProfileUpdate(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accumulate multiple validation errors', () => {
      const data = {
        username: 'ab', // too short
        display_name: '', // empty
        bio: 'a'.repeat(501), // too long
        avatar_url: 'invalid-url', // invalid URL
        preferences: {
          theme: 'invalid' // invalid theme
        }
      };

      const result = validateProfileUpdate(data);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);
    });

    it('should handle empty update data', () => {
      const result = validateProfileUpdate({});
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
