---
name: linkedin-poster
description: Post job posters as LinkedIn feed posts with images. Requires LinkedIn Developer App with proper OAuth credentials.
metadata:
  openclaw:
    emoji: "💼"
    requires:
      env: ["LINKEDIN_ACCESS_TOKEN"]
---

# LinkedIn Poster Skill

Post job posters as LinkedIn feed posts with images and captions.

## Prerequisites

### Option 1: Personal Access Token (Recommended)

1. Go to https://www.linkedin.com/developers/tools/oauth/token-generator
2. Generate a token with these permissions:
   - `openid` - Basic profile info
   - `profile` - Profile access
   - `w_member_social` - Post on behalf of member
   - `email` - Email access
3. Copy the access token

### Option 2: OAuth App (For Company Pages)

1. Create a LinkedIn Developer App at https://developer.linkedin.com
2. Add products: "Share on LinkedIn", "Sign In with LinkedIn"
3. Get Client ID and Client Secret
4. Get your Organization URN for company posts

## Setup

### Environment Variables

Add to `~/.openclaw/openclaw.json`:

```json
{
  "env": {
    "LINKEDIN_ACCESS_TOKEN": "your-personal-access-token"
  }
}
```

For company page posts, also add:

```json
{
  "env": {
    "LINKEDIN_CLIENT_ID": "your-client-id",
    "LINKEDIN_CLIENT_SECRET": "your-client-secret",
    "LINKEDIN_ORGANIZATION_URN": "urn:li:organization:12345678"
  }
}
```

## Usage

### Post an Image with Caption

```
Use linkedin-poster skill to post image:
- imagePath: /path/to/poster.png
- text: "🚀 We're hiring! Check out this opportunity..."
- isCompany: false (optional, set true for company page)
```

### Post Job Poster

```
Use linkedin-poster skill to post job:
- title: "Senior Software Engineer"
- company: "Tech Corp"
- location: "Bangalore, India"
- type: "FULL_TIME"
- salary: "₹15-25 LPA"
- description: "We are looking for..."
- requirements: "Python, React, AWS"
- applyUrl: "https://company.com/apply"
- posterPath: /path/to/generated/poster.png
```

### Get Your Profile Info

```
node scripts/linkedin.js --profile
```

## API Flow

1. **Upload Image** → Register upload → Upload to URL → Wait for processing
2. **Create Post** → Post with image URN and caption
3. **Return** → Post URL

## Features

- ✅ Post images to LinkedIn feed
- ✅ Auto-generate captions from job details
- ✅ Support for personal and company page posts
- ✅ Hashtags auto-generation
- ✅ Error handling and retries

## Generated Caption Format

```
🚀 We're Hiring! [Job Title] at [Company]

📍 Location: [Location]
💼 Type: Full-time/Part-time/etc.
💰 Salary: [Salary]

[Description preview...]

✅ Requirements:
   • Requirement 1
   • Requirement 2

👉 Apply here: [URL]

#hiring #jobopening #career #jobs
```

## Workflow Integration

1. **Job Poster Skill** generates poster image
2. **User confirms** the poster looks good
3. **LinkedIn Poster Skill** uploads image and posts with caption
4. **Returns** LinkedIn post URL

---

For LinkedIn API docs, see: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/ugc-post-api