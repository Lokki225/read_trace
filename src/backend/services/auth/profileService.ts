import { createServerClient, Database } from '@/lib/supabase';
import { UserProfile, ProfileUpdate } from '@/model/schemas/profile';
import { validateProfileUpdate } from './profileValidator';

/**
 * Retrieves the profile for the given user ID
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    throw new Error('Failed to fetch profile');
  }

  if (!data) {
    return null;
  }

  const profileData = data as any;

  return {
    id: profileData.id,
    email: profileData.email,
    username: profileData.username,
    display_name: profileData.display_name,
    avatar_url: profileData.avatar_url,
    bio: profileData.bio,
    email_confirmed_at: profileData.email_confirmed_at ? new Date(profileData.email_confirmed_at) : null,
    created_at: new Date(profileData.created_at),
    updated_at: new Date(profileData.updated_at),
    preferences: profileData.preferences
  };
}

/**
 * Updates the profile for the given user ID
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<UserProfile> {
  // Validate the updates
  const validation = validateProfileUpdate(updates as any);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  const supabase = await createServerClient();

  // Check if username is being updated and if it's unique
  if (updates.username) {
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('id')
      .ilike('username', updates.username)
      .neq('id', userId)
      .single();

    if (existingUser) {
      throw new Error('Username already taken');
    }
  }

  // Prepare update data - only include fields that are being updated
  const updateData: any = {};
  if (updates.username !== undefined) updateData.username = updates.username;
  if (updates.display_name !== undefined) updateData.display_name = updates.display_name;
  if (updates.bio !== undefined) updateData.bio = updates.bio;
  if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;
  if (updates.preferences !== undefined) {
    updateData.preferences = updates.preferences;
  }

  const { data, error } = await (supabase as any)
    .from('user_profiles')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw new Error('Failed to update profile');
  }

  const profileData = data as any;

  return {
    id: profileData.id,
    email: profileData.email,
    username: profileData.username,
    display_name: profileData.display_name,
    avatar_url: profileData.avatar_url,
    bio: profileData.bio,
    email_confirmed_at: profileData.email_confirmed_at ? new Date(profileData.email_confirmed_at) : null,
    created_at: new Date(profileData.created_at),
    updated_at: new Date(profileData.updated_at),
    preferences: profileData.preferences
  };
}

/**
 * Changes the user's password
 */
export async function changePassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const supabase = await createServerClient();

  // Verify current password by attempting to sign in
  const { data: user } = await supabase.auth.getUser();
  if (!user || user.user?.id !== userId) {
    throw new Error('Unauthorized');
  }

  // Update password using Supabase Auth
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    console.error('Error changing password:', error);
    throw new Error('Failed to change password');
  }
}

/**
 * Retrieves connected OAuth providers for a user
 */
export async function getConnectedProviders(userId: string): Promise<any[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data.user) {
    throw new Error('Failed to fetch user data');
  }

  // Extract identities from user metadata
  const identities = data.user.identities || [];
  
  return identities.map((identity: any) => ({
    provider_name: identity.provider,
    provider_id: identity.id,
    linked_at: identity.created_at ? new Date(identity.created_at) : new Date()
  }));
}

/**
 * Unlinks an OAuth provider from a user's account
 */
export async function unlinkProvider(
  userId: string,
  provider: string
): Promise<void> {
  const supabase = await createServerClient();

  // Get current user identities
  const { data } = await supabase.auth.getUser();
  
  if (!data.user) {
    throw new Error('User not found');
  }

  const identities = data.user.identities || [];
  
  // Ensure user has at least 2 identities (can't unlink last one)
  if (identities.length <= 1) {
    throw new Error('Cannot unlink the only authentication method');
  }

  // Note: Supabase doesn't have a direct API to unlink identities
  // This would typically be done through Supabase Admin API
  // For now, we'll throw an error indicating this limitation
  throw new Error('OAuth unlinking requires admin API - not yet implemented');
}
