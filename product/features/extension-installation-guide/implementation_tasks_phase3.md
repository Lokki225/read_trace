# Implementation Tasks - Phase 3: Database Integration

**Feature**: Browser Extension Installation Guide  
**Phase**: Database Integration (Persistence Layer)  
**Dependencies**: Phase 1 (UI), Phase 2 (Detection)  
**Estimated Duration**: 1 day

## Phase Overview

Phase 3 implements database schema updates and persistence for extension installation tracking in user profiles.

## Phase Completion Criteria

- [ ] User profile schema updated
- [ ] Migration files created and applied
- [ ] Installation tracking queries implemented
- [ ] RLS policies configured
- [ ] Database tests passing (>85% coverage)

---

## Task 3.1: Update User Profile Schema

**File**: `database/migrations/005_extension_tracking.sql`

**Description**: Add extension tracking fields to user_profiles table.

**Acceptance Criteria**:
- Add extension_installed boolean field
- Add extension_installed_at timestamp field
- Add browser_type field
- Add extension_version field
- Add installation_skipped field

**Implementation Details**:
```sql
-- database/migrations/005_extension_tracking.sql

-- Add extension tracking columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS extension_installed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS extension_installed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS browser_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS extension_version VARCHAR(20),
ADD COLUMN IF NOT EXISTS installation_skipped BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS installation_skipped_at TIMESTAMP WITH TIME ZONE;

-- Create index for extension status queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_extension_installed 
ON user_profiles(extension_installed);

CREATE INDEX IF NOT EXISTS idx_user_profiles_browser_type 
ON user_profiles(browser_type);

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.extension_installed IS 'Whether browser extension is installed';
COMMENT ON COLUMN user_profiles.extension_installed_at IS 'When extension was first installed';
COMMENT ON COLUMN user_profiles.browser_type IS 'Browser type: chrome, firefox, safari';
COMMENT ON COLUMN user_profiles.extension_version IS 'Extension version string';
COMMENT ON COLUMN user_profiles.installation_skipped IS 'Whether user skipped installation';
```

**Verification**:
```bash
supabase db push
```

**Dependencies**: User profiles table exists

**Estimated Time**: 1 hour

---

## Task 3.2: Create User Profile Repository Methods

**File**: `backend/repositories/userProfileRepository.ts`

**Description**: Add methods for extension status management.

**Acceptance Criteria**:
- Update extension installation status
- Get extension status by user ID
- Mark installation as skipped
- Query users by installation status

**Implementation Details**:
```typescript
// backend/repositories/userProfileRepository.ts

import { createClient } from '@/lib/supabase/server';

export interface ExtensionStatus {
  extension_installed: boolean;
  extension_installed_at?: string;
  browser_type?: string;
  extension_version?: string;
  installation_skipped: boolean;
  installation_skipped_at?: string;
}

export async function updateExtensionStatus(
  userId: string,
  browserType: string,
  extensionVersion: string
): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      extension_installed: true,
      extension_installed_at: new Date().toISOString(),
      browser_type: browserType,
      extension_version: extensionVersion
    }, {
      onConflict: 'user_id'
    });
  
  if (error) throw error;
}

export async function getExtensionStatus(
  userId: string
): Promise<ExtensionStatus | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('extension_installed, extension_installed_at, browser_type, extension_version, installation_skipped, installation_skipped_at')
    .eq('user_id', userId)
    .single();
  
  if (error) return null;
  return data;
}

export async function markInstallationSkipped(
  userId: string
): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      installation_skipped: true,
      installation_skipped_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });
  
  if (error) throw error;
}

export async function getUsersWithoutExtension(
  limit: number = 100
): Promise<string[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('extension_installed', false)
    .eq('installation_skipped', false)
    .limit(limit);
  
  if (error) throw error;
  return data?.map(p => p.user_id) || [];
}
```

**Verification**:
```bash
npm run test -- userProfileRepository.test.ts
```

**Dependencies**: Task 3.1

**Estimated Time**: 2 hours

---

## Task 3.3: Update Installation API with Database Integration

**File**: `src/app/api/extension/installed/route.ts` (update)

**Description**: Update API endpoint to use repository methods.

**Acceptance Criteria**:
- Use updateExtensionStatus repository method
- Handle database errors gracefully
- Return updated status

**Implementation Details**:
```typescript
// src/app/api/extension/installed/route.ts (updated)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateExtensionStatus } from '@/backend/repositories/userProfileRepository';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { browser_type, extension_version } = await request.json();
    
    if (!browser_type || !extension_version) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    await updateExtensionStatus(user.id, browser_type, extension_version);
    
    return NextResponse.json({
      success: true,
      user_id: user.id,
      browser_type,
      extension_version
    });
  } catch (error) {
    console.error('Extension installed API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Verification**:
```bash
npm run test -- integration/extension-api.test.ts
```

**Dependencies**: Task 3.2

**Estimated Time**: 1 hour

---

## Task 3.4: Create Skip Installation API Endpoint

**File**: `src/app/api/extension/skip/route.ts`

**Description**: API endpoint to mark installation as skipped.

**Acceptance Criteria**:
- Mark user as skipped installation
- Record skip timestamp
- Return success response

**Implementation Details**:
```typescript
// src/app/api/extension/skip/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { markInstallationSkipped } from '@/backend/repositories/userProfileRepository';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await markInstallationSkipped(user.id);
    
    return NextResponse.json({
      success: true,
      user_id: user.id,
      skipped: true
    });
  } catch (error) {
    console.error('Skip installation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Verification**:
```bash
curl -X POST http://localhost:3000/api/extension/skip
```

**Dependencies**: Task 3.2

**Estimated Time**: 1 hour

---

## Phase 3 Completion Checklist

- [ ] User profile schema updated with extension fields
- [ ] Migration applied successfully
- [ ] User profile repository methods implemented
- [ ] Installation API updated with database integration
- [ ] Skip installation API endpoint created
- [ ] All database tests passing (>85% coverage)
- [ ] RLS policies tested
- [ ] Code review approved
- [ ] Ready for Phase 4

**Status**: Not Started  
**Last Updated**: 2026-02-10  
**Owner**: [Developer Name]
