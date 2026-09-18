# V8 — producción

## Frontend
1. Copia `.env.example` a `.env`.
2. Define `VITE_AI_CHAT_URL=https://TU-BACKEND/chat`.
3. Ejecuta `npm install` y `npm run build`.

## Backend
1. En `backend`, ejecuta `npm install` y `npm start`.
2. Configura `AI_API_URL`, `AI_API_KEY`, `AI_MODEL` y `ALLOWED_ORIGIN` como variables privadas del servidor.
3. Comprueba `GET /health`.

La clave de IA nunca debe estar en `VITE_*`, porque las variables Vite terminan en el navegador.

## Flujo
Usuario → frontend → `/chat` → proveedor IA → respuesta + emoción → voz del dispositivo → animación facial.

La memoria guardada por el usuario se mantiene localmente en el navegador en esta versión. El backend solo recibe las memorias incluidas en cada solicitud.
