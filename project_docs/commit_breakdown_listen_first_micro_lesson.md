# Commit Breakdown - Listen-First Micro-Lesson Implementation

This document breaks down the implementation of the **Listen-First: Meet & Greet** micro-lesson into logical, incremental commits that follow the suggested implementation order from the deliverable specification.

## Implementation Strategy

Each commit builds incrementally on the previous ones, allowing for testing and validation at each step. The order follows the "fastest proof-of-value" approach recommended in the specification.

---

## Commit 1: Foundation - Content Representation & Basic Structure
**Scope:** Track A1, A2 - Content representation and audio association

**Goals:**
- Define lesson data models/schemas
- Set up basic project structure
- Create content loading mechanism
- Establish audio file association patterns
- Add basic error handling for malformed content

**Files to create/modify:**
- Data models for lesson content
- Content loading service
- Basic project structure setup

**Acceptance Criteria:**
- Lesson can be loaded at runtime
- Fields are available to the UI
- Malformed content is handled gracefully
- Audio associations are established

---

## Commit 2: Core Audio Playback Engine
**Scope:** Track B1 - Single-stream audio playback

**Goals:**
- Implement audio playback service
- Handle single clip at a time logic
- Add start/end/error event handling
- Clean up listeners between plays
- Surface errors to UI layer

**Files to create/modify:**
- Audio service/manager
- Event handling system
- Error handling for audio failures

**Acceptance Criteria:**
- Starting a new clip stops the previous one
- Listeners are cleaned up properly
- Errors are surfaced in the UI
- Single stream playback works reliably

---

## Commit 3: Reveal Gate Logic
**Scope:** Track B2 - Reveal gate implementation

**Goals:**
- Implement play counting logic
- Gate state management (locked/unlocked)
- Validation that only complete plays count
- Computed `can_reveal` state

**Files to create/modify:**
- Gate logic service
- Play counter/validator
- State management for reveal status

**Acceptance Criteria:**
- Incomplete/errored/aborted plays do not increment
- `can_reveal` state becomes true only after two verified completions
- Gate logic is robust and predictable

---

## Commit 4: Basic Lesson UI Container
**Scope:** Track C1 - Lesson container with listen-first interface

**Goals:**
- Create lesson container component
- Pre-reveal UI (hint + play control)
- Hide all text until gate unlocks
- Record `lesson_started` event

**Files to create/modify:**
- Main lesson component
- Pre-reveal UI components
- Basic event recording

**Acceptance Criteria:**
- On lesson open, `lesson_started` is recorded
- Pre-reveal shows only listening controls and hint
- No text is visible before gate unlocks

---

## Commit 5: Main Play Control & Gate Unlocking
**Scope:** Track C2, C3 - Play control and reveal interaction

**Goals:**
- Main play button with visual states
- Gate unlocking after 2 complete plays
- Reveal action appearance
- `text_revealed` event recording

**Files to create/modify:**
- Play control component
- Reveal button/action
- State transitions for gate unlocking

**Acceptance Criteria:**
- After exactly two full plays, gate state becomes unlocked
- Reveal action becomes available and enabled
- Clear visual feedback for idle/playing/completed states

---

## Commit 6: Post-Reveal Content & Phrase Replays
**Scope:** Track C4 - Phrase replays and full lesson display

**Goals:**
- Display main line text after reveal
- Three phrase items with individual controls
- Phrase replay functionality
- `phrase_replay` event recording
- Single clip at a time enforcement

**Files to create/modify:**
- Phrase display components
- Individual phrase controls
- Replay all functionality

**Acceptance Criteria:**
- Post-reveal shows full main line text and three phrase items
- Phrase replays provide clear playing feedback
- Only one clip plays at a time
- `phrase_replay` events are recorded with phrase identifiers

---

## Commit 7: Transcript Toggle
**Scope:** Track C5 - Transcript functionality

**Goals:**
- Transcript control (post-reveal only)
- Show/hide learner gloss/translation
- Toggle without layout jumps
- Proper focus management

**Files to create/modify:**
- Transcript toggle component
- Gloss/translation display
- Smooth toggle animations

**Acceptance Criteria:**
- Transcript is not available pre-reveal
- After reveal, transcript can be toggled
- Toggle works without layout jumps or loss of focus

---

## Commit 8: Accessibility & Keyboard Navigation
**Scope:** Track D1, D2 - Keyboard operability and screen reader support

**Goals:**
- Full keyboard navigation
- Logical focus order
- Screen reader labels and announcements
- Focus visibility indicators
- ARIA attributes

**Files to create/modify:**
- Keyboard navigation handlers
- Focus management
- Screen reader announcements
- Accessibility attributes

**Acceptance Criteria:**
- Every interactive control is operable using keyboard alone
- Focus order is logical: Play → Reveal → phrase items → Replay all → Transcript
- Visible focus outlines
- Screen reader announces playback changes appropriately

---

## Commit 9: Error Handling & Resilience
**Scope:** Track D3 - Error states and retry functionality

**Goals:**
- Audio error display
- Retry mechanisms
- Gate protection during failures
- Clear error messaging

**Files to create/modify:**
- Error display components
- Retry functionality
- Error state management

**Acceptance Criteria:**
- On audio failure, clear error message and retry action are shown
- Gate never increments on failure
- Interface remains navigable
- Retry attempts are possible

---

## Commit 10: Progress Indicators & XP (Optional)
**Scope:** Track C6 - Visual progress and XP

**Goals:**
- Progress indicator (0-100%)
- XP counter increments
- Local-only, non-persistent
- Visual feedback for key actions

**Files to create/modify:**
- Progress indicator component
- XP counter display
- Visual feedback components

**Acceptance Criteria:**
- Progress indicator reaches 100% once text is revealed
- XP counters increment on key actions
- All indicators are local, non-persistent, and never block usage

---

## Commit 11: Event Instrumentation
**Scope:** Track B3 - Lightweight telemetry

**Goals:**
- `lesson_started` events
- `audio_play` events
- `text_revealed` events
- `phrase_replay` events
- Simple event recording mechanism

**Files to create/modify:**
- Event recording service
- Event data structures
- Simple storage/logging

**Acceptance Criteria:**
- All four key events are captured
- Events are recorded in simple, inspectable form
- No external services required
- Events include necessary identifiers

---

## Commit 12: Testing & Quality Assurance
**Scope:** Track E1-E4 - All quality checks

**Goals:**
- Unit tests for gate logic
- Interaction tests for state transitions
- End-to-end test scenarios
- Performance validation
- BDD test implementation

**Files to create/modify:**
- Unit test suites
- Integration tests
- E2E test scenarios
- Performance tests
- BDD test implementations

**Acceptance Criteria:**
- Gate logic tests cover happy path and edge cases
- Interaction tests confirm state transitions and visibility rules
- E2E tests validate critical user journeys
- Performance tests ensure audio starts within ~1 second

---

## Commit 13: Documentation & Handoffs
**Scope:** Track F1-F3 - Copy, quick-start, and QA checklist

**Goals:**
- Centralized microcopy
- Quick-start instructions
- QA checklist
- Implementation notes

**Files to create/modify:**
- Configuration files for copy
- README updates
- QA checklist documentation
- Quick-start guide

**Acceptance Criteria:**
- Microcopy is configurable without code changes
- New contributor can run lesson locally within minutes
- QA checklist provides single source of truth for acceptance
- Clear handoff documentation exists

---

## BDD Test Coverage

The following BDD features will be implemented throughout the commits:

- **listen_first_reveal_gate.feature** - Commits 3, 4, 5
- **phrase_replays_after_reveal.feature** - Commits 6, 8
- **transcript_availability.feature** - Commits 7, 8
- **accessibility_and_input_methods.feature** - Commit 8
- **functional_telemetry.feature** - Commits 4, 5, 6, 11
- **resilience_and_recovery.feature** - Commit 9
- **lightweight_progress_signals.feature** - Commit 10
- **performance_sanity.feature** - Commits 2, 12

---

## Risk Mitigation

- **Early Testing:** Each commit includes basic validation to catch issues early
- **Incremental Validation:** Core functionality is tested before adding complexity
- **Accessibility First:** Accessibility features are built in from the start, not bolted on
- **Error Handling:** Error states are considered throughout, not as an afterthought

---

## Success Metrics

- **Time to First Audio:** ≤ 1 second on typical laptop
- **Gate Logic Accuracy:** 100% correct play counting
- **Accessibility:** Full keyboard and screen reader support
- **Error Recovery:** 100% graceful degradation on failures
- **Test Coverage:** All BDD scenarios pass
- **Performance:** UI remains responsive during audio playback

---

## Notes for Implementation

- Follow the suggested implementation order for fastest proof-of-value
- Each commit should be independently testable
- Focus on core functionality before adding polish features
- Keep audio local and avoid external dependencies
- Maintain focus on the listen-first learning pattern
- Document any deviations from the specification
