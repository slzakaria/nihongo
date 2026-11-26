# Flashcard spaced repetition

Flashcard reviews use a fixed-step schedule, not SM-2:

| Rating | Next review | Active-session behavior                  |
| ------ | ----------- | ---------------------------------------- |
| Again  | 30 seconds  | Repeat until rated Good or Easy          |
| Hard   | 10 minutes  | Repeat until rated Good or Easy          |
| Good   | 1 day       | Finish this card for the current session |
| Easy   | 3 days      | Finish this card for the current session |

Again and Hard cards wait until the rest of the initially available set has been attempted. If no card is ready, keep the session open and show a countdown. Scenario phrase progress and its difficulty labels are separate from flashcard SRS progress and ratings; only phrase content is shared.

Scheduling logic belongs in `src/lib/srs/scheduler.ts`, session ordering in `src/lib/flashcards/sessionQueue.ts`, and session state in `src/hooks/useFlashcardSession.ts`.
