// The build prepends the route module and embeds the local static assets.
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (!["GET", "HEAD"].includes(request.method)) {
      return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } });
    }
    if (url.pathname === "/api/live") {
      if (request.method === "HEAD") return new Response(null, { headers: { "content-type": "application/json" } });
      return serveLive();
    }
    const asset = ASSETS[url.pathname === "/" ? "/index.html" : url.pathname];
    if (!Array.isArray(asset)) return new Response("Not found", { status: 404 });
    return new Response(request.method === "HEAD" ? null : Uint8Array.from(atob(asset[1]), (c) => c.charCodeAt(0)), {
      headers: {
        "content-type": asset[0],
        "cache-control": url.pathname.startsWith("/assets/") ? "private, max-age=86400" : "private, max-age=60",
        "referrer-policy": "strict-origin-when-cross-origin",
        "x-content-type-options": "nosniff",
      },
    });
  },
};
