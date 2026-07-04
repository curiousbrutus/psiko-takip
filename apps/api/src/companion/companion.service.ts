import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OracleService } from '../database/oracle.service';
import { AiService, ChatMessage } from '../ai/ai.service';
import { SetCompanionConfigDto } from './dto/set-companion-config.dto';

export interface CompanionConfig {
  approach?: string;
  tone?: string;
  goals?: string;
  forbiddenTopics?: string;
  treatmentNotes?: string;
  escalationSensitivity?: string;
}

// Deterministic, code-level risk screen (belt-and-suspenders alongside the model).
// NOTE: heuristic only — must be reviewed/expanded by a clinician. No auto-dispatch.
const HIGH_RISK = [
  'intihar',
  'kendimi öldür',
  'canıma kıy',
  'ölmek istiyorum',
  'yaşamak istemiyorum',
  'kendime zarar',
  'bileğimi',
  'hap içt',
  'yaşamın anlamı yok',
  'son vermek istiyorum',
];
const MEDIUM_RISK = [
  'umutsuz',
  'değersizim',
  'dayanamıyorum',
  'kimse beni sevmiyor',
  'çok yalnızım',
  'boğuluyorum',
  'tükendim',
  'nefret ediyorum kendimden',
  'kaçmak istiyorum',
];

const CRISIS_PREFIX =
  'Şu an yaşadıkların çok ağır olabilir ve bunu benimle paylaşman önemli. ' +
  'Yalnız değilsin. Lütfen en kısa sürede terapistine ulaş; acil bir tehlike ' +
  'hissediyorsan 112’yi ara ya da güvendiğin birinden yanında olmasını iste. ';

@Injectable()
export class CompanionService {
  constructor(
    private readonly oracle: OracleService,
    private readonly ai: AiService
  ) {}

  private screenRisk(text: string): { severity: 'high' | 'medium' | null; reason?: string } {
    const t = text.toLocaleLowerCase('tr');
    const hi = HIGH_RISK.find(k => t.includes(k));
    if (hi) return { severity: 'high', reason: `Riskli ifade: "${hi}"` };
    const mid = MEDIUM_RISK.find(k => t.includes(k));
    if (mid) return { severity: 'medium', reason: `Zorlanma ifadesi: "${mid}"` };
    return { severity: null };
  }

  private async requireTherapistOwnsClient(therapistId: string, clientId: string) {
    const res = await this.oracle.executeQuery<{ connectedTherapistId: string }>(
      `SELECT connected_therapist_id as "connectedTherapistId"
       FROM psk_ebg_users WHERE user_id = :clientId AND role = 'danisan'`,
      { clientId }
    );
    const row = res.rows && res.rows[0];
    if (!row) throw new NotFoundException('Danışan bulunamadı');
    if (row.connectedTherapistId !== therapistId) {
      throw new ForbiddenException('Bu danışan için yetkiniz yok');
    }
  }

  async getConfig(therapistId: string, clientId: string) {
    await this.requireTherapistOwnsClient(therapistId, clientId);
    const res = await this.oracle.executeQuery<CompanionConfig>(
      `SELECT approach as "approach", tone as "tone", goals as "goals",
              forbidden_topics as "forbiddenTopics", treatment_notes as "treatmentNotes",
              escalation_sensitivity as "escalationSensitivity"
       FROM psk_ebg_companion_config
       WHERE therapist_id = :therapistId AND client_id = :clientId`,
      { therapistId, clientId }
    );
    return (res.rows && res.rows[0]) || null;
  }

  async setConfig(therapistId: string, clientId: string, dto: SetCompanionConfigDto) {
    await this.requireTherapistOwnsClient(therapistId, clientId);
    const existing = await this.oracle.executeQuery<{ configId: string }>(
      `SELECT config_id as "configId" FROM psk_ebg_companion_config
       WHERE therapist_id = :therapistId AND client_id = :clientId`,
      { therapistId, clientId }
    );

    const binds = {
      approach: dto.approach ?? null,
      tone: dto.tone ?? null,
      goals: dto.goals ?? null,
      forbiddenTopics: dto.forbiddenTopics ?? null,
      treatmentNotes: dto.treatmentNotes ?? null,
      escalationSensitivity: dto.escalationSensitivity ?? 'medium',
      therapistId,
      clientId,
    };

    if (existing.rows && existing.rows.length > 0) {
      await this.oracle.executeQuery(
        `UPDATE psk_ebg_companion_config
         SET approach = :approach, tone = :tone, goals = :goals,
             forbidden_topics = :forbiddenTopics, treatment_notes = :treatmentNotes,
             escalation_sensitivity = :escalationSensitivity, updated_at = CURRENT_TIMESTAMP
         WHERE therapist_id = :therapistId AND client_id = :clientId`,
        binds,
        { autoCommit: true }
      );
    } else {
      await this.oracle.executeQuery(
        `INSERT INTO psk_ebg_companion_config
           (config_id, therapist_id, client_id, approach, tone, goals,
            forbidden_topics, treatment_notes, escalation_sensitivity)
         VALUES (:configId, :therapistId, :clientId, :approach, :tone, :goals,
            :forbiddenTopics, :treatmentNotes, :escalationSensitivity)`,
        { ...binds, configId: `CFG_${Date.now()}` },
        { autoCommit: true }
      );
    }
    return { success: true };
  }

  async getMessages(clientId: string) {
    const res = await this.oracle.executeQuery(
      `SELECT message_id as "messageId", role as "role", content as "content",
              flagged as "flagged", created_at as "createdAt"
       FROM psk_ebg_companion_messages
       WHERE client_id = :clientId
       ORDER BY created_at ASC
       FETCH FIRST 100 ROWS ONLY`,
      { clientId }
    );
    return res.rows || [];
  }

  async getFlags(therapistId: string, clientId: string) {
    await this.requireTherapistOwnsClient(therapistId, clientId);
    const res = await this.oracle.executeQuery(
      `SELECT message_id as "messageId", content as "content",
              flag_severity as "severity", flag_reason as "reason",
              created_at as "createdAt"
       FROM psk_ebg_companion_messages
       WHERE client_id = :clientId AND flagged = 1
       ORDER BY created_at DESC
       FETCH FIRST 50 ROWS ONLY`,
      { clientId }
    );
    return res.rows || [];
  }

  async chat(clientId: string, message: string) {
    // 1) Who is the client + which therapist configured the Yoldaş
    const clientRes = await this.oracle.executeQuery<{
      displayName: string;
      therapistId: string | null;
    }>(
      `SELECT display_name as "displayName", connected_therapist_id as "therapistId"
       FROM psk_ebg_users WHERE user_id = :clientId`,
      { clientId }
    );
    const client = clientRes.rows && clientRes.rows[0];
    const therapistId = client?.therapistId || null;

    const config = therapistId
      ? await this.oracle
          .executeQuery<CompanionConfig>(
            `SELECT approach as "approach", tone as "tone", goals as "goals",
                    forbidden_topics as "forbiddenTopics", treatment_notes as "treatmentNotes"
             FROM psk_ebg_companion_config
             WHERE therapist_id = :therapistId AND client_id = :clientId`,
            { therapistId, clientId }
          )
          .then(r => (r.rows && r.rows[0]) || null)
      : null;

    // 2) Longitudinal client context (RAG-lite over the client's own record)
    const [moods, journals, tests, history] = await Promise.all([
      this.oracle.executeQuery(
        `SELECT mood as "mood", created_at as "createdAt" FROM psk_ebg_mood_entries
         WHERE user_id = :clientId ORDER BY created_at DESC FETCH FIRST 5 ROWS ONLY`,
        { clientId }
      ),
      this.oracle.executeQuery(
        `SELECT content as "content" FROM psk_ebg_journal_entries
         WHERE user_id = :clientId ORDER BY created_at DESC FETCH FIRST 3 ROWS ONLY`,
        { clientId }
      ),
      this.oracle.executeQuery(
        `SELECT test_name as "testName", total_score as "totalScore",
                severity_level as "severityLevel" FROM psk_ebg_test_submissions
         WHERE user_id = :clientId ORDER BY submitted_at DESC FETCH FIRST 3 ROWS ONLY`,
        { clientId }
      ),
      this.oracle.executeQuery<{ role: string; content: string }>(
        `SELECT role as "role", content as "content" FROM (
           SELECT role, content, created_at FROM psk_ebg_companion_messages
           WHERE client_id = :clientId ORDER BY created_at DESC FETCH FIRST 8 ROWS ONLY
         ) ORDER BY created_at ASC`,
        { clientId }
      ),
    ]);

    const system = this.buildSystemPrompt(client?.displayName || 'danışan', config, {
      moods: (moods.rows as Array<{ mood: string }>) || [],
      journals: (journals.rows as Array<{ content: string }>) || [],
      tests:
        (tests.rows as Array<{ testName: string; totalScore: number; severityLevel: string }>) ||
        [],
    });

    const messages: ChatMessage[] = [{ role: 'system', content: system }];
    for (const h of (history.rows as Array<{ role: string; content: string }>) || []) {
      messages.push({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content });
    }
    messages.push({ role: 'user', content: message });

    // 3) Risk screen (deterministic) on the client's message
    const risk = this.screenRisk(message);

    // 4) Generate
    let replyText: string;
    try {
      const result = await this.ai.chat(messages, { temperature: 0.7 });
      replyText = result.response.trim();
    } catch {
      replyText =
        'Şu an sana yanıt vermekte küçük bir güçlük yaşıyorum, ama buradayım. ' +
        'Birazdan tekrar dener misin? Dilersen bu arada bir nefes egzersizi yapabiliriz.';
    }
    if (risk.severity === 'high') {
      replyText = CRISIS_PREFIX + replyText;
    }

    // 5) Persist both turns; flag the user message if risky
    const userMsgId = `MSG_${Date.now()}_u`;
    const botMsgId = `MSG_${Date.now()}_a`;
    await this.oracle.executeQuery(
      `INSERT INTO psk_ebg_companion_messages
         (message_id, client_id, role, content, flagged, flag_severity, flag_reason)
       VALUES (:id, :clientId, 'user', :content, :flagged, :severity, :reason)`,
      {
        id: userMsgId,
        clientId,
        content: message,
        flagged: risk.severity ? 1 : 0,
        severity: risk.severity,
        reason: risk.reason ?? null,
      },
      { autoCommit: true }
    );
    await this.oracle.executeQuery(
      `INSERT INTO psk_ebg_companion_messages (message_id, client_id, role, content)
       VALUES (:id, :clientId, 'assistant', :content)`,
      { id: botMsgId, clientId, content: replyText },
      { autoCommit: true }
    );

    return {
      reply: replyText,
      flagged: Boolean(risk.severity),
      severity: risk.severity,
    };
  }

  private buildSystemPrompt(
    clientName: string,
    config: CompanionConfig | null,
    ctx: {
      moods: Array<{ mood: string }>;
      journals: Array<{ content: string }>;
      tests: Array<{ testName: string; totalScore: number; severityLevel: string }>;
    }
  ): string {
    const approach = config?.approach || 'bütünleştirici, kanıta dayalı';
    const tone = config?.tone || 'şefkatli ve sıcak';

    const lines: string[] = [
      `Sen "Yoldaş"sın — ${clientName} adlı danışanın, terapistinin YANINDA çalışan dijital destek yoldaşısın.`,
      '',
      'TEMEL KURALLAR (kesinlikle uy):',
      '- Sen bir terapist DEĞİLSİN ve terapistin yerini ALMAZSIN. Danışanı her zaman terapistine ve gerçek insan ilişkilerine yönlendir; "bunu bir sonraki seansta terapistinle konuşmak ister misin?" gibi köprüler kur.',
      '- Asla tıbbi tanı koyma, ilaç veya doz önerme, terapistin söylediklerini çürütme.',
      '- Yalnızca davranışsal öneri ve nazik hatırlatma yapabilirsin (günlük yaz, nefes/topraklanma egzersizi, kısa yürüyüş, sevdiğine ulaş, randevuna git, ilacını almayı unutma).',
      '- Kriz veya kendine zarar sinyali görürsen ciddiye al, şefkatle karşıla, terapistine ve gerektiğinde 112’ye başvurmasını öner; asla küçümseme.',
      '- Kısa, sıcak, akıcı ve doğal TÜRKÇE konuş (2-4 cümle). Yargılamadan dinle, aç uçlu bir soruyla kapat.',
      '',
      `TERAPİSTİN YAKLAŞIMI: ${approach}. KONUŞMA TONU: ${tone}.`,
    ];

    if (config?.goals) lines.push(`BU DANIŞAN İÇİN HEDEFLER: ${config.goals}`);
    if (config?.forbiddenTopics)
      lines.push(`KAÇINILACAK KONULAR (girme): ${config.forbiddenTopics}`);
    if (config?.treatmentNotes)
      lines.push(
        `TERAPİST NOTLARI (yalnızca senin rehberin; danışana AÇIKLAMA/SÖYLEME): ${config.treatmentNotes}`
      );

    const ctxLines: string[] = [];
    if (ctx.moods.length)
      ctxLines.push(`- Son ruh halleri: ${ctx.moods.map(m => m.mood).join(', ')}`);
    if (ctx.tests.length)
      ctxLines.push(
        `- Son testler: ${ctx.tests
          .map(t => `${t.testName} (${t.totalScore}${t.severityLevel ? ', ' + t.severityLevel : ''})`)
          .join('; ')}`
      );
    if (ctx.journals.length)
      ctxLines.push(
        `- Son günlük notları (özet): ${ctx.journals
          .map(j => (j.content || '').slice(0, 160))
          .join(' | ')}`
      );
    if (ctxLines.length) {
      lines.push('', 'DANIŞAN BAĞLAMI (yalnızca senin farkındalığın için):', ...ctxLines);
    }

    return lines.join('\n');
  }
}
