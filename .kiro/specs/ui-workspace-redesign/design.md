# UI Workspace Redesign - Design

## Layout Architecture

### 3-Panel Structure
```
┌─────────────────────────────────────────────────────────────┐
│ [ SIDEBAR 240px ]  [ LIST PANEL 300px ]  [ MAIN PANEL flex ]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ VNotes          │ All Notes         │ Recording Title       │
│ ─────────────── │ ───────────────── │ ─────────────────── │
│                 │                   │ Date • Duration     │
│ • All Notes     │ 📝 Meeting Notes  │                     │
│ • Recordings    │ 14 Nov, 2:14 min  │ [Rich Editor]       │
│ • Tags          │                   │                     │
│                 │ 🎙️ Podcast Ep 3   │                     │
│ ─────────────── │ 10 Nov, 45 min    │                     │
│                 │                   │                     │
│ [User Menu]     │ 📝 Meeting Notes  │ [Timeline/Player]   │
└─────────────────────────────────────────────────────────────┘
```

### Panel Specifications

#### LEFT SIDEBAR (240px)
- Fixed width
- Background: #111827
- Scrollable if needed
- Components:
  - Workspace title (VNotes) - 16px bold
  - Navigation sections (All Notes, Recordings, Tags)
  - User menu (bottom)
- Active state: Small left border accent (3px)
- Hover: Opacity fade, no color change

#### MIDDLE LIST PANEL (300px)
- Fixed width, scrollable vertically
- Background: #111827
- Search bar at top (optional)
- Flat list items (no cards)
- Item height: 56px (tight spacing)
- Each item:
  - Title: 15px bold, #FFFFFF
  - Metadata: 12px, #9CA3AF
  - Optional tags: inline, small badges
- Hover state:
  - Background: #1F2937
  - Scale: 1.01
  - Duration: 150ms
- Active state:
  - Left border: 3px accent color
  - Background: #1F2937

#### MAIN EDITOR PANEL (flex)
- Takes remaining horizontal space
- Minimum width: 600px
- Background: #0B0F14
- Sections:
  1. Header (80px)
     - Editable title (28-32px bold)
     - Metadata row (date, duration, tags)
  2. Editor (flex)
     - Rich text area or structured view
     - Full scrollable height
  3. Timeline (80px, at bottom)
     - Waveform, progress, playback controls
- Right sidebar optional: Transcript/outline (200px, collapsible)

---

## Component Design

### 1. Sidebar Navigation
```tsx
// Structure
<Sidebar>
  <WorkspaceTitle>VNotes</WorkspaceTitle>
  <NavSection>
    <NavItem active>All Notes</NavItem>
    <NavItem>Recordings</NavItem>
    <NavItem>Tags</NavItem>
  </NavSection>
  <UserMenu />
</Sidebar>
```

**Styling:**
- Active: `left border 3px accent`, `bg #1F2937`
- Hover: `bg #1F2937`, `scale 1.02`
- Inactive: `bg transparent`, `text #9CA3AF`
- Transition: `transform 150ms, background 150ms`

### 2. List Item
```tsx
<ListItem>
  <Title>Meeting Notes</Title>
  <Metadata>14 Nov • 2:14 min</Metadata>
  <Tags>
    <Tag>work</Tag>
    <Tag>urgent</Tag>
  </Tags>
</ListItem>
```

**Styling:**
- Padding: 12px 16px
- Border-left: 3px transparent (active: accent color)
- Hover: `bg #1F2937`, `scale 1.01`, `shadow-sm`
- Cursor: pointer
- Transition: `all 150ms ease-out`

### 3. Editor Header
```tsx
<EditorHeader>
  <EditableTitle>Recording Title</EditableTitle>
  <MetadataRow>
    <Date>14 Nov 2024</Date>
    <Duration>2:14 min</Duration>
    <Tags>...</Tags>
  </MetadataRow>
</EditorHeader>
```

**Styling:**
- Title: 28px bold, #FFFFFF, contentEditable
- Metadata: 13px, #9CA3AF
- Padding: 20px 24px
- Border-bottom: 1px #1F2937

### 4. Rich Text Editor
```tsx
<Editor>
  {/* 
    Integration points:
    - Preserve existing RecordingCard logic
    - Add transcript panel (optional right sidebar)
    - Support markdown OR WYSIWYG formatting
  */}
</Editor>
```

**Styling:**
- Background: #0B0F14
- Text: 15px, #E5E5E5, line-height 1.6
- Focus: soft highlight, `ring-1 ring-accent`
- Padding: 24px
- Max-width: 900px (for readability)

### 5. Media Timeline
```tsx
<Timeline>
  <TimestampLabel>00:00</TimestampLabel>
  <Waveform>
    {/* Bars representing amplitude */}
    <Bar height={20} />
    <Bar height={35} />
    {/* ... */}
  </Waveform>
  <ProgressBar />
  <Controls>
    <RecordButton />
    <PlayButton />
    <PauseButton />
    <SplitButton />
  </Controls>
</Timeline>
```

**Styling:**
- Height: 80px
- Background: #111827
- Waveform: Blue bars, gradient top-to-bottom
- Progress: Accent color, smooth scrubbing
- Controls: Flex row, centered spacing
- Padding: 12px 24px

### 6. Recording Controls (Top Bar)
```tsx
<RecordingDock>
  <LiveWaveform />  // Small, inline
  <Timer />         // 12px, inline
  <RecordButton />
  <StopButton />
</RecordingDock>
```

**Styling:**
- Position: Fixed top or floating bottom
- Height: 48px
- Background: #111827
- Border: 1px bottom #1F2937
- Padding: 8px 16px
- Z-index: 40 (above content)

---

## Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| Main Background | #0B0F14 | App background |
| Panel Background | #111827 | Sidebar, list panel |
| Hover Background | #1F2937 | Hover states on items |
| Active Background | #27364E | Active panel with border |
| Text Primary | #FFFFFF | Headings, titles |
| Text Secondary | #E5E5E5 | Body text |
| Text Muted | #9CA3AF | Metadata, secondary info |
| Border Subtle | #1F2937 | Dividers, subtle borders |
| Accent | #3B82F6 | Active states, buttons, progress |
| Accent Hover | #2563EB | Hover on accent |
| Error | #EF4444 | Destructive actions |
| Success | #10B981 | Positive feedback |

---

## Typography

| Element | Size | Weight | Color | Usage |
|---------|------|--------|-------|-------|
| Editor Title | 28-32px | bold | #FFFFFF | Main note/recording title |
| Section Heading | 18-20px | semibold | #E5E5E5 | Panel headers |
| Body Text | 15-16px | regular | #E5E5E5 | Editor content |
| List Item Title | 15px | bold | #FFFFFF | List item name |
| Metadata | 12-13px | regular | #9CA3AF | Timestamps, counts |
| Button Text | 14px | medium | varies | CTA, action buttons |

---

## Motion & Interaction

### Hover Effects (Global)
```css
.interactive-element {
  transition: transform 150ms ease-out, background-color 150ms ease-out;
}
.interactive-element:hover {
  transform: scale(1.02);
  background-color: rgba(255, 255, 255, 0.05);
}
```

### Click Effects
```css
.interactive-element:active {
  transform: scale(0.97);
  opacity: 0.9;
}
```

### Panel Transitions
```css
.panel {
  transition: all 200ms ease-out;
}
.panel.slide-in {
  animation: slideIn 200ms ease-out;
}
@keyframes slideIn {
  from { 
    opacity: 0; 
    transform: translateX(-20px); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0); 
  }
}
```

### Timeline Scrubbing
```css
.progress-bar {
  cursor: grab;
  transition: background-color 100ms ease-out;
}
.progress-bar:active {
  cursor: grabbing;
  background-color: #2563EB;
}
```

---

## Responsive Design (Mobile - Future Phase)

Currently targeting desktop (1200px+). Mobile layout will:
- Stack panels vertically (bottom sheet for list)
- Full-screen editor on selection
- Timeline becomes full-width
- Sidebar collapses to icon-only or bottom tab bar

---

## Accessibility

### Semantic HTML
- Use `<nav>`, `<article>`, `<section>` appropriately
- Headings hierarchy: h1 (title) → h2 (sections) → h3 (subsections)

### Keyboard Navigation
- Tab order: Sidebar → List → Editor
- Arrow keys: Navigate list items
- Enter: Select/activate item
- Ctrl+S (Cmd+S): Save
- Ctrl+K (Cmd+K): Search

### ARIA Labels
- Active state: `aria-current="page"`
- Buttons: `aria-label="Record Audio"`
- Lists: `role="listbox"` / `role="option"`

### Color Contrast
- Text on background: 4.5:1 minimum (WCAG AA)
- Accent on background: 3:1 minimum (WCAG AA for UI components)

---

## File Structure (Post-Implementation)

```
src/
├── components/
│   ├── Workspace/
│   │   ├── Workspace.tsx          (3-panel container)
│   │   ├── Sidebar.tsx            (left navigation)
│   │   ├── ListPanel.tsx          (middle notes/recordings)
│   │   ├── EditorPanel.tsx        (main editor)
│   │   └── Workspace.css
│   ├── Editor/
│   │   ├── RichEditor.tsx         (text editor with transcript)
│   │   ├── EditorHeader.tsx       (title + metadata)
│   │   └── Editor.css
│   ├── Timeline/
│   │   ├── Timeline.tsx           (media timeline)
│   │   ├── Waveform.tsx           (waveform visualization)
│   │   ├── PlaybackControls.tsx   (play/pause/record)
│   │   └── Timeline.css
│   ├── RecordingDock/
│   │   ├── RecordingDock.tsx      (floating recording UI)
│   │   └── RecordingDock.css
│   └── Pricing/
│       ├── PricingPage.tsx        (pricing page)
│       └── PricingPage.css
├── pages/
│   ├── LibraryPage.tsx            (refactored to use Workspace)
│   ├── RecordingPage.tsx          (refactored to use Workspace)
│   └── PricingPage.tsx            (new page)
└── styles/
    ├── typography.css            (font hierarchy)
    ├── colors.css                (color system)
    ├── motion.css                (transitions & animations)
    └── workspace.css             (3-panel layout)
```

---

## Implementation Order

1. **Workspace Layout** - Create 3-panel container, grid structure
2. **Sidebar** - Navigation, sections, active states
3. **List Panel** - Display items, hover/active interactions
4. **Editor Panel Header** - Title + metadata display
5. **Rich Editor** - Integrate existing editor with new styling
6. **Timeline** - Waveform, controls, scrubbing interaction
7. **Recording Dock** - Move recording UI to top/bottom
8. **Motion System** - Apply transitions globally
9. **Pricing Page** - New page with pricing tiers
10. **Polish & Testing** - Accessibility, performance, edge cases
