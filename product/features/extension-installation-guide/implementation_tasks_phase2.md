# Implementation Tasks - Phase 2: Extension Detection

**Feature**: Browser Extension Installation Guide  
**Phase**: Extension Detection & Verification  
**Dependencies**: Phase 1 (UI Components)  
**Estimated Duration**: 1 day

## Phase Overview

Phase 2 implements extension detection logic using browser messaging APIs to verify successful installation and track installation status.

## Phase Completion Criteria

- [ ] Extension detection logic implemented
- [ ] Browser messaging API integration complete
- [ ] Installation status tracking implemented
- [ ] API endpoints for status management created
- [ ] Integration tests passing (>85% coverage)

---

## Task 2.1: Implement Extension Detection Client

**File**: `src/lib/extension/detector.ts`

**Description**: Create client-side logic to detect if browser extension is installed.

**Acceptance Criteria**:
- Detect extension via message passing
- Support Chrome, Firefox, Safari
- Handle detection timeout
- Retry logic for failed detection

**Implementation Details**:
```typescript
// src/lib/extension/detector.ts

export interface ExtensionDetectionResult {
  installed: boolean;
  version?: string;
  browser?: 'chrome' | 'firefox' | 'safari';
}

export async function detectExtension(
  timeout: number = 5000
): Promise<ExtensionDetectionResult> {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve({ installed: false });
    }, timeout);
    
    // Listen for extension response
    window.addEventListener('message', function handler(event) {
      if (event.data?.type === 'READTRACE_EXTENSION_PING_RESPONSE') {
        clearTimeout(timeoutId);
        window.removeEventListener('message', handler);
        
        resolve({
          installed: true,
          version: event.data.version,
          browser: detectBrowser()
        });
      }
    });
    
    // Send ping to extension
    window.postMessage({ type: 'READTRACE_EXTENSION_PING' }, '*');
  });
}

function detectBrowser(): 'chrome' | 'firefox' | 'safari' {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
    return 'chrome';
  } else if (userAgent.includes('firefox')) {
    return 'firefox';
  } else if (userAgent.includes('safari')) {
    return 'safari';
  }
  
  return 'chrome'; // default
}

export function getBrowserName(): string {
  const browser = detectBrowser();
  return browser.charAt(0).toUpperCase() + browser.slice(1);
}
```

**Verification**:
```bash
npm run test -- detector.test.ts
```

**Dependencies**: None

**Estimated Time**: 2 hours

---

## Task 2.2: Create Extension Status Hook

**File**: `src/hooks/useExtensionStatus.ts`

**Description**: React hook for detecting and monitoring extension installation status.

**Acceptance Criteria**:
- Check extension status on mount
- Periodic status checking
- Return loading and error states
- Trigger manual re-check

**Implementation Details**:
```typescript
// src/hooks/useExtensionStatus.ts

import { useState, useEffect, useCallback } from 'react';
import { detectExtension, ExtensionDetectionResult } from '@/lib/extension/detector';

export function useExtensionStatus(checkInterval?: number) {
  const [status, setStatus] = useState<ExtensionDetectionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await detectExtension();
      setStatus(result);
      
      // Save status to user profile if installed
      if (result.installed) {
        await saveExtensionStatus(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Detection failed');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    checkStatus();
    
    if (checkInterval) {
      const intervalId = setInterval(checkStatus, checkInterval);
      return () => clearInterval(intervalId);
    }
  }, [checkStatus, checkInterval]);
  
  return {
    status,
    loading,
    error,
    recheckStatus: checkStatus
  };
}

async function saveExtensionStatus(result: ExtensionDetectionResult) {
  try {
    await fetch('/api/extension/installed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        browser_type: result.browser,
        extension_version: result.version
      })
    });
  } catch (err) {
    console.error('Failed to save extension status:', err);
  }
}
```

**Verification**:
```bash
npm run test -- useExtensionStatus.test.ts
```

**Dependencies**: Task 2.1

**Estimated Time**: 2 hours

---

## Task 2.3: Create Extension Status API Endpoints

**File**: `src/app/api/extension/installed/route.ts`

**Description**: API endpoint to record extension installation.

**Acceptance Criteria**:
- Accept browser type and version
- Update user profile
- Return success response
- Handle authentication

**Implementation Details**:
```typescript
// src/app/api/extension/installed/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    
    // Update user profile
    const { error: updateError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        extension_installed: true,
        extension_installed_at: new Date().toISOString(),
        browser_type,
        extension_version
      });
    
    if (updateError) {
      throw updateError;
    }
    
    return NextResponse.json({
      success: true,
      user_id: user.id
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
curl -X POST http://localhost:3000/api/extension/installed \
  -H "Content-Type: application/json" \
  -d '{"browser_type": "chrome", "extension_version": "1.0.0"}'
```

**Dependencies**: User profile schema

**Estimated Time**: 1 hour

---

## Task 2.4: Create Extension Verification API Endpoint

**File**: `src/app/api/extension/verify/route.ts`

**Description**: API endpoint to check extension installation status.

**Acceptance Criteria**:
- Return installation status
- Return browser and version info
- Handle unauthenticated requests
- Cache response appropriately

**Implementation Details**:
```typescript
// src/app/api/extension/verify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({
        installed: false,
        authenticated: false
      });
    }
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('extension_installed, extension_version, browser_type')
      .eq('user_id', user.id)
      .single();
    
    return NextResponse.json({
      installed: profile?.extension_installed || false,
      version: profile?.extension_version,
      browser: profile?.browser_type,
      authenticated: true
    });
  } catch (error) {
    console.error('Extension verify API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Verification**:
```bash
curl http://localhost:3000/api/extension/verify
```

**Dependencies**: Task 2.3

**Estimated Time**: 1 hour

---

## Task 2.5: Create Extension Status API Endpoint

**File**: `src/app/api/extension/status/route.ts`

**Description**: API endpoint to get detailed extension status for user.

**Acceptance Criteria**:
- Return full installation details
- Include installation timestamp
- Return skip status if applicable
- Require authentication

**Implementation Details**:
```typescript
// src/app/api/extension/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      installed: profile.extension_installed,
      installed_at: profile.extension_installed_at,
      browser_type: profile.browser_type,
      extension_version: profile.extension_version,
      installation_skipped: profile.installation_skipped
    });
  } catch (error) {
    console.error('Extension status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Verification**:
```bash
curl http://localhost:3000/api/extension/status
```

**Dependencies**: Task 2.3

**Estimated Time**: 1 hour

---

## Phase 2 Completion Checklist

- [ ] Extension detection client implemented
- [ ] Extension status hook created
- [ ] Installation status API endpoint created
- [ ] Verification API endpoint created
- [ ] Status API endpoint created
- [ ] All integration tests passing (>85% coverage)
- [ ] Browser compatibility tested (Chrome, Firefox, Safari)
- [ ] Error handling tested
- [ ] Code review approved
- [ ] Ready for Phase 3

**Status**: Not Started  
**Last Updated**: 2026-02-10  
**Owner**: [Developer Name]
