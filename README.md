# The Cookie Circle Admin

Business management platform for The Cookie Circle.

## Requirements

- Node.js 20+
- npm

## Setup

```bash
cp .env.example .env.local
npm install
```

## Run

```bash
npm run dev
```

Admin runs on [http://localhost:3001](http://localhost:3001).

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Authentication pages (Phase 2)
│   ├── (dashboard)/     # Protected admin pages
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── layout/          # AppShell, Sidebar, Header
│   └── providers/       # Theme, Query providers
├── config/              # Environment, routes, navigation, branding
└── lib/                 # Utilities
```
