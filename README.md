# Synthora Nano

Privacy-first AI research notebook running entirely in your browser using Chrome's built-in Gemini Nano capabilities.

## What is Synthora Nano?

Synthora Nano is a local-first research workspace that brings AI-powered paper analysis to your browser without sending any data to external servers. All processing happens on-device using Chrome's built-in language model capabilities.

### Why On-Device AI Matters

- **Privacy**: Your research papers never leave your device
- **Zero Cost**: No API keys or cloud AI subscriptions required
- **Offline**: Full functionality without internet connection
- **Speed**: No network latency for analysis tasks
- **Control**: You own your data and research insights

## Features

- **Document Ingestion**: Import PDF, Markdown, HTML, and plain text papers
- **AI Analysis**: Automated methodology, findings, and limitations extraction
- **Paper Comparison**: Multi-paper comparison matrices with agreement/contradiction analysis
- **Knowledge Graph**: Concept linking and relationship discovery
- **Research Assistant**: Grounded Q&A with citation validation
- **Export/Import**: Portable workspace snapshots with integrity checksums
- **PWA**: Installable as a native-like app with offline support

## Chrome Requirements

Synthora Nano requires Chrome 131 or later with the built-in AI features enabled:

1. Open `chrome://flags/#built-in-ai`
2. Enable **Built-in AI** (Gemini Nano)
3. Restart Chrome

### Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome 131+ | Full support |
| Edge 131+ | Full support |
| Safari | Partial (no AI features) |
| Firefox | Partial (no AI features) |

## Installation

### Development

```bash
git clone https://github.com/YASSERRMD/synthora-nano.git
cd synthora-nano
npm install
npm run dev
```

### Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run lint         # Lint code
npm run typecheck    # TypeScript checking
npm run format       # Format code
```

## Architecture

```
synthora-nano/
├── src/
│   ├── ai/              # Browser AI runtime and pipelines
│   ├── db/              # IndexedDB schemas and repositories
│   ├── features/        # Feature modules
│   │   ├── analysis/    # Paper analysis pipeline
│   │   ├── assistant/   # Research assistant
│   │   ├── concepts/    # Knowledge graph
│   │   ├── comparison/  # Paper comparison
│   │   ├── export/      # Import/export
│   │   ├── library/     # Paper library
│   │   ├── pwa/         # PWA and offline
│   │   └── security/    # Security and diagnostics
│   ├── parsers/         # Document parsers
│   ├── components/      # Shared UI components
│   └── types/           # TypeScript types
├── public/              # Static assets and service worker
└── tests/               # E2E tests
```

## Privacy Model

- All data stored in browser IndexedDB
- No external API calls or telemetry
- Service worker caches only static assets, never paper content
- Export snapshots contain only metadata, not source PDFs by default
- Content sanitized on import to prevent XSS

## Testing

```bash
npm run test          # Run all unit tests
npx playwright test   # Run E2E tests
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the atomic commit workflow.

## License

MIT License - see [LICENSE](./LICENSE)
