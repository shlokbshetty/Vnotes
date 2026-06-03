# UI Workspace Redesign - Requirements

## Overview
Transform VNotes from a basic recording tool into a professional 3-panel knowledge + media workspace, inspired by Obsidian (structure), Apple Notes (clarity), and Descript (media interaction).

## User Stories

### Requirement 1: Obsidian-Inspired Sidebar Navigation
**User Story:** As a user, I want a clean hierarchical sidebar so that I can navigate my workspace intuitively.

#### Acceptance Criteria
1. Sidebar displays "VNotes" workspace title at top
2. Sections visible:
   - All Notes (with count)
   - Recordings (with count)
   - Tags/Categories (if exists, expandable)
3. Items show subtle left accent line when active (not heavy blue background)
4. Hover state: soft background fade (opacity change only)
5. Click response is instant (no loading delay)
6. Sidebar width: 240px, very low contrast background (#111827)
7. Nested items supported with expand/collapse arrows
8. Active state shows small left border accent in accent color

### Requirement 2: Middle Panel - Notes/Recordings List
**User Story:** As a user, I want a dedicated list view of all my notes and recordings so that I can quickly find and select what I need.

#### Acceptance Criteria
1. Middle panel displays flat list (NO cards)
2. Each item shows:
   - Title (15-16px, bold)
   - Metadata: date, duration (12-13px, muted)
   - Optional tags
3. Spacing: tight, high density
4. Hover interaction:
   - Slight background change (#1F2937 → #27364E)
   - Subtle scale (1.01)
5. Active state: left border accent (3px, accent color)
6. List scrolls independently
7. Search/filter capability
8. Items are clickable to open in main editor

### Requirement 3: Main Editor Panel - Enhanced Editor
**User Story:** As a user, I want a powerful editor with transcript sync so that I can write and reference media simultaneously.

#### Acceptance Criteria
1. Top section displays:
   - Editable title (28-32px bold)
   - Metadata: date, duration, tags
2. Middle section: Rich text editor OR structured text view
3. Optional right panel inside editor: Transcript synced with timeline
4. Editor takes focus with soft highlight animation
5. No static empty state feeling
6. All controls visible and responsive

### Requirement 4: Media Timeline Component
**User Story:** As a user, I want an interactive media timeline so that I can scrub, play, and navigate audio/video with visual feedback.

#### Acceptance Criteria
1. Horizontal timeline displays:
   - Waveform (real or simulated bars)
   - Playback progress indicator
   - Timestamps (00:00, 00:10, 00:20, etc.)
2. Controls available:
   - Record button (red)
   - Play/Pause button
   - Split/Mark controls
3. Scrubbing: smooth drag interaction
4. Hover on timeline: preview indicator appears
5. Active segment: highlighted with accent color
6. Timeline updates in real-time during playback/recording

### Requirement 5: Recording UI Redesign
**User Story:** As a user, I want recording controls that feel like a background process, not a full-screen overlay, so I can multitask while recording.

#### Acceptance Criteria
1. Remove centered circular design
2. Move recording controls to top bar or bottom dock
3. Display:
   - Live waveform (small, inline)
   - Timer (12-13px, inline)
   - Record/Stop buttons
4. Recording should not obscure workspace
5. Visual feedback (pulse animation) on recording state
6. Easy access while focused on editor

### Requirement 6: Typography System
**User Story:** As a user, I want consistent, clear typography so that the interface feels professional and readable.

#### Acceptance Criteria
1. Font: Inter or system-ui
2. Hierarchy enforced:
   - Titles: 28-32px, bold, #F5F5F5
   - Sections: 18-20px, semibold, #E5E5E5
   - Body: 15-16px, regular, #D1D5DB
   - Metadata: 12-13px, regular, #9CA3AF
3. No visual clutter (no excessive icons)
4. Text is the primary interface (minimal iconography)
5. Line height: relaxed (1.6+)
6. Letter spacing: natural (no excessive tracking)

### Requirement 7: Color System - Dark Mode
**User Story:** As a user, I want a cohesive dark color system so that the interface is easy on the eyes and feels professional.

#### Acceptance Criteria
1. Background colors:
   - Main: #0B0F14
   - Panels: #111827
   - Hover: #1F2937
   - Active: #27364E (with accent border)
2. Text colors:
   - Primary: #FFFFFF (high contrast)
   - Secondary: #E5E5E5
   - Muted: #9CA3AF (metadata)
3. Accent color: ONE primary (blue or purple)
   - Used ONLY for:
     - Active states (border/highlight)
     - Cursor/progress indicators
     - Timeline progress
     - Primary buttons
4. No secondary colors (keep it minimal)

### Requirement 8: Motion System - Subtle & Precise
**User Story:** As a user, I want smooth, purposeful interactions so that the interface feels responsive without being distracting.

#### Acceptance Criteria
1. All interactions use transform + opacity only (no layout shifts)
2. Hover animations:
   - Scale: 1.02
   - Duration: 150-200ms
   - Easing: ease-out
3. Click animations:
   - Scale: 0.97
   - Duration: 100ms
   - Easing: ease-in
4. Panel transitions:
   - Slide + fade
   - Duration: 200-250ms
5. Timeline scrubbing:
   - Smooth, no frame drops
   - Progress updates continuously
6. Editor focus:
   - Soft highlight animation
   - Duration: 200ms
7. NO flashy animations
8. All animations test well at 60fps

### Requirement 9: Remove Anti-Patterns
**User Story:** As a user, I want a clean, uncluttered interface so that nothing feels template-like or outdated.

#### Acceptance Criteria
1. Remove heavy card designs (flat, subtle borders only)
2. Remove large centered empty states (compact guidance)
3. Remove overuse of blue backgrounds (use accent sparingly)
4. Remove static UI elements (everything responds to interaction)
5. Remove thick borders (max 1px)
6. Remove unnecessary shadows (subtle only)

### Requirement 10: Pricing Page
**User Story:** As a user or prospect, I want a clear pricing page so that I understand plans and can decide to upgrade.

#### Acceptance Criteria
1. Route: `/pricing`
2. Header section:
   - Title: "Simple Pricing"
   - Short subtitle
   - Minimal decoration
3. Pricing tiers displayed:
   - Free (left)
   - Pro (center, highlighted)
   - Team (right, optional)
4. Each tier shows:
   - Plan name
   - Price (large, bold)
   - Feature list (clean, compact)
   - CTA button
5. Pro tier highlighted with:
   - Subtle accent border
   - Slight scale (1.02)
   - Higher visual prominence
6. Style:
   - Flat design (NO heavy cards)
   - Subtle borders only
   - Typography-driven
   - Dark mode consistent with app

## Glossary
- **Panel**: A column/section in the 3-panel layout
- **Accent color**: Primary interactive color (e.g., #3B82F6)
- **Scrubbing**: Dragging timeline indicator to seek
- **Waveform**: Visual representation of audio amplitude
- **Transform**: CSS transform property (scale, translateX, etc.)

## Implementation Notes
- All changes must preserve existing authentication logic
- Recording/playback functionality must remain intact
- No breaking changes to API contracts
- Must work on desktop (primary target)
- Dark mode is default (light mode optional future phase)
