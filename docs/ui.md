# GYM — UI Design System & Tokens

Extracted from `/design/Design System & Components/design-tokens.png` and `component-library.png`.

## Theme: ELECTRIC VOLT DARK (AMOLED Optimized)

### 1. Color Palette

#### Backgrounds & Surfaces
- `--bg-background`: `#0A0A0A` (Pure Dark AMOLED Base)
- `--bg-surface`: `#1A1A1A` (Card and List Module Base)
- `--bg-elevated`: `#242424` (Elevated controls, active rows, dialogs)
- `--border-subtle`: `#2A2A2A` (Borders & dividers)

#### Brand / Accent (Electric Volt)
- `--color-primary`: `#B4FF39` (Signature Electric Neon Green/Volt)
- `--color-primary-hover`: `#C5FF66`
- `--color-primary-soft`: `#B4FF3920` (12-20% opacity volt for tags & selected highlights)
- `--color-primary-active-state`: `#84CC16`

#### Text Hierarchy
- `--text-primary`: `#FFFFFF` (100% white for high legibility)
- `--text-secondary`: `#A0A0A0` (Muted labels, metadata, units)
- `--text-muted`: `#666666` (Inactive icons, placeholders, subtle hints)

#### System Status Colors
- `--status-success`: `#4CAF50` (Green completed checks, synced state)
- `--status-warning`: `#FFC107` (Amber offline mode banner, sync pending)
- `--status-error`: `#EF4444` (Red error badges, delete actions, failed sync)

---

### 2. Typography Tokens

- **Font Family**: Inter, Roboto, or System Sans-serif; Geist Mono / SF Mono for timers and numerical metrics.

| Token | Size | Weight | Line Height | Use Case |
|---|---|---|---|---|
| **Display** | 36px | Bold (700) | 1.0 | Hero Headings |
| **H1** | 28px | Bold (700) | 1.2 | Page Titles (e.g. `MY ROUTINES`, `EXERCISES`) |
| **H2** | 24px | Semibold (600) | 1.2 | Card Titles, Section Headers |
| **H3** | 20px | Semibold (600) | 1.2 | Modal Titles, Group Headers |
| **Body Large** | 18px | Regular (400) | 1.4 | Prominent descriptions, sub-headings |
| **Body** | 16px | Regular (400) | 1.4 | Default body, form inputs |
| **Body Small** | 14px | Regular (400) | 1.4 | Secondary details, metadata |
| **Caption** | 12px | Regular (400) | 1.2 | Micro tags, timestamps, badges |
| **Button** | 16px | Semibold (600) | 1.0 | Action CTAs |
| **Timer** | 48px | Bold (700) Mono | 1.0 | Rest Timer countdown (`01:43`) |
| **Numeric** | 32px | Bold (700) Mono | 1.0 | Target weight & reps (`32.5 kg × 10`) |

---

### 3. Spacing System
- `space-4`: 4px
- `space-8`: 8px
- `space-12`: 12px
- `space-16`: 16px
- `space-20`: 20px
- `space-24`: 24px
- `space-32`: 32px
- `space-40`: 40px
- `space-48`: 48px

---

### 4. Radius Tokens
- `radius-sm`: 8px (Inner controls, small chips)
- `radius-md`: 12px (Form inputs, stepper controls, secondary buttons)
- `radius-lg`: 16px (Card containers, list items)
- `radius-card`: 20px (Primary cards, modal sheets)
- `radius-hero`: 24px (Large featured hero cards)
- `radius-pill`: 9999px (Status badges, pill chips, action pills)

---

### 5. Shadow Tokens
- `shadow-sm`: `0 2px 4px rgba(0,0,0,0.5)`
- `shadow-md`: `0 4px 16px rgba(0,0,0,0.6)`
- `shadow-lg`: `0 8px 32px rgba(0,0,0,0.8)`
- `shadow-volt`: `0 0 20px rgba(180, 255, 57, 0.35)`

---

### 6. Component Catalog & Variants
1. **Buttons**:
   - `Primary`: Neon Electric Volt background (`#B4FF39`), black bold text (`#000000`).
   - `Secondary`: Dark surface (`#242424`), white text.
   - `Ghost`: Transparent background, white or volt text.
   - `Danger`: Deep red (`#EF4444`), white text.
   - `IconButton`: Circular / rounded square with centered icon.
2. **Inputs & Steppers**:
   - Text Input, Search Input with search icon, Number Stepper with `-` and `+` touch buttons, Unit inputs (`kg`, `reps`).
3. **Chips / Badges**:
   - Muscle chips (idle `#242424`, active `#B4FF39` / volt pill), Status badges (`ACTIVE`, `LAST WEEK`, `ONLINE`, `PENDING`).
4. **Cards**:
   - Today Session Card, Routine Card, Exercise Card, Metric Summary Card, PR Record Card.
5. **Workout Mode Components**:
   - Active Set Highlight Row (Volt border or subtle volt background), Circular Rest Timer Ring with SVG stroke-dasharray animation, Next Exercise Drawer.
6. **Navigation**:
   - Bottom Tab Bar: 5 items (Home, Workouts, Exercises, Progress, Profile) with active volt indicator and glowing green icon.
