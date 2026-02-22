# STAGEPASS Web UI Skeleton

This is the Next.js frontend for STAGEPASS, the creator ecosystem.

## Setup

1. Navigate to directory:
   ```bash
   cd apps/web
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Run development server:
   ```bash
   yarn dev
   ```

## Key Components

- **Theme**: Defined in `tailwind.config.js` (Electric Indigo, Neon Mint, Charcoal).
- **Butler (Encore)**: Located in `components/butler/ButlerDock.tsx`. A global AI assistant.
- **Player**: HLS-compatible video player in `components/stagepass/Player.tsx`.
- **Pages**:
  - `/` - Home (Feed)
  - `/live` - Live directory
  - `/radio` - Global radio station
  - `/studio` - Creator dashboard

## Next Steps for Emergent

1. Connect `useButler.ts` to the real API endpoint `/api/butler/resolve`.
2. Implement Firebase Auth in `lib/firebase/auth.ts`.
3. Wire up `ContentCard` to real Firestore data.
