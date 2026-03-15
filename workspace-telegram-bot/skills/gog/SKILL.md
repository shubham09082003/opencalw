---
name: gog
description: Google Workspace CLI for Gmail, Calendar, Drive, Contacts, Sheets, and Docs.
homepage: https://gogcli.sh
metadata: {"clawdbot":{"emoji":"🎮","requires":{"bins":["gog"]},"install":[{"id":"manual","kind":"manual","bins":["gog"],"label":"Binary at C:\\Tools\\gog.exe"}]}}
---

# gog

Use `gog` for Gmail/Calendar/Drive/Contacts/Sheets/Docs. Requires OAuth setup.

**Binary location:** `C:\Tools\gog.exe` — Use full path in commands.

**Authenticated account:** `aman765265yadav@gmail.com` (services: gmail, calendar, drive, contacts, sheets, docs, etc.)

## Setup (already done)
- `C:\Tools\gog.exe auth credentials /path/to/client_secret.json`
- `C:\Tools\gog.exe auth add you@gmail.com --services gmail,calendar,drive,contacts,sheets,docs`
- `C:\Tools\gog.exe auth list`

## Common commands
- Gmail search: `C:\Tools\gog.exe gmail search 'newer_than:7d' --max 10`
- Gmail send: `C:\Tools\gog.exe gmail send --to a@b.com --subject "Hi" --body "Hello"`
- Calendar events: `C:\Tools\gog.exe calendar events <calendarId> --from <iso> --to <iso>`
- Drive search: `C:\Tools\gog.exe drive search "query" --max 10`
- Contacts: `C:\Tools\gog.exe contacts list --max 20`
- Sheets get: `C:\Tools\gog.exe sheets get <sheetId> "Tab!A1:D10" --json`
- Sheets update: `C:\Tools\gog.exe sheets update <sheetId> "Tab!A1:B2" --values-json '[["A","B"],["1","2"]]' --input USER_ENTERED`
- Sheets append: `C:\Tools\gog.exe sheets append <sheetId> "Tab!A:C" --values-json '[["x","y","z"]]' --insert INSERT_ROWS`
- Sheets clear: `C:\Tools\gog.exe sheets clear <sheetId> "Tab!A2:Z"`
- Sheets metadata: `C:\Tools\gog.exe sheets metadata <sheetId> --json`
- Docs export: `C:\Tools\gog.exe docs export <docId> --format txt --out /tmp/doc.txt`
- Docs cat: `C:\Tools\gog.exe docs cat <docId>`

## Notes
- Set `GOG_ACCOUNT=aman765265yadav@gmail.com` env var to avoid repeating `--account`.
- For scripting, prefer `--json` plus `--no-input`.
- Sheets values can be passed via `--values-json` (recommended) or as inline rows.
- Docs supports export/cat/copy. In-place edits require a Docs API client (not in gog).
- Confirm before sending mail or creating events.
