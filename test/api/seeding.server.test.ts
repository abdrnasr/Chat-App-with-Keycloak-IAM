// test/setup.route.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ⬇️ Adjust this path if needed
import { GET } from "@/app/api/seeding/route";

vi.mock("@/lib/db", () => ({
  pool: { query: vi.fn() },
}));

vi.mock("@/lib/utils", () => ({
  safeEqual: vi.fn((a: string, b: string) => a === b),
  getErrorMessage: vi.fn((e: unknown) =>
    e instanceof Error ? e.message : String(e)
  ),
}));

// Mock NextResponse.json to a simple return { body, status }
vi.mock("next/server", async () => {
  const actual = await vi.importActual<any>("next/server");
  return {
    ...actual,
    NextResponse: {
      json: vi.fn((body: any, init?: { status?: number }) => ({
        body,
        status: init?.status ?? 200,
      })),
    },
    // NextRequest is only a type here; at runtime we pass a plain object
  };
});

import { pool } from "@/lib/db";
import { getErrorMessage } from "@/lib/utils";
import { NextResponse } from "next/server";

const poolQueryMock = pool.query as unknown as ReturnType<typeof vi.fn>;
const nextJsonMock = NextResponse.json as unknown as ReturnType<typeof vi.fn>;
const getErrMsgMock = getErrorMessage as unknown as ReturnType<typeof vi.fn>;

const makeReq = (params: { secret?: string; headerSecret?: string }) => {
  const searchParams = new URLSearchParams();
  if (params.secret !== undefined) searchParams.set("secret", params.secret);

  return {
    nextUrl: { searchParams },
    headers: {
      get: (k: string) =>
        k.toLowerCase() === "x-seeding-secret" ? params.headerSecret ?? null : null,
    },
  } as any; // runtime shape sufficient for the handler
};

const withEnv = (vars: Record<string, string | undefined>) => {
  const prev: Record<string, string | undefined> = {};
  for (const k of Object.keys(vars)) {
    prev[k] = process.env[k];
    if (vars[k] === undefined) delete process.env[k];
    else process.env[k] = vars[k]!;
  }
  return () => {
    for (const k of Object.keys(prev)) {
      if (prev[k] === undefined) delete process.env[k];
      else process.env[k] = prev[k]!;
    }
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/setup", () => {
  it("500 when SEEDING_SECRET is missing", async () => {
    const restore = withEnv({ SEEDING_SECRET: undefined, DATABASE_NAME: "db" });
    const res = await GET(makeReq({}));
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      ok: false,
      error: "Server is missing SEEDING_SECRET",
    });
    restore();
  });

  it("401 when provided secret does not match (query param)", async () => {
    const restore = withEnv({ SEEDING_SECRET: "s3cr3t", DATABASE_NAME: "db" });
    const res = await GET(makeReq({ secret: "wrong" }));
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ ok: false, error: "Unauthorized" });
    restore();
  });

  it("401 when provided secret does not match (header)", async () => {
    const restore = withEnv({ SEEDING_SECRET: "s3cr3t", DATABASE_NAME: "db" });
    const res = await GET(makeReq({ headerSecret: "nope" }));
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ ok: false, error: "Unauthorized" });
    restore();
  });

  it("200 already seeded when users table exists", async () => {
    const restore = withEnv({ SEEDING_SECRET: "s3cr3t", DATABASE_NAME: "db" });

    // first query: SELECT EXISTS(...) -> true
    poolQueryMock.mockResolvedValueOnce([
      [{ users_table_exists: 1 }],
    ] as any);

    const res = await GET(makeReq({ secret: "s3cr3t" }));

    expect(poolQueryMock).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      message: "Database already seeded.",
    });
    restore();
  });

  it("500 on error while checking if seeded", async () => {
    const restore = withEnv({ SEEDING_SECRET: "s3cr3t", DATABASE_NAME: "db" });

    poolQueryMock.mockRejectedValueOnce(new Error("select failed"));

    const res = await GET(makeReq({ secret: "s3cr3t" }));

    expect(getErrMsgMock).toHaveBeenCalled();
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      ok: false,
      error: "select failed",
    });
    restore();
  });

  it("200 creates tables when not seeded (both CREATE succeed)", async () => {
    const restore = withEnv({ SEEDING_SECRET: "s3cr3t", DATABASE_NAME: "db" });

    // 1) exists -> false
    poolQueryMock.mockResolvedValueOnce([
      [{ users_table_exists: 0 }],
    ] as any);
    // 2) CREATE users ok
    poolQueryMock.mockResolvedValueOnce([{}] as any);
    // 3) CREATE messages ok
    poolQueryMock.mockResolvedValueOnce([{}] as any);

    const res = await GET(makeReq({ secret: "s3cr3t" }));

    expect(poolQueryMock).toHaveBeenCalledTimes(3);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, message: "Tables created!" });
    restore();
  });

  it("500 when CREATE TABLE fails (users)", async () => {
    const restore = withEnv({ SEEDING_SECRET: "s3cr3t", DATABASE_NAME: "db" });

    // 1) exists -> false
    poolQueryMock.mockResolvedValueOnce([
      [{ users_table_exists: 0 }],
    ] as any);
    // 2) CREATE users fails
    poolQueryMock.mockRejectedValueOnce(new Error("create users failed"));

    const res = await GET(makeReq({ secret: "s3cr3t" }));

    expect(getErrMsgMock).toHaveBeenCalled();
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      ok: false,
      error: "create users failed",
    });
    restore();
  });

  it("500 when CREATE TABLE fails (messages)", async () => {
    const restore = withEnv({ SEEDING_SECRET: "s3cr3t", DATABASE_NAME: "db" });

    // 1) exists -> false
    poolQueryMock.mockResolvedValueOnce([
      [{ users_table_exists: 0 }],
    ] as any);
    // 2) CREATE users ok
    poolQueryMock.mockResolvedValueOnce([{}] as any);
    // 3) CREATE messages fails
    poolQueryMock.mockRejectedValueOnce(new Error("create messages failed"));

    const res = await GET(makeReq({ secret: "s3cr3t" }));

    expect(getErrMsgMock).toHaveBeenCalled();
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      ok: false,
      error: "create messages failed",
    });
    restore();
  });
});
