# Custom Sites Feature - Implementation Summary

## Overview
Added full support for users to create custom scan sites and include them in their preferred sites list on the settings page.

## Features Implemented

### 1. Custom Site Creation
- **AddScanSiteForm Component** (`src/components/settings/AddScanSiteForm.tsx`)
  - Form to add new custom scan sites
  - Site name input (max 100 characters with live counter)
  - URL validation (HTTP/HTTPS required)
  - Duplicate name prevention
  - Success/error messaging
  - Display of existing custom sites

### 2. Custom Sites API
- **POST /api/user/custom-sites** - Add new custom site
- **GET /api/user/custom-sites** - Retrieve user's custom sites
- **DELETE /api/user/custom-sites?id=<siteId>** - Remove custom site

### 3. Integration with Preferences
- **PreferredSitesForm Enhancement**
  - Fetches custom sites on component mount
  - Displays custom sites in "Your Custom Sites" section
  - Custom sites styled with blue background for distinction
  - Custom sites can be selected and prioritized alongside built-in platforms
  - Supports drag-and-drop reordering of all sites (built-in + custom)

### 4. Database Schema
- **Migration 012**: `database/migrations/012_add_custom_sites.sql`
  - Adds `custom_sites` JSONB column to `user_profiles`
  - Default value: empty array `[]`
  - GIN index for efficient queries

## Files Created/Modified

### New Files
- `src/components/settings/AddScanSiteForm.tsx` - Custom site form component
- `src/app/api/user/custom-sites/route.ts` - API endpoints for custom sites
- `database/migrations/012_add_custom_sites.sql` - Database migration
- `tests/unit/AddScanSiteForm.test.tsx` - Component tests (25 tests)
- `tests/integration/customSites.integration.test.ts` - Integration tests (20 tests)

### Modified Files
- `src/components/settings/PreferredSitesForm.tsx` - Added custom sites fetching and display
- `src/types/preferences.ts` - Added CustomSite interface and API types
- `src/lib/supabase.ts` - Added custom_sites column to user_profiles type
- `src/app/settings/page.tsx` - Integrated AddScanSiteForm
- `tests/unit/PreferredSitesForm.test.tsx` - Updated to handle custom sites loading

## How to Use

### For Users
1. Go to Settings page
2. Scroll to "Add Custom Scan Site" section
3. Enter site name (e.g., "Asura Scans")
4. Enter site URL (e.g., "https://asuracomic.net/")
5. Click "Add Site"
6. Site appears in "Your Custom Sites" list
7. In "Preferred Scan Sites" section, custom sites appear under "Your Custom Sites" heading
8. Select custom sites and drag to reorder with other platforms
9. Click "Save Preferences"

### For Developers
- Custom sites are stored as JSONB in `user_profiles.custom_sites`
- Each custom site has: `id`, `name`, `url`, `createdAt`
- Custom sites can be mixed with built-in platforms in preferences
- Resume logic respects custom site preferences

## Testing

### Test Coverage
- **AddScanSiteForm**: 25 tests covering rendering, validation, submission, error handling
- **Custom Sites Integration**: 20 tests covering validation, creation, management, resume logic
- **PreferredSitesForm**: Updated to handle custom sites loading (15 tests)

### Running Tests
```bash
npm run test -- AddScanSiteForm.test.tsx customSites.integration.test.ts
```

## Setup Instructions

### Step 1: Apply Database Migration
Run in Supabase SQL Editor:
```sql
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS custom_sites JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_user_profiles_custom_sites 
ON user_profiles USING GIN (custom_sites);
```

### Step 2: Restart Development Server
```bash
npm run dev
```

## Known Issues & Fixes

### Issue: Custom sites not appearing in preferences
**Status**: FIXED
- **Cause**: PreferredSitesForm wasn't fetching custom sites from API
- **Fix**: Added useEffect to fetch custom sites on component mount
- **Result**: Custom sites now display in "Your Custom Sites" section with blue styling

### Issue: "Failed to load more series" error
**Status**: IMPROVED ERROR LOGGING
- **Cause**: API error responses weren't being logged with details
- **Fix**: Enhanced error logging in DashboardTabs.handleLoadMore to include response status and error data
- **Result**: Better debugging information when series loading fails

## Architecture

```
Settings Page
├── Scan Site Preferences (PreferredSitesForm)
│   ├── Selected Sites (drag-and-drop reordering)
│   │   └── Built-in + Custom sites
│   └── Available Sites
│       ├── Built-in platforms (gray background)
│       └── Your Custom Sites (blue background)
└── Add Custom Scan Site (AddScanSiteForm)
    ├── Site Name Input
    ├── Site URL Input
    ├── Add Site Button
    └── Your Custom Sites List
```

## Performance Considerations

- Custom sites fetched on component mount (single API call)
- JSONB storage allows efficient querying
- GIN index on custom_sites for fast filtering
- No N+1 queries - all sites loaded in single fetch

## Security

- User can only view/modify their own custom sites (RLS enforced)
- URL validation prevents malformed URLs
- Site name length limited to 100 characters
- Duplicate site names prevented
