# Implementation Tasks - Phase 4: UI Layer

**Feature**: User Profile Management  
**Phase**: UI Layer (Frontend Components)  
**Dependencies**: Phase 1 (Domain), Phase 2 (API), Phase 3 (Database)  
**Estimated Duration**: 2 days

## Phase Overview

Phase 4 implements the user interface components for profile management, including profile view, edit form, profile picture upload, password change, and account deletion.

## Phase Completion Criteria

- [ ] Profile page component implemented
- [ ] Profile edit form implemented
- [ ] Profile picture upload implemented
- [ ] Password change form implemented
- [ ] Account deletion flow implemented
- [ ] E2E tests passing (>90% coverage)
- [ ] Accessibility requirements met

---

## Task 4.1: Create Profile Page Component

**File**: `src/app/profile/page.tsx`

**Description**: Main profile page showing user information with edit capabilities.

**Acceptance Criteria**:
- Display user profile information
- Show edit and delete options
- Protected route (authentication required)
- Loading and error states

**Implementation Details**:
```typescript
// src/app/profile/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileView } from '@/components/profile/ProfileView';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchProfile();
  }, []);
  
  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to load profile');
      }
      
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateSuccess = (updatedProfile: any) => {
    setProfile(updatedProfile);
    setEditing(false);
  };
  
  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchProfile}>Retry</button>
      </div>
    );
  }
  
  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile</h1>
      </div>
      
      {editing ? (
        <ProfileEditForm
          profile={profile}
          onSuccess={handleUpdateSuccess}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <ProfileView
          profile={profile}
          onEdit={() => setEditing(true)}
        />
      )}
    </div>
  );
}
```

**Verification**:
```bash
npm run dev
# Navigate to http://localhost:3000/profile
```

**Dependencies**: None

**Estimated Time**: 2 hours

---

## Task 4.2: Create Profile View Component

**File**: `src/components/profile/ProfileView.tsx`

**Description**: Display-only view of user profile information.

**Acceptance Criteria**:
- Display profile picture
- Display user information
- Show edit button
- Show account management options

**Implementation Details**:
```typescript
// src/components/profile/ProfileView.tsx

'use client';

import Image from 'next/image';

interface ProfileViewProps {
  profile: {
    display_name?: string;
    email: string;
    profile_picture?: string;
    bio?: string;
    created_at: string;
  };
  onEdit: () => void;
}

export function ProfileView({ profile, onEdit }: ProfileViewProps) {
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
  
  return (
    <div className="profile-view">
      <div className="profile-card">
        <div className="profile-picture-container">
          {profile.profile_picture ? (
            <Image
              src={profile.profile_picture}
              alt="Profile picture"
              width={120}
              height={120}
              className="profile-picture"
            />
          ) : (
            <div className="profile-picture-placeholder">
              {(profile.display_name || profile.email)[0].toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="profile-info">
          <h2>{profile.display_name || 'No name set'}</h2>
          <p className="email">{profile.email}</p>
          
          {profile.bio && (
            <p className="bio">{profile.bio}</p>
          )}
          
          <p className="join-date">Joined {joinDate}</p>
        </div>
        
        <div className="profile-actions">
          <button onClick={onEdit} className="btn-primary">
            Edit Profile
          </button>
        </div>
      </div>
      
      <div className="account-section">
        <h3>Account Settings</h3>
        <div className="account-links">
          <a href="/profile/change-password" className="account-link">
            Change Password
          </a>
          <a href="/profile/notifications" className="account-link">
            Notification Preferences
          </a>
          <a href="/profile/delete-account" className="account-link danger">
            Delete Account
          </a>
        </div>
      </div>
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- ProfileView.test.tsx
```

**Dependencies**: Task 4.1

**Estimated Time**: 2 hours

---

## Task 4.3: Create Profile Edit Form Component

**File**: `src/components/profile/ProfileEditForm.tsx`

**Description**: Form for editing profile information.

**Acceptance Criteria**:
- Edit display name
- Edit bio
- Upload profile picture
- Form validation
- Save and cancel buttons

**Implementation Details**:
```typescript
// src/components/profile/ProfileEditForm.tsx

'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProfileEditFormProps {
  profile: {
    display_name?: string;
    profile_picture?: string;
    bio?: string;
  };
  onSuccess: (updatedProfile: any) => void;
  onCancel: () => void;
}

export function ProfileEditForm({ profile, onSuccess, onCancel }: ProfileEditFormProps) {
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [profilePicture, setProfilePicture] = useState(profile.profile_picture);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit');
      return;
    }
    
    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are supported');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/profile/picture', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      setProfilePicture(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (displayName.length > 100) {
      setError('Display name must be 100 characters or less');
      return;
    }
    
    if (bio.length > 500) {
      setError('Bio must be 500 characters or less');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName,
          bio,
          profile_picture: profilePicture
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Update failed');
      }
      
      const updatedProfile = await response.json();
      onSuccess(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="profile-edit-form">
      <div className="form-section">
        <h3>Profile Picture</h3>
        <div className="picture-upload">
          {profilePicture ? (
            <Image
              src={profilePicture}
              alt="Profile picture"
              width={120}
              height={120}
              className="profile-picture"
            />
          ) : (
            <div className="profile-picture-placeholder">
              {displayName[0]?.toUpperCase() || '?'}
            </div>
          )}
          <input
            type="file"
            id="picture-upload"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          <label htmlFor="picture-upload" className="btn-upload">
            {uploading ? 'Uploading...' : 'Change Picture'}
          </label>
        </div>
      </div>
      
      <div className="form-section">
        <label htmlFor="display-name">Display Name</label>
        <input
          id="display-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={100}
          placeholder="Your display name"
        />
        <p className="char-count">{displayName.length}/100</p>
      </div>
      
      <div className="form-section">
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          placeholder="Tell us about yourself"
          rows={4}
        />
        <p className="char-count">{bio.length}/500</p>
      </div>
      
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      
      <div className="form-actions">
        <button type="button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" disabled={saving || uploading} className="btn-primary">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
```

**Verification**:
```bash
npm run test -- ProfileEditForm.test.tsx
```

**Dependencies**: Task 4.1

**Estimated Time**: 3 hours

---

## Task 4.4: Create Change Password Page

**File**: `src/app/profile/change-password/page.tsx`

**Description**: Page for changing user password.

**Acceptance Criteria**:
- Current password verification
- New password input
- Password strength indicator
- Confirmation step

**Implementation Details**:
```typescript
// src/app/profile/change-password/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Password change failed');
      }
      
      setSuccess(true);
      setTimeout(() => router.push('/profile'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password change failed');
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="success-container">
        <h2>Password Changed!</h2>
        <p>Your password has been successfully updated.</p>
        <p>Redirecting to profile...</p>
      </div>
    );
  }
  
  return (
    <div className="change-password-page">
      <h1>Change Password</h1>
      
      <form onSubmit={handleSubmit} className="password-form">
        <div className="form-field">
          <label htmlFor="current-password">Current Password</label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="form-field">
          <label htmlFor="new-password">New Password</label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        
        <div className="form-field">
          <label htmlFor="confirm-password">Confirm New Password</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}
        
        <div className="form-actions">
          <button type="button" onClick={() => router.back()} disabled={loading}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- e2e/change-password.e2e.test.ts
```

**Dependencies**: Password change API endpoint

**Estimated Time**: 2 hours

---

## Task 4.5: Create Delete Account Page

**File**: `src/app/profile/delete-account/page.tsx`

**Description**: Page for account deletion with confirmation.

**Acceptance Criteria**:
- Display warning about account deletion
- Require password confirmation
- Confirmation checkbox
- Clear consequences explained

**Implementation Details**:
```typescript
// src/app/profile/delete-account/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteAccountPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confirmed) {
      setError('You must confirm account deletion');
      return;
    }
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    if (!confirm('Are you absolutely sure? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/profile/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Account deletion failed');
      }
      
      // Redirect to goodbye page
      router.push('/goodbye');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Account deletion failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="delete-account-page">
      <h1>Delete Account</h1>
      
      <div className="warning-box">
        <h2>⚠️ Warning</h2>
        <p>Deleting your account is permanent and cannot be undone.</p>
        <p>You will lose:</p>
        <ul>
          <li>All your reading progress data</li>
          <li>Your saved series and bookmarks</li>
          <li>Your profile and settings</li>
          <li>Access to your account</li>
        </ul>
      </div>
      
      <form onSubmit={handleDelete} className="delete-form">
        <div className="form-field">
          <label htmlFor="password">Confirm Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password to confirm"
          />
        </div>
        
        <div className="confirmation-checkbox">
          <input
            type="checkbox"
            id="confirm-delete"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <label htmlFor="confirm-delete">
            I understand that this action is permanent and cannot be reversed
          </label>
        </div>
        
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}
        
        <div className="form-actions">
          <button type="button" onClick={() => router.back()} disabled={loading}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !confirmed}
            className="btn-danger"
          >
            {loading ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      </form>
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- e2e/delete-account.e2e.test.ts
```

**Dependencies**: Delete account API endpoint

**Estimated Time**: 2 hours

---

## Phase 4 Completion Checklist

- [ ] Profile page component implemented
- [ ] Profile view component implemented
- [ ] Profile edit form implemented
- [ ] Change password page implemented
- [ ] Delete account page implemented
- [ ] All E2E tests passing (>90% coverage)
- [ ] Accessibility requirements met (WCAG 2.1 AA)
- [ ] Mobile responsive design verified
- [ ] Form validation tested
- [ ] File upload tested
- [ ] Code review approved
- [ ] Ready for production

**Status**: Not Started  
**Last Updated**: 2026-02-10  
**Owner**: [Developer Name]
