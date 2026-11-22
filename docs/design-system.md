# Hanazono Design System

This guide documents the visual system used across the app. The implementation source of truth is `src/app/globals.css`, with font loading in `src/app/layout.tsx` and shared UI patterns in `src/components/`.

## Design principles

- Use the shared semantic tokens for page surfaces, text, borders, and focus states.
- Keep the warm, quiet light theme and the deep navy dark theme visually related.
- Use pink, blue, and peach as coordinated accents; avoid introducing unrelated accent colors or gradients.
- Keep interactive controls consistent in shape and hierarchy. Use existing button variants and component styles.
- Pair every component-specific color treatment with a deliberate dark-mode treatment.
- Prefer spacing and subtle borders over elevation; reserve stronger contrast for primary actions and focus indicators.

## Color tokens

| Token                    | Light     | Dark      | Intended use                 |
| ------------------------ | --------- | --------- | ---------------------------- |
| `--background`           | `#faf7f4` | `#12151f` | Page surface                 |
| `--foreground`           | `#2d2520` | `#e8eaf6` | Primary text                 |
| `--card`                 | `#ffffff` | `#1e1e2e` | Card surfaces                |
| `--card-foreground`      | `#2d2520` | `#e8eaf6` | Text on cards                |
| `--primary`              | `#d4537e` | `#378add` | Primary actions and emphasis |
| `--primary-foreground`   | `#ffffff` | `#ffffff` | Text on primary surfaces     |
| `--secondary`            | `#fce4ee` | `#2d1f28` | Secondary surfaces           |
| `--secondary-foreground` | `#993556` | `#ed93b1` | Text on secondary surfaces   |
| `--muted`                | `#fdf6f0` | `#1a1f2e` | Quiet surfaces               |
| `--muted-foreground`     | `#8a7470` | `#8893b0` | Secondary text               |
| `--accent`               | `#faeada` | `#2a2018` | Warm accent surfaces         |
| `--accent-foreground`    | `#8a5030` | `#fac775` | Text on accent surfaces      |
| `--border`               | `#f0d8cc` | `#2d3450` | Borders and dividers         |
| `--ring`                 | `#d4537e` | `#85b7eb` | Keyboard focus rings         |

Use the corresponding Tailwind semantic classes such as `bg-background`, `text-foreground`, `bg-card`, `border-border`, and `ring-ring`. Keep new raw color values in `globals.css`, not scattered through component markup.

### Page background

The page uses a fixed, full-page gradient rather than a flat background:

- Light: `#faf7f4` → `#fdf6f0` → `#f4f0fc`
- Dark: `#12151f` → `#1a1f2e` → `#16122a`

The header, footer, and homepage sections should blend with this shared page surface. Do not give a section a separate full-width background unless the design explicitly calls for it.

## Typography and brand

- **Inter** is the primary interface and Latin text font.
- **Noto Serif JP** is the Japanese serif face and the Hanazono wordmark face. Keep Japanese text marked with `lang="ja"` so font fallback and language tooling work correctly.
- **Geist Mono** is reserved for code-like or monospaced content.
- The logo lockup is the `public/hanazono.svg` mark plus `花園 - はなぞの`. Header and footer use the same lockup and `.navbar-logo` theme colors.

## Layout and responsive behavior

- Use the centered `max-w-5xl` content width for primary page content.
- Keep a consistent `3.5rem` vertical gap between major homepage sections.
- Homepage order: Hero → Explore → Simulator → Popular scenarios → Kana.
- The Explore carousel remains a single horizontal row. It is safely centered when all cards fit; when it overflows, it uses scroll snapping and visible left/right controls. Cards are capped at `220px`; on mobile they use `43.7vw` with a `152px` minimum.
- The simulator teaser stacks on small screens and becomes a two-column layout at the `md` breakpoint. Its section shares the page background.
- The Kana teaser uses five columns by default, eight at `sm`, and five again at `lg`, producing five characters per row on desktop.
- Keep scenario cards compact and let their imagery support, rather than dominate, their content.

## Components and interaction

- Use the shared `Button` component and its existing variants for CTAs. Avoid mixing unrelated filled, ghost, and gradient treatments within one control group.
- Flashcard grades share an outlined shape and use coordinated Again/Hard/Good/Easy colors; their labels and grade meaning must remain clear without color alone.
- Explore cards use related pink, blue, and peach tints. Their icon background should match the card’s tone.
- Preserve visible keyboard focus, accessible labels for icon-only controls, and sufficient contrast in both themes.

## Where to make changes

- Global tokens, gradients, type roles, and component-specific theme styles: `src/app/globals.css`
- Font registration and root layout: `src/app/layout.tsx`
- Navbar and footer wordmark: `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`
- Homepage composition and Explore carousel: `src/app/(marketing)/page.tsx`
- Simulator teaser: `src/components/marketing/SimulatorTeaser.tsx`
- Kana teaser: `src/components/marketing/KanaTeaser.tsx`
