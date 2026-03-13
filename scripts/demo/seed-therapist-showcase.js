/* eslint-disable no-console */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const DEFAULT_PASSWORD = process.env.DEMO_DEFAULT_PASSWORD || 'Test123!';
const DEMO_TAG =
  process.env.DEMO_TAG ||
  `run${Date.now().toString().slice(-6)}`;

const DEMO_USERS = {
  admin: {
    email: 'admin.demo@psikotakip.com',
    password: DEFAULT_PASSWORD,
    displayName: 'Demo Kurum Yoneticisi',
    role: 'kurum_yoneticisi',
  },
  therapists: [
    {
      email: 'ayse.terapist.demo@psikotakip.com',
      password: DEFAULT_PASSWORD,
      displayName: 'Uzm. Psk. Ayse Demir',
      role: 'terapist',
    },
    {
      email: 'murat.terapist.demo@psikotakip.com',
      password: DEFAULT_PASSWORD,
      displayName: 'Klinik Psk. Murat Kaya',
      role: 'terapist',
    },
    {
      email: 'elif.terapist.demo@psikotakip.com',
      password: DEFAULT_PASSWORD,
      displayName: 'Psk. Elif Yildiz',
      role: 'terapist',
    },
  ],
  clients: [
    {
      email: 'deniz.danisan.demo@psikotakip.com',
      password: DEFAULT_PASSWORD,
      displayName: 'Deniz A.',
      role: 'danisan',
      profile: 'improving',
      therapist: 0,
    },
    {
      email: 'zeynep.danisan.demo@psikotakip.com',
      password: DEFAULT_PASSWORD,
      displayName: 'Zeynep B.',
      role: 'danisan',
      profile: 'unstable',
      therapist: 0,
    },
    {
      email: 'arda.danisan.demo@psikotakip.com',
      password: DEFAULT_PASSWORD,
      displayName: 'Arda C.',
      role: 'danisan',
      profile: 'high-risk-followup',
      therapist: 0,
    },
    {
      email: 'selin.danisan.demo@psikotakip.com',
      password: DEFAULT_PASSWORD,
      displayName: 'Selin D.',
      role: 'danisan',
      profile: 'improving',
      therapist: 1,
    },
    {
      email: 'onur.danisan.demo@psikotakip.com',
      password: DEFAULT_PASSWORD,
      displayName: 'Onur E.',
      role: 'danisan',
      profile: 'stable',
      therapist: 1,
    },
    {
      email: 'ece.danisan.demo@psikotakip.com',
      password: DEFAULT_PASSWORD,
      displayName: 'Ece F.',
      role: 'danisan',
      profile: 'unstable',
      therapist: 1,
    },
    {
      email: 'baris.danisan.demo@psikotakip.com',
      password: DEFAULT_PASSWORD,
      displayName: 'Baris G.',
      role: 'danisan',
      profile: 'stable',
      therapist: 2,
    },
    {
      email: 'melis.danisan.demo@psikotakip.com',
      password: DEFAULT_PASSWORD,
      displayName: 'Melis H.',
      role: 'danisan',
      profile: 'improving',
      therapist: 2,
    },
  ],
};

function withTag(email) {
  const [local, domain] = email.split('@');
  return `${local}.${DEMO_TAG}@${domain}`;
}

function applyDemoTag() {
  DEMO_USERS.admin.email = withTag(DEMO_USERS.admin.email);
  DEMO_USERS.therapists = DEMO_USERS.therapists.map(therapist => ({
    ...therapist,
    email: withTag(therapist.email),
  }));
  DEMO_USERS.clients = DEMO_USERS.clients.map(client => ({
    ...client,
    email: withTag(client.email),
  }));
}

function pad(number) {
  return String(number).padStart(2, '0');
}

function toOracleTimestampInput(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }

  return { response, body };
}

async function login(email, password) {
  const { response, body } = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok || !body.accessToken || !body.user) {
    throw new Error(`Login failed for ${email}: ${response.status} ${JSON.stringify(body)}`);
  }

  return {
    token: body.accessToken,
    user: body.user,
  };
}

async function registerIfNeeded(user) {
  const registrationPayload = {
    email: user.email,
    password: user.password,
    displayName: user.displayName,
    role: user.role,
  };

  try {
    return await login(user.email, user.password);
  } catch {
    const { response, body } = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registrationPayload),
    });

    if (response.ok && body?.accessToken && body?.user) {
      return {
        token: body.accessToken,
        user: body.user,
      };
    }

    if (!response.ok && response.status !== 409 && response.status !== 400) {
      throw new Error(
        `Registration failed for ${user.email}: ${response.status} ${JSON.stringify(body)}`
      );
    }

    const message = Array.isArray(body?.message)
      ? body.message.join(' ')
      : typeof body?.message === 'string'
        ? body.message
        : '';

    const looksLikeConflict =
      response.status === 409 ||
      message.toLowerCase().includes('zaten') ||
      message.toLowerCase().includes('already');

    if (looksLikeConflict) {
      return await login(user.email, user.password);
    }

    throw new Error(
      `Registration failed for ${user.email}: ${response.status} ${JSON.stringify(body)}`
    );
  }
}

async function authedPost(path, token, payload) {
  return request(path, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

async function authedPut(path, token, payload) {
  return request(path, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

async function connectClient(therapistToken, clientEmail) {
  const { response, body } = await authedPost('/users/clients', therapistToken, {
    email: clientEmail,
  });

  if (response.ok && body.success) {
    return true;
  }

  const message = Array.isArray(body?.message)
    ? body.message.join(' ')
    : typeof body?.message === 'string'
      ? body.message
      : '';

  if (response.status === 400 && message.toLowerCase().includes('zaten')) {
    return true;
  }

  return false;
}

function profileConfig(profile) {
  if (profile === 'improving') {
    return {
      moods: ['kaygili', 'orta', 'iyi', 'iyi', 'iyi'],
      baseScore: 10,
      severity: 'mild',
      journalTone: 'iyilesme',
      xp: 980,
      companion: 'filiz',
    };
  }

  if (profile === 'unstable') {
    return {
      moods: ['kaygili', 'dusuk', 'orta', 'kaygili', 'orta'],
      baseScore: 18,
      severity: 'moderate',
      journalTone: 'dalgali',
      xp: 620,
      companion: 'toz',
    };
  }

  if (profile === 'high-risk-followup') {
    return {
      moods: ['dusuk', 'dusuk', 'kaygili', 'dusuk', 'orta'],
      baseScore: 24,
      severity: 'severe',
      journalTone: 'yuksek-risk',
      xp: 410,
      companion: 'toz',
    };
  }

  return {
    moods: ['orta', 'iyi', 'orta', 'iyi', 'orta'],
    baseScore: 12,
    severity: 'mild',
    journalTone: 'stabil',
    xp: 760,
    companion: 'filiz',
  };
}

async function seedClientData(clientAuth, therapistAuth, clientProfile) {
  const config = profileConfig(clientProfile.profile);

  await authedPut('/gamification', clientAuth.token, { xp: config.xp });
  await authedPut('/gamification/companion', clientAuth.token, {
    companionType: config.companion,
  });

  const now = new Date();

  for (let day = 30; day >= 1; day -= 1) {
    const mood = config.moods[day % config.moods.length];
    const period = day % 2 === 0 ? 'morning' : 'evening';

    await authedPost('/mood-entries', clientAuth.token, {
      mood,
      period,
      notes: `${day} gün önce: ${clientProfile.displayName} için günlük takip notu`,
    });

    if (day % 3 === 0) {
      await authedPost('/journal-entries', clientAuth.token, {
        content: `${clientProfile.displayName} - ${config.journalTone} günlük kaydı (gün -${day}).`,
        prompt: day % 6 === 0 ? 'therapist-checkin' : 'daily-reflection',
        isShared: day % 2 === 0,
      });
    }

    if (day % 5 === 0) {
      await authedPost('/gratitude-entries', clientAuth.token, {
        content: `${clientProfile.displayName} bugün küçük bir ilerleme için minnettar. (gün -${day})`,
        category: 'progress',
      });
    }
  }

  const testCatalog = [
    'beck-depression-inventory',
    'burnout-inventory',
    'young-schema-scale-short',
  ];

  for (let i = 0; i < 5; i += 1) {
    await authedPost('/test-submissions', clientAuth.token, {
      testName: testCatalog[i % testCatalog.length],
      totalScore: config.baseScore + i,
      severityLevel: config.severity,
      answers: {
        profile: clientProfile.profile,
        trendIndex: i,
      },
    });
  }

  for (let i = 0; i < 3; i += 1) {
    const appointmentDate = new Date(now);
    appointmentDate.setDate(now.getDate() + (i - 1) * 7);

    await authedPost('/appointments', therapistAuth.token, {
      clientId: clientAuth.user.userId,
      appointmentDate: toOracleTimestampInput(appointmentDate),
      appointmentType: i % 2 === 0 ? 'online' : 'yuz-yuze',
      durationMinutes: 50,
      description: `${clientProfile.displayName} takip seansı #${i + 1}`,
    });
  }

  await authedPost('/assessment-tasks', therapistAuth.token, {
    clientId: clientAuth.user.userId,
    testName: 'young-schema-scale-short',
    dueDate: toOracleTimestampInput(new Date(Date.now() + 7 * 86400000)),
    notes: `DTX takip görevi: ${clientProfile.profile}`,
  });

  await authedPost('/collaborative-tasks', therapistAuth.token, {
    clientId: clientAuth.user.userId,
    title: 'Haftalık Düşünce Kaydı',
    description: `${clientProfile.displayName} için bilişsel yeniden çerçeveleme çalışması`,
    taskType: 'cognitive-reframe',
    fields: {
      focus: clientProfile.profile,
      frequency: 'weekly',
    },
  });
}

(async () => {
  applyDemoTag();

  console.log('🚀 Therapist showcase seed started...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Demo tag: ${DEMO_TAG}`);

  const adminAuth = await registerIfNeeded(DEMO_USERS.admin);

  const therapistAuths = [];
  for (const therapist of DEMO_USERS.therapists) {
    therapistAuths.push(await registerIfNeeded(therapist));
  }

  const clientAuths = [];
  for (const client of DEMO_USERS.clients) {
    const auth = await registerIfNeeded(client);
    clientAuths.push({ auth, profile: client });
  }

  for (const { auth, profile } of clientAuths) {
    const therapistAuth = therapistAuths[profile.therapist];
    await connectClient(therapistAuth.token, profile.email);
    await seedClientData(auth, therapistAuth, profile);
    console.log(`✅ Seeded client data: ${profile.displayName} (${profile.profile})`);
  }

  console.log('\n🎉 Showcase seed complete!');
  console.log('\n🔐 Demo credentials (all same password):');
  console.log(`Password: ${DEFAULT_PASSWORD}`);

  console.log('\nAdmin:');
  console.log(`- ${DEMO_USERS.admin.email}`);

  console.log('\nTherapists:');
  for (const therapist of DEMO_USERS.therapists) {
    console.log(`- ${therapist.email}`);
  }

  console.log('\nClients:');
  for (const client of DEMO_USERS.clients) {
    console.log(`- ${client.email} (${client.profile})`);
  }

  console.log('\nSuggested demo therapist account:');
  console.log(`- ${DEMO_USERS.therapists[0].email}`);
  console.log('  This therapist has improving + unstable + high-risk-followup showcase clients.');
})();
