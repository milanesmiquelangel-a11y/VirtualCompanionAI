# Render deployment

Backend: set Root Directory to `backend`, build with `npm install --omit=dev`, and start with `npm start`.

Environment variables:
- `AI_API_URL` — OpenAI-compatible API base URL, ending in `/v1` (the backend appends `/chat/completions`).
- `AI_API_KEY` — secret provider key; never put it in the frontend.
- `AI_MODEL` — model name.
- `ALLOWED_ORIGIN` — exact frontend origin when deployed.
- `RATE_LIMIT` — requests per minute per IP.

Frontend: set `VITE_AI_CHAT_URL` to the deployed backend `/chat` endpoint before building.

Health check: `/health`. It reveals only whether the provider is configured, never the API key.
