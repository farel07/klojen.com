// constants/roles.ts

export const ROLES = {
  READER: 'reader',
  JOURNALIST: 'journalist',
  EDITOR: 'editor',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const canPublish = (role: Role) =>
  ([ROLES.EDITOR, ROLES.ADMIN] as Role[]).includes(role);

export const canDeleteComment = (role: Role) =>
  ([ROLES.EDITOR, ROLES.ADMIN] as Role[]).includes(role);

export const canManageUsers = (role: Role) => role === ROLES.ADMIN;

export const CMS_ROLES: Role[] = [ROLES.JOURNALIST, ROLES.EDITOR, ROLES.ADMIN];
