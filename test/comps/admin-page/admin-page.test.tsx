// admin-page.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Hoisted static mocks
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NF");
  }),
}));
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/authcheck", () => ({ hasPermission: vi.fn() }));
vi.mock("@/lib/dbquery", () => ({ getAllUsers: vi.fn() }));
vi.mock("@/lib/utils", () => ({ bufferToUuid: vi.fn((x: string) => `uuid-${x}`) }));
vi.mock("../components/Minicomps/Signout", () => ({
  default: () => <div data-testid="signout-btn" />,
}));
vi.mock("@/app/components/Minicomps/Signout", () => ({
  default: () => <div data-testid="signout-btn" />,
}));

// Imports after mocks
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/authcheck";
import { getAllUsers } from "@/lib/dbquery";
import AdminPage from "@/app/admin-page/page";

describe("access control", () => {
  beforeEach(() => vi.clearAllMocks());

  it("notFound when no session", async () => {
    (auth as any).mockResolvedValue(null);
    await expect(AdminPage()).rejects.toThrow("NF");
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("notFound when lacking permission", async () => {
    (auth as any).mockResolvedValue({ user: { name: "u", roles: [] } });
    (hasPermission as any).mockReturnValue(false);
    await expect(AdminPage()).rejects.toThrow("NF");
    expect(notFound).toHaveBeenCalledTimes(1);
  });
});

describe("rendering", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders table rows and header button", async () => {
    (auth as any).mockResolvedValue({ user: { name: "u1", roles: ["admin.view"] } });
    (hasPermission as any).mockReturnValue(true);
    (getAllUsers as any).mockResolvedValue([
      { id: 1, name: "alice", keycloak_id: "k1", created_at: "2025-10-07T00:00:00Z" },
      { id: 2, name: "bob", keycloak_id: "k2", created_at: "2025-10-06T00:00:00Z" },
    ]);

    const element = await AdminPage();
    render(element);

    // existence checks using Chai
    expect(screen.getByTestId("signout-btn")).to.exist;
    expect(screen.getByRole("table")).to.exist;

    // cells presence (getBy* throws if missing)
    screen.getByText("alice");
    screen.getByText("bob");
    screen.getByText("uuid-k1");
    screen.getByText("uuid-k2");
    screen.getByText("2025-10-07");
    screen.getByText("2025-10-06");
  });
});
