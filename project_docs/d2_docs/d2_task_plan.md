# D2 — Chunk Practice: AI Agent Task Plan (Implementation-Agnostic)

## 1) Define the problem and success criteria
- Write a concise problem statement for “chunk practice”: a short speaking exercise that helps learners master 2–3 tiny, real-world phrases.
- Success criteria (first slice):
  - The learner can complete a 1–2 minute practice for 3 phrases.
  - Each attempt receives lightweight feedback: **Clear / Almost / Try again**.
  - Micro-tips appear only when needed and are phrase-specific.
  - A completion summary shows attempts per phrase and tips surfaced.

## 2) Select the practice set
- Choose exactly 3 short meet & greet phrases aligned with the D1 scope (e.g., greeting, name, polite close).
- Create a micro-tip library per phrase (3–5 items). Constraints:
  - ≤ 60 characters per tip, no jargon.
  - Phrase-specific (avoid generic advice).

## 3) Map the learner journey
- Steps: enter → prompt to speak → attempt → feedback → (retry or next) → completion.
- Describe visible states and controls per step (labels from the copy deck). Keep it minimal and consistent.
- Provide sample on-screen copy for each state.

## 4) Specify feedback states and rules
- **Clear**: attempt meets the acceptance threshold; allow “Continue”.
- **Almost**: acceptable proximity but needs refinement; allow “Retry” and show one micro-tip.
- **Try again**: insufficient; allow “Retry” and show one micro-tip.
- Do not describe algorithms or thresholds—only learner-facing behavior.

## 5) Define micro-tip behavior
- Show exactly one micro-tip on **Almost** or **Try again**.
- Rotate tips across attempts for the same phrase (no repeats until exhausted).
- Placement: adjacent to feedback; short and scannable.

## 6) Progression and completion rules
- A phrase is marked completed on the first **Clear**.
- Provide an optional **Skip** after a minimal number of attempts (define the number).
- Include a safeguard for excessive attempts (define maximum) with a gentle nudge.
- Completion summary includes attempts per phrase, list of tips shown, and a review suggestion.

## 7) Accessibility requirements
- Keyboard operability for all interactive elements; visible focus indicators.
- Feedback uses text and/or affordances not relying on color alone.
- Screen reader announcements for feedback changes (polite timing, no chatter).
- Offer guidance for learners in quiet/no‑mic environments.

## 8) Resilience & empty/error states
- If speaking input is unavailable/blocked: show a clear message with Retry and alternative navigation.
- Very short/silent attempts: treat as **Try again**; show one micro-tip.
- Generic failure: show a general error; allow retry without losing place.

## 9) Functional analytics catalog (names & moments only)
- `practice_started` — when practice opens.
- `attempt_started` — when a phrase attempt begins (include phrase identifier).
- `feedback_shown` — when feedback is shown (include state).
- `micro_tip_shown` — when a micro-tip appears (phrase_id, tip_id).
- `phrase_completed` — when a phrase is marked complete (phrase identifier).
- `practice_completed` — when the completion summary appears (overall counts).

## 10) Copy deck
- Finalize concise labels for controls and states.
- Phrase-specific micro-tips (3–5 per phrase), ≤ 60 chars.
- Error and guidance messages.
- Tone: encouraging, factual, non‑jargony.

## 11) QA plan
- Map testable acceptance criteria to each state, control, and rule.
- Coverage: feedback states × phrases × attempt counts × accessibility modes.
- Include resilience scenarios (no input, silent input, generic failure).

## 12) Review bundle
- Deliver: functional spec (this plan), copy deck, BDD feature files, analytics catalog, QA checklist.
