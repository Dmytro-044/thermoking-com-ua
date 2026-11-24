# Bundle a built static site into one Cloudflare Worker module (test hosting).
import base64, json, mimetypes, os, sys
root, out = sys.argv[1], sys.argv[2]
files = {}
for dp, _, fs in os.walk(root):
    for f in fs:
        full = os.path.join(dp, f); rel = "/" + os.path.relpath(full, root).replace(os.sep, "/")
        if rel == "/_headers": continue
        ctype = mimetypes.guess_type(f)[0] or "application/octet-stream"
        if ctype.startswith("text/") or ctype in ("application/javascript", "application/json", "image/svg+xml", "application/xml"):
            ctype += "; charset=utf-8"
        files[rel] = {"t": ctype, "b": base64.b64encode(open(full, "rb").read()).decode()}
js = """const FILES = %s;
const SEC = {"X-Content-Type-Options":"nosniff","Referrer-Policy":"strict-origin-when-cross-origin","X-Robots-Tag":"noindex, nofollow"};
const dec = (b) => Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
function respond(f, status, immutable) {
  const h = new Headers(SEC);
  h.set("Content-Type", f.t);
  h.set("Cache-Control", immutable ? "public, max-age=31536000, immutable" : "public, max-age=300");
  return new Response(dec(f.b), { status, headers: h });
}
export default {
  async fetch(req) {
    const url = new URL(req.url);
    let p = decodeURIComponent(url.pathname);
    if (p.endsWith("/")) p += "index.html";
    let f = FILES[p] || FILES[p + "/index.html"] || FILES[p + ".html"];
    if (!f && !p.split("/").pop().includes(".")) {
      if (FILES[p + "/index.html"]) return Response.redirect(url.origin + p + "/", 301);
    }
    if (!f) return respond(FILES["/404.html"], 404, false);
    return respond(f, 200, /^\\/(css|js|img)\\//.test(p));
  },
};
""" % json.dumps(files)
open(out, "w").write(js)
print(len(files), "files,", os.path.getsize(out) // 1024, "KB")
