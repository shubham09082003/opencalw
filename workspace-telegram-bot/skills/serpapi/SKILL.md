---
name: serpapi
description: Search Google with SerpAPI for prices, shopping results, and web search. Use when user asks about product prices, shopping comparisons, or needs structured search results. Requires SERPAPI_KEY environment variable.
---

# SerpAPI Search Skill

Search Google with SerpAPI for prices, shopping, and web results.

## Setup

1. Get API key from https://serpapi.com (free tier: 100 searches/month)
2. Set environment variable:
   ```bash
   # Windows PowerShell
   [Environment]::SetEnvironmentVariable("SERPAPI_KEY", "your-api-key", "User")
   
   # Or add to openclaw.json:
   # "env": { "SERPAPI_KEY": "your-api-key" }
   ```

## Usage

### Price/Shopping Search
```
Use serpapi_shopping for product prices
```

### Web Search
```
Use serpapi_search for general web results
```

### Parameters
- `query` (required): Search query
- `location` (optional): Location for localized results (e.g., "India", "New York")
- `gl` (optional): Country code (e.g., "in" for India, "us" for USA)
- `hl` (optional): Language code (e.g., "en")

## Example Queries
- "iPhone 16 price in India"
- "Samsung Galaxy S24 price comparison"
- "best laptop under 50000"
- "PS5 price near me"

## Notes
- Free tier: 100 searches/month
- Paid plans: https://serpapi.com/pricing
- Shopping results include: title, price, source, link, thumbnail