import http from "node:http";

const PORT = Number(process.env.PORT || 10000);
const API_URL = (process.env.AI_API_URL || "https://openrouter.ai/api/v1").replace(/\/$/, "");
const API_KEY = process.env.AI_API_KEY || "";
const MODEL = process.env.AI_MODEL || "openrouter/free";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const MAX_BODY_BYTES = Number(process.env.MAX_BODY_BYTES || 1_000_000);
const RATE_LIMIT = Number(process.env.RATE_LIMIT || 30);
const rate = new Map();

const fallback = {
  en: "I'm here with you. Tell me what you'd like to talk about.",
  es: "Estoy aquí contigo. Cuéntame qué te gustaría hablar.",
  ru: "Я рядом. Расскажи, о чём ты хочешь поговорить.",
  kk: "Мен осындамын. Не туралы сөйлескің келетінін айт."
};

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET"
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => {
      data += chunk;
      if (data.length > MAX_BODY_BYTES) req.destroy(new Error("Request too large"));
    });
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch { reject(new Error("Invalid JSON")); }
    });
    req.on("error", reject);
  });
}

function cleanHistory(history) {
  return Array.isArray(history) ? history.slice(-20).map(m => ({
    role: m?.role === "assistant" ? "assistant" : "user",
    content: String(m?.text || m?.content || "").slice(0, 4000)
  })).filter(m => m.content) : [];
}

function systemPrompt({ language = "en", personality = {}, memories = [], system = "" }) {
  const mem = Array.isArray(memories) && memories.length
    ? memories.slice(-20).map(x => `- ${String(x).slice(0, 1000)}`).join("\n")
    : "- No saved memories yet.";
  return `${system}\n\nYou are ${personality.name || "Ava"}, an adult fictional virtual companion. Never claim to be human. Respond in the requested language (${language}). The language is dynamic and may be any valid human language; do not restrict it to a fixed list. Be warm, friendly, respectful, curious and supportive. Do not invent memories. Use only the supplied memories.\nSaved memories:\n${mem}`;
}

function extractContent(data) {
  return String(
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.text ??
    data?.output_text ?? ""
  ).trim();
}

async function callProvider(body) {
  if (!API_URL || !API_KEY) return null;
  const payload = {
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt(body) },
      ...cleanHistory(body.history),
      { role: "user", content: String(body.message || "") }
    ],
    temperature: 0.8
  };
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` };
  if (API_URL.includes("openrouter.ai")) {
    headers["HTTP-Referer"] = "https://virtualcompanionai-1.onrender.com";
    headers["X-Title"] = "Virtual Companion AI";
  }
  const response = await fetch(`${API_URL}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  const raw = await response.text();
  if (!response.ok) throw new Error(`Provider HTTP ${response.status}: ${raw.slice(0, 300)}`);
  const data = JSON.parse(raw);
  const reply = extractContent(data);
  if (!reply) throw new Error("Provider returned an empty reply");
  return reply;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return json(res, 204, {});
  if (req.method === "GET" && req.url === "/health") {
    return json(res, 200, { ok: true, providerConfigured: Boolean(API_URL && API_KEY), model: MODEL });
  }
  if (req.method !== "POST" || req.url !== "/chat") return json(res, 404, { error: "Not found" });
  try {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const windowMs = 60_000;
    const entry = rate.get(ip) || { start: now, count: 0 };
    if (now - entry.start >= windowMs) { entry.start = now; entry.count = 0; }
    entry.count += 1;
    rate.set(ip, entry);
    if (entry.count > RATE_LIMIT) return json(res, 429, { error: "rate limit exceeded", retryAfterSeconds: Math.ceil((entry.start + windowMs - now) / 1000) });
    try {
      const body = await readBody(req);
      const message = String(body.message || "").trim();
      const language = String(body.language || "en").trim().toLowerCase() || "en";
      if (!message) return json(res, 400, { error: "message is required" });
      let reply = await callProvider({ ...body, language });
      if (!reply) reply = fallback[language] || fallback.en;
      const emotion = ["HAPPY","CALM","SAD","ANGRY","SURPRISED","LOVE"].includes(String(body.emotion || "").toUpperCase()) ? String(body.emotion).toUpperCase() : "CALM";
      return json(res, 200, { reply, language, emotion });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error(error);
    return json(res, 502, { error: "AI provider error", detail: error.message });
  }
});

server.listen(PORT, () => console.log(`Virtual Companion backend listening on ${PORT}`));