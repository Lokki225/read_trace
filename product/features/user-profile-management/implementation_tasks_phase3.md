# Implementation Tasks - Phase 3: Database Integration

**Feature**: User Profile Management  
**Phase**: Database Integration (Persistence Layer)  
**Dependencies**: Phase 1 (Domain), Phase 2 (API)  
**Estimated Duration**: 1 day

## Phase Overview

Phase 3 implements database schema updates, migrations, and persistence logic for user profile management including profile updates, password changes, and account deletion.

## Phase Completion Criteria

- [ ] Database schema updated for profiles
- [ ] Migration files created and applied
- [ ] Profile CRUD operations implemented
- [ ] RLS policies configured
- [ ] Database tests passing (>85% coverage)

---

## Task 3.1: Update User Profile Schema

**File**: `database/migrations/006_user_profiles_extended.sql`

**Description**: Extend user_profiles table with additional profile fields.

**Acceptance Criteria**:
- Add display_name field
- Add profile_picture field
- Add bio field
- Add notification preferences
- Create indexes

**Implementation Details**:
```sql
-- database/migrations/006_user_profiles_extended.sql

-- Extend user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS display_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS profile_picture TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notification_push BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name 
ON user_profiles(display_name);

-- Add constraints
ALTER TABLE user_profiles
ADD CONSTRAINT check_display_name_length 
CHECK (length(display_name) >= 1 AND length(display_name) <= 100);

ALTER TABLE user_profiles
ADD CONSTRAINT check_bio_length 
CHECK (length(bio) <= 500);

-- Add comments
COMMENT ON COLUMN user_profiles.display_name IS 'User display name shown in UI';
COMMENT ON COLUMN user_profiles.profile_picture IS 'URL to user profile picture';
COMMENT ON COLUMN user_profiles.bio IS 'User bio (max 500 characters)';
COMMENT ON COLUMN user_profiles.notification_email IS 'Email notification preference';
COMMENT ON COLUMN user_profiles.notification_push IS 'Push notification preference';
```

**Verification**:
```bash
supabase db push
```

**Dependencies**: user_profiles table exists

**Estimated Time**: 1 hour

---

## Task 3.2: Create User Profile Repository

**File**: `backend/repositories/userProfileRepository.ts`

**Description**: Implement repository for user profile database operations.

**Acceptance Criteria**:
- Get profile by user ID
- Update profile information
- Update notification preferences
- Delete user profile

**Implementation Details**:
```typescript
// backend/repositories/userProfileRepository.ts

import { createClient } from '@/lib/supabase/server';

export interface UserProfile {
  user_id: string;
  display_name?: string;
  profile_picture?: string;
  bio?: string;
  notification_email: boolean;
  notification_push: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  display_name?: string;
  profile_picture?: string;
  bio?: string;
}

export interface NotificationPreferences {
  notification_email: boolean;
  notification_push: boolean;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) return null;
  return data;
}

export async function updateUserProfile(
  userId: string,
  updates: UpdateProfileData
): Promise<UserProfile> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      ...updates,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: NotificationPreferences
): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('user_profiles')
    .update(preferences)
    .eq('user_id', userId);
  
  if (error) throw error;
}

export async function deleteUserProfile(userId: string): Promise<void> {
  const supabase = createClient();
  
  // Delete profile (will cascade to related data based on foreign keys)
  const { error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('user_id', userId);
  
  if (error) throw error;
  
  // Delete auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  
  if (authError) throw authError;
}

export async function uploadProfilePicture(
  userId: string,
  file: File
): Promise<string> {
  const supabase = createClient();
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `profile-pictures/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);
  
  if (uploadError) throw uploadError;
  
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}
```

**Verification**:
```bash
npm run test -- userProfileRepository.test.ts
```

**Dependencies**: Task 3.1

**Estimated Time**: 2 hours

---

## Task 3.3: Update Profile API Endpoints

**File**: Multiple API route files

**Description**: Connect API endpoints to repository methods.

**Acceptance Criteria**:
- Profile GET endpoint uses repository
- Profile PATCH endpoint uses repository
- Notification preferences endpoint uses repository
- Account deletion endpoint uses repository

**Implementation Details**:

Update `src/app/api/profile/route.ts`:
```typescript
// src/app/api/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile, updateUserProfile } from '@/backend/repositories/userProfileRepository';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const profile = await getUserProfile(user.id);
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const updates = await request.json();
    
    // Validate updates
    if (updates.display_name && updates.display_name.length > 100) {
      return NextResponse.json(
        { error: 'Display name too long (max 100 characters)' },
        { status: 400 }
      );
    }
    
    if (updates.bio && updates.bio.length > 500) {
      return NextResponse.json(
        { error: 'Bio too long (max 500 characters)' },
        { status: 400 }
      );
    }
    
    const profile = await updateUserProfile(user.id, updates);
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Verification**:
```bash
npm run test -- integration/profile-api.test.ts
```

**Dependencies**: Task 3.2

**Estimated Time**: 2 hours

---

## Task 3.4: Create Storage Bucket for Profile Pictures

**File**: Supabase dashboard or CLI

**Description**: Set up storage bucket for profile picture uploads.

**Acceptance Criteria**:
- Create 'avatars' storage bucket
- Configure public access
- Set file size limits (5MB)
- Set allowed file types (jpg, png, webp)

**Implementation Details**:
```bash
# Create storage bucket via Supabase CLI
supabase storage create avatars --public

# Or configure via dashboard:
# 1. Go to Storage in Supabase dashboard
# 2. Create new bucket named 'avatars'
# 3. Set public access to true
# 4. Configure policies for authenticated uploads
```

Storage policies (SQL):
```sql
-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profile-pictures' AND
  auth.uid()::text = (storage.filename(name))[1]
);

-- Allow public read access to avatars
CREATE POLICY "Public read access to avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.filename(name))[1]
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.filename(name))[1]
);
```

**Verification**:
Test upload via API

**Dependencies**: Supabase storage configured

**Estimated Time**: 1 hour

---

## Phase 3 Completion Checklist

- [ ] User profile schema updated and migrated
- [ ] User profile repository implemented
- [ ] Profile API endpoints integrated with database
- [ ] Storage bucket created for profile pictures
- [ ] Storage policies configured
- [ ] All database tests passing (>85% coverage)
- [ ] RLS policies tested
- [ ] File upload tested
- [ ] Code review approved
- [ ] Ready for Phase 4

**Status**: Not Started  
**Last Updated**: 2026-02-10  
**Owner**: [Developer Name]
