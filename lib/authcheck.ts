// Each role has a list of allowed permissions
const ROLE_PERMISSIONS: Record<string, readonly string[]> = {
  'chat-admin': ["post.create", "post.edit", "post.delete", "post.view","summary.view"],
  'chat-editor': ["post.create", "post.edit", "post.view"],
  'chat-user': ["post.view", "post.create"],
};

// Check if a user has a ROLE with the specific permission
export function hasPermission(roles: string[], permission: string): boolean {
  return roles.some(role => ROLE_PERMISSIONS[role]?.includes(permission));
}