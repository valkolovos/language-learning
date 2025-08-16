# Deliverable 1 — AI‑Executable Task Breakdown (Implementation‑Agnostic)

This breaks the **Listen‑First: Meet & Greet** specification into small, outcome‑focused tasks an AI agent can complete end‑to‑end **without prescribing a tech stack, file layout, or framework**. The agent may choose any suitable approach.

**Scope assumptions**
- Lesson pattern: one **main line** (a short greeting) and **three supporting phrases**.
- **Listen‑first gate**: written text remains hidden **until the main line has been fully played at least twice**. Partial or failed plays don’t count.
- Local playback only; no accounts or server round‑trips required.

---

## Track A — Content & Data (what must exist, not how)

**A1. Content representation**
- **Goal:** Provide a representation for a lesson containing: a main line, three phrases, each with native text, a learner‑friendly gloss/translation, optional tips, and a reference to an audio clip.
- **Acceptance:** The lesson can be loaded at runtime; fields are available to the UI; malformed content is handled gracefully (error surfaced, app still usable).

**A2. Audio association**
- **Goal:** Establish a way to associate each line/phrase with a playable audio source.
- **Acceptance:** Each content item resolves to a playable clip; naming/IDs are consistent; guidance exists for audio normalization (volume and loudness) and clip length (≤ ~2.5s per item).

---

## Track B — Playback & Gating Logic

**B1. Single‑stream audio playback**
- **Goal:** Provide a playback capability that plays one audio clip at a time and exposes start/end/error signals.
- **Acceptance:** Starting a new clip stops the previous one; listeners are cleaned up; errors are surfaced in the UI.

**B2. Reveal gate**
- **Goal:** Implement logic that unlocks text **only after two complete plays** of the main line.
- **Acceptance:** Incomplete/errored/aborted plays do not increment; a computed `can reveal?` state becomes true only after two verified completions.

**B3. Event instrumentation (lightweight)**
- **Goal:** Capture a minimal set of usage events for later inspection.
- **Events:** `lesson_started`, `audio_play` (with clip identifier), `text_revealed`, `phrase_replay` (with phrase identifier).
- **Acceptance:** Events are recorded in a simple, inspectable form (e.g., buffered in memory or logged) without requiring external services.

---

## Track C — User Experience (behaviors, not components)

**C1. Lesson container**
- **Goal:** Present a minimal interface with: a hint to listen first, a primary Play control for the main line, and no visible text before the gate unlocks.
- **Acceptance:** On lesson open, `lesson_started` is recorded; pre‑reveal, only listening controls and hint are visible.

**C2. Main Play control**
- **Goal:** Allow the learner to play/replay the main line, with clear visual feedback for idle/playing/completed.
- **Acceptance:** After exactly two full plays, the gate state becomes unlocked and a reveal action becomes available.

**C3. Reveal interaction**
- **Goal:** When the gate is unlocked, provide a clear action to reveal the text and the rest of the lesson.
- **Acceptance:** On reveal, show the full main line text, phrase items, a **Replay all** action, and a **Transcript** toggle; record `text_revealed` once.

**C4. Phrase replays**
- **Goal:** Allow tapping/clicking each phrase to hear its audio with visible playing state and accessible feedback.
- **Acceptance:** Rapid replays are handled; only one clip plays at a time; `phrase_replay` is recorded with the associated phrase.

**C5. Transcript toggle**
- **Goal:** Provide a control to show/hide the learner gloss/translation after reveal.
- **Acceptance:** Transcript is not available pre‑reveal; after reveal it can be toggled without layout jumps or loss of focus.

**C6. Progress indicator & XP (optional, visual only)**
- **Goal:** Provide a lightweight visual indicator of progress and an XP counter that increments on key actions.
- **Acceptance:** Indicator reaches 100% once text is revealed; counters are local, non‑persistent, and never block usage.

---

## Track D — Accessibility & Resilience

**D1. Keyboard & focus**
- **Goal:** Ensure full keyboard operability with logical focus order: Play → (after gate) Reveal → phrase items → Replay all → Transcript.
- **Acceptance:** Visible focus outlines; Space/Enter activate controls; no keyboard traps.

**D2. Screen reader affordances**
- **Goal:** Provide descriptive labels and polite announcements for state changes (e.g., when a phrase starts/stops playing).
- **Acceptance:** A screen reader announces playback start/stop and the current phrase; controls have descriptive names.

**D3. Error states & retry**
- **Goal:** On audio load/playback failure, show a clear error message and a retry action.
- **Acceptance:** The gate never increments on failure; the interface remains navigable; retry attempts are possible.

---

## Track E — Quality Checks (tool‑agnostic)

**E1. Unit‑level checks**
- **Goal:** Validate the gate logic: exactly two complete plays unlock reveal; partials/errors do not.
- **Acceptance:** Tests/assertions cover happy path and edge cases.

**E2. Interaction checks**
- **Goal:** Validate pre‑ vs. post‑reveal behaviors: phrase controls disabled/hidden pre‑reveal; transcript toggle only available post‑reveal.
- **Acceptance:** Automated checks confirm state transitions and visibility rules.

**E3. End‑to‑end checks**
- **Goal:** Validate critical journeys: (1) two plays → reveal available; (2) reveal → phrase replays show playing state; (3) simulate audio error → retry works and gate remains locked.
- **Acceptance:** Checks use stable selectors not tied to user‑visible copy.

**E4. Performance sanity**
- **Goal:** Keep time‑to‑first‑audio low.
- **Acceptance:** On a typical laptop, audio begins within ~1 second of pressing Play when assets are local.

---

## Track F — Copy & Handoffs

**F1. Microcopy (configurable)**
- **Goal:** Centralize learner‑facing strings so they can be edited without code changes.
- **Suggested defaults:**
  - Pre‑reveal hint: “Listen first. Text appears after you replay.”
  - Reveal action: “Show text”
  - Post‑reveal hint: “Tap a phrase to hear it again.”
  - Error: “Couldn’t play audio. Check your sound and try again.”

**F2. Quick‑start notes**
- **Goal:** Brief instructions so a new contributor can run the lesson locally and know where to place audio clips.
- **Acceptance:** A newcomer can launch a local build, drop in audio assets, and exercise the QA checklist within a few minutes.

**F3. QA checklist (copyable)**
- **Goal:** Provide a single source of truth for acceptance.
- **Checklist:**
  - [ ] Pre‑reveal shows no text; only listening controls and the pre‑reveal hint.
  - [ ] After the 2nd full play, a reveal action appears and is enabled.
  - [ ] Post‑reveal shows main text, three phrase controls, Replay all, and a Transcript toggle.
  - [ ] Phrase replays provide clear playing feedback; only one clip plays at a time.
  - [ ] Transcript is unavailable pre‑reveal; appears post‑reveal and toggles cleanly.
  - [ ] Audio error path shows message; Retry works; gate never increments on failure.
  - [ ] Keyboard: order is logical; focus is visible; activation works.
  - [ ] Screen reader: labels and announcements are meaningful.
  - [ ] Events: the four key events are captured by the chosen mechanism.
  - [ ] Performance: first audio starts promptly; UI remains responsive.

---

## Suggested Implementation Order (fastest proof‑of‑value)
1) A1 → C1 (content is loadable; lesson opens with listen‑first UI)
2) B1/B2 → C2 (playback works; gate unlocks at 2 full plays)
3) C3/C4/C5 (reveal + phrase replays + transcript)
4) D1/D2/D3 (accessibility + error handling)
5) C6 (optional progress/XP)
6) E1–E4 (quality checks)
7) F1–F3 (copy & handoff docs)

---

## Out‑of‑Scope Guardrails
- No speech recording, scoring, accounts, or external servers.
- Keep audio local and short; avoid cloud media dependencies.
- Progress/XP are visual only; no persistence required.

---

## Agent Objectives (high‑level, stack‑agnostic)
1) Introduce a lesson content representation you can load at runtime.
2) Implement robust single‑stream audio playback and gate logic (2 full plays → reveal).
3) Provide reveal interaction, phrase replays, replay‑all, and a transcript toggle.
4) Meet accessibility and resilience requirements.
5) Add automated checks using tools of your choice.
6) Deliver concise run notes and a QA checklist for the next contributor.

