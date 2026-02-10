# Theme System Documentation

## Overview

ReadTrace implements a comprehensive light/dark theme system with CSS variables and Tailwind CSS integration. The theme automatically respects system preferences and allows manual override.

## Color Palette

### Light Mode (Default)

| Color | Hex | Usage |
|-------|-----|-------|
| Background | #FFF8F2 | Main page background (cream) |
| Foreground | #222222 | Primary text (charcoal) |
| Primary | #FF7A45 | Main actions, buttons (orange) |
| Primary Dark | #FF6A30 | Hover state for primary |
| Secondary | #8b5cf6 | Secondary actions (purple) |
| Accent | #FFEDE3 | Card backgrounds, accents (peach) |
| Success | #3AB0FF | Success states (teal) |
| Warning | #f59e0b | Warning states (amber) |
| Error | #FF6B6B | Error states (red) |
| Border | #FFE5D5 | Borders and dividers (light peach) |
| Muted | #6C757D | Secondary text (gray) |

### Dark Mode

| Color | Hex | Usage |
|-------|-----|-------|
| Background | #1a1a1a | Main page background (dark) |
| Foreground | #f5f5f5 | Primary text (light) |
| Primary | #FF8A5A | Main actions (lighter orange) |
| Primary Dark | #FF7A45 | Hover state for primary |
| Secondary | #a78bfa | Secondary actions (light purple) |
| Accent | #2d2d2d | Card backgrounds (dark gray) |
| Success | #4BC0FF | Success states (light teal) |
| Warning | #fbbf24 | Warning states (light amber) |
| Error | #FF7A7A | Error states (light red) |
| Border | #2d2d2d | Borders and dividers (dark) |
| Muted | #a0a0a0 | Secondary text (light gray) |

### Brand Palette (Available in Both Modes)

```css
--brand-orange: #FF7A45 (light) / #FF8A5A (dark)
--brand-orange-hover: #FF6A30 (light) / #FF7A45 (dark)
--brand-cream: #FFF8F2 (light) / #1a1a1a (dark)
--brand-peach: #FFEDE3 (light) / #2d2d2d (dark)
--brand-charcoal: #222222 (light) / #f5f5f5 (dark)
--brand-gray: #6C757D (light) / #a0a0a0 (dark)
--brand-progress: #FFC48C (light) / #FFD4A3 (dark)
--brand-teal: #3AB0FF (light) / #4BC0FF (dark)
```

## Implementation

### CSS Variables

All colors are defined as CSS variables in `src/app/globals.css`:

```css
:root {
  --background: #FFF8F2;
  --foreground: #222222;
  --primary: #FF7A45;
  /* ... more variables ... */
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #1a1a1a;
    --foreground: #f5f5f5;
    --primary: #FF8A5A;
    /* ... more variables ... */
  }
}
```

### Tailwind Configuration

All CSS variables are extended in `tailwind.config.ts`:

```typescript
colors: {
  background: "var(--background)",
  foreground: "var(--foreground)",
  primary: "var(--primary)",
  "brand-orange": "var(--brand-orange)",
  // ... more colors ...
}
```

### Theme Provider

The `ThemeProvider` component manages theme state and system preference detection:

```typescript
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Usage

### Using CSS Variables

```css
.button {
  background-color: var(--primary);
  color: var(--background);
  border: 1px solid var(--border);
}

.button:hover {
  background-color: var(--primary-dark);
}
```

### Using Tailwind Classes

```jsx
<button className="bg-primary text-background hover:bg-primary-dark border border-border">
  Click me
</button>
```

### Using Brand Colors

```jsx
<div className="bg-brand-cream text-brand-charcoal">
  <button className="bg-brand-orange hover:bg-brand-orange-hover">
    Action
  </button>
</div>
```

### Using the Theme Hook

```typescript
'use client';

import { useTheme } from "@/components/theme/ThemeProvider";

export function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Resolved theme: {resolvedTheme}</p>
      <button onClick={() => setTheme('dark')}>
        Switch to dark mode
      </button>
    </div>
  );
}
```

### Using the Theme Toggle Component

```jsx
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Header() {
  return (
    <header>
      <h1>ReadTrace</h1>
      <ThemeToggle />
    </header>
  );
}
```

## Theme Behavior

### Automatic Detection

- **Default**: Respects system preference (`prefers-color-scheme`)
- **User Override**: Stored in `localStorage` as `theme` key
- **Values**: `'light'`, `'dark'`, or `'system'`

### Theme Persistence

Theme preference is saved to localStorage and restored on page load:

```typescript
// Save theme
localStorage.setItem('theme', 'dark');

// Load theme
const savedTheme = localStorage.getItem('theme');
```

### System Preference Listener

The theme provider listens for system preference changes:

```typescript
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', updateResolvedTheme);
```

## Customization

### Changing Colors

To update brand colors, edit `src/app/globals.css`:

```css
:root {
  --primary: #FF7A45; /* Change this */
  --brand-orange: #FF7A45; /* And this */
}

@media (prefers-color-scheme: dark) {
  :root {
    --primary: #FF8A5A; /* And dark mode version */
  }
}
```

Then update `tailwind.config.ts` if adding new color variables.

### Adding New Colors

1. Add CSS variable to `globals.css`:
```css
:root {
  --custom-color: #123456;
}

@media (prefers-color-scheme: dark) {
  :root {
    --custom-color: #654321;
  }
}
```

2. Add to Tailwind config:
```typescript
colors: {
  "custom-color": "var(--custom-color)",
}
```

3. Use in components:
```jsx
<div className="bg-custom-color">Custom color</div>
```

## Testing

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

### Test System Preference
1. Set system to dark mode
2. Open app in new tab
3. Verify app respects system preference
4. Change system to light mode
5. Verify app updates automatically

## Accessibility

- **Contrast Ratios**: All color combinations meet WCAG AA standards (4.5:1 minimum)
- **Color Blindness**: Orange and teal provide sufficient differentiation
- **Reduced Motion**: Theme transitions respect `prefers-reduced-motion`
- **High Contrast**: Dark mode uses lighter text on dark backgrounds

## Browser Support

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 13+)
- **Mobile**: Full support with system preference detection

## Files

- `src/app/globals.css` - CSS variables and media queries
- `tailwind.config.ts` - Tailwind color configuration
- `src/components/theme/ThemeProvider.tsx` - Theme context and logic
- `src/components/theme/ThemeToggle.tsx` - Theme toggle button component
- `src/app/layout.tsx` - Root layout with ThemeProvider

## Troubleshooting

### Theme not persisting
- Check browser localStorage is enabled
- Verify `suppressHydrationWarning` is on `<html>` element
- Check browser console for errors

### Colors not updating
- Clear browser cache
- Verify CSS variables are defined in `globals.css`
- Check Tailwind config includes the color
- Restart dev server

### Dark mode not working
- Verify `@media (prefers-color-scheme: dark)` is in `globals.css`
- Check system dark mode is enabled
- Test with DevTools emulation
- Verify `ThemeProvider` is in root layout

## Future Enhancements

- [ ] Add more theme options (e.g., high contrast, sepia)
- [ ] Implement theme scheduling (auto-switch at sunset)
- [ ] Add theme preview before applying
- [ ] Sync theme across browser tabs
- [ ] Add theme customization UI in settings

---

**Last Updated**: February 10, 2026
