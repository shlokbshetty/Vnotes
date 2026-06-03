# UI Workspace Redesign - Implementation Tasks

## Task 1: Create Workspace Layout Container
**Status:** Ready
**Type:** Core Infrastructure

Create the 3-panel grid layout system that will serve as the foundation for all workspace components.

**Sub-tasks:**
- [ ] Create `components/Workspace/Workspace.tsx` with CSS Grid layout (240px | 300px | 1fr)
- [ ] Add panel resize logic (optional: collapsible sidebar)
- [ ] Import/wire existing components into panels
- [ ] Add responsive breakpoint management
- [ ] Style with dark mode colors (#0B0F14 main, #111827 panels)

**Deliverables:**
- Workspace component with 3-panel structure
- No functional changes yet, just layout repositioning

---

## Task 2: Build Obsidian-Inspired Sidebar
**Status:** Depends on Task 1
**Type:** UI Component

Replace current sidebar with hierarchical navigation matching Obsidian pattern.

**Sub-tasks:**
- [ ] Create `components/Workspace/Sidebar.tsx`
- [ ] Add VNotes workspace title at top
- [ ] Create navigation sections: All Notes, Recordings, Tags
- [ ] Implement nested/expandable items (fold/unfold arrows)
- [ ] Add active state styling (left border accent, no heavy blue)
- [ ] Implement hover interactions (soft fade, scale 1.02)
- [ ] Add user menu at bottom (profile, settings, logout)
- [ ] Wire to navigate between sections

**Styling Details:**
- Background: #111827
- Active: left border 3px #3B82F6, bg #1F2937
- Hover: bg #1F2937, scale 1.02
- Text: 14-16px, #E5E5E5
- Transitions: 150ms ease-out

**Deliverables:**
- Functional Obsidian-style sidebar
- Navigation updates main panel content

---

## Task 3: Build Middle List Panel
**Status:** Depends on Task 1
**Type:** UI Component

Create the notes/recordings list view that was missing from original design.

**Sub-tasks:**
- [ ] Create `components/Workspace/ListPanel.tsx`
- [ ] Display flat list of notes/recordings (no cards)
- [ ] Each item shows: Title (15px), Metadata (12px), Tags
- [ ] Implement hover state (bg #1F2937, scale 1.01)
- [ ] Implement active state (left border accent 3px)
- [ ] Add search/filter at top (optional, can be Phase 2)
- [ ] Implement click handler to select and open in editor
- [ ] Add scrollbar styling (subtle, thin)
- [ ] Display item counts in sidebar sections

**Item Structure:**
```
Title: "Meeting Notes"
Date: "14 Nov 2024"
Duration: "2:14 min"
Tags: [work] [urgent]
```

**Styling:**
- Item height: 56px
- Padding: 12px 16px
- Hover: opacity fade, scale 1.01
- Active: left border 3px accent, bg #1F2937
- Transitions: 150ms ease-out

**Deliverables:**
- Functional list panel
- Click to select item
- Active item highlighted

---

## Task 4: Redesign Main Editor Panel Header
**Status:** Depends on Task 1
**Type:** UI Component

Add header section to editor with editable title and metadata display.

**Sub-tasks:**
- [ ] Create `components/Editor/EditorHeader.tsx`
- [ ] Add editable title (contentEditable or input)
- [ ] Display metadata: Date, Duration, Tags
- [ ] Implement title editing with blur/enter to save
- [ ] Style with proper typography (28-32px bold)
- [ ] Add subtle border-bottom separator
- [ ] Integrate with existing recording data

**Styling:**
- Title: 28-32px bold, #FFFFFF
- Metadata: 13px, #9CA3AF
- Padding: 20px 24px
- Border: 1px bottom #1F2937
- Focus state: soft highlight

**Deliverables:**
- Editor header component
- Title editing functionality
- Metadata display

---

## Task 5: Build Rich Text Editor Integration
**Status:** Depends on Task 4
**Type:** UI Component

Integrate/create rich text editor in main panel with optional transcript panel.

**Sub-tasks:**
- [ ] Create `components/Editor/RichEditor.tsx` OR integrate existing editor
- [ ] Add transcript panel option (right sidebar, 200px, collapsible)
- [ ] Sync transcript with timeline playback
- [ ] Preserve existing editor functionality
- [ ] Apply new typography/styling
- [ ] Add focus state with soft highlight
- [ ] Ensure scrollable within panel

**Editor Features:**
- Support markdown OR WYSIWYG formatting
- Max-width 900px for readability
- Line-height 1.6+
- Text: 15-16px, #E5E5E5
- Padding: 24px

**Transcript Panel:**
- Right sidebar, 200px width
- Show transcribed text synced to timeline
- Clickable timestamps jump to timeline position
- Collapsible (toggle button)

**Deliverables:**
- Functional rich text editor
- Optional transcript panel (can integrate later)
- Existing functionality preserved

---

## Task 6: Create Media Timeline Component
**Status:** Depends on Task 1
**Type:** UI Component

Build interactive timeline with waveform, playback controls, and scrubbing.

**Sub-tasks:**
- [ ] Create `components/Timeline/Timeline.tsx`
- [ ] Create `components/Timeline/Waveform.tsx` (bars visualization)
- [ ] Create `components/Timeline/PlaybackControls.tsx`
- [ ] Generate or fetch waveform data (bars representing amplitude)
- [ ] Implement playback progress bar (draggable scrubbing)
- [ ] Add timestamps (00:00, 00:10, 00:20, etc.)
- [ ] Implement play/pause controls
- [ ] Add record button (red)
- [ ] Implement split/mark controls
- [ ] Add smooth drag scrubbing interaction
- [ ] Show preview on hover

**Waveform:**
- Bar height: 6-40px
- Colors: Blue gradient (#3B82F6 to #6366F1)
- Spacing: 2px between bars
- Animation: subtle wave effect (optional)

**Controls:**
- Record (red button)
- Play/Pause toggle
- Split (optional)
- Timeline scrubbing: smooth, no stuttering

**Styling:**
- Height: 80px
- Background: #111827
- Border-top: 1px #1F2937
- Padding: 12px 24px

**Deliverables:**
- Fully interactive media timeline
- Waveform visualization
- Scrubbing and playback controls

---

## Task 7: Move Recording UI to Top/Bottom Dock
**Status:** Depends on Task 1
**Type:** UI Redesign

Refactor recording controls from centered overlay to top bar or floating dock.

**Sub-tasks:**
- [ ] Create `components/RecordingDock/RecordingDock.tsx`
- [ ] Add live waveform (small, inline)
- [ ] Add timer display (12px, inline)
- [ ] Add record/stop buttons
- [ ] Position as floating dock at top or bottom (fixed)
- [ ] Preserve recording functionality
- [ ] Add pulse animation during recording
- [ ] Ensure controls don't obscure editor

**Dock Features:**
- Height: 48px
- Position: Fixed top (below header) or floating bottom-right
- Z-index: 40 (above panels)
- Background: #111827
- Border: 1px bottom #1F2937
- Padding: 8px 16px

**Controls:**
- Live waveform (small bars)
- Timer (HH:MM:SS)
- Record button (red)
- Stop button (hidden until recording)
- Status indicator (recording, idle)

**Deliverables:**
- Recording dock component
- Non-intrusive recording UI
- All existing recording functionality preserved

---

## Task 8: Implement Motion System
**Status:** Depends on Tasks 2-7
**Type:** Polish

Apply subtle, precise animations across all components.

**Sub-tasks:**
- [ ] Create `styles/motion.css` with global transition classes
- [ ] Apply hover scale (1.02) to interactive elements
- [ ] Apply click scale (0.97) to buttons
- [ ] Add panel transition animations (slide + fade, 200-250ms)
- [ ] Add timeline scrubbing smooth movement
- [ ] Add editor focus soft highlight (200ms)
- [ ] Add list item hover/active transitions
- [ ] Test all animations at 60fps
- [ ] Ensure no layout shifts (transform + opacity only)

**Animations:**
- Hover: `transform: scale(1.02)` + `background 150ms ease-out`
- Click: `transform: scale(0.97)` + `opacity 100ms ease-in`
- Panel: `slide + fade 200-250ms ease-out`
- Focus: `ring-1 ring-accent` + `background 200ms ease-out`
- Scrub: Smooth continuous update, no frame skips

**Deliverables:**
- CSS motion system
- All components use consistent animations
- Smooth 60fps performance

---

## Task 9: Create Pricing Page
**Status:** Independent
**Type:** New Feature

Add pricing page with tiered plans aligned to new design system.

**Sub-tasks:**
- [ ] Create `pages/PricingPage.tsx`
- [ ] Create `components/Pricing/PricingPage.css`
- [ ] Add minimal header (title, subtitle)
- [ ] Create pricing tier cards: Free, Pro, Team
- [ ] Display for each tier: Name, Price (large), Features (list)
- [ ] Add CTA buttons for each tier
- [ ] Highlight Pro tier (subtle accent border, scale 1.02)
- [ ] Implement flat design (NO heavy cards)
- [ ] Add route `/pricing` to router
- [ ] Align colors/typography with main app

**Tier Structure:**
```
FREE
$0/month
- 10 recordings/month
- 1GB storage
- Basic transcript

PRO (highlighted)
$9.99/month
- Unlimited recordings
- 100GB storage
- Advanced transcript
- [Upgrade Button]

TEAM
$29.99/month
- Everything in Pro
- Team management
- Priority support
```

**Styling:**
- Background: #0B0F14
- Card: Subtle border 1px #1F2937
- Pro: Accent border, slight scale
- CTA: Accent color button
- Text: Same hierarchy as app

**Deliverables:**
- Pricing page component
- Route registered
- Aligned with design system

---

## Task 10: Quality Assurance & Polish
**Status:** Final Phase
**Type:** Testing

Comprehensive testing and refinement of all components.

**Sub-tasks:**
- [ ] Test keyboard navigation (Tab, Arrow keys, Enter)
- [ ] Test accessibility (color contrast, ARIA labels)
- [ ] Test on multiple screen sizes (1200px, 1440px, 1920px)
- [ ] Test all interactions at 60fps (no jank)
- [ ] Test with slow network (simulate delays)
- [ ] Test dark mode consistency
- [ ] Verify no breaking changes to existing features
- [ ] Test recording/playback functionality
- [ ] Performance audit (Lighthouse)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Fix edge cases and polish animations
- [ ] Create migration guide for database/state

**Deliverables:**
- All tests passing
- Performance optimized
- Ready for production

---

## Task Dependency Graph

```
Task 1 (Layout)
├─ Task 2 (Sidebar)
├─ Task 3 (List Panel)
├─ Task 4 (Editor Header)
│  └─ Task 5 (Rich Editor)
├─ Task 6 (Timeline)
└─ Task 7 (Recording Dock)
   └─ Task 8 (Motion System)
   └─ Task 9 (Pricing Page)
      └─ Task 10 (QA & Polish)
```

---

## Implementation Guidelines

### Code Style
- TypeScript for all components
- Tailwind CSS for styling (or CSS modules)
- Functional components with React hooks
- Component composition over large files
- Clear prop interfaces

### State Management
- React Context for workspace state (selected item, panels, etc.)
- Preserve existing Redux/Context usage if present
- Minimize prop drilling

### Testing
- Unit tests for components
- Integration tests for interactions
- Visual regression tests (optional)

### Documentation
- JSDoc comments on components
- README for complex components
- Migration guide for breaking changes

### Git Workflow
- Use `work-in-progress` branch
- Atomic commits (one feature per commit)
- Clear commit messages

---

## Success Criteria

✅ All tasks completed
✅ No breaking changes to existing logic
✅ UI is panel-based, not page-based
✅ Content density is high but readable
✅ Everything responds to interaction
✅ No part feels template-like
✅ Accessibility WCAG AA compliant
✅ Performance: Lighthouse 90+
✅ Works across major browsers
✅ Recording/playback fully functional
