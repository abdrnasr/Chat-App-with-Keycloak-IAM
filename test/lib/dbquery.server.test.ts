import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

// 👇 Mock the module that exports `pool`
vi.mock("@/lib/db", () => {
  return {
    pool: {
      query: vi.fn(), // we'll set return values per test
    },
  };
});

// Now import SUT and the mocked pool
import {
  getMessagesByUser,
  getAllMessages,
  GetUserPKByUUID,
  CreateNewUserRecord,
  PostMessage,
  DeleteMessageById,
  EditMessageById,
  type MessageRow,
  type UserId,
  getUserCount,
  getMessageCount,
  getAllUsers,
  UserTableEntry,
} from "@/lib/dbquery";
import { pool } from "@/lib/db";

const mockQuery = pool.query as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getMessagesByUser", () => {
  it("queries messages by author id and returns rows", async () => {
    const fakeRows = [{ id: 1, content: "hi" }, { id: 2, content: "yo" }];
    mockQuery.mockResolvedValueOnce([fakeRows] as any);

    const rows = await getMessagesByUser(42);

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith(
      "SELECT id, content FROM messages WHERE authorId = ?",
      [42]
    );
    expect(rows).toEqual(fakeRows);
  });
});

describe("getAllMessages", () => {
  it("joins users and returns typed rows", async () => {
    const fakeRows = [
        {
            id: 1,
            name: "John Admin",
            content: "Hello world",
            created_at: new Date("2025-01-01"),
            updated_at: new Date("2025-01-02"),
        },
    ] as unknown as MessageRow[];

    mockQuery.mockResolvedValueOnce([fakeRows] as any);

    const rows = await getAllMessages();

    expect(mockQuery).toHaveBeenCalledWith(
      "SELECT messages.id,users.name, messages.content, messages.createdAt, messages.updatedAt FROM messages INNER JOIN users ON messages.authorId = users.id Order by messages.createdAt"
    );
    expect(rows).toEqual(fakeRows);
  });
});

describe("GetUserPKByUUID", () => {
  it("returns -1 when no user found", async () => {
    mockQuery.mockResolvedValueOnce([[] as UserId[]] as any);

    const id = await GetUserPKByUUID("00000000-0000-0000-0000-000000000000");

    expect(mockQuery).toHaveBeenCalledWith(
      "SELECT id FROM users WHERE keycloak_id = UUID_TO_BIN(?, 1) LIMIT 1",
      ["00000000-0000-0000-0000-000000000000"]
    );
    expect(id).toBe(-1);
  });

  it("returns first id when a user is found", async () => {
    mockQuery.mockResolvedValueOnce([[{ id: 777 }] as UserId[]] as any);

    const id = await GetUserPKByUUID("abcd-ef");

    expect(id).toBe(777);
  });
});

describe("CreateNewUserRecord", () => {
  it("upserts the user using UUID_TO_BIN", async () => {
    mockQuery.mockResolvedValueOnce([{}] as any);

    await CreateNewUserRecord("uuid-123", "john");

    expect(mockQuery).toHaveBeenCalledWith(
      `INSERT INTO users (name, keycloak_id)
    VALUES (?, UUID_TO_BIN(?, 1))
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      keycloak_id = VALUES(keycloak_id)`,
      ["john", "uuid-123"]
    );
  });
});

describe("PostMessage", () => {
  it("inserts a message with author id", async () => {
    mockQuery.mockResolvedValueOnce([{}] as any);

    await PostMessage(5, "hey there");

    expect(mockQuery).toHaveBeenCalledWith(
      "INSERT INTO messages (content, authorId) VALUES (?, ?)",
      ["hey there", 5]
    );
  });
});

describe("DeleteMessageById", () => {
  it("deletes by message id", async () => {
    mockQuery.mockResolvedValueOnce([{}] as any);

    await DeleteMessageById(99);

    expect(mockQuery).toHaveBeenCalledWith(
      "DELETE FROM messages WHERE id = ?",
      [99]
    );
  });
});

describe("EditMessageById", () => {
  it("updates content by message id", async () => {
    mockQuery.mockResolvedValueOnce([{}] as any);

    await EditMessageById(12, "new content");

    expect(mockQuery).toHaveBeenCalledWith(
      "UPDATE messages SET content = ? WHERE id = ?",
      ["new content", 12]
    );
  });
});


describe("getUserCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns correct user count", async () => {
    (pool.query as any).mockResolvedValueOnce([[{ count: 10 }]]);
    const result = await getUserCount();
    expect(result).toBe(10);
    expect(pool.query).toHaveBeenCalledWith("SELECT COUNT(*) AS count FROM users");
  });

});

describe("getMessageCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns correct message count", async () => {
    (pool.query as any).mockResolvedValueOnce([[{ count: 25 }]]);
    const result = await getMessageCount();
    expect(result).toBe(25);
    expect(pool.query).toHaveBeenCalledWith("SELECT COUNT(*) AS count FROM messages");
  });

});


vi.mock("./db", () => ({
  pool: { query: vi.fn() },
}));

describe("getAllUsers", () => {
  it("returns all users", async () => {
    const now = new Date();
    const mockRows = [
      {
        id: 1,
        keycloak_id: Buffer.from("00112233445566778899aabbccddeeff", "hex"),
        name: "Alice",
        created_at: now,
      },
      {
        id: 2,
        keycloak_id: Buffer.from("ffeeddccbbaa99887766554433221100", "hex"),
        name: "Bob",
        created_at: now,
      },
    ] as UserTableEntry[];

    (pool.query as Mock).mockResolvedValueOnce([mockRows]);

    const result = await getAllUsers();

    expect(pool.query).toHaveBeenCalledWith("SELECT * FROM users");
    expect(result).toEqual(mockRows);
  });

  it("throws when query fails", async () => {
    (pool.query as Mock).mockRejectedValueOnce(new Error("DB Error"));
    await expect(getAllUsers()).rejects.toThrow("DB Error");
  });
});