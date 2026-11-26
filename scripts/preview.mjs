import { createServer } from "node:http";
import worker from "../dist/server/index.js";

const port = Number(process.env.SEOUL_PREVIEW_PORT || 8768);
createServer(async (req, res) => {
  try {
    const request = new Request(`http://127.0.0.1:${port}${req.url}`, {
      method: req.method, headers: req.headers,
      ...(["GET", "HEAD"].includes(req.method) ? {} : { body: req, duplex: "half" }),
    });
    const response = await worker.fetch(request, process.env);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.writeHead(502).end();
  }
}).listen(port, "127.0.0.1", () => console.log(`http://127.0.0.1:${port}`));
