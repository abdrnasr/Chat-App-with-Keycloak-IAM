import { describe, it, expect } from "vitest";
import { hasPermission } from "@/lib/authcheck";

describe("hasPermission", () => {
  it("returns true if any of multiple roles has the permission", () => {
    const roles = ["chat-user", "chat-editor"]; // chat-editor has 'post.edit'
    expect(hasPermission(roles, "post.edit")).toBe(true);
  });

  it("returns true when a single role includes the permission", () => {
    const roles = ["chat-admin"];
    expect(hasPermission(roles, "post.delete")).toBe(true);
  });

  it("returns false when no roles are provided", () => {
    const roles: string[] = [];
    expect(hasPermission(roles, "post.view")).toBe(false);
  });

  it("returns false if none of the roles has the permission", () => {
    const roles = ["chat-user"]; // does not have post.delete
    expect(hasPermission(roles, "post.delete")).toBe(false);
  });
});