---
name: job-poster
description: Generate professional job posters. Uses AI (Replicate) when available, falls back to beautiful TEAL DARK template.
metadata:
  openclaw:
    emoji: "📋"
    requires:
      bins: ["node"]
      env: ["REPLICATE_API_TOKEN"]
---

# Job Poster Skill

Generate professional job posters with AI-powered design or elegant template fallback.

## How It Works

1. **Primary: AI Generation** — Uses Replicate SDK with `openai/gpt-image-1.5` to generate unique recruitment posters
2. **Fallback: Template** — When AI is unavailable (no credits, no token, or API error), automatically falls back to the beautiful TEAL DARK template
3. **Seamless Switch** — No user intervention needed; the system handles fallback automatically

## Templates Available

### TEAL DARK (Default Fallback)
- Deep teal textured background
- Large yellow corner blobs
- Line-art megaphone decoration
- "WE ARE HIRING" huge white bold text
- White rounded pill for job title
- REQUIREMENT badge with italic list
- "SEND CV TO" button with email pill

## Prerequisites

### Replicate API Token (Optional)

For AI-generated posters:
1. Go to https://replicate.com/account/api-tokens
2. Create a new token (or copy existing)
3. Add to `~/.openclaw/openclaw.json`:

```json
{
  "env": {
    "REPLICATE_API_TOKEN": "r8_xxxxx..."
  }
}
```

**Note:** Replicate requires credits. If you run out, the system automatically falls back to the template.

### For Template-Only (No AI)

If `REPLICATE_API_TOKEN` is not set, the skill uses the template immediately without attempting AI generation.

## Installation

```bash
cd {baseDir}
npm install
```

## Usage

### Generate Poster (Auto Mode)

```javascript
const { generatePoster } = require('./scripts/poster.js');

const job = {
  title: "Full Stack Developer",
  company: "Excellence Technologies",
  location: "Noida, Uttar Pradesh",
  type: "FULL_TIME",
  salary: "3-4 LPA",
  experience: "2-4 Years",
  skills: ["React.js", "Node.js", "MongoDB"],
  email: "careers@excellencetech.com"
};

const result = await generatePoster(job);
// result.posterPath: /path/to/poster.png
// result.aiGenerated: true/false
// result.templateBased: true/false (when template used)
// result.template: "TEAL_DARK" (when template used)
```

### CLI Usage

```bash
# Auto mode (AI first, template fallback)
node scripts/poster.js '{"title":"Software Engineer","company":"TechCorp","location":"Bangalore"}'

# Test mode
node scripts/poster.js --test '{"title":"Developer","company":"Test","location":"Remote"}'
```

## Job Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | Job title |
| `company` | ✅ | Company name |
| `location` | ⚪ | Job location |
| `type` | ⚪ | Employment type: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP |
| `salary` | ⚪ | Salary range (e.g., "3-4 LPA") |
| `experience` | ⚪ | Experience required (e.g., "2-4 Years") |
| `skills` | ⚪ | Array of skills (shows top 5) |
| `email` | ⚪ | Contact email (shown in poster) |
| `education` | ⚪ | Education requirement |
| `workMode` | ⚪ | Work mode: Remote, Hybrid, On-site |
| `shift` | ⚪ | Shift timing |
| `workingDays` | ⚪ | Working days |
| `requirements` | ⚪ | Array of requirements (shows top 7) |

## Output

| Field | Description |
|-------|-------------|
| `posterPath` | Path to generated PNG image |
| `aiGenerated` | `true` if AI-generated |
| `templateBased` | `true` if template used |
| `template` | Template name (e.g., "TEAL_DARK") |

## Behavior Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     generatePoster(job)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────┐
                │ REPLICATE_API_TOKEN set? │
                └─────────────────────────┘
                    │               │
                   YES              NO
                    │               │
                    ▼               ▼
        ┌───────────────────┐    ┌───────────────────┐
        │ Try AI Generation │    │ Use Template       │
        │ via Replicate API │    │ (TEAL DARK)        │
        └───────────────────┘    └───────────────────┘
                    │
                    ▼
        ┌───────────────────┐
        │ AI Success?       │
        └───────────────────┘
            │           │
           YES          NO
            │           │
            ▼           ▼
    ┌─────────────┐  ┌───────────────────┐
    │ Return AI   │  │ Fallback Template │
    │ Poster      │  │ (TEAL DARK)        │
    └─────────────┘  └───────────────────┘
```

## Workflow Integration

1. **Receive job details** from WhatsApp user
2. **Generate poster** (AI or template fallback)
3. **Show poster** for user confirmation
4. **Post to LinkedIn** via linkedin-poster skill (if confirmed)

---

This skill works with the `linkedin-poster` skill for the complete workflow.