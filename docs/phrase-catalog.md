# Phrase catalog

The bundled phrase catalog currently contains **38 categories and 653 phrase
entries**: 36 travel scenarios and two learning/reference categories. Counts are
phrase entries in `scenarios` from
[`src/lib/data/phrases.json`](../src/lib/data/phrases.json); a phrase used in
more than one context counts once in each category.

## Difficulty tiers

Phrase and kana entries use **Easy**, **Medium**, **Hard**, and **Expert**.
The original two content levels map to Easy and Medium; selected phrases with
more complex constructions or specialized language were promoted to Hard or
Expert. Kana entries remain Easy or Medium because the character sets are
foundational rather than advanced phrase material.

| Tier   | Phrase entries |
| ------ | -------------: |
| Easy   |            380 |
| Medium |            218 |
| Hard   |             40 |
| Expert |             15 |

Flashcard ratings use the same labels for recall strength but are separate from
the content difficulty badges: Again, Hard, Medium, Easy, and Expert.

## Travel scenarios

| Category                               | Slug                    | Phrases |
| -------------------------------------- | ----------------------- | ------: |
| Greetings & Basics                     | `greetings`             |      11 |
| Shopping                               | `shopping`              |      24 |
| Restaurants                            | `restaurant`            |      53 |
| Getting Around                         | `getting-around`        |      40 |
| Hotel                                  | `hotel`                 |      20 |
| Bar & Cocktails                        | `bar-cocktails`         |      27 |
| Directions                             | `directions`            |       5 |
| Emergencies & Police                   | `emergencies`           |      34 |
| Time & Dates                           | `time-dates`            |      40 |
| Language Barriers                      | `language-barrier`      |      14 |
| Money & Banking                        | `money-banking`         |       8 |
| Airport & Arrival                      | `airport-arrival`       |      11 |
| Post, Parcels & Lost Property          | `lost-property-post`    |      14 |
| Supermarket & Izakaya                  | `supermarket-izakaya`   |       8 |
| Karaoke                                | `karaoke`               |       8 |
| Sento (Public Bath)                    | `sento`                 |       8 |
| Small Talk & Socializing               | `small-talk`            |       4 |
| Onsen & Hot Springs                    | `onsen`                 |       6 |
| Pharmacy & Health                      | `pharmacy-health`       |      28 |
| About Me                               | `about-me`              |       8 |
| Tickets & Games                        | `tickets-games`         |       9 |
| Bike & Vehicle Rental                  | `bike-rental`           |      32 |
| All-You-Can-Eat & Drink                | `all-you-can-eat`       |      10 |
| Game Centers & Entertainment Complexes | `entertainment-complex` |      15 |
| Coin Laundry                           | `coin-laundry`          |       9 |
| Small Talk with Shop Owners            | `shopkeeper-chat`       |      12 |
| Shinkansen & Train Etiquette           | `shinkansen`            |      10 |
| Weather & Natural Events               | `weather-events`        |      10 |
| Complaints & Apologies                 | `apology-repair`        |      18 |
| Sightseeing & Shrines                  | `shrine-temple`         |      12 |
| Vending Machines                       | `vending-machines`      |      12 |
| Hair Salon & Barber                    | `hair-salon`            |      10 |
| Gym & Fitness                          | `gym-fitness`           |      25 |
| Manga & Anime Shops                    | `otaku-culture`         |      10 |
| Convenience Store & Food               | `konbini-food`          |      20 |
| Making Friends & Exchanging Contact    | `making-friends`        |      10 |

## Learning and reference

| Category                                  | Slug                    | Phrases |
| ----------------------------------------- | ----------------------- | ------: |
| Grammar Connectors: Ordering & Quantities | `grammar-connectors`    |      28 |
| Essential Vocabulary & Adjectives         | `vocabulary-adjectives` |      30 |

## Coverage review

- The smallest categories are Small Talk & Socializing (4), Directions (5), and
  Onsen & Hot Springs (6). Airport & Arrival, Money & Banking, Supermarket &
  Izakaya, Karaoke, Sento, and About Me each have eight phrases. These may be
  intentionally concise, but are the clearest candidates for expansion.
- The 53-phrase restaurant category now includes vegan, stock, ingredient
  exclusion, peanut-allergy, and shrimp/crab-allergy questions in addition to
  the existing egg, wheat, and vegetarian phrases. Allergy wording should still
  be reviewed by a Japanese-speaking food-safety expert.
- Getting Around now includes elevator, step-free-route, and wheelchair-access
  requests, but is still broad and includes taxi/ride-hailing phrases. Future
  growth could separate local transit from taxi/ride-hailing and add IC-card
  top-ups, transfers, service delays, and last trains.
- Airport & Arrival now includes SIM-card, airport Wi-Fi, and phone-charging
  phrases. A dedicated connectivity category may be worthwhile if this topic
  grows beyond arrival needs.
- Accessibility phrases now appear under Transport and Hotel. A dedicated
  accessibility category would make them easier to find if the content expands.
- Bike & Vehicle Rental retains its `bike-rental` slug and illustration while
  acknowledging the motorcycle and car-rental phrases in the category.
- `supermarket-izakaya` still combines two contexts (five supermarket phrases
  and three izakaya phrases). It is grouped under Food & Drink without moving
  existing phrase IDs between scenarios, preserving their current review
  associations.
- The restaurant cards `rs-05b` and `rs-17` retain their IDs but now distinguish
  “Can we pay separately?” from “Could we have separate checks?”
- Onsen's two tattoo questions remain as wording alternatives. Their phrase IDs
  were kept to preserve existing study progress.
- All 623 conversation and scenario phrases now have at least one sample reply
  in [`src/lib/data/phrase-responses.json`](../src/lib/data/phrase-responses.json).
  The remaining 30 entries without replies are vocabulary/adjective reference
  cards; contextual example sentences would be a better fit for those.

## Suggested browse groups

These are proposed directory groups, not a request to merge scenario data.
Keeping existing slugs and phrase IDs stable avoids disrupting links and
phrase-level study state.

- **Conversation & everyday language** (_かいわ・まいにちのことば_): Greetings & Basics, About Me, Small Talk
  & Socializing, Making Friends, Language Barriers, Shopkeeper Chat, and Time &
  Dates.
- **Food & drink** (_たべもの・のみもの_): Restaurants, Convenience Store & Food, Supermarket & Izakaya,
  All-You-Can-Eat & Drink, Bar & Cocktails, and Vending Machines.
- **Transport & stays** (_こうつう・しゅくはく_): Airport & Arrival, Getting Around, Directions, Shinkansen
  & Train Etiquette, Bike Rental, and Hotel.
- **Shopping & services** (_かいもの・サービス_): Shopping, Money & Banking, Post/Parcels & Lost
  Property, and Coin Laundry.
- **Health & safety** (_けんこう・あんぜん_): Emergencies & Police, Pharmacy & Health, and Weather &
  Natural Events.
- **Culture & activities** (_ぶんか・アクティビティ_): Sightseeing & Shrines, Onsen, Sento, Karaoke, Game
  Centers, Tickets & Games, Manga & Anime Shops, Gym & Fitness, and Hair
  Salon & Barber.
- **Learning & reference** (_まなび・さんこう_): Grammar Connectors and Essential Vocabulary &
  Adjectives.

Counts are a snapshot. Update this table when adding or removing categories or
phrases; the JSON files remain the source of truth.
