export const ROLES = {
  DANISAN: 'danisan',
  TERAPIST: 'terapist',
  KURUM_YONETICISI: 'kurum_yoneticisi',
} as const;

export type RoleValue = (typeof ROLES)[keyof typeof ROLES];
