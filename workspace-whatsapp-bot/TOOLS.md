# TOOLS.md - WhatsApp Job Poster Agent

This agent handles the job posting workflow from WhatsApp to LinkedIn with AI-generated posters.

## Skills

### 1. Job Poster (`job-poster`)

**Generates AI-powered recruitment posters using Replicate (openai/gpt-image-1.5).**

**How it works:**
1. Takes job details (title, company, location, salary, skills)
2. Builds prompt with exact text for the poster
3. Calls Replicate API (openai/gpt-image-1.5)
4. Returns high-quality WebP image with job details

**Requirements:**
- `REPLICATE_API_TOKEN` - Replicate API token (get from https://replicate.com/account/api-tokens)

**Usage:**
```
Use job-poster skill to create AI poster:
- title: "Full Stack Developer"
- company: "Excellence Technologies"
- location: "Noida, India"
- type: "FULL_TIME"
- salary: "3-4 LPA"
- skills: ["JavaScript", "React.js", "Node.js", "MongoDB"]
```

**Output:** WebP poster image with job details

### 2. LinkedIn Poster (`linkedin-poster`)

**Posts job posters as LinkedIn feed posts with images and captions.**

**Requirements:**
- `LINKEDIN_ACCESS_TOKEN` - Personal LinkedIn access token (recommended)
- OR `LINKEDIN_CLIENT_ID` + `LINKEDIN_CLIENT_SECRET` for OAuth app
- `LINKEDIN_ORGANIZATION_URN` - For company page posts (optional)

**Usage:**
```
Use linkedin-poster skill to post:
- posterPath: /path/to/poster.webp
- title: "Full Stack Developer"
- company: "Excellence Technologies"
- location: "Noida, India"
- type: "FULL_TIME"
- description: "..."
- applyUrl: "https://company.com/careers/..."
```

**Output:** LinkedIn post URL

## Workflow

```
WhatsApp User
     │
     ├── 1. Send job details
     │      (title, company, location, type, salary, skills)
     │
     ├── 2. AI Poster Generation
     │      • Build prompt with exact text
     │      • Call Replicate API (openai/gpt-image-1.5)
     │      • Generate recruitment poster
     │
     ├── 3. Show poster for confirmation
     │      "Does this look good? Reply Yes to post, No to edit."
     │
     └── 4. Post to LinkedIn (if confirmed)
            • Upload poster image
            • Post with auto-generated caption
            • Return LinkedIn post URL
```

## Environment Variables

Set these in `~/.openclaw/openclaw.json`:

```json
{
  "env": {
    "REPLICATE_API_TOKEN": "r8_xxxxx...",     // For AI poster generation
    "LINKEDIN_ACCESS_TOKEN": "AQXxx..."        // For LinkedIn posting
  }
}
```

### Get Replicate Token

1. Go to https://replicate.com/account/api-tokens
2. Create or copy your API token
3. Paste into config

### Get LinkedIn Token

1. Go to https://www.linkedin.com/developers/tools/oauth-token-generator
2. Select permissions: `openid`, `profile`, `w_member_social`, `email`
3. Generate and copy token

## LinkedIn Caption Format

Auto-generated caption with hashtags:

```
🚀 We're Hiring! Full Stack Developer at Excellence Technologies

📍 Location: Noida, India
💼 Type: Full-time
💰 Salary: 3-4 LPA

[Description preview...]

✅ Requirements:
   • JavaScript
   • React.js
   • Node.js
   • MongoDB

👉 Apply here: [URL]

#hiring #jobopening #career #jobs
```

## Notes

- AI generates unique poster for each job (no duplicates)
- Uses Replicate's openai/gpt-image-1.5 model
- Always confirm before posting to LinkedIn
- Supports multiple industries with themed design