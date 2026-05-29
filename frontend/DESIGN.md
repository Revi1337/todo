# Design System: Personal Todo Dashboard

## 1. Visual Theme & Atmosphere
A highly refined, premium personal dashboard. The atmosphere is focused and tranquil, blending the precision of a productivity tool with the aesthetic depth of a modern gallery. It employs **Mesh Gradient & Ambient Glow** backgrounds (like an Aurora) to provide a soft, dreamy underlay that shifts beautifully between light and dark modes. The UI feels alive through perpetual micro-interactions, where cards float slightly on hover with diffused, soft shadows.

## 2. Color Palette & Roles
- **Canvas Base** (#F8FAFC) — Primary background surface in light mode (Slate-50)
- **Night Canvas** (#09090B) — Primary background surface in dark mode (Zinc-950)
- **Pure Surface** (#FFFFFF / #18181B) — Card and container fill (White / Zinc-900)
- **Charcoal Ink** (#0F172A) — Primary text, Slate-900 depth
- **Muted Steel** (#64748B) — Secondary text, descriptions, metadata (Slate-500)
- **Whisper Border** (rgba(226,232,240,0.5) / rgba(39,39,42,0.5)) — Card borders, 1px structural lines
- **Indigo Accent** (#6366F1) — Single accent for CTAs, active states, priority indicators
- **Aurora Glows** — Soft, heavily blurred patches of #6366F1, #A855F7, and #3B82F6 placed strategically in the background (using 100px+ blur).

## 3. Typography Rules
- **Display:** Geist — Track-tight, controlled scale, weight-driven hierarchy. Used for page titles and large data numbers.
- **Body:** Geist — Relaxed leading, 65ch max-width, neutral secondary color.
- **Mono:** Geist Mono — For code, metadata, timestamps, high-density numbers (e.g., stats).
- **Banned:** Inter, generic system fonts, serif fonts. 

## 4. Component Stylings
* **Buttons:** Flat, no outer glow. Tactile -1px translate on active. Accent fill for primary, ghost/outline for secondary.
* **Cards:** Generously rounded corners (1.5rem). Diffused whisper shadow (very soft, wide spread). Hover state triggers a subtle `-translate-y-1` and slightly deepens the shadow.
* **Inputs/Selects:** Label above, error below. Focus ring in Indigo Accent. No floating labels. Background should have subtle Glassmorphism (`backdrop-blur-md` with semi-transparent fill) if floating over the Aurora background.
* **Header/Sidebar:** Must employ Glassmorphism (`backdrop-blur-lg`, `bg-white/70` or `bg-zinc-950/70`) to let the underlying Mesh Gradient softly peek through.
* **Loaders:** Skeletal shimmer matching exact layout dimensions. No circular spinners.
* **Empty States:** Composed, illustrated compositions — not just "No data" text.

## 5. Layout Principles
Grid-first responsive architecture. The Stats dashboard uses a Bento Grid Layout with varied card sizes perfectly aligning on a grid.
Strict single-column collapse below 768px. Max-width containment (e.g., 1400px centered) for the main dashboard area.
No flexbox percentage math. Generous internal padding (e.g., p-6 or p-8 inside cards).

## 6. Motion & Interaction
Spring physics for all interactive elements (stiffness: 100, damping: 20).
Staggered cascade reveals when lists (Todo items) mount.
Perpetual micro-loops on active dashboard components.
Hardware-accelerated transforms only (translate, scale, opacity).

## 7. Anti-Patterns (Banned)
- No emojis anywhere.
- No `Inter` font.
- No generic serif fonts.
- No pure black (`#000000`).
- No neon/outer glow shadows.
- No oversaturated accents.
- No excessive gradient text on large headers.
- No custom mouse cursors.
- No overlapping elements — clean spatial separation always.
- No 3-column equal card layouts (use Bento grid instead).
- No generic names ("John Doe", "Acme").
- No fabricated data or statistics.
- No AI copywriting clichés ("Elevate", "Seamless", "Unleash", "Next-Gen").
- No filler UI text: "Scroll to explore", "Swipe down", scroll arrows.
- No broken image links.
