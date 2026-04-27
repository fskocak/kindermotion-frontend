# Design System Document: Editorial Soft Minimalism

## 1. Overview & Creative North Star: "The Serene Curator"
This design system is built to transcend the "utility-first" look of standard SaaS platforms. Our Creative North Star is **The Serene Curator**. We treat digital interfaces not as a collection of boxes, but as a high-end editorial layout—think of a premium architectural magazine where the white space is as functional as the content itself.

To achieve this, we move away from rigid, boxed-in grids. We embrace **intentional asymmetry**, where a headline might hang over a card boundary, and **tonal depth**, where elements are separated by soft shifts in light rather than harsh lines. The goal is an interface that feels "effortless" to the user, reducing cognitive load through a "calm-tech" philosophy.

---

## 2. Color & Surface Architecture
Our palette avoids the sterile "pure white" (#FFFFFF) in favor of a sophisticated, low-strain off-white.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders for sectioning or containment. 
Boundaries must be defined through **Background Color Shifts**. For instance, a `surface-container-low` section should sit directly on a `surface` background. The eye should perceive the change in depth through the shift in lightness, not a structural wire.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine paper or frosted glass. Use the following hierarchy to create "nested" importance:
- **Surface (Base):** `#f7f9fb` — The primary canvas.
- **Surface-Container-Low:** `#f2f4f6` — Use for secondary content areas or sidebar foundations.
- **Surface-Container-Lowest:** `#ffffff` — Reserved for the "top-most" active cards to create a natural, bright lift.
- **Glassmorphism:** For top navigation and sidebars, use `surface` at 70% opacity with a `20px` backdrop-blur. This allows content to "ghost" behind the navigation, maintaining a sense of spatial awareness.

### Signature Accents
- **Primary (KinderMotion Blue):** `#006591` for high-contrast actions.
- **Primary-Container:** `#0ea5e9` for subtle background washes behind icons or active states.
- **Secondary (Soft Emerald):** `#006c49` for success states and growth-oriented callouts.
- **Signature Gradient:** For Hero CTAs, use a linear gradient from `primary` (#006591) to `primary-container` (#0ea5e9) at a 135° angle. This adds "soul" and professional depth.

---

## 3. Typography: The Editorial Voice
We use **Plus Jakarta Sans** exclusively. Its geometric clarity combined with soft apertures creates a "Friendly Professional" tone.

*   **Display (Scale: 3.5rem to 2.25rem):** Used for high-impact editorial moments. Use `-0.02em` letter spacing to keep it tight and authoritative.
*   **Headlines (Scale: 2rem to 1.5rem):** These are the anchors of your page. Never center-align long headlines; keep them flush left to maintain the "Editorial" grid.
*   **Body (Scale: 1rem to 0.875rem):** Set at `on-surface-variant` (#3e4850) to ensure readability without the harshness of pure black.
*   **The Power of Labels:** Use `label-md` (0.75rem) in all-caps with `0.05em` letter spacing for categories or small eyebrow text to introduce a premium, "catalog" feel.

---

## 4. Elevation & Depth: Tonal Layering
We do not use elevation to "lift" objects off a page; we use it to "layer" them.

*   **The Layering Principle:** Place a `surface-container-lowest` (#ffffff) card on a `surface-container-low` (#f2f4f6) background. The 3% difference in lightness is enough to create a "soft lift" that feels premium and integrated.
*   **Ambient Shadows:** If a floating element (like a Modal or Dropdown) is required, use a "Cloud Shadow": `Y: 12px, Blur: 32px, Color: rgba(25, 28, 30, 0.06)`. The shadow must be tinted with the `on-surface` color to avoid a "dirty" grey look.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility in input fields, use `outline-variant` (#bec8d2) at **20% opacity**. It should be felt, not seen.

---

## 5. Components & Interaction Patterns

### Buttons
- **Primary:** Gradient-filled (Primary to Primary-Container), `xl` roundedness (3rem), no shadow.
- **Secondary:** `surface-container-highest` background with `on-surface` text. 
- **Interaction:** On hover, the button should scale to `102%` rather than changing color harshly. This mimics a tactile, physical response.

### Cards & Lists
- **No Dividers:** Prohibit the use of horizontal lines to separate list items. Use **Spacing Scale 4** (1.4rem) to create separation through "breathing room."
- **Nesting:** Place a white card on a light gray background. Use `md` (1.5rem) or `lg` (2rem) corner radius.

### Input Fields
- **Soft Minimalist Inputs:** Use a `surface-container-low` background with no border. On focus, transition the background to `surface-container-lowest` (white) and add a `2px` signature blue "Ghost Border" at 40% opacity.

### Glassmorphism Navigation
- Sidebars and Top Bars must use the "Frosted" effect. Use a subtle `1px` white inner-stroke at 10% opacity on the top edge to simulate the "glint" of a glass sheet.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Let a photo or a large headline break the vertical alignment of the columns below it.
*   **Use the Spacing Scale:** Stick strictly to the defined increments (e.g., use `16` (5.5rem) for section padding) to ensure the "breathing room" feels intentional.
*   **Layer Surfaces:** Think of the UI as a series of 3D planes.

### Don't:
*   **Don't use 1px Borders:** Never use a solid grey line to separate content. Use a background color change or whitespace.
*   **Don't use Heavy Shadows:** Avoid "Drop Shadows" that look like they were made in 2010. If it looks "fuzzy," it’s too dark.
*   **Don't Crowd the Content:** If you feel like you need a divider, it usually means you haven't used enough whitespace. Double your padding before you reach for a line.
*   **Don't use Pure Black:** Always use `on-surface` (#191c1e) or `on-surface-variant` (#3e4850) for text to maintain the "Soft Minimalist" aesthetic.