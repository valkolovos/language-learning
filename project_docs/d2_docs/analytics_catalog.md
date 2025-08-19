# Analytics Event Catalog — D2 Chunk Practice (Conceptual)

> Names and moments only. No technical schemas or vendor specifics.

## Events
1. practice_started
   - Moment: Practice opens.
   - Minimal props: practice_id (or equivalent), user/session identifier (minimal).

2. attempt_started
   - Moment: Learner begins an attempt for a phrase.
   - Minimal props: phrase_id.

3. feedback_shown
   - Moment: Feedback appears after an attempt.
   - Minimal props: state (Clear | Almost | Try again).

4. micro_tip_shown
   - Moment: A micro-tip is displayed.
   - Minimal props: phrase_id, tip_id.

5. phrase_completed
   - Moment: A phrase is marked completed.
   - Minimal props: phrase_id.

6. practice_completed
   - Moment: Completion summary is displayed.
   - Minimal props: total_attempts, phrases_completed, phrases_skipped.
