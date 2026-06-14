# Kruzo Document AI Web

Landing page for Kruzo Document AI, a document automation product for service businesses.

## Sections

- Navbar
- Hero
- Problem
- Solution workflow
- Use cases
- How it works
- FAQ
- Free workflow audit CTA
- Footer

## Development

Install dependencies:

```bash
npm install
```

Run the local dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Key Files

- `src/data/siteDetails.ts` controls SEO title, description, and site details.
- `src/data/menuItems.ts` controls navigation links.
- `src/data/hero.ts` controls hero copy and CTA links.
- `src/data/landing.tsx` controls problem, workflow, use case, how-it-works, and audit highlights.
- `src/data/faq.ts` controls FAQ content.
- `src/data/footer.ts` controls footer links and footer copy.
- `src/app/globals.css` controls global theme colors, dark mode tokens, reusable brand classes, and motion utilities.

## Branding And Theme

Kruzo uses a lime-and-ink visual system:

- Kruzo Lime: `#C7EA46`
- Kruzo Lime Strong: `#BFE53B`
- Midnight Ink: `#0C120F`
- Soft Stone: `#F5F7F2`
- Graphite: `#1A1F1C`
- Muted gray-green: `#6B746D`
- Soft border: `#D9DED6`

The light and dark themes are driven by CSS variables in `src/app/globals.css`. The header theme toggle lives in `src/components/ThemeToggle.tsx`, stores the selected theme in `localStorage` under `kruzo-theme`, and applies the `dark` class plus `data-theme` on the root `<html>` element. `src/app/layout.tsx` includes a small boot script so the saved theme is applied before hydration.

The reusable Kruzo logo component lives in `src/components/KruzoLogo.tsx` and supports both `lockup` and `icon` variants. The favicon-like icon asset is `public/kruzo-mark.svg`, and `src/data/siteDetails.ts` points metadata to that mark.
