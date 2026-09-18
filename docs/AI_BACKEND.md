# AI backend — Virtual Companion AI V6

This package now includes a small Node backend in `backend/`.

## Run

```bash
cd backend
npm start
```

Set these server-side environment variables:

- `AI_API_URL` — base URL of an OpenAI-compatible provider (without `/chat/completions`).
- `AI_API_KEY` — provider secret. Never expose it in `VITE_*`.
- `AI_MODEL` — model name.
- `ALLOWED_ORIGIN` — frontend origin, or `*` for testing.
- `PORT` — supplied automatically by hosts such as Render.

The frontend uses `VITE_AI_CHAT_URL=https://YOUR-BACKEND/chat`.

## Endpoints

- `GET /health` — service status and provider configuration status.
- `POST /chat` — sends message, language, history, memories and personality.

The backend keeps provider credentials on the server and returns `{ reply, language, emotion }`.
