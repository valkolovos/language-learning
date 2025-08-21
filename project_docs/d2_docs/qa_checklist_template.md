# QA Checklist — D2 Chunk Practice (Template)

## A. Visible States and Controls
- [ ] Start control appears on entry.
- [ ] Prompt to speak is visible for each phrase.
- [ ] Attempt controls (Speak/Stop/Retry/Continue/Skip) behave per rules.
- [ ] Feedback labels match copy deck: Clear / Almost / Try again.

## B. Feedback Rules
- [ ] Clear enables Continue, marks phrase completed.
- [ ] Almost shows one micro-tip and enables Retry.
- [ ] Try again shows one micro-tip and enables Retry.
- [ ] Micro-tips do not appear on Clear.
- [ ] Micro-tips rotate without repeats until exhausted.

## C. Progression & Completion
- [ ] Skip appears after the configured minimum attempts.
- [ ] Excessive attempts trigger a gentle nudge.
- [ ] Completion summary lists attempts per phrase and tips shown.
- [ ] Optional XP nudge appears if enabled.

## D. Accessibility
- [ ] Full keyboard operability; visible focus states.
- [ ] Feedback does not rely on color alone.
- [ ] Screen reader announces feedback changes politely.
- [ ] Quiet-mode guidance is available.

## E. Resilience
- [ ] Mic blocked/unavailable shows clear message and Retry.
- [ ] Silent/very short attempt returns Try again + micro-tip.
- [ ] Generic failures recover without losing place.

## F. Analytics (names & moments only)
- [ ] practice_started on open.
- [ ] attempt_started on attempt begin (phrase id).
- [ ] feedback_shown with state.
- [ ] micro_tip_shown with phrase & tip ids.
- [ ] phrase_completed with phrase id.
- [ ] practice_completed on summary.

## G. Cross-Coverage Matrix (suggested)
| Phrase | Attempt #1 | Attempt #2 | Attempt #3 | Skip available | Clear path | Almost path | Try again path |
|-------:|------------|------------|------------|----------------|------------|-------------|----------------|

> Expand, add data combinations, and record evidence (screens/notes).
