import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { hash } from 'bcryptjs';
import { User, UserRole } from '@psikotakip/shared/types';
import { OracleService } from '../database/oracle.service';
import { ConnectClientDto } from './dto/connect-client.dto';
import { SearchUsersQueryDto } from './dto/search-users-query.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface DbUser extends User {
  passwordHash: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly oracleService: OracleService) {}

  async findByEmailWithPassword(email: string): Promise<DbUser | null> {
    const result = await this.oracleService.executeQuery<DbUser>(
      `SELECT user_id as "userId", email, password_hash as "passwordHash",
              display_name as "displayName", role as "role", status as "status",
              connected_therapist_id as "connectedTherapistId", phone as "phone"
       FROM psk_ebg_users
       WHERE email = :email`,
      { email }
    );

    return result.rows && result.rows.length > 0 ? result.rows[0] : null;
  }

  async createUser(input: {
    email: string;
    passwordHash: string;
    displayName: string;
    role: UserRole;
  }): Promise<User> {
    const userId = `USR_${Date.now()}`;

    await this.oracleService.executeQuery(
      `INSERT INTO psk_ebg_users (user_id, email, password_hash, display_name, role, status)
       VALUES (:userId, :email, :passwordHash, :displayName, :role, 'active')`,
      {
        userId,
        email: input.email,
        passwordHash: input.passwordHash,
        displayName: input.displayName,
        role: input.role,
      },
      { autoCommit: true }
    );

    return {
      userId,
      email: input.email,
      displayName: input.displayName,
      role: input.role,
      status: 'active',
    };
  }

  async getProfile(userId: string): Promise<User | null> {
    const result = await this.oracleService.executeQuery<User>(
      `SELECT user_id as "userId", email, display_name as "displayName",
              role as "role", status as "status",
              connected_therapist_id as "connectedTherapistId", phone as "phone"
       FROM psk_ebg_users
       WHERE user_id = :userId`,
      { userId }
    );

    return result.rows && result.rows.length > 0 ? result.rows[0] : null;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<void> {
    await this.oracleService.executeQuery(
      `UPDATE psk_ebg_users
       SET display_name = COALESCE(:displayName, display_name),
           phone = COALESCE(:phone, phone)
       WHERE user_id = :userId`,
      {
        userId,
        displayName: dto.displayName || null,
        phone: dto.phone || null,
      },
      { autoCommit: true }
    );
  }

  async changePassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await hash(newPassword, 10);
    await this.oracleService.executeQuery(
      `UPDATE psk_ebg_users
       SET password_hash = :passwordHash
       WHERE user_id = :userId`,
      { userId, passwordHash },
      { autoCommit: true }
    );
  }

  async getTherapistClients(therapistId: string) {
    const result = await this.oracleService.executeQuery(
      `SELECT u.user_id as "userId", u.email as "email", u.display_name as "displayName",
              u.role as "role", u.status as "status", u.created_at as "createdAt", u.last_login as "lastLogin",
              g.user_level as "level", g.current_streak as "currentStreak", g.xp as "xp"
       FROM psk_ebg_users u
       LEFT JOIN psk_ebg_gamification g ON u.user_id = g.user_id
       WHERE u.connected_therapist_id = :therapistId AND u.role = 'danisan'
       ORDER BY u.display_name`,
      { therapistId }
    );

    return result.rows || [];
  }

  async connectClientToTherapist(therapistId: string, dto: ConnectClientDto) {
    const existingClient = await this.findByEmailWithPassword(dto.email);

    if (!existingClient) {
      throw new NotFoundException('Bu e-posta adresine sahip kullanici bulunamadi');
    }

    if (existingClient.role !== 'danisan') {
      throw new BadRequestException('Bu kullanici bir danisan degil');
    }

    if (existingClient.connectedTherapistId) {
      throw new BadRequestException('Bu danisan zaten bir terapiste bagli');
    }

    await this.oracleService.executeQuery(
      `UPDATE psk_ebg_users
       SET connected_therapist_id = :therapistId
       WHERE user_id = :clientId`,
      {
        therapistId,
        clientId: existingClient.userId,
      },
      { autoCommit: true }
    );

    return {
      clientId: existingClient.userId,
      clientName: existingClient.displayName,
      clientEmail: existingClient.email,
    };
  }

  async searchUsers(query: SearchUsersQueryDto) {
    let sql = `
      SELECT user_id as "userId", email as "email", display_name as "displayName",
             role as "role", status as "status", created_at as "createdAt"
      FROM psk_ebg_users
      WHERE (LOWER(email) LIKE :query OR LOWER(display_name) LIKE :query)
    `;

    const binds: BindParameters = {
      query: `%${query.q.toLowerCase()}%`,
    };

    if (query.role) {
      sql += ' AND role = :role';
      binds.role = query.role;
    }

    sql += ' ORDER BY display_name FETCH FIRST 50 ROWS ONLY';

    const result = await this.oracleService.executeQuery(sql, binds);
    return result.rows || [];
  }

  async getClientDetailForTherapist(therapistId: string, clientId: string) {
    const clientResult = await this.oracleService.executeQuery<User>(
      `SELECT user_id as "userId", email as "email", display_name as "displayName",
              role as "role", status as "status",
              connected_therapist_id as "connectedTherapistId", phone as "phone"
       FROM psk_ebg_users
       WHERE user_id = :clientId`,
      { clientId }
    );

    if (!clientResult.rows || clientResult.rows.length === 0) {
      throw new NotFoundException('Danisan bulunamadi');
    }

    const client = clientResult.rows[0];
    if (client.connectedTherapistId !== therapistId) {
      throw new ForbiddenException('Bu danisanin verilerine erisim yetkiniz yok');
    }

    const [journalResult, testResult, appointmentResult, taskResult, moodResult, gamificationResult] =
      await Promise.all([
        this.oracleService.executeQuery(
          `SELECT entry_id as "entryId", content as "content", prompt as "prompt",
                  is_shared as "isShared", created_at as "createdAt"
           FROM psk_ebg_journal_entries
           WHERE user_id = :clientId AND is_shared = 1
           ORDER BY created_at DESC FETCH FIRST 20 ROWS ONLY`,
          { clientId }
        ),
        this.oracleService.executeQuery(
          `SELECT submission_id as "submissionId", test_name as "testName",
                  total_score as "totalScore", severity_level as "severityLevel",
                  submitted_at as "createdAt"
           FROM psk_ebg_test_submissions
           WHERE user_id = :clientId
           ORDER BY submitted_at DESC FETCH FIRST 20 ROWS ONLY`,
          { clientId }
        ),
        this.oracleService.executeQuery(
          `SELECT appointment_id as "appointmentId", appointment_date as "appointmentDate",
                  appointment_type as "appointmentType", duration_minutes as "durationMinutes",
                  description as "description", status as "status", created_at as "createdAt"
           FROM psk_ebg_appointments
           WHERE client_id = :clientId AND therapist_id = :therapistId
           ORDER BY appointment_date DESC FETCH FIRST 20 ROWS ONLY`,
          { clientId, therapistId }
        ),
        this.oracleService.executeQuery(
          `SELECT task_id as "taskId", title as "title", description as "description",
                  task_type as "taskType", fields as "fields", status as "status",
                  created_at as "createdAt", updated_at as "updatedAt"
           FROM psk_ebg_collaborative_tasks
           WHERE client_id = :clientId AND therapist_id = :therapistId
           ORDER BY created_at DESC FETCH FIRST 20 ROWS ONLY`,
          { clientId, therapistId }
        ),
        this.oracleService.executeQuery(
          `SELECT entry_id as "entryId", mood as "mood", period as "period", notes as "notes",
                  created_at as "createdAt"
           FROM psk_ebg_mood_entries
           WHERE user_id = :clientId
           ORDER BY created_at DESC FETCH FIRST 30 ROWS ONLY`,
          { clientId }
        ),
        this.oracleService.executeQuery(
          `SELECT xp as "xp", user_level as "level", current_streak as "currentStreak",
                  longest_streak as "longestStreak", total_tasks_completed as "totalTasksCompleted"
           FROM psk_ebg_gamification
           WHERE user_id = :clientId`,
          { clientId }
        ),
      ]);

    return {
      client,
      journals: journalResult.rows || [],
      tests: testResult.rows || [],
      appointments: appointmentResult.rows || [],
      tasks: taskResult.rows || [],
      moods: moodResult.rows || [],
      gamification:
        gamificationResult.rows && gamificationResult.rows.length > 0
          ? gamificationResult.rows[0]
          : null,
    };
  }
}
