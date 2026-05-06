# AI Daily

Bilingual (DE/EN) AI news site for personal learning. One edition per day at
18:00 Europe/Berlin, generated automatically by a scheduled Claude Code routine.

**Live:** https://saadel123.github.io/ai-daily-news/

## File layout

```
.
├── index.html              # archive landing page (lists all editions)
├── editions.json           # manifest — one entry per published edition
├── template.html           # canonical structural reference (NEVER overwrite from routine)
├── assets/
│   ├── style.css           # shared CSS — referenced with ?v=N for cache-busting
│   └── site.js             # shared JS — referenced with ?v=N
├── editions/
│   └── YYYY-MM-DD.html     # one bilingual edition per day
└── README.md
```

## How editions are produced

A scheduled remote routine runs every day at 18:00 Europe/Berlin and:

1. Reads `editions.json` via the GitHub Contents API
2. WebSearches AI sources for the last 7 days (Anthropic, OpenAI, Google,
   Mistral, HackerNews) and Claude Code releases
3. Filters duplicates and items that don't pass the quality bar
4. Generates 5 main articles + 1 hack-of-the-day with parallel DE/EN columns,
   inline vocab annotations, idioms
5. PUTs `editions/YYYY-MM-DD.html` and updates `editions.json`
6. Posts a one-line link to Slack `#ai-news`

The routine prompt is configured in claude.ai/code/routines, not in this repo.
Authentication uses a fine-grained GitHub PAT scoped to this repo only
(Contents: Read+Write).

## Editorial style — canonical reference

`editions/2026-05-06.html` is the reference for tone, layout, structure:

- **Bilingual prose:** DE left, EN right; same paragraph order; not literal translations
- **Inline vocab:** `<mark class="vocab" data-translation="word — meaning">word</mark>` (3-4 per DE paragraph)
- **CLI commands:** prose stays bilingual without backticks or flag mentions; commands go in `<section class="cmd-card">` after `.article-body`. See the Claude Code 2.1.126 article in 2026-05-06 as the canonical implementation.
- **Mixed-language register:** keep English tech terms in German prose where natural ("im Dry-Run", "der Branch", "ein Slash-Command")
- **Article ids:** main articles `id="article-1".."article-5"`, hack `id="hack"`; glance bullets wrap content in `<a href="#article-N">`

## Cache-busting

`assets/style.css` and `assets/site.js` are referenced with a version query (`?v=N`).

**Bump `N` ONLY when the contents of `assets/style.css` or `assets/site.js` actually change.** Do not bump for HTML edits, content updates, README changes, routine-prompt changes, or any other file change.

When CSS or JS does change:

1. Edit `assets/style.css` and/or `assets/site.js`
2. Increment the version number in `template.html` and `index.html` (e.g. `?v=2` → `?v=3`) — both `<link>` and `<script src>` tags
3. Commit and push everything in the same commit
4. Old editions keep their old `?v` (still serve the latest CSS — same file URL — just don't get cache-busted automatically). New routine-generated editions inherit the bumped version from `template.html`.

## Manual edit workflow

1. Make changes to local files (from the repo root)
2. Preview: `open editions/2026-05-06.html` (or any specific edition / `index.html`)
3. Confirm visually before pushing
4. Commit + push
5. After GitHub Pages redeploys (~1 min), hard-refresh (Cmd+Shift+R) once to bypass cache

## Don'ts

- Never write to `template.html` from the routine — it's the canonical reference
- Never re-inline CSS or JS into HTML files — keep them in `assets/` only
- Don't include secrets (PAT, API keys) in any committed file
- Don't pad slow news days with weak articles — the routine has a hard floor
  (2 main + 1 hack); below that, abort the edition

## TTS voice quality

Pages use the browser's Web Speech API. For best DE/EN voice quality, open in
**Microsoft Edge** (Microsoft Online Neural Voices) or download macOS Premium
voices via System Settings → Accessibility → Spoken Content.
