export type UserRole = 'danisan' | 'terapist' | 'kurum_yoneticisi';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  connectedTherapistId?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface ClientUser extends User {
  role: 'danisan';
  connectedTherapistId?: string;
}

export interface TherapistUser extends User {
  role: 'terapist';
}

export interface AdminUser extends User {
  role: 'kurum_yoneticisi';
}
