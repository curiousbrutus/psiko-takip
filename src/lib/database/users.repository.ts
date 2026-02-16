/**
 * User Repository
 *
 * Data access layer for user operations
 */

import oracledb from 'oracledb';
import { executeQuery, executeProcedure } from './config';
import { hashPassword } from '../auth/jwt';

export interface User {
  userId: string;
  email: string;
  displayName?: string;
  role: 'danisan' | 'terapist' | 'kurum_yoneticisi';
  connectedTherapistId?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  displayName: string;
  role: 'danisan' | 'terapist' | 'kurum_yoneticisi';
  phone?: string;
}

/**
 * Create a new user
 */
export async function createUser(userData: CreateUserData): Promise<User> {
  const passwordHash = await hashPassword(userData.password);

  const binds = {
    p_user_id: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    p_email: userData.email,
    p_password_hash: passwordHash,
    p_display_name: userData.displayName,
    p_role: userData.role,
  };

  await executeProcedure(
    'sp_create_user(:p_email, :p_password_hash, :p_display_name, :p_role, :p_user_id)',
    binds
  );

  return await getUserById(binds.p_user_id as string);
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const result = await executeQuery<User>(
    `SELECT user_id as "userId", email, display_name as "displayName", role, 
            connected_therapist_id as "connectedTherapistId", phone, status,
            created_at as "createdAt", updated_at as "updatedAt", last_login as "lastLogin"
     FROM users WHERE user_id = :userId`,
    { userId }
  );

  return result.rows && result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await executeQuery<User>(
    `SELECT user_id as "userId", email, display_name as "displayName", role,
            connected_therapist_id as "connectedTherapistId", phone, status,
            created_at as "createdAt", updated_at as "updatedAt", last_login as "lastLogin"
     FROM users WHERE email = :email`,
    { email }
  );

  return result.rows && result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Get user with password hash (for authentication)
 */
export async function getUserWithPassword(
  email: string
): Promise<(User & { passwordHash: string }) | null> {
  const result = await executeQuery(
    `SELECT user_id as "userId", email, password_hash as "passwordHash", 
            display_name as "displayName", role, status,
            connected_therapist_id as "connectedTherapistId", phone,
            created_at as "createdAt", updated_at as "updatedAt", last_login as "lastLogin"
     FROM users WHERE email = :email AND status = 'active'`,
    { email }
  );

  return result.rows && result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: { displayName?: string; phone?: string }
): Promise<User> {
  const binds = {
    p_user_id: userId,
    p_display_name: updates.displayName,
    p_phone: updates.phone,
  };

  await executeProcedure(
    'sp_update_user_profile(:p_user_id, :p_display_name, :p_phone)',
    binds
  );

  return await getUserById(userId);
}

/**
 * Update user password
 */
export async function updateUserPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const passwordHash = await hashPassword(newPassword);

  const binds = {
    p_user_id: userId,
    p_new_password_hash: passwordHash,
  };

  await executeProcedure(
    'sp_change_password(:p_user_id, :p_new_password_hash)',
    binds
  );
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  await executeQuery(
    `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = :userId`,
    { userId }
  );
}

/**
 * Connect client to therapist
 */
export async function connectClientToTherapist(
  clientId: string,
  therapistId: string
): Promise<void> {
  const binds = {
    p_client_id: clientId,
    p_therapist_id: therapistId,
  };

  await executeProcedure(
    'sp_connect_client_therapist(:p_client_id, :p_therapist_id)',
    binds
  );
}

/**
 * Get therapist's clients
 */
export async function getTherapistClients(
  therapistId: string
): Promise<User[]> {
  const result = await executeQuery<User>(
    `SELECT u.user_id as "userId", u.email, u.display_name as "displayName", 
            u.role, u.status, u.created_at as "createdAt", u.last_login as "lastLogin",
            g.user_level as "level", g.current_streak as "currentStreak", g.xp
     FROM users u
     LEFT JOIN gamification g ON u.user_id = g.user_id
     WHERE u.connected_therapist_id = :therapistId AND u.role = 'danisan'
     ORDER BY u.display_name`,
    { therapistId }
  );

  return result.rows || [];
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string): Promise<any> {
  const result = await executeQuery(
    `SELECT 
        (SELECT COUNT(*) FROM mood_entries WHERE user_id = :userId) as "totalMoods",
        (SELECT COUNT(*) FROM journal_entries WHERE user_id = :userId) as "totalJournals",
        (SELECT COUNT(*) FROM test_submissions WHERE user_id = :userId) as "totalTests",
        (SELECT COUNT(*) FROM appointments WHERE client_id = :userId) as "totalAppointments",
        (SELECT xp FROM gamification WHERE user_id = :userId) as "totalXp",
        (SELECT user_level FROM gamification WHERE user_id = :userId) as "currentLevel",
        (SELECT current_streak FROM gamification WHERE user_id = :userId) as "currentStreak"
     FROM DUAL`,
    { userId }
  );

  return result.rows && result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Deactivate user account
 */
export async function deactivateUser(userId: string): Promise<void> {
  await executeQuery(
    `UPDATE users SET status = 'inactive' WHERE user_id = :userId`,
    { userId }
  );
}

/**
 * Activate user account
 */
export async function activateUser(userId: string): Promise<void> {
  await executeQuery(
    `UPDATE users SET status = 'active' WHERE user_id = :userId`,
    { userId }
  );
}

/**
 * Delete user (soft delete by setting status)
 */
export async function deleteUser(userId: string): Promise<void> {
  await executeQuery(
    `UPDATE users SET status = 'suspended' WHERE user_id = :userId`,
    { userId }
  );
}

/**
 * Search users (for admin/therapist)
 */
export async function searchUsers(
  query: string,
  role?: string,
  limit: number = 50
): Promise<User[]> {
  let sql = `
    SELECT user_id as "userId", email, display_name as "displayName", 
           role, status, created_at as "createdAt"
    FROM users
    WHERE (LOWER(email) LIKE :query OR LOWER(display_name) LIKE :query)
  `;

  const binds: any = { query: `%${query.toLowerCase()}%` };

  if (role) {
    sql += ` AND role = :role`;
    binds.role = role;
  }

  sql += ` ORDER BY display_name FETCH FIRST :limit ROWS ONLY`;
  binds.limit = limit;

  const result = await executeQuery<User>(sql, binds);

  return result.rows || [];
}

export default {
  createUser,
  getUserById,
  getUserByEmail,
  getUserWithPassword,
  updateUserProfile,
  updateUserPassword,
  updateLastLogin,
  connectClientToTherapist,
  getTherapistClients,
  getUserStats,
  deactivateUser,
  activateUser,
  deleteUser,
  searchUsers,
};
