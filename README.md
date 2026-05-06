# AI Daily

Tägliche KI-News auf Deutsch und Englisch — mit Vorlesefunktion (TTS), Vokabel-Highlights und Redewendungen. Daily AI news in German and English with click-to-listen, vocabulary highlights, and idioms.

**Live:** https://saadel123.github.io/ai-daily-news/

## What it is

A static site that publishes one bilingual page per weekday. Each edition contains:

- 📋 *Heute auf einen Blick* — at-a-glance headlines
- 🟧 Anthropic & Claude updates
- 🌐 General AI news (OpenAI, Google, Mistral, etc.)
- 💡 Hack of the day
- 📚 5 vocabulary highlights with example sentences (DE/EN, audible)
- 💬 Idioms and native phrases

Built for slow reading and fast learning: parallel German/English columns, click-to-listen for any paragraph, hover tooltips on highlighted vocabulary, dark/light theme, mobile-friendly.

## How it works

Pages are generated automatically every weekday morning at 08:00 Europe/Berlin by a scheduled remote agent (Claude Code Routine). The agent fetches news from Anthropic, OpenAI, Google, Mistral, HackerNews, and curated AI newsletters, then writes a new `YYYY-MM-DD.html` file into this repo and updates `editions.json` with the new entry.

The TTS uses the browser's Web Speech API — no external service, no audio files. Just open a page and click 🔊.

## Structure

```
.
├── index.html          # archive landing page (lists all editions)
├── editions.json       # manifest of all published editions
├── YYYY-MM-DD.html     # one page per weekday
└── README.md
```

## Local preview

Just open any `.html` file in your browser. No build step. No server needed.
