import { Module } from '@nestjs/common';
import { AppointmentsModule } from './appointments/appointments.module';
import { AssessmentModule } from './assessment/assessment.module';
import { CollaborativeTasksModule } from './collaborative-tasks/collaborative-tasks.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth';
import { GamificationModule } from './gamification/gamification.module';
import { GratitudeModule } from './gratitude/gratitude.module';
import { JournalModule } from './journal/journal.module';
import { MoodModule } from './mood/mood.module';
import { TestsModule } from './tests/tests.module';
import { oracleConfig } from './config/oracle.config';
import { jwtConfig } from './config/jwt.config';
import { OracleModule } from './database/oracle.module';
import { UsersModule } from './users';
import { AiModule } from './ai';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [oracleConfig, jwtConfig],
      envFilePath: ['apps/api/.env', '.env', '../../.env'],
    }),
    OracleModule,
    AppointmentsModule,
    AssessmentModule,
    CollaborativeTasksModule,
    AuthModule,
    MoodModule,
    JournalModule,
    GratitudeModule,
    GamificationModule,
    TestsModule,
    UsersModule,
    AiModule,
  ],
})
export class AppModule {}
