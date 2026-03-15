# OpenClaw

A comprehensive workspace management and automation system with multi-agent capabilities.

## Features

- **Multi-Agent Support**: Discord Bot, Telegram Bot, WhatsApp Bot, and Main Agent
- **Skill System**: Extensible skills including GOG, SerpAPI, Job Poster, and LinkedIn integration
- **Session Management**: Per-agent session tracking and state management
- **Workspace Isolation**: Separate workspaces for different bot environments
- **Plugin Architecture**: Extensible plugin system for GitHub PR reviews, web search, and more
- **Credential Management**: Secure credential storage for multiple services
- **Cron Jobs**: Scheduled job execution
- **Media Handling**: Inbound media management and processing

## Project Structure

```
.
├── agents/              # Multi-bot agents
│   ├── main/           # Main agent workspace
│   ├── discord-bot/    # Discord bot integration
│   ├── telegram-bot/   # Telegram bot integration
│   └── whatsapp-bot/   # WhatsApp bot integration
├── workspace/          # Primary workspace
├── workspace-*/        # Bot-specific workspaces
├── extensions/         # Plugin extensions
├── skills/            # Reusable skill modules
├── credentials/       # Service credentials
├── cron/             # Scheduled jobs
└── media/            # Media storage
```

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/shubham09082003/opencalw.git
   cd opencalw
   ```

2. **Install dependencies** (if applicable)
   ```bash
   npm install
   ```

3. **Configure credentials**
   - Add service credentials in `credentials/` directory
   - Update workspace configuration files

4. **Run agents**
   ```bash
   # Main agent
   npm start
   ```

## Configuration

- `openclaw.json` - Main configuration file
- `agents/*/agent/` - Agent-specific configs
- `workspace/` - Workspace settings and tools

## Available Bots

- **Discord Bot**: Real-time chat integration
- **Telegram Bot**: Messaging automation
- **WhatsApp Bot**: Enterprise messaging
- **Main Agent**: Core orchestration

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit pull requests.
