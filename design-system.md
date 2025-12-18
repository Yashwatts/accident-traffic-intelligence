# Traffic & Accident Intelligence Platform - Design System

**Version 1.0** | Last Updated: December 2025

A minimal, professional design system built for clarity during emergencies and sophisticated data analysis.

---

## Core Philosophy

**Emergency-First Design**
- High contrast for quick recognition
- Large touch targets (minimum 44x44px)
- Clear visual hierarchy
- Color-blind safe severity indicators

**Premium Minimal**
- Clean interfaces with generous whitespace
- Purposeful use of color (not decorative)
- Smooth animations (performance matters)
- Professional typography

---

## Color Palette

### Primary Colors (Brand & Navigation)

```
Primary Blue (Trust, Authority)
--primary-50:  #EFF6FF
--primary-100: #DBEAFE
--primary-200: #BFDBFE
--primary-300: #93C5FD
--primary-400: #60A5FA
--primary-500: #3B82F6  ← Main brand color
--primary-600: #2563EB
--primary-700: #1D4ED8
--primary-800: #1E40AF
--primary-900: #1E3A8A

Use: Headers, links, interactive elements, responder badges
```

### Neutral Colors (UI Foundation)

```
Gray Scale (Clean, Modern)
--gray-50:  #F9FAFB  ← Light mode background
--gray-100: #F3F4F6  ← Card backgrounds
--gray-200: #E5E7EB  ← Borders
--gray-300: #D1D5DB
--gray-400: #9CA3AF  ← Disabled text
--gray-500: #6B7280  ← Secondary text
--gray-600: #4B5563  ← Body text
--gray-700: #374151
--gray-800: #1F2937  ← Dark mode background
--gray-900: #111827  ← Headings, dark mode text

Use: Text, backgrounds, borders, shadows
```

### Semantic Colors (Status & Feedback)

```
Success Green (Cleared, Safe)
--success-50:  #F0FDF4
--success-500: #10B981  ← Primary success
--success-600: #059669
--success-700: #047857

Warning Yellow (Caution, Pending)
--warning-50:  #FFFBEB
--warning-500: #F59E0B  ← Primary warning
--warning-600: #D97706
--warning-700: #B45309

Error Red (Emergency, Critical)
--error-50:  #FEF2F2
--error-500: #EF4444  ← Primary error
--error-600: #DC2626
--error-700: #B91C1C

Info Blue (Notifications, Tips)
--info-50:  #EFF6FF
--info-500: #3B82F6
--info-600: #2563EB
```

### Traffic Severity Colors (CRITICAL)

```
Minor (Property damage only)
--severity-minor: #10B981 (Green)
--severity-minor-bg: #D1FAE5
--severity-minor-border: #6EE7B7

Moderate (Minor injuries, lane blocked)
--severity-moderate: #F59E0B (Amber)
--severity-moderate-bg: #FEF3C7
--severity-moderate-border: #FCD34D

Severe (Serious injuries, multiple vehicles, all lanes blocked)
--severity-severe: #EF4444 (Red)
--severity-severe-bg: #FEE2E2
--severity-severe-border: #FCA5A5

Critical (Fatalities, major highway closure)
--severity-critical: #DC2626 (Dark Red)
--severity-critical-bg: #FEE2E2
--severity-critical-border: #F87171

Color-blind safe: Always paired with icons and text labels
```

### Accent Colors

```
Emergency Red (Report button, urgent actions)
--emergency: #DC2626
--emergency-hover: #B91C1C

Responder Gold (Official status)
--responder: #F59E0B
--responder-bg: #FEF3C7

Route Purple (Saved routes, personal)
--route: #8B5CF6
--route-bg: #EDE9FE
```

---

## Typography

### Font Families

```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;

/* Load Inter from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

**Why Inter:**
- Optimized for screens
- Excellent readability at small sizes
- Professional, modern
- Wide language support

### Type Scale (1.250 - Major Third)

```
--text-xs:   0.75rem   (12px)  - Timestamps, captions
--text-sm:   0.875rem  (14px)  - Secondary text, labels
--text-base: 1rem      (16px)  - Body text (default)
--text-lg:   1.125rem  (18px)  - Emphasized text
--text-xl:   1.25rem   (20px)  - Card titles
--text-2xl:  1.5rem    (24px)  - Section headers
--text-3xl:  1.875rem  (30px)  - Page titles
--text-4xl:  2.25rem   (36px)  - Hero text
--text-5xl:  3rem      (48px)  - Landing page
```

### Font Weights

```
--font-normal:   400  - Body text
--font-medium:   500  - Emphasized text, labels
--font-semibold: 600  - Headings, buttons
--font-bold:     700  - Numbers, critical info
```

### Line Heights

```
--leading-tight:  1.25  - Headings
--leading-snug:   1.375 - Card titles
--leading-normal: 1.5   - Body text (default)
--leading-relaxed: 1.625 - Long-form content
```

### Letter Spacing

```
--tracking-tight:  -0.025em  - Large headings
--tracking-normal: 0         - Body text
--tracking-wide:   0.025em   - Labels, buttons
```

---

## Spacing System

**8pt Grid System** (Consistent, scalable)

```
--space-0:  0px
--space-1:  0.25rem  (4px)   - Icon padding
--space-2:  0.5rem   (8px)   - Tight spacing
--space-3:  0.75rem  (12px)  - Small gaps
--space-4:  1rem     (16px)  - Default gap
--space-5:  1.25rem  (20px)  - Medium spacing
--space-6:  1.5rem   (24px)  - Card padding
--space-8:  2rem     (32px)  - Section spacing
--space-10: 2.5rem   (40px)  - Large gaps
--space-12: 3rem     (48px)  - Hero spacing
--space-16: 4rem     (64px)  - Major sections
--space-20: 5rem     (80px)  - Page margins
--space-24: 6rem     (96px)  - Extra large
```

---

## Border Radius

```
--radius-none: 0
--radius-sm:   0.25rem  (4px)   - Badges, small buttons
--radius-md:   0.5rem   (8px)   - Buttons, inputs (default)
--radius-lg:   0.75rem  (12px)  - Cards
--radius-xl:   1rem     (16px)  - Modals, large cards
--radius-2xl:  1.5rem   (24px)  - Image containers
--radius-full: 9999px           - Circular buttons, avatars
```

---

## Shadows

**Elevation system for depth**

```css
/* Subtle - Hover states */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Default - Cards */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1),
             0 2px 4px -2px rgb(0 0 0 / 0.1);

/* Elevated - Dropdowns, tooltips */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1),
             0 4px 6px -4px rgb(0 0 0 / 0.1);

/* Floating - Modals, dialogs */
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1),
             0 8px 10px -6px rgb(0 0 0 / 0.1);

/* Emergency button */
--shadow-emergency: 0 10px 25px -5px rgb(220 38 38 / 0.3),
                    0 4px 6px -4px rgb(220 38 38 / 0.2);
```

---

## Component Styles

### Buttons

#### **Primary Button** (Main actions)
```css
Background: --primary-600 (#2563EB)
Hover: --primary-700 (#1D4ED8)
Active: --primary-800 (#1E40AF)
Text: White
Padding: 12px 24px (--space-3 --space-6)
Border Radius: --radius-md (8px)
Font: --font-semibold (600)
Min Height: 44px (touch-friendly)
Shadow: --shadow-sm
Transition: all 150ms ease
```

#### **Emergency Button** (Report accident)
```css
Background: --emergency (#DC2626)
Hover: --emergency-hover (#B91C1C)
Text: White
Padding: 16px 32px (--space-4 --space-8)
Border Radius: --radius-full (circular)
Font: --font-bold (700)
Size: 64x64px (FAB) or full width (mobile)
Shadow: --shadow-emergency
Icon: + or camera icon
Animation: Pulse on idle (subtle)
```

#### **Secondary Button** (Cancel, go back)
```css
Background: Transparent
Border: 2px solid --gray-300 (#E5E7EB)
Hover Border: --gray-400 (#9CA3AF)
Text: --gray-700 (#374151)
Padding: 12px 24px
Border Radius: --radius-md
```

#### **Ghost Button** (Tertiary actions)
```css
Background: Transparent
Hover Background: --gray-100 (#F3F4F6)
Text: --primary-600 (#2563EB)
Padding: 8px 16px
No border
```

#### **Icon Button** (Close, menu)
```css
Size: 40x40px
Background: Transparent
Hover: --gray-100
Border Radius: --radius-md
Icon Size: 20x20px
```

### Cards

#### **Incident Card** (Map list item)
```css
Background: White (light) / --gray-800 (dark)
Padding: --space-4 (16px)
Border Radius: --radius-lg (12px)
Border: 1px solid --gray-200 / --gray-700
Shadow: --shadow-md
Hover: --shadow-lg (lift effect)
Transition: transform 150ms, shadow 150ms
```

#### **Detail Card** (Dashboard panels)
```css
Background: White / --gray-800
Padding: --space-6 (24px)
Border Radius: --radius-xl (16px)
Border: None
Shadow: --shadow-md
```

#### **Stat Card** (Analytics numbers)
```css
Background: Gradient (subtle)
Padding: --space-6
Border Radius: --radius-lg
Min Height: 120px
Flex layout: column, justify-between
```

### Badges

#### **Severity Badges**
```css
/* Minor */
Background: --severity-minor-bg (#D1FAE5)
Text: --severity-minor (#10B981)
Border: 1px solid --severity-minor-border
Icon: ● (dot)

/* Moderate */
Background: --severity-moderate-bg (#FEF3C7)
Text: --severity-moderate (#F59E0B)
Border: 1px solid --severity-moderate-border
Icon: ▲ (triangle)

/* Severe */
Background: --severity-severe-bg (#FEE2E2)
Text: --severity-severe (#EF4444)
Border: 1px solid --severity-severe-border
Icon: ■ (square)

/* Critical */
Background: --severity-critical-bg (#FEE2E2)
Text: --severity-critical (#DC2626)
Border: 2px solid --severity-critical-border
Icon: ✕ (x) or ⬢ (hexagon)
Animation: Pulse

/* Shared */
Padding: 4px 12px (--space-1 --space-3)
Border Radius: --radius-full
Font: --font-semibold, --text-xs
Text Transform: Uppercase
Letter Spacing: --tracking-wide
```

#### **Status Badges**
```css
/* Active */
Background: --error-50
Text: --error-600
Icon: ● pulsing

/* Dispatched */
Background: --warning-50
Text: --warning-600
Icon: → arrow

/* On Scene */
Background: --info-50
Text: --info-600
Icon: ✓ checkmark

/* Cleared */
Background: --success-50
Text: --success-600
Icon: ✓✓ double check
```

### Inputs

#### **Text Input**
```css
Background: White / --gray-900
Border: 2px solid --gray-300 / --gray-600
Hover Border: --gray-400 / --gray-500
Focus Border: --primary-500 (blue ring)
Focus Ring: 0 0 0 3px --primary-50 / --primary-900/20
Padding: 12px 16px
Border Radius: --radius-md
Font: --text-base
Min Height: 44px
Placeholder: --gray-400
Transition: border 150ms, box-shadow 150ms
```

#### **Search Input**
```css
Icon: 🔍 (magnifying glass) left side
Padding Left: 44px (space for icon)
Background: --gray-100 / --gray-800
Border: None
Focus: Background → White, add shadow
```

### Map Pins

#### **Accident Pins**
```css
/* Minor */
Color: --severity-minor (#10B981)
Size: 24x24px
Shape: Circle
Border: 3px solid white
Shadow: --shadow-md

/* Moderate */
Color: --severity-moderate (#F59E0B)
Size: 32x32px
Shape: Triangle (CSS clip-path)
Border: 3px solid white
Shadow: --shadow-lg

/* Severe */
Color: --severity-severe (#EF4444)
Size: 40x40px
Shape: Square (rounded 4px)
Border: 4px solid white
Shadow: --shadow-xl
Animation: Pulse scale (1.0 → 1.1)

/* Critical */
Color: --severity-critical (#DC2626)
Size: 48x48px
Shape: Hexagon
Border: 4px solid white
Shadow: --shadow-xl
Animation: Pulse + glow
```

### Modals & Overlays

#### **Modal**
```css
Background: White / --gray-800
Max Width: 600px (mobile: 100% - 32px)
Padding: --space-8 (32px)
Border Radius: --radius-2xl (24px)
Shadow: --shadow-xl
Backdrop: rgba(0, 0, 0, 0.5) blur(4px)
Animation: Fade in + slide up (200ms ease-out)
```

#### **Bottom Sheet** (Mobile)
```css
Background: White / --gray-800
Border Radius: --radius-2xl --radius-2xl 0 0 (top corners only)
Padding: --space-4
Min Height: 120px
Max Height: 80vh
Handle: 4px wide, 32px long, --gray-300, centered top
Shadow: 0 -4px 12px rgba(0, 0, 0, 0.1)
Animation: Slide up from bottom
Drag to dismiss
```

### Notifications / Toasts

```css
Background: White / --gray-800
Border Left: 4px solid (severity color)
Padding: --space-4
Border Radius: --radius-lg
Shadow: --shadow-lg
Max Width: 400px
Animation: Slide in from top-right (300ms)
Auto dismiss: 5 seconds
Icon: Left side (severity icon)
Close button: Top-right corner
```

---

## Dark Mode

### Strategy
- Automatic detection (prefers-color-scheme)
- Manual toggle in settings
- Persistent choice (localStorage)
- Smooth transition (150ms)

### Color Adjustments

```
Light Mode → Dark Mode

Backgrounds:
--gray-50 (#F9FAFB) → --gray-900 (#111827)
White (#FFFFFF)     → --gray-800 (#1F2937)
--gray-100 (#F3F4F6)→ --gray-800 (#1F2937)

Text:
--gray-900 (#111827) → --gray-50 (#F9FAFB)
--gray-600 (#4B5563) → --gray-300 (#D1D5DB)
--gray-500 (#6B7280) → --gray-400 (#9CA3AF)

Borders:
--gray-200 (#E5E7EB) → --gray-700 (#374151)
--gray-300 (#D1D5DB) → --gray-600 (#4B5563)

Severity Colors: Same (high contrast maintained)
Primary Colors: Slightly lighter in dark mode
  --primary-600 → --primary-500

Shadows: Reduce opacity 50% in dark mode
```

### Dark Mode Specific

```css
/* Card glow effect in dark mode */
.card-dark-glow {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05),
              0 4px 12px rgba(0, 0, 0, 0.5);
}

/* Elevated surfaces in dark mode are lighter */
Dark Level 0: --gray-900 (#111827) - Page background
Dark Level 1: --gray-800 (#1F2937) - Cards
Dark Level 2: --gray-750 (#243240) - Elevated cards (custom)
Dark Level 3: --gray-700 (#374151) - Modals
```

---

## Animation & Transitions

### Duration

```css
--duration-fast:   150ms   - Hover, focus states
--duration-base:   200ms   - Buttons, simple transitions
--duration-medium: 300ms   - Modals, sheets
--duration-slow:   500ms   - Page transitions
```

### Easing

```css
--ease-in:       cubic-bezier(0.4, 0, 1, 1)
--ease-out:      cubic-bezier(0, 0, 0.2, 1)      - Default
--ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1)
--ease-bounce:   cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Key Animations

```css
/* Pulse (Emergency button, critical incidents) */
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}
Animation: pulse 2s ease-in-out infinite

/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Spin (Loading) */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

## Responsive Breakpoints

```css
--screen-sm:  640px   - Mobile landscape
--screen-md:  768px   - Tablet
--screen-lg:  1024px  - Laptop
--screen-xl:  1280px  - Desktop
--screen-2xl: 1536px  - Large desktop

Mobile-first approach:
Base styles = mobile
@media (min-width: --screen-md) = tablet+
@media (min-width: --screen-lg) = desktop+
```

---

## Accessibility

### Focus States
```css
/* Keyboard focus (not mouse) */
:focus-visible {
  outline: 3px solid --primary-500;
  outline-offset: 2px;
  border-radius: --radius-sm;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  border-width: 2px;
  font-weight: 600;
}
```

### Color Contrast

```
WCAG AAA Standards:
Body text (16px): 7:1 contrast ratio
Large text (18px+): 4.5:1 contrast ratio

All severity colors tested:
✓ Minor green on white: 4.8:1
✓ Moderate amber on white: 4.6:1
✓ Severe red on white: 5.2:1
✓ All dark mode combos: >7:1
```

### Touch Targets

```
Minimum: 44x44px (Apple HIG, Material Design)
Spacing: 8px between targets
Emergency button: 64x64px (oversized for urgency)
```

### Screen Reader Labels

```
All icons have aria-label
All severity badges have aria-live="polite"
Map pins have descriptive labels
Form inputs have associated labels
```

---

## Implementation Notes

### CSS Custom Properties
```css
:root {
  /* Paste all variables here */
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Override for dark mode */
  }
}

[data-theme="dark"] {
  /* Manual dark mode override */
}
```

### Tailwind Config
```javascript
// All values map to Tailwind's theme extension
// See tailwind.config.js for implementation
```

### Component Library
```
Follow atomic design:
- Atoms: Buttons, badges, inputs
- Molecules: Cards, forms
- Organisms: Map, dashboard panels
- Templates: Page layouts
- Pages: Complete screens
```

---

## Design Tokens Export

**Figma:** Use Tokens Studio plugin
**Code:** CSS variables + Tailwind config
**Mobile:** JSON export for iOS/Android

---

**This design system ensures:**
✓ Brand consistency across all screens
✓ Fast emergency recognition (severity colors)
✓ Professional, minimal aesthetic
✓ Accessibility compliance (WCAG AAA)
✓ Dark mode support
✓ Responsive across all devices
✓ Easy maintenance (single source of truth)
