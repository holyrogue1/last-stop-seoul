import { mkdir, readFile, readdir, copyFile, writeFile } from "node:fs/promises";
import { extname } from "node:path";

const root = new URL("../", import.meta.url);
const types = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".webp": "image/webp",
  ".png": "image/png",
  ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
};
const images = (await readdir(new URL("web/assets/", root))).map((name) => "assets/" + name);
const files = [
  "index.html", "styles.css", "app.js", "planner.js", "trends.js", "discover.js",
  "album.html", "album.css", "album.js", "album-store.js", "album-templates.js",
  "concierge.js", "concierge.css", ...images,
];
const assets = {};
for (const path of files) {
  const bytes = await readFile(new URL("web/" + path, root));
  assets["/" + path] = [types[extname(path)], bytes.toString("base64")];
}
assets["/album"] = assets["/album.html"];
assets["/album/"] = assets["/album.html"];
const manifest = new URL(".openai/hosting.json", root);
const { project_id: id, static: staticMode } = JSON.parse(await readFile(manifest, "utf8"));
if (!id || staticMode) throw new Error("Worker hosting manifest is required");
const modules = ["web/planner.js", "web/discover.js", "worker/live.mjs",
  "worker/sagemaker.mjs", "worker/concierge.mjs", "worker/entry.mjs"];
const server = await Promise.all(modules.map((path) => readFile(new URL(path, root), "utf8")));
await mkdir(new URL("dist/server/", root), { recursive: true });
await mkdir(new URL("dist/.openai/", root), { recursive: true });
await copyFile(manifest, new URL("dist/.openai/hosting.json", root));
await writeFile(new URL("dist/server/index.js", root), `const ASSETS = ${JSON.stringify(assets)};\n${server.join("\n")}`);
