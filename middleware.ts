import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  const start = Date.now();
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Auth redirects
  if (!token && pathname === "/api/auth/signout") {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }
  if (token && pathname === "/api/auth/signin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Execute normal flow
  const res = NextResponse.next();

  // If both API variables are set, forward logs
  if (process.env.ES_URL && process.env.ES_API_KEY) {
      await ForwardLog(req,res, pathname, start);
  }
    
  return res;
}

async function ForwardLog(req: NextRequest, res:NextResponse, pathname: string, start: number){

  // Log fields
  const log = {
    "@timestamp": new Date().toISOString(),
    route: pathname,
    status: res.status,
    duration_ms: Date.now() - start,
    version: process.env.APP_VERSION || "1.0.0",
    env: process.env.NODE_ENV || "node-default",
    client_ip:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
    user_agent: req.headers.get("user-agent") || "unknown",
  };

  // send directly to Elasticsearch
  const index = `app-logs-${new Date().toISOString().slice(0,10)}`; // YYYY-MM-DD
  const esUrl = `${process.env.ES_URL}/${index}/_doc`; // e.g. https://es:9200
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 1500); // keep latency bounded

  try {
    await fetch(esUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        // Prefer API key. Create one in ES and set ES_API_KEY in env.
        Authorization: `ApiKey ${process.env.ES_API_KEY}`,
      },
      // Your index template already sets index.default_pipeline=app_logs_v1
      // so no need to pass ?pipeline=...
      body: JSON.stringify(log),
      signal: controller.signal,
      // keepalive helps avoid canceled requests on quick responses
      keepalive: true,
    });
  } catch {
    // last-resort fallback; do not throw from middleware
    console.log(JSON.stringify({ level: "warn", msg: "es_log_failed", log }));
  } finally {
    clearTimeout(t);
  }
}

// Limit scope
export const config = { matcher: ["/((?!_next|favicon.ico).*)"] };