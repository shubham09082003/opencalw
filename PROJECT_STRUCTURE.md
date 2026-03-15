# Project Structure Documentation

## Main Configuration Files

### `openclaw.json` ⭐ **PRIMARY CONFIG**
- **Purpose**: Main configuration file for the entire OpenClaw system
- **Contains**: 
  - Agent definitions and settings
  - Bot tokens and API keys
  - Workspace configurations
  - Feature flags and options
- **Usage**: Loaded on system startup; defines all agents and their capabilities

### `openclaw.json.bak`, `openclaw.json.bak.1-4`
- **Purpose**: Backup copies of the configuration file
- **Usage**: For rollback if configuration changes break the system

---

## Root Files

| File | Purpose |
|------|---------|
| `.gitignore` | Specifies files to exclude from git (secrets, node_modules, etc.) |
| `gateway.cmd` | Windows batch script for gateway startup |
| `exec-approvals.json` | Execution approval records |
| `update-check.json` | System update tracking |

---

## Directory Structure

### 📁 `agents/` - Multi-Agent System

#### `agents/main/` (Main Agent)
- **Control plane**: Orchestrates other agents
- **Files**: 
  - `agent/`: Configuration and settings
  - `sessions/`: Conversation and state logs (excluded from git)

#### `agents/discord-bot/` (Discord Integration)
- **Purpose**: Handles Discord server interactions
- **Files**:
  - `agent/auth-profiles.json`: Discord auth credentials
  - `agent/auth.json`: Authentication tokens
  - `agent/models.json`: LLM model configurations
  - `sessions/`: Message history and conversations

#### `agents/telegram-bot/` (Telegram Integration)
- **Purpose**: Telegram bot automation
- **Structure**: Similar to Discord bot

#### `agents/whatsapp-bot/` (WhatsApp Integration)
- **Purpose**: WhatsApp messaging automation
- **Structure**: Similar to Discord bot

---

### 📁 `workspace/` ⭐ **PRIMARY WORKSPACE**
- **Main workspace** for the core system
- **Key Files**:
  - `AGENTS.md`: Agent definitions and capabilities
  - `HEARTBEAT.md`: System health and status
  - `IDENTITY.md`: System identity and metadata
  - `SOUL.md`: Core personality and behavior
  - `TOOLS.md`: Available tools and utilities
  - `USER.md`: User information and preferences
- **Subdirectories**:
  - `skills/`: Reusable skill modules (GOG, SerpAPI)
  - `gogcli/`: Go-based CLI tool
  - `.clawhub/`, `.openclaw/`: Internal state and locks

### 📁 `workspace-discord-bot/`, `workspace-telegram-bot/`, `workspace-whatsapp-bot/`
- **Bot-specific workspaces**: Same structure as main workspace but isolated for each bot
- **Purpose**: Allow each bot to have its own tools, skills, and configurations

---

### 📁 `extensions/` - Plugin System

#### `extensions/github-pr-review/`
- **Purpose**: GitHub PR review automation
- **Files**: 
  - `index.ts`: Main plugin code
  - `package.json`: Dependencies
  - `openclaw.plugin.json`: Plugin manifest

#### `extensions/openclaw-web-search/`
- **Purpose**: Web search integration

#### `extensions/serpapi-search/`
- **Purpose**: SerpAPI search integration

---

### 📁 `skills/` - Skill Modules

Re-usable skills available to all workspaces:
- `gog/`: GOG (Go-based operations) skill
- `serpapi/`: SerpAPI search wrapper
- Available in both main and bot workspaces

---

### 📁 `credentials/` - Secure Storage
```
credentials/
├── discord-allowFrom.json    # Discord whitelist
├── discord-pairing.json      # Discord auth pairing
├── telegram-default-allowFrom.json
├── telegram-pairing.json
└── whatsapp/
    └── default/              # WhatsApp credentials
```

---

### 📁 `cron/` - Scheduled Jobs
- `jobs.json` ⭐ **Active jobs** - Current scheduled tasks
- `jobs.json.bak` - Previous job configuration

---

### 📁 `media/` - File Storage
- `inbound/`: User-uploaded files (images, documents)
  - ⚠️ **EXCLUDED FROM GIT** - May contain personal data

---

### 📁 `delivery-queue/` - Message Queue
```
delivery-queue/
├── *.json          # Pending messages
└── failed/         # Failed delivery messages
```

---

### 📁 `devices/` - Device Management
- `paired.json`: Already-paired devices
- `pending.json`: Devices awaiting pairing

---

### 📁 `logs/` - System Logs
- `config-audit.jsonl`: Configuration changes audit trail

---

### 📁 `identity/` - System Identity
- `device.json`: Unique device identifier and metadata

---

### 📁 `memory/` - Agent Memory
- Persistent memory storage for agents
- Conversation history and learned preferences

---

### 📁 `telegram/` - Telegram State
- `update-offset-*.json`: Telegram message offset tracking

---

### 📁 `subagents/` - Sub-Agent Tracking
- `runs.json`: Record of sub-agent executions

---

### 📁 `canvas/` - UI/Frontend
- `index.html`: Web interface (if applicable)

---

### 📁 `completions/` - Shell Completions
- `openclaw.bash`, `openclaw.zsh`, `openclaw.ps1`, `openclaw.fish`
- Shell autocompletion scripts for the CLI

---

## File Relationships

```
openclaw.json (PRIMARY)
├── Defines all agents
├── Points to workspace/
├── Includes credentials/
└── Loads from agents/*/agent/

Main Process Flow:
openclaw.json → agents/main/ → workspace/ → skills/ → extensions/
                ├→ agents/discord-bot/ → workspace-discord-bot/
                ├→ agents/telegram-bot/ → workspace-telegram-bot/
                └→ agents/whatsapp-bot/ → workspace-whatsapp-bot/
```

---

## .gitignore Rules

Files **excluded from git**:
- `node_modules/` - npm dependencies
- `workspace*/client_secret.json` - OAuth secrets
- `agents/*/sessions/` - Conversation history
- `credentials/` - Service credentials
- `media/inbound/` - User uploads
- `.env*` - Environment variables
- `*.token` - API tokens
- `*.bak*` - Backup files

---

## Quick Reference

| Task | File to Edit |
|------|-------------|
| Add new agent | `openclaw.json` + create `agents/*/agent/` |
| Configure credentials | `credentials/` |
| Modify tools | `workspace/TOOLS.md` |
| Change system behavior | `workspace/SOUL.md` |
| Add new skill | `workspace/skills/` or `skills/` |
| Create new extension | `extensions/` |
| Schedule tasks | `cron/jobs.json` |
| User preferences | `workspace/USER.md` |

