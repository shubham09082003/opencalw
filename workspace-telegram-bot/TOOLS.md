# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## Gog (Google Workspace CLI)

- **Binary:** `C:\Tools\gog.exe`
- **Account:** `aman765265yadav@gmail.com`
- **Services:** gmail, calendar, drive, contacts, sheets, docs, slides, tasks, chat, forms, classroom, appscript, people

### Quick Commands
```powershell
# Gmail: last 5 emails
C:\Tools\gog.exe gmail search 'newer_than:7d' --max 5 --json

# Calendar: upcoming events
C:\Tools\gog.exe calendar events primary --from 2026-03-01 --to 2026-03-07

# Set default account (optional)
$env:GOG_ACCOUNT = "aman765265yadav@gmail.com"
```

## SerpAPI

- **Key:** Configured in `~/.openclaw/openclaw.json` under `env.SERPAPI_KEY`
- **Default location:** India (`gl: "in"`)
- **Free tier:** 100 searches/month

### Usage
- Shopping search: Use `serpapi_shopping` tool for product prices
- Web search: Use `serpapi_search` tool for general results

---

Add whatever helps you do your job. This is your cheat sheet.