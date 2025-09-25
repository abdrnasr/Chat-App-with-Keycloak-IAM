// test/mutations.server.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// ⬇️ Adjust this path to your file under /app/api/actions/
import {
  PostMessageAction,
  DeleteMessage,
  EditMessage,
} from "@/app/api/actions/mutations"; // e.g. "@/app/api/actions/index"

// ---- Mock the modules up front ----
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/dbquery", () => ({
  PostMessage: vi.fn(),
  DeleteMessageById: vi.fn(),
  EditMessageById: vi.fn(),
}));
vi.mock("@/lib/authcheck", () => ({ hasPermission: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// Import the (now mocked) bindings
import { auth } from "@/auth";
import { hasPermission } from "@/lib/authcheck";
import {
  PostMessage,
  DeleteMessageById,
  EditMessageById,
} from "@/lib/dbquery";
import { revalidatePath } from "next/cache";

// Helpers to treat them as mocks
const authMock = vi.mocked(auth);
const hasPermissionMock = vi.mocked(hasPermission);
const postMessageMock = vi.mocked(PostMessage);
const deleteMessageByIdMock = vi.mocked(DeleteMessageById);
const editMessageByIdMock = vi.mocked(EditMessageById);
const revalidatePathMock = vi.mocked(revalidatePath);

const sessionFor = (overrides?: Partial<any>) => ({
  user: { dbId: 123, roles: ["post.create", "post.delete", "post.edit"] },
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------- PostMessageAction ----------
describe("PostMessageAction", () => {
  it("Unauthorized without session", async () => {
    authMock.mockResolvedValueOnce(null as any);
    const fd = new FormData();
    fd.set("text", "hello");
    await expect(PostMessageAction(fd)).resolves.toEqual({
      error: "Unauthorized",
    });
  });

  it("Missing Permissions", async () => {
    authMock.mockResolvedValueOnce(sessionFor() as any);
    hasPermissionMock.mockReturnValueOnce(false as any);
    const fd = new FormData();
    fd.set("text", "hi");
    await expect(PostMessageAction(fd)).resolves.toEqual({
      error: "Missing Permissions",
    });
  });

  it("Invalid body (no text)", async () => {
    authMock.mockResolvedValueOnce(sessionFor() as any);
    hasPermissionMock.mockReturnValueOnce(true as any);
    const fd = new FormData(); // no text
    await expect(PostMessageAction(fd)).resolves.toEqual({
      error: "Invalid body",
    });
  });

  it("Database Error from PostMessage", async () => {
    authMock.mockResolvedValueOnce(sessionFor() as any);
    hasPermissionMock.mockReturnValueOnce(true as any);
    postMessageMock.mockRejectedValueOnce(new Error("db"));
    const fd = new FormData();
    fd.set("text", "ok");
    await expect(PostMessageAction(fd)).resolves.toEqual({
      error: "Database Error",
    });
  });

  it("Success calls PostMessage and revalidatePath", async () => {
    authMock.mockResolvedValueOnce(sessionFor() as any);
    hasPermissionMock.mockReturnValueOnce(true as any);
    postMessageMock.mockResolvedValueOnce(undefined);
    const fd = new FormData();
    fd.set("text", "great");
    const res = await PostMessageAction(fd);
    expect(postMessageMock).toHaveBeenCalledWith(123, "great");
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(res).toBeUndefined();
  });
});

// ---------- DeleteMessage ----------
describe("DeleteMessage", () => {
  it("Unauthorized without session", async () => {
    authMock.mockResolvedValueOnce(null as any);
    await expect(DeleteMessage(42)).resolves.toEqual({
      error: "Unauthorized",
    });
  });

  it("Missing Permissions", async () => {
    authMock.mockResolvedValueOnce(sessionFor() as any);
    hasPermissionMock.mockReturnValueOnce(false as any);
    await expect(DeleteMessage(42)).resolves.toEqual({
      error: "Missing Permissions",
    });
  });

  it("Data Format Issue (not a number)", async () => {
    authMock.mockResolvedValueOnce(sessionFor() as any);
    hasPermissionMock.mockReturnValueOnce(true as any);
    await expect(DeleteMessage({ bad: true } as any)).resolves.toEqual({
      error: "Data Format Issue",
    });
  });

  it("Database Error from DeleteMessageById", async () => {
    authMock.mockResolvedValueOnce(sessionFor() as any);
    hasPermissionMock.mockReturnValueOnce(true as any);
    deleteMessageByIdMock.mockRejectedValueOnce(new Error("db"));
    await expect(DeleteMessage(99)).resolves.toEqual({
      error: "Database Error",
    });
  });

  it("Success calls DeleteMessageById and revalidatePath", async () => {
    authMock.mockResolvedValueOnce(sessionFor() as any);
    hasPermissionMock.mockReturnValueOnce(true as any);
    deleteMessageByIdMock.mockResolvedValueOnce(undefined);
    const res = await DeleteMessage(77);
    expect(deleteMessageByIdMock).toHaveBeenCalledWith(77);
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(res).toBeUndefined();
  });
});

// ---------- EditMessage ----------
describe("EditMessage", () => {
  it("Unauthorized without session", async () => {
    authMock.mockResolvedValueOnce(null as any);
    await expect(EditMessage({ messageId: 1, text: "x" })).resolves.toEqual({
      error: "Unauthorized",
    });
  });

  it("Missing Permissions", async () => {
    authMock.mockResolvedValueOnce(sessionFor() as any);
    hasPermissionMock.mockReturnValueOnce(false as any);
    await expect(EditMessage({ messageId: 1, text: "x" })).resolves.toEqual({
      error: "Missing Permissions",
    });
  });

  it("Data Format Issue (schema fail)", async () => {
    authMock.mockResolvedValueOnce(sessionFor() as any);
    hasPermissionMock.mockReturnValueOnce(true as any);
    await expect(EditMessage({ messageId: "nope" } as any)).resolves.toEqual({
      error: "Data Format Issue",
    });
  });

  it("Database Error from EditMessageById", async () => {
    authMock.mockResolvedValueOnce(sessionFor() as any);
    hasPermissionMock.mockReturnValueOnce(true as any);
    editMessageByIdMock.mockRejectedValueOnce(new Error("db"));
    await expect(
      EditMessage({ messageId: 44, text: "new text" })
    ).resolves.toEqual({ error: "Database Error" });
  });

  it("Success calls EditMessageById and revalidatePath", async () => {
    authMock.mockResolvedValueOnce(sessionFor() as any);
    hasPermissionMock.mockReturnValueOnce(true as any);
    editMessageByIdMock.mockResolvedValueOnce(undefined);
    const res = await EditMessage({ messageId: 10, text: "edited" });
    expect(editMessageByIdMock).toHaveBeenCalledWith(10, "edited");
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(res).toBeUndefined();
  });
});
