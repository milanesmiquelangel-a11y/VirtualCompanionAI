import { mkdir, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";

const url = "https://github.com/milanesmiquelangel-a11y/VirtualCompanionAI/releases/latest/download/model.5.glb";
const output = "public/models/model.5.glb";

await mkdir("public/models", { recursive: true });

console.log("Downloading companion GLB from GitHub Release...");
const response = await fetch(url, { redirect: "follow" });

if (!response.ok || !response.body) {
  throw new Error(`Model download failed: HTTP ${response.status}`);
}

const contentType = response.headers.get("content-type") || "";
if (contentType.includes("text/html") || contentType.includes("application/json")) {
  throw new Error(`Model download returned ${contentType} instead of binary GLB`);
}

const file = createWriteStream(output);
await finished(Readable.fromWeb(response.body).pipe(file));

const { stat } = await import("node:fs/promises");
const size = (await stat(output)).size;

if (size < 1000000) {
  throw new Error(`Downloaded model is unexpectedly small: ${size} bytes`);
}

console.log(`Companion GLB ready: ${output} (${size} bytes)`);
