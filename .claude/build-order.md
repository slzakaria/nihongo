Data + types — drop the JSON in, write the types, export helpers (getPhrasesBySlug, getAllPhrases)
Scenario list + detail pages — static, no state, gets the content visible fast
Zustand store + fixed-step SRS scheduler — the flashcard engine, fully unit-testable in isolation
Flashcard session — the core learning loop
TTS integration — one hook, plug into phrase cards
Simulator API route + chat UI — Claude integration last, depends on nothing else
