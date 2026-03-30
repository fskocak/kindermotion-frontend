# KinderMotion Frontend

The frontend foundation is built on Next 16. The project is organized under `src/`, and the API layer is managed centrally through `axios`.

## Getting Started

```bash
npm install
npm run dev
```

Default frontend URL: `http://localhost:3000`

Default backend URL: `http://localhost:3001`

Use `.env.example` as the base:

```bash
cp .env.example .env.local
```

## Folder Structure

- `src/app` -> Next routes
- `src/components` -> reusable UI pieces
- `src/features` -> domain-based modules
- `src/lib` -> config, axios, helpers, and constants
- `src/services` -> API calls
- `src/store` -> Zustand store entry point
- `src/types` -> shared types

## Auth API Foundation

- `POST /auth/admin/login`
- `POST /auth/teacher/login`
- `GET /auth/me`

Central HTTP client: `src/lib/http/http-client.ts`

Auth service: `src/services/auth.service.ts`
