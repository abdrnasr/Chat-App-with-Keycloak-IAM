import { describe, it, beforeEach, vi, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Adjust the import if your path differs.
import Summary from "@/app/summary/page";

// --- Mocks ---
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/authcheck", () => ({
  hasPermission: vi.fn(),
}));

vi.mock("@/lib/dbquery", () => ({
  getUserCount: vi.fn(),
  getMessageCount: vi.fn(),
}));

vi.mock("../components/Minicomps/Signout", () => ({
  default: () => <button>Sign out</button>,
}));

const mockedNotFound = vi.mocked(
  await import("next/navigation").then(m => m.notFound),
);
const mockedAuth = vi.mocked(await import("@/auth").then(m => m.auth));
const mockedHasPermission = vi.mocked(
  await import("@/lib/authcheck").then(m => m.hasPermission),
);
const { getUserCount, getMessageCount } = vi.mocked(
  await import("@/lib/dbquery"),
);

describe("Summary page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls notFound when user is unauthenticated", async () => {
    mockedAuth.mockResolvedValueOnce(null as any);
    mockedNotFound.mockImplementationOnce(() => {
      throw new Error("notFound");
    });

    await expect(Summary()).rejects.toThrow("notFound");
    expect(mockedNotFound).toHaveBeenCalledTimes(1);
  });

  it("calls notFound when user lacks permission", async () => {
    mockedAuth.mockResolvedValueOnce({
      user: { name: "Alice", roles: ["user"] },
    } as any);
    mockedHasPermission.mockReturnValueOnce(false);
    mockedNotFound.mockImplementationOnce(() => {
      throw new Error("notFound");
    });

    await expect(Summary()).rejects.toThrow("notFound");
    expect(mockedNotFound).toHaveBeenCalledTimes(1);
  });

  it("renders stats when user has permission", async () => {
    mockedAuth.mockResolvedValueOnce({
      user: { name: "Alice", roles: ["summary.view"] },
    } as any);
    mockedHasPermission.mockReturnValueOnce(true);
    (getUserCount as any).mockResolvedValueOnce(5);
    (getMessageCount as any).mockResolvedValueOnce(42);

    const ui = await Summary();
    render(ui);


    expect(screen.getByText("User Count")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Message Count")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
    expect(mockedNotFound).not.toHaveBeenCalled();
  });
});
