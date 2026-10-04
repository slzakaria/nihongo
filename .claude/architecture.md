src/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx                    # Landing / home
│   ├── scenarios/
│   │   ├── page.tsx                    # Scenario selection grid
│   │   └── [slug]/
│   │       └── page.tsx                # Scenario detail + phrase list
│   ├── flashcards/
│   │   ├── page.tsx                    # Session config (scenario picker, mode)
│   │   └── [slug]/
│   │       └── page.tsx                # Active flashcard session
│   ├── simulator/
│   │   ├── page.tsx                    # Scenario picker for simulation
│   │   └── [slug]/
│   │       └── page.tsx                # Active sim conversation
│   ├── quick-ref/
│   │   └── [slug]/
│   │       └── page.tsx                # Printable/saveable cheat sheet
│   └── api/
│       └── simulator/
│           └── route.ts                # Claude API proxy (server-side only)
├── components/
│   ├── ui/                             # shadcn base components
│   ├── phrases/
│   │   ├── PhraseCard.tsx
│   │   ├── PhraseList.tsx
│   │   └── AudioButton.tsx
│   ├── flashcards/
│   │   ├── FlashcardDeck.tsx
│   │   ├── FlashcardFace.tsx           # front / back faces
│   │   └── ProgressBar.tsx
│   ├── simulator/
│   │   ├── SimulatorChat.tsx
│   │   ├── SimulatorMessage.tsx
│   │   └── ScenarioPrompt.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── ScenarioSidebar.tsx
├── lib/
│   ├── data/
│   │   └── phrases.ts                  # The JSON, typed and exported
│   ├── srs/
│   │   └── sm2.ts                      # Spaced repetition algorithm
│   ├── tts/
│   │   └── speak.ts                    # Web Speech API wrapper
│   └── simulator/
│       └── prompts.ts                  # System prompts per scenario
├── hooks/
│   ├── useFlashcardSession.ts
│   ├── useSRS.ts
│   └── useAudio.ts
├── store/
│   └── progress.ts                     # Zustand store
└── types/
    └── index.ts                        # Phrase, Scenario, SRSCard types