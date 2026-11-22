# Routes

## Pages

| Route                   | Purpose                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| `/`                     | Landing page: hero, Explore carousel, simulator teaser, featured scenarios, and kana teaser |
| `/scenarios`            | Browse travel scenarios and study progress                                                  |
| `/scenarios/[slug]`     | Scenario phrases, responses, audio, and filtering                                           |
| `/flashcards`           | Configure a phrase review session                                                           |
| `/flashcards/[slug]`    | Spaced-repetition review session                                                            |
| `/flashcards/bookmarks` | Review saved phrases                                                                        |
| `/kana`                 | Browse hiragana and katakana                                                                |
| `/kana/practice`        | Review kana cards that are due                                                              |
| `/offline-practice`     | Prepare and enter offline phrase and kana practice                                          |
| `/simulator`            | Choose a role-play scenario                                                                 |
| `/simulator/[slug]`     | Continue an AI conversation for a scenario                                                  |
| `/speaking/[slug]`      | Speak a scenario phrase and view pronunciation feedback                                     |
| `/quick-ref/[slug]`     | Print or save a compact scenario phrase reference                                           |
| `/profile`              | View account progress, saved phrases, goals, milestones, and preferences                    |
| `/sign-in`, `/sign-up`  | Clerk authentication                                                                        |
| `/auth/error`           | Authentication error guidance                                                               |

## API routes

| Route                     | Purpose                                              |
| ------------------------- | ---------------------------------------------------- |
| `/api/account/delete`     | Delete the signed-in account and associated app data |
| `/api/admin/users`        | Admin user-management endpoint                       |
| `/api/practice/score`     | Score speaking-practice audio                        |
| `/api/simulator`          | Generate a simulator response                        |
| `/api/simulator/feedback` | Generate feedback for a simulator conversation       |
| `/api/stt`                | Transcribe speech                                    |
| `/api/tts`                | Generate Japanese speech audio                       |
| `/api/word`               | Look up a word                                       |
