# Theme Integration Guide for Future Development

## Quick Reference

When creating new pages and components, always use theme-aware colors instead of hardcoded color values.

### Color Mapping

| Purpose | CSS Variable | Tailwind Class |
|---------|--------------|----------------|
| Main background | `--background` | `bg-background` |
| Primary text | `--foreground` | `text-foreground` |
| Primary action | `--primary` | `bg-primary` / `text-primary` |
| Primary hover | `--primary-dark` | `bg-primary-dark` / `hover:bg-primary-dark` |
| Secondary action | `--secondary` | `bg-secondary` / `text-secondary` |
| Card/accent background | `--accent` | `bg-accent` |
| Success state | `--success` | `bg-success` / `text-success` |
| Warning state | `--warning` | `bg-warning` / `text-warning` |
| Error state | `--error` | `bg-error` / `text-error` |
| Borders | `--border` | `border-border` |
| Secondary text | `--muted` | `text-muted` |

### Brand Colors (Optional)

For brand-specific styling:

```tailwind
bg-brand-orange       /* Primary brand color */
bg-brand-orange-hover /* Hover state */
bg-brand-cream        /* Light background */
bg-brand-peach        /* Accent background */
text-brand-charcoal   /* Primary text */
text-brand-gray       /* Secondary text */
bg-brand-progress     /* Progress indicators */
text-brand-teal       /* Success/info */
```

---

## Component Template

### Basic Component Structure

```typescript
'use client';

import { cn } from '@/lib/utils';

interface MyComponentProps {
  children: React.ReactNode;
}

export function MyComponent({ children }: MyComponentProps) {
  return (
    <div className="bg-background text-foreground">
      {/* Use theme colors */}
      <button className="bg-primary text-background hover:bg-primary-dark">
        Action
      </button>
    </div>
  );
}
```

### Form Input Template

```typescript
<input
  className={cn(
    'bg-background text-foreground border border-border rounded-md px-3 py-2',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    'placeholder-muted transition-colors',
    errors && 'border-error/50 focus:ring-error'
  )}
  placeholder="Enter text..."
/>
```

### Button Template

```typescript
<button
  className={cn(
    'bg-primary text-background px-4 py-2 rounded-md font-semibold',
    'hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary',
    'focus:ring-offset-2 dark:focus:ring-offset-background',
    'transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  )}
>
  Click me
</button>
```

### Card Template

```typescript
<div className="bg-accent border border-border rounded-lg p-6">
  <h3 className="text-foreground font-semibold">Title</h3>
  <p className="text-muted mt-2">Description</p>
</div>
```

### Error Message Template

```typescript
{errors.field && (
  <p className="text-error text-sm mt-1">
    {errors.field.message}
  </p>
)}
```

### Success Message Template

```typescript
{success && (
  <div className="bg-success/10 border border-success/30 rounded-md p-4">
    <p className="text-success text-sm">{success}</p>
  </div>
)}
```

---

## Common Patterns

### Disabled State

```typescript
className={cn(
  'opacity-50 cursor-not-allowed',
  disabled && 'pointer-events-none'
)}
```

### Loading State

```typescript
className={cn(
  'transition-opacity',
  isLoading && 'opacity-50 cursor-not-allowed'
)}
```

### Hover Effects

```typescript
className="hover:bg-primary-dark hover:text-background transition-colors"
```

### Focus States

```typescript
className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background"
```

### Dark Mode Specific

```typescript
className="dark:bg-accent dark:text-foreground dark:border-border"
```

---

## Do's and Don'ts

### ✅ DO

```typescript
// Use theme colors
<div className="bg-background text-foreground border border-border">
  <button className="bg-primary hover:bg-primary-dark">Action</button>
</div>

// Use semantic colors
<p className="text-error">Error message</p>
<p className="text-success">Success message</p>
<p className="text-warning">Warning message</p>

// Use muted for secondary text
<p className="text-muted">Secondary information</p>

// Use accent for card backgrounds
<div className="bg-accent">Card content</div>
```

### ❌ DON'T

```typescript
// Don't hardcode colors
<div className="bg-gray-50 text-gray-900">
  <button className="bg-blue-600 hover:bg-blue-500">Action</button>
</div>

// Don't use arbitrary colors
<div className="bg-[#ffffff] text-[#000000]">
  Content
</div>

// Don't mix color systems
<div className="bg-background text-gray-700">
  Mixed colors
</div>

// Don't ignore dark mode
<div className="bg-white">
  No dark mode support
</div>
```

---

## Page Template

```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title | ReadTrace',
  description: 'Page description',
};

export default function MyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-foreground">
          Page Title
        </h1>
        <p className="mt-4 text-muted">
          Page description
        </p>

        {/* Page content */}
      </div>
    </div>
  );
}
```

---

## Testing Theme Changes

### Test Light Mode
1. Open DevTools (F12)
2. Go to Rendering tab
3. Set "Emulate CSS media feature prefers-color-scheme" to "prefers-light"
4. Verify colors match light mode palette

### Test Dark Mode
1. Open DevTools (F12)
2. Go to Rendering tab
3. Set "Emulate CSS media feature prefers-color-scheme" to "prefers-dark"
4. Verify colors match dark mode palette

### Test Theme Toggle
1. Click theme toggle button
2. Verify theme switches immediately
3. Refresh page
4. Verify theme persists from localStorage

---

## Accessibility Checklist

- [ ] Text has sufficient contrast (4.5:1 minimum)
- [ ] Color is not the only way to convey information
- [ ] Focus states are visible
- [ ] Disabled states are clear
- [ ] Error states are clear and descriptive
- [ ] Success states are clear and positive

---

## Color Palette Reference

### Light Mode

```
Background:  #FFF8F2 (Cream)
Foreground:  #222222 (Charcoal)
Primary:     #FF7A45 (Orange)
Primary-Dark: #FF6A30 (Dark Orange)
Secondary:   #8b5cf6 (Purple)
Accent:      #FFEDE3 (Peach)
Success:     #3AB0FF (Teal)
Warning:     #f59e0b (Amber)
Error:       #FF6B6B (Red)
Border:      #FFE5D5 (Light Peach)
Muted:       #6C757D (Gray)
```

### Dark Mode

```
Background:  #1a1a1a (Dark)
Foreground:  #f5f5f5 (Light)
Primary:     #FF8A5A (Light Orange)
Primary-Dark: #FF7A45 (Orange)
Secondary:   #a78bfa (Light Purple)
Accent:      #2d2d2d (Dark Gray)
Success:     #4BC0FF (Light Teal)
Warning:     #fbbf24 (Light Amber)
Error:       #FF7A7A (Light Red)
Border:      #2d2d2d (Dark)
Muted:       #a0a0a0 (Light Gray)
```

---

## Files to Reference

- `src/app/globals.css` - CSS variables and media queries
- `tailwind.config.ts` - Tailwind color configuration
- `src/components/theme/ThemeProvider.tsx` - Theme context
- `src/components/theme/ThemeToggle.tsx` - Theme toggle component
- `docs/THEME_SYSTEM.md` - Comprehensive theme documentation

---

## Examples

### Registration Form (Already Updated)
See: `src/components/auth/RegisterForm.tsx`

### Password Strength Indicator (Already Updated)
See: `src/components/auth/PasswordStrengthIndicator.tsx`

### Registration Page (Already Updated)
See: `src/app/register/page.tsx`

### Confirmation Page (Already Updated)
See: `src/app/register/confirm/page.tsx`

---

## Future Component Checklist

When creating new components:

- [ ] Use theme colors instead of hardcoded values
- [ ] Support both light and dark modes
- [ ] Test with DevTools color scheme emulation
- [ ] Verify contrast ratios meet WCAG AA
- [ ] Add focus states for interactive elements
- [ ] Use `transition-colors` for smooth theme switching
- [ ] Document any custom color usage
- [ ] Test on multiple browsers

---

**Last Updated**: February 10, 2026
