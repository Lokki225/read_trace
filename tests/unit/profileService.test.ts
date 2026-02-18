import { getProfile, updateProfile, changePassword, getConnectedProviders } from '@/backend/services/auth/profileService';
import { createServerClient } from '@/lib/supabase';

jest.mock('@/lib/supabase');

describe('profileService', () => {
  const mockUserId = 'test-user-id';
  const mockProfile = {
    id: mockUserId,
    email: 'test@example.com',
    username: 'testuser',
    display_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    bio: 'Test bio',
    email_confirmed_at: new Date('2026-02-10'),
    created_at: new Date('2026-02-09'),
    updated_at: new Date('2026-02-10'),
    preferences: { theme: 'light', email_notifications: true, default_scan_site: null }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should fetch and return user profile', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: mockProfile, error: null })
            })
          })
        })
      };

      (createServerClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await getProfile(mockUserId);

      expect(result).toEqual(mockProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
    });

    it('should return null when profile not found', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
            })
          })
        })
      };

      (createServerClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await getProfile(mockUserId);

      expect(result).toBeNull();
    });

    it('should throw error when fetch fails', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ 
                data: null, 
                error: new Error('Database error') 
              })
            })
          })
        })
      };

      (createServerClient as jest.Mock).mockResolvedValue(mockSupabase);

      await expect(getProfile(mockUserId)).rejects.toThrow('Failed to fetch profile');
    });
  });

  describe('updateProfile', () => {
    it('should update profile with valid data', async () => {
      const updates = { display_name: 'Updated Name', bio: 'Updated bio' };
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            ilike: jest.fn().mockReturnValue({
              neq: jest.fn().mockResolvedValue({ data: null })
            })
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { ...mockProfile, ...updates }, error: null })
              })
            })
          })
        })
      };

      (createServerClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await updateProfile(mockUserId, updates);

      expect(result.display_name).toBe('Updated Name');
      expect(result.bio).toBe('Updated bio');
    });

    it('should reject duplicate username', async () => {
      const updates = { username: 'existinguser' };
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            ilike: jest.fn().mockReturnValue({
              neq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { id: 'other-user-id' } })
              })
            })
          })
        })
      };

      (createServerClient as jest.Mock).mockResolvedValue(mockSupabase);

      await expect(updateProfile(mockUserId, updates)).rejects.toThrow('Username already taken');
    });

    it('should validate profile update data', async () => {
      const invalidUpdates = { username: 'ab' }; // Too short

      await expect(updateProfile(mockUserId, invalidUpdates)).rejects.toThrow('Validation failed');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: { id: mockUserId } }, 
            error: null 
          }),
          updateUser: jest.fn().mockResolvedValue({ error: null })
        }
      };

      (createServerClient as jest.Mock).mockResolvedValue(mockSupabase);

      await changePassword(mockUserId, 'newPassword456!');

      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({ password: 'newPassword456!' });
    });

    it('should throw error when user is unauthorized', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: { id: 'different-user-id' } }, 
            error: null 
          })
        }
      };

      (createServerClient as jest.Mock).mockResolvedValue(mockSupabase);

      await expect(changePassword(mockUserId, 'newPassword456!')).rejects.toThrow('Unauthorized');
    });

    it('should throw error when password update fails', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ 
            data: { user: { id: mockUserId } }, 
            error: null 
          }),
          updateUser: jest.fn().mockResolvedValue({ error: new Error('Password update failed') })
        }
      };

      (createServerClient as jest.Mock).mockResolvedValue(mockSupabase);

      await expect(changePassword(mockUserId, 'newPassword456!')).rejects.toThrow('Failed to change password');
    });
  });

  describe('getConnectedProviders', () => {
    it('should return list of connected OAuth providers', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: {
              user: {
                identities: [
                  { provider: 'google', id: 'google-123', created_at: '2026-02-09' },
                  { provider: 'discord', id: 'discord-456', created_at: '2026-02-10' }
                ]
              }
            },
            error: null
          })
        }
      };

      (createServerClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await getConnectedProviders(mockUserId);

      expect(result).toHaveLength(2);
      expect(result[0].provider_name).toBe('google');
      expect(result[1].provider_name).toBe('discord');
    });

    it('should return empty array when no providers connected', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { identities: [] } },
            error: null
          })
        }
      };

      (createServerClient as jest.Mock).mockResolvedValue(mockSupabase);

      const result = await getConnectedProviders(mockUserId);

      expect(result).toEqual([]);
    });
  });
});
