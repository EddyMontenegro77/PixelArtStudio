# Pixel Art Studio

Pixel Art editor built with Angular + Supabase.

## Features
- Draw and animate pixel art with layers and frames.
- Toolset: pencil, eraser, line, circle, ellipse, fill, eyedropper.
- Local draft save when logged out.
- Cloud save/load/delete when logged in.
- Auth flow with email confirmation, login, logout, password recovery.
- Profile with avatar upload and project cards.
- Light/Dark theme support.
- Export PNG, Sprite sheet, GIF and APNG.

## Stack
- Angular 21
- TypeScript
- Supabase Auth + Database + Storage
- Vitest for unit tests

## Local Setup
```bash
npm install
ng serve
```

App runs at `http://localhost:4200`.

## Environment Variables
Production build uses:
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

They are injected by `scripts/generate-env.mjs` through the `prebuild` script.

## Scripts
```bash
npm run start      # ng serve
npm run build      # ng build (runs prebuild first)
npm test           # ng test
npx vitest run src/app/services/local-project.service.spec.ts
```

## Auth Notes
- If Supabase `autoconfirm` is OFF, signup returns `requiresEmailConfirmation: true`.
- User must confirm email before first login.
- `user_profile` is created/ensured when a valid session exists (RLS-safe flow).
- Password recovery redirects to `/reset-password`.

## Deploy (Vercel)
Use these settings:
- Root Directory: `pixel-art-studio`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist/pixel-art-studio/browser`

Set environment variables in Vercel project settings:
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

## Testing Status
Core service tests are in progress.
Recommended critical coverage:
- `LocalProjectService`
- `ProjectService` save/migrate flows
- `ProjectRepositoryService` cloud persistence flows
- `AuthService` signup/login/recovery paths
