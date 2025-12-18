# Responsive Layout Strategy
## Traffic & Accident Intelligence Platform

**Mobile-First Approach** | Optimized for real-world usage patterns

---

## Philosophy

**Mobile-First Design**
- 80% of accident reports come from mobile devices
- Emergency actions must be one-handed accessible
- Map view is the primary interface
- Progressive enhancement for larger screens

**Breakpoint Strategy**
```
Mobile:  320px - 767px   (Phone - Portrait & Landscape)
Tablet:  768px - 1023px  (iPad - Portrait & Landscape)
Desktop: 1024px+         (Laptop/Desktop - Multi-column)
```

---

## Layout Grid System

### Mobile Grid (< 768px)
```
├─────────────────────┐
│   16px   Content    │ 16px side margins
│                     │ Single column
│   Full Width        │ Stack everything
│                     │
└─────────────────────┘
```

### Tablet Grid (768px - 1023px)
```
├───────────────────────────────┐
│  24px     Content      24px   │ 24px side margins
│                               │ 2-column option
│      Max Width: 720px         │ Centered content
│                               │
└───────────────────────────────┘
```

### Desktop Grid (1024px+)
```
├─────────────────────────────────────────┐
│  Sidebar  │      Main Content      │   │
│  240px    │   (Flexible Width)     │40px│
│           │                        │   │
│  Pinned   │   Max Width: 1400px    │   │
└─────────────────────────────────────────┘
```

---

## Core Layouts by Screen Type

## 1. MAP VIEW (Primary Interface)

### 📱 Mobile Layout (< 768px)

**Structure:**
```
┌─────────────────────────┐
│ [Header Bar - 60px]     │ ← Search, Menu, Profile
├─────────────────────────┤
│                         │
│                         │
│    FULL SCREEN MAP      │ ← 100vh - header - bottom sheet
│    (Interactive)        │
│                         │
│                         │
├─────────────────────────┤
│ [Bottom Sheet - 120px]  │ ← Swipe up for incidents list
│ ● 3 Active Incidents    │
└─────────────────────────┘
│    [FAB - 64x64px]      │ ← Report button (fixed)
│         ⊕               │
└─────────────────────────┘
```

**Specifications:**
- **Header:** Fixed top, 60px height
  - Floating search bar with backdrop blur
  - Hamburger menu (left)
  - Profile icon (right)
  - Shadow on scroll
  
- **Map:**
  - Full width and height (fills available space)
  - Touch gestures: pinch zoom, pan, tap pins
  - One-finger navigation optimized
  - Current location button (bottom-left)
  - Map style toggle (bottom-right)
  
- **Bottom Sheet:**
  - Default: 120px peek (shows "X active incidents")
  - Swipe up: Expands to 60vh (incident list)
  - Swipe down: Returns to peek or dismiss
  - Handle indicator at top (4px x 32px gray bar)
  - Smooth spring animation
  
- **FAB (Floating Action Button):**
  - Position: Fixed bottom-right, 16px margin
  - Size: 64x64px (oversized for emergency)
  - Color: Emergency red (#DC2626)
  - Icon: Plus or camera
  - Shadow: Elevated
  - Pulse animation when idle

**Interactions:**
- Tap pin → Open incident detail modal (full screen)
- Tap FAB → Start report flow (full screen)
- Pull down from top → Refresh incidents
- Tap bottom sheet → Expand to list view

**Content Priorities:**
1. Map (immediate visual context)
2. Report button (primary action)
3. Active incidents count (awareness)
4. Detailed list (secondary)

---

### 📱 Tablet Layout (768px - 1023px)

**Structure:**
```
┌─────────────────────────────────────┐
│ [Header Bar - 72px]                 │
├───────────────┬─────────────────────┤
│               │                     │
│   MAP VIEW    │  INCIDENT SIDEBAR   │
│   (65%)       │  (35%)              │
│               │  ┌───────────────┐  │
│   Interactive │  │ Incident 1    │  │
│   Fullscreen  │  │ [Photo] [Map] │  │
│   Option      │  ├───────────────┤  │
│               │  │ Incident 2    │  │
│               │  └───────────────┘  │
│               │  [Scrollable]       │
│               │                     │
└───────────────┴─────────────────────┘
        [FAB - 56x56px] →
```

**Specifications:**
- **Split View:** Map (65%) + Sidebar (35%)
- **Header:** 72px height
  - Search bar expanded (not floating)
  - Breadcrumb navigation
  - Filter toggle
  
- **Map:**
  - Left panel, full height
  - Toggle fullscreen button (top-right of map)
  - Keyboard shortcuts enabled
  
- **Sidebar:**
  - Right panel, fixed width (280-320px)
  - Scrollable incident cards
  - Sticky header with filters
  - Click incident → Highlights on map
  - Hover incident → Show preview on map
  
- **FAB:**
  - 56x56px (slightly smaller)
  - Positioned over map (bottom-right)

**Adaptive Features:**
- **Landscape Mode:** Sidebar can collapse to icons only
- **Portrait Mode:** Sidebar moves below map (tabs)
- **Keyboard Navigation:** Tab through incidents, arrow keys for map

---

### 🖥️ Desktop Layout (1024px+)

**Structure:**
```
┌───────────────────────────────────────────────────────┐
│ [Header Bar - 64px - Full Width]                      │
├──────┬──────────────────────────┬─────────────────────┤
│ Nav  │                          │  Right Sidebar      │
│ 240px│      MAP VIEW            │  320px              │
│      │   (Main Content)         │                     │
│ ●Map │                          │ ┌─────────────────┐ │
│ ●Rpt │   Centered & Fullscreen  │ │ Filters         │ │
│ ●Rte │                          │ │ □ Minor         │ │
│ ●Ntf │   HD Quality             │ │ ☑ Severe        │ │
│ ●Stg │                          │ ├─────────────────┤ │
│      │                          │ │ Active: 12      │ │
│      │                          │ ├─────────────────┤ │
│      │   [Map Controls]         │ │ Incident 1      │ │
│      │                          │ │ [Details]       │ │
│      │                          │ │                 │ │
│      │                          │ │ Incident 2      │ │
│      │                          │ │ [Details]       │ │
│      │                          │ └─────────────────┘ │
└──────┴──────────────────────────┴─────────────────────┘
                [FAB - 56x56px] →
```

**Specifications:**
- **Three-Column Layout:**
  - Left Nav: 240px fixed
  - Main Content: Flexible (min 640px)
  - Right Sidebar: 320px fixed (collapsible)
  
- **Header:**
  - 64px height
  - Logo left, search center, user right
  - Global actions (notifications, settings)
  
- **Left Navigation:**
  - Fixed position
  - Icon + Label format
  - Active state highlighting
  - Collapsible to icon-only (saves 180px)
  
- **Map (Main):**
  - Fills available space
  - Max width: 1400px (centered)
  - High-resolution tiles
  - Keyboard shortcuts overlay (press ?)
  
- **Right Sidebar:**
  - Fixed width 320px
  - Collapsible (toggle button)
  - Filters at top (sticky)
  - Scrollable incident list
  - Detailed cards (more info shown)
  
- **FAB:**
  - Still visible (desktop users can report too)
  - 56x56px
  - Tooltip on hover

**Desktop-Specific Features:**
- Hover states on all interactive elements
- Right-click context menu on pins
- Keyboard shortcuts (J/K for next/prev incident)
- Multi-select with Shift+Click
- Export/print options

---

## 2. REPORT ACCIDENT FLOW

### 📱 Mobile Layout (< 768px)

**Full-Screen Modal Approach**

**Step 1: Location Confirmation**
```
┌─────────────────────────┐
│ [← Back]  [Step 1/4]    │ ← 44px header
├─────────────────────────┤
│                         │
│    MAP (Location Pin)   │ ← 60% height
│    [Draggable]          │
│                         │
├─────────────────────────┤
│ Highway 101 North       │ ← 40% height
│ Exit 45                 │
│                         │
│ Is this correct?        │
│                         │
│ [Adjust Pin on Map]     │ ← Ghost button
│                         │
│ [✓ Yes, This is It]     │ ← Primary button
└─────────────────────────┘
```

**Step 2: Quick Details**
```
┌─────────────────────────┐
│ [← Back]  [Step 2/4]    │
├─────────────────────────┤
│ Tell us what happened   │ ← Title
│                         │
│ ┌────────┬────────┐     │
│ │   1    │   2    │     │ ← Vehicle count
│ └────────┴────────┘     │   (Large tap targets)
│ ┌────────┬────────┐     │
│ │   3    │   3+   │     │
│ └────────┴────────┘     │
│                         │
│ Injuries?               │
│ ┌────────┬────────┐     │
│ │  None  │ Minor  │     │
│ └────────┴────────┘     │
│ ┌──────────────────┐    │
│ │    Serious       │    │
│ └──────────────────┘    │
│                         │
│ [📷 Add Photo]          │ ← Camera button
│                         │
│ [Next →]                │ ← Full width
└─────────────────────────┘
```

**Specifications:**
- **Modal:** Full screen, slide up animation
- **Progress:** Step indicator at top
- **Buttons:** Minimum 56px height, 8px spacing
- **Icons:** 24x24px with labels
- **Scroll:** Vertical if content exceeds screen
- **Navigation:** Back button + progress bar

---

### 📱 Tablet Layout (768px - 1023px)

**Centered Modal Approach**

```
┌─────────────────────────────────────┐
│                                     │
│   ┌───────────────────────────┐   │
│   │ Report Accident [✕]       │   │ ← 600px wide
│   ├───────────────────────────┤   │   Centered
│   │                           │   │
│   │  [Map or Form Content]    │   │
│   │  More horizontal space    │   │
│   │                           │   │
│   │  ┌─────┐ ┌─────┐ ┌─────┐ │   │ ← 3 columns
│   │  │  1  │ │  2  │ │  3+ │ │   │
│   │  └─────┘ └─────┘ └─────┘ │   │
│   │                           │   │
│   │  [← Back]    [Next →]     │   │
│   └───────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Specifications:**
- **Modal:** 600px wide, centered, rounded corners
- **Backdrop:** Blurred background (80% opacity)
- **Layout:** 2-3 column grid for options
- **Map:** Side-by-side with form when space allows

---

### 🖥️ Desktop Layout (1024px+)

**Split-Screen Wizard**

```
┌─────────────────────────────────────────────┐
│ Report Accident                        [✕]  │
├──────────────────────┬──────────────────────┤
│                      │                      │
│   MAP (Live)         │   FORM (Wizard)     │
│   400px width        │   400px width       │
│                      │                      │
│   Pin draggable      │   Step 2 of 4       │
│   Auto-detect        │                      │
│   location           │   Vehicles:         │
│                      │   ● 1  ○ 2  ○ 3+    │ ← Radio
│   [📍]               │                      │
│                      │   Injuries:         │
│                      │   ☐ None ☐ Minor    │ ← Checkbox
│                      │   ☐ Serious         │
│                      │                      │
│   Highway 101 N      │   Lanes Blocked:    │
│   Exit 45            │   [▓▓▓░░░] 3 of 6   │ ← Visual
│   (Auto-detected)    │                      │
│                      │                      │
│                      │   [← Back] [Next →] │
└──────────────────────┴──────────────────────┘
        800px total width (centered)
```

**Specifications:**
- **Modal:** 800px wide, split into two 400px panels
- **Left:** Live map preview (updates as you adjust)
- **Right:** Multi-step form with clear progress
- **Layout:** Horizontal form fields (labels left, inputs right)
- **Validation:** Inline, real-time feedback

---

## 3. INCIDENT DETAIL VIEW

### 📱 Mobile Layout (< 768px)

**Bottom Sheet → Full Modal**

```
Initial (Bottom Sheet - 40vh):
┌─────────────────────────┐
│       [Handle]          │ ← Drag handle
├─────────────────────────┤
│ [Photo Carousel]        │ ← Swipeable
├─────────────────────────┤
│ ⚠️ SEVERE              │ ← Badge
│ 3 vehicles, 2 injuries  │
│                         │
│ 📍 1.2 miles from you   │
│ 🕐 15 minutes ago       │
│                         │
│ [Swipe up for more]     │
└─────────────────────────┘

Expanded (Full Screen):
┌─────────────────────────┐
│ [← Close]         [⋮]   │
├─────────────────────────┤
│ [Photo Gallery]         │ ← Full width carousel
├─────────────────────────┤
│ ⚠️ SEVERE              │
│                         │
│ Location                │
│ Highway 101 North       │
│ [View on Map] [Navigate]│ ← Action buttons
│                         │
│ Details                 │
│ • 3 vehicles involved   │
│ • 2 injuries reported   │
│ • Left 2 lanes blocked  │
│                         │
│ Status                  │
│ ✓ Police on scene       │
│ → Ambulance en route    │
│                         │
│ Timeline                │
│ • Reported: 3:45 PM     │
│ • Dispatched: 3:46 PM   │
│ • On scene: 3:52 PM     │
│                         │
│ [Get Directions]        │ ← Primary CTA
│ [Add Update]            │ ← Secondary
└─────────────────────────┘
```

**Specifications:**
- **Transition:** Bottom sheet → Full screen modal
- **Photos:** Full-width carousel with dots indicator
- **Sections:** Clear visual separation with headers
- **Actions:** Sticky at bottom (safe area padding)
- **Scroll:** Smooth with momentum

---

### 📱 Tablet Layout (768px - 1023px)

**Centered Modal with Map Preview**

```
┌─────────────────────────────────────┐
│                                     │
│  ┌──────────────────────────────┐  │
│  │ [✕] Incident Detail          │  │ ← 640px wide
│  ├────────────┬─────────────────┤  │
│  │            │ ⚠️ SEVERE       │  │
│  │   [Map]    │                 │  │
│  │  Preview   │ 3 vehicles      │  │
│  │   200px    │ 2 injuries      │  │
│  │            │                 │  │
│  ├────────────┴─────────────────┤  │
│  │ [Photo Carousel - 3 of 5]    │  │
│  ├──────────────────────────────┤  │
│  │ Details (2-column)           │  │
│  │ Location:    Highway 101 N   │  │
│  │ Time:        15 min ago      │  │
│  │ Status:      Police on scene │  │
│  │                               │  │
│  │ [Get Directions] [Add Update]│  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

---

### 🖥️ Desktop Layout (1024px+)

**Side Panel (Slide-in from right)**

```
┌────────────────────────────┬──────────────────┐
│                            │ [✕] Incident     │
│                            │                  │
│        MAP VIEW            │ [Photos 5x]      │
│    (Slightly dimmed)       │ ▓▓▓▓▓           │
│                            │                  │
│    Incident pin            │ ⚠️ SEVERE       │
│    highlighted             │ Highway 101 N    │
│                            │                  │
│                            │ ┌──────────────┐ │
│                            │ │ 📍 Location  │ │
│                            │ │ Show on map  │ │
│                            │ └──────────────┘ │
│                            │                  │
│                            │ Details          │
│                            │ • 3 vehicles     │
│                            │ • 2 injuries     │
│                            │ • Left lanes ❌  │
│                            │                  │
│                            │ Response         │
│                            │ ✓ Police         │
│                            │ → Ambulance      │
│                            │                  │
│                            │ [Get Directions] │
│                            │ [Add Update]     │
│                            │                  │
└────────────────────────────┴──────────────────┘
        Main (70%)              Sidebar (30%)
```

**Specifications:**
- **Panel:** Slides in from right, 400-480px wide
- **Map:** Remains visible (dimmed/blurred slightly)
- **Photos:** Thumbnail grid (click for lightbox)
- **Actions:** Contextual (desktop shows more options)
- **Keyboard:** ESC to close, arrow keys for photos

---

## 4. DASHBOARD (Emergency Responders)

### 📱 Mobile Layout (< 768px)

**Tabs + Cards**

```
┌─────────────────────────┐
│ [☰] Dashboard    [👤]   │
├─────────────────────────┤
│ [Active] [Dispatched]   │ ← Tabs
│ [On Scene] [Cleared]    │
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐ │
│ │ ⚠️ SEVERE          │ │ ← Incident card
│ │ Highway 101 N       │ │
│ │ 3 vehicles          │ │
│ │ [View] [Claim]      │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ ⚠️ MODERATE        │ │
│ │ Oak St & Main       │ │
│ │ 2 vehicles          │ │
│ │ [View] [Claim]      │ │
│ └─────────────────────┘ │
│                         │
│ [Scroll for more...]    │
└─────────────────────────┘
```

**Specifications:**
- **Layout:** Single column, stacked cards
- **Tabs:** Horizontal scroll for status filters
- **Cards:** 
  - Severity badge prominent
  - Key info only (location, vehicles, time)
  - 2 quick actions per card
- **Pull to refresh:** Updates incident list
- **Notification banner:** New incidents appear at top

---

### 📱 Tablet Layout (768px - 1023px)

**Split View: Map + List**

```
┌───────────────────────────────────────┐
│ [☰] Dashboard    [Filters ▼]    [👤]  │
├──────────────────┬────────────────────┤
│                  │ Active (12)        │
│                  │                    │
│     MAP VIEW     │ ┌────────────────┐ │
│   (All pins)     │ │ ⚠️ SEVERE     │ │
│                  │ │ Highway 101 N  │ │
│   Click pin →    │ │ [View][Claim]  │ │
│   Highlight      │ └────────────────┘ │
│   in list        │                    │
│                  │ ┌────────────────┐ │
│                  │ │ ⚠️ MODERATE   │ │
│                  │ │ Oak & Main     │ │
│                  │ └────────────────┘ │
│                  │                    │
│                  │ [Scrollable]       │
└──────────────────┴────────────────────┘
    Map 50%              List 50%
```

**Specifications:**
- **Split:** 50/50 or 60/40 (map/list)
- **Interaction:** Click pin → highlight card, vice versa
- **Filters:** Dropdown in header
- **Landscape:** Optimal for in-vehicle tablets

---

### 🖥️ Desktop Layout (1024px+)

**Command Center Layout**

```
┌──────────────────────────────────────────────────────┐
│ Dashboard    [Filters] [Sort] [Export]    [User ▼]   │
├────┬─────────────────────────────────────┬───────────┤
│Nav │  MAP (Large - 60%)                  │ Details   │
│    │                                     │ Panel     │
│●All│  All incident pins                  │           │
│●Act│  Color coded by severity            │ Selected  │
│●Dis│  Cluster on zoom out                │ Incident  │
│●On │                                     │           │
│●Clr│  Click pin → Load details panel →  │ ┌───────┐ │
│    │                                     │ │Photos │ │
│Flt │  [Legend] [Controls]                │ ├───────┤ │
│□Svr│                                     │ │Info   │ │
│☑Mod│                                     │ │Assign │ │
│☑Min│                                     │ │Status │ │
│    │                                     │ └───────┘ │
│Stc │                                     │           │
│12  │                                     │ Actions:  │
│Act │                                     │ [Claim]   │
│8   │                                     │ [Assign]  │
│Disp│                                     │ [Update]  │
├────┼─────────────────────────────────────┤           │
│    │ TABLE VIEW (Bottom 40% - Toggle)    │           │
│    ┌──────┬──────┬─────┬──────┬────────┐│           │
│    │Svrty │Loctn │Veh  │Time  │Status  ││           │
│    ├──────┼──────┼─────┼──────┼────────┤│           │
│    │⚠️SVR │Hwy101│3    │15min │Active  ││           │
│    │⚠️MOD │Oak St│2    │23min │Disptch ││           │
│    │⚠️MIN │Main  │1    │45min │OnScene ││           │
│    └──────┴──────┴─────┴──────┴────────┘│           │
└─────┴─────────────────────────────────────┴───────────┘
```

**Specifications:**
- **Three Sections:**
  - Left Nav (240px): Filters, stats
  - Main Content (60%): Map + optional table
  - Right Panel (320-400px): Details on selection
  
- **Map:**
  - Large, primary view
  - Clustering for performance
  - Legend overlay
  - Full-screen toggle
  
- **Table View:**
  - Toggle below map
  - Sortable columns
  - Multi-select rows
  - Export to CSV
  - Keyboard navigation (arrows, space to select)
  
- **Details Panel:**
  - Loads on pin/row click
  - Quick actions at bottom
  - Can pin open (doesn't close on new selection)
  
- **Stats Sidebar:**
  - Live counts by status
  - Filter checkboxes
  - Visual indicators (graphs)

---

## 5. ANALYTICS (City Officials)

### 📱 Mobile Layout (< 768px)

**Vertical Scroll, Stacked Cards**

```
┌─────────────────────────┐
│ [☰] Analytics    [📅]   │
├─────────────────────────┤
│ This Month ▼            │ ← Date selector
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 1,247              │ │ ← Key metric
│ │ Total Accidents     │ │
│ │ ↓ 8% vs last month  │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 8.2 min            │ │
│ │ Avg Response Time   │ │
│ │ ↑ 0.5 min           │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ [Bar Chart]         │ │ ← Simplified charts
│ │ Accidents by Hour   │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Top 5 Locations     │ │ ← List view
│ │ 1. Highway 101      │ │
│ │ 2. Oak & Main       │ │
│ │ 3. ...              │ │
│ └─────────────────────┘ │
│                         │
│ [Export Report]         │
└─────────────────────────┘
```

**Specifications:**
- **Layout:** Single column, vertical scroll
- **Metrics:** Large numbers, clear trends
- **Charts:** Simplified, tap for full screen
- **Lists:** Top 5/10 only (not full data)
- **Export:** Button at bottom

---

### 📱 Tablet Layout (768px - 1023px)

**2-Column Grid**

```
┌───────────────────────────────────────┐
│ Analytics      [📅 Date] [Filter]     │
├───────────────────┬───────────────────┤
│ ┌───────────────┐ │ ┌───────────────┐ │
│ │ 1,247         │ │ │ 8.2 min       │ │
│ │ Accidents     │ │ │ Response Time │ │
│ └───────────────┘ │ └───────────────┘ │
├───────────────────┴───────────────────┤
│ [Heatmap - Interactive]               │
│                                       │
│ City map with accident hotspots       │
│                                       │
├───────────────────┬───────────────────┤
│ [Time Chart]      │ [Type Chart]      │
│                   │                   │
├───────────────────┴───────────────────┤
│ Top 10 Dangerous Locations            │
│ [Table with inline charts]            │
└───────────────────────────────────────┘
```

**Specifications:**
- **Grid:** 2 columns for metrics/charts
- **Charts:** Interactive (hover, click)
- **Heatmap:** Full width, touch-enabled
- **Tables:** Show more rows (10 vs 5)

---

### 🖥️ Desktop Layout (1024px+)

**Dashboard Grid System**

```
┌──────────────────────────────────────────────────────────┐
│ Analytics    [Date Range ▼] [Filters] [Export ▼]  [User]│
├────┬─────────────────────────────────────────────────────┤
│Nav │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│    │  │1,247 │ │8.2min│ │  34  │ │Hwy101│              │
│●Ovr│  │Total │ │Resp  │ │Severe│ │Top   │              │
│●Hot│  │↓ 8%  │ │↑0.5m │ │↑12%  │ │Road  │              │
│●Tim│  └──────┘ └──────┘ └──────┘ └──────┘              │
│●Typ│                                                     │
│●Loc│  ┌──────────────────────┐ ┌──────────────────────┐│
│    │  │  HEATMAP (Large)     │ │  TIME CHART          ││
│Exp │  │  Interactive         │ │  Accidents by Hour   ││
│PDF │  │  Click zone →        │ │  Last 30 days        ││
│CSV │  │  Filter table        │ │  [Interactive]       ││
│PPT │  │                      │ │                      ││
│    │  └──────────────────────┘ └──────────────────────┘│
│    │  ┌──────────────────────────────────────────────┐ │
│    │  │  TABLE: Top 20 Dangerous Locations           │ │
│    │  ├────┬─────────┬──────┬──────┬──────┬─────────┤ │
│    │  │Rank│Location │Count │Severe│Trend │[Chart]  │ │
│    │  ├────┼─────────┼──────┼──────┼──────┼─────────┤ │
│    │  │ 1  │Hwy 101 N│ 47   │ 12   │ ↑15% │▁▃▅▇    │ │
│    │  │ 2  │Oak&Main │ 34   │ 8    │ ↓8%  │▇▅▃▁    │ │
│    │  │... │...      │ ...  │ ...  │ ...  │...      │ │
│    │  └────┴─────────┴──────┴──────┴──────┴─────────┘ │
│    │  [Load More] [Export Selection]                  │
└────┴──────────────────────────────────────────────────┘
```

**Specifications:**
- **Layout:** Modular grid (4-column base)
- **Metrics:** 4 across at top
- **Charts:** 2-3 columns, variable heights
- **Table:** Full width, advanced features
- **Interactions:**
  - Hover charts → Show tooltips
  - Click heatmap zone → Filter table
  - Click table row → Drill down to location details
- **Export:** Multiple formats (PDF, CSV, PPTX)

---

## Adaptive Components

### Navigation

**Mobile:**
```
Hamburger menu (☰) → Full-screen overlay
- Stacked links
- Large touch targets
- Close button (✕)
```

**Tablet:**
```
Collapsed sidebar (icons only)
- Hover → Show labels
- Toggle to expand
```

**Desktop:**
```
Full sidebar (icons + labels)
- Always visible
- Active state highlighting
- Sub-navigation support
```

---

### Search

**Mobile:**
```
[🔍] Icon → Expands to full-width input
- Overlay with backdrop
- Recent searches
- Voice input option
```

**Tablet:**
```
Search bar in header (medium width)
- Dropdown results below
- Keyboard shortcuts
```

**Desktop:**
```
Prominent search bar (center header)
- Live suggestions
- Advanced filters
- Keyboard navigation (⌘K to focus)
```

---

### Filters

**Mobile:**
```
[Filter] button → Bottom sheet
- Vertical list of options
- Apply/Reset buttons
- Badge shows active count
```

**Tablet:**
```
[Filters ▼] Dropdown
- Overlay panel
- Grouped sections
```

**Desktop:**
```
Sidebar (always visible)
- Checkboxes/toggles
- Inline, no modal needed
```

---

### Data Tables

**Mobile:**
```
Card-based list view
- 1 card per row
- Key fields only
- Tap card → Details
```

**Tablet:**
```
Simplified table
- 4-5 essential columns
- Horizontal scroll if needed
```

**Desktop:**
```
Full data table
- All columns visible
- Sortable, filterable
- Multi-select, inline edit
- Fixed header on scroll
```

---

## Performance Optimizations

### Mobile
- Lazy load images (incident photos)
- Virtual scrolling for long lists
- Simplified maps (fewer features)
- Offline mode with service workers
- Touch gesture optimization

### Tablet
- Balance between mobile simplicity and desktop features
- Orientation lock support
- Split-screen app support

### Desktop
- High-resolution assets
- Prefetch on hover
- Multiple simultaneous views
- Background data refresh
- Keyboard shortcuts

---

## Touch vs Mouse Interactions

### Touch (Mobile/Tablet)
- Minimum 44x44px targets
- No hover states (use active states)
- Swipe gestures (dismiss, refresh)
- Long-press for context menus
- Pinch to zoom (maps)

### Mouse (Desktop)
- Hover tooltips and previews
- Right-click context menus
- Precise clicking (smaller targets OK)
- Keyboard shortcuts
- Drag and drop

---

## Responsive Images

```javascript
// Incident photos
<picture>
  <source media="(min-width: 1024px)" srcset="image-large.jpg">
  <source media="(min-width: 768px)" srcset="image-medium.jpg">
  <img src="image-small.jpg" alt="Accident scene">
</picture>

// Map tiles
Mobile: Lower resolution, smaller tile size
Desktop: HD tiles, larger coverage
```

---

## Loading States

### Mobile
- Skeleton screens (maintain layout)
- Inline spinners (small)
- Pull-to-refresh indicator

### Tablet/Desktop
- Shimmer effect on cards
- Progress bars for bulk actions
- Background loading (non-blocking)

---

## Implementation Checklist

### CSS Framework
```css
/* Mobile First */
.card {
  /* Base mobile styles */
}

@media (min-width: 768px) {
  .card {
    /* Tablet adjustments */
  }
}

@media (min-width: 1024px) {
  .card {
    /* Desktop enhancements */
  }
}
```

### React Components
```jsx
// Responsive hook
const { isMobile, isTablet, isDesktop } = useMediaQuery();

// Conditional rendering
{isMobile ? <MobileNav /> : <DesktopNav />}

// Or use CSS classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

---

## Testing Strategy

### Devices to Test
- **Mobile:** iPhone SE (small), iPhone 14 Pro, Android (various)
- **Tablet:** iPad, iPad Pro, Android tablets
- **Desktop:** 1366x768, 1920x1080, 2560x1440

### Orientations
- Portrait and landscape for mobile/tablet
- Window resizing on desktop

### Interactions
- Touch, mouse, keyboard, voice
- Slow network (3G simulation)
- Offline mode

---

This responsive strategy ensures the platform works seamlessly across all devices while optimizing for each screen size's unique strengths and user contexts.
