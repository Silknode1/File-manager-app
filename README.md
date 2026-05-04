# FileCraft - Advanced macOS File Management System

A high-performance desktop application for macOS that provides parallel file scanning, real-time data visualizations, and intelligent duplicate detection using BLAKE3 hashing.

Built with **Tauri 2** (Rust backend) + **React** + **TypeScript** + **D3.js** + **Recharts**.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Scan     │  │ Real-time    │  │ Results & Review  │  │
│  │ Setup    │  │ Viz (D3 +   │  │ Workflow          │  │
│  │          │  │ Recharts)    │  │                   │  │
│  └──────────┘  └──────────────┘  └───────────────────┘  │
│                    Zustand Store                         │
├─────────────────────────────────────────────────────────┤
│                 Tauri IPC Bridge                         │
├─────────────────────────────────────────────────────────┤
│                    Rust Backend                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Parallel │  │ BLAKE3       │  │ Duplicate         │  │
│  │ Walker   │  │ Hasher       │  │ Grouper           │  │
│  │ (Rayon)  │  │ (Prehash +  │  │                   │  │
│  │          │  │  Full Hash)  │  │                   │  │
│  └──────────┘  └──────────────┘  └───────────────────┘  │
│  ┌──────────┐  ┌──────────────┐                         │
│  │ File     │  │ macOS Trash  │                         │
│  │ Filter   │  │ Integration  │                         │
│  └──────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────┘
```

## Features

### Scan Pipeline
- **Parallel filesystem walking** using Rayon thread pool
- **Two-stage BLAKE3 hashing**: head+tail prehash for fast filtering, then full content hashing
- **Configurable filters**: include/exclude extensions, directories, patterns, size limits
- **Real-time progress** with live statistics and visualizations

### Visualizations
- **D3.js donut chart** - File type distribution with animated transitions
- **D3.js treemap** - Storage usage by extension
- **Recharts bar charts** - Size distribution and extension breakdown
- **Animated counters** - Smooth real-time stat updates

### Duplicate Management
- Visual duplicate groups with file previews
- Bulk selection strategies (keep newest, oldest, shortest path)
- macOS Trash integration with safety warnings
- Path inspection and Finder reveal

## Prerequisites

- **macOS 13+** (for full functionality)
- **Rust** (latest stable) - [Install via rustup](https://rustup.rs/)
- **Node.js 18+** - [Install via nvm](https://github.com/nvm-sh/nvm)

## Development

```bash
# Install frontend dependencies
npm install

# Run in development mode (starts both Vite + Tauri)
npm run tauri dev

# Build for production
npm run tauri build
```

### Browser Development Mode

The frontend can run standalone in a browser for UI development:

```bash
npm run dev
```

Mock data is automatically provided when running outside Tauri, enabling full UI development without the Rust backend.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend | Rust + Tauri 2 | Filesystem ops, hashing, IPC |
| Hashing | BLAKE3 | Parallel content hashing |
| Parallelism | Rayon | Multi-threaded file walking |
| Frontend | React 18 + TypeScript | UI framework |
| State | Zustand | Reactive state management |
| Charts | D3.js | Donut chart, treemap |
| Charts | Recharts | Bar charts, distributions |
| Animation | Framer Motion | Smooth UI transitions |
| Styling | Tailwind CSS | Utility-first CSS |
| Icons | Lucide React | Consistent iconography |
| Trash | trash crate | macOS Trash integration |

## Data Flow

```
Discovery → Filtering → Prehashing → Full Hashing → Grouping → Output
    │           │            │             │            │          │
    ▼           ▼            ▼             ▼            ▼          ▼
  WalkDir    Include/     Head+Tail     BLAKE3       Hash →     UI/CLI
  (Rayon)    Exclude      4KB hash     streaming    Groups
             Rules        prefilter     full hash
```

## Project Structure

```
├── src-tauri/                # Rust backend
│   ├── src/
│   │   ├── scanner/          # Filesystem scanning
│   │   │   ├── walker.rs     # Parallel directory walker + scan engine
│   │   │   ├── filter.rs     # Include/exclude rules
│   │   │   └── hasher.rs     # BLAKE3 prehash + full hash
│   │   ├── grouper/          # Duplicate detection
│   │   │   └── dedup.rs      # Hash grouping + selection strategies
│   │   ├── commands.rs       # Tauri command handlers
│   │   └── lib.rs            # App entry point
│   └── Cargo.toml
├── src/                      # React frontend
│   ├── components/
│   │   ├── layout/           # Sidebar, Header
│   │   ├── scan/             # ScanSetup, ScanProgress
│   │   ├── viz/              # Charts and visualizations
│   │   ├── results/          # DuplicateGroups, BulkActions
│   │   └── common/           # Shared components
│   ├── store/                # Zustand state management
│   ├── lib/                  # Utilities, Tauri bridge, mock data
│   └── types/                # TypeScript type definitions
└── package.json
```

## License

MIT
