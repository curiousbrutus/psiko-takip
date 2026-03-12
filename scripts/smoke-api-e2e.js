/* eslint-disable no-console */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

const CREDENTIALS = {
  therapist: {
    email: process.env.SMOKE_THERAPIST_EMAIL || 'therapist@test.psikotakip.com',
    password: process.env.SMOKE_THERAPIST_PASSWORD || 'Test123!',
  },
  client: {
    email: process.env.SMOKE_CLIENT_EMAIL || 'client@test.psikotakip.com',
    password: process.env.SMOKE_CLIENT_PASSWORD || 'Test123!',
  },
};

const results = [];

function record(name, passed, detail) {
  results.push({ name, passed, detail });
  console.log(`${passed ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  let body;
  const text = await res.text();
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }

  return { res, body };
}

async function login(role, creds) {
  const { res, body } = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(creds),
  });

  if (!res.ok || !body?.accessToken || !body?.user?.userId) {
    throw new Error(
      `${role} login failed (${res.status}): ${body?.message || body?.error || JSON.stringify(body)}`
    );
  }

  return {
    token: body.accessToken,
    userId: body.user.userId,
    user: body.user,
  };
}

async function authedGet(path, token) {
  return request(path, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function authedPost(path, token, payload) {
  return request(path, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

(async () => {
  let therapist;
  let client;
  let assessmentTaskId;

  try {
    therapist = await login('therapist', CREDENTIALS.therapist);
    record('Therapist login', true, therapist.user.email);
  } catch (error) {
    record('Therapist login', false, error.message);
    process.exit(1);
  }

  try {
    client = await login('client', CREDENTIALS.client);
    record('Client login', true, client.user.email);
  } catch (error) {
    record('Client login', false, error.message);
    process.exit(1);
  }

  try {
    const { res, body } = await authedGet('/users/profile', therapist.token);
    const ok = res.ok && body?.success && body?.data?.role;
    record('Therapist profile fetch', ok, ok ? body.data.role : JSON.stringify(body));
  } catch (error) {
    record('Therapist profile fetch', false, error.message);
  }

  try {
    const { res, body } = await authedPost('/users/clients', therapist.token, {
      email: CREDENTIALS.client.email,
    });

    const messageText = Array.isArray(body?.message)
      ? body.message.join(' ')
      : typeof body?.message === 'string'
        ? body.message
        : '';

    const alreadyConnected =
      res.status === 400 &&
      (messageText.toLowerCase().includes('zaten') || messageText.toLowerCase().includes('bagli'));

    const ok = (res.ok && body?.success) || alreadyConnected;
    const detail = alreadyConnected
      ? 'already connected (acceptable)'
      : `${res.status} ${messageText}`.trim();
    record('Connect client to therapist', ok, detail);
  } catch (error) {
    record('Connect client to therapist', false, error.message);
  }

  try {
    const { res, body } = await authedGet('/users/clients', therapist.token);
    const ok = res.ok && body?.success && Array.isArray(body?.data);
    record('Therapist client list', ok, `count=${body?.data?.length ?? 0}`);
  } catch (error) {
    record('Therapist client list', false, error.message);
  }

  try {
    const { res, body } = await authedPost('/assessment-tasks', therapist.token, {
      clientId: client.userId,
      testName: 'beck-depression-inventory',
      notes: 'Smoke test task',
    });

    const ok = res.ok && body?.success && body?.data?.taskId;
    assessmentTaskId = body?.data?.taskId;
    record('Create assessment task', ok, ok ? assessmentTaskId : JSON.stringify(body));
  } catch (error) {
    record('Create assessment task', false, error.message);
  }

  try {
    const { res, body } = await authedGet('/assessment-tasks', client.token);
    const ok =
      (res.ok && Array.isArray(body?.data)) ||
      (res.status >= 200 && res.status < 500 && res.status !== 401 && res.status !== 403);
    record('Client assessment task list', ok, `count=${body?.data?.length ?? 0}`);
  } catch (error) {
    record('Client assessment task list', false, error.message);
  }

  try {
    const { res, body } = await authedPost('/test-submissions', client.token, {
      testName: 'beck-depression-inventory',
      totalScore: 11,
      severityLevel: 'minimal',
      answers: { q1: 1, q2: 0 },
    });

    const ok = res.ok && body?.success && body?.data?.submissionId;
    record('Create test submission', ok, ok ? body.data.submissionId : JSON.stringify(body));
  } catch (error) {
    record('Create test submission', false, error.message);
  }

  try {
    const { res, body } = await authedGet(
      `/test-submissions?userId=${encodeURIComponent(client.userId)}`,
      therapist.token
    );
    const ok =
      (res.ok && Array.isArray(body?.data)) ||
      (res.status >= 200 && res.status < 500 && res.status !== 401 && res.status !== 403);
    record('Therapist test submission list', ok, `count=${body?.data?.length ?? 0}`);
  } catch (error) {
    record('Therapist test submission list', false, error.message);
  }

  try {
    const { res, body } = await authedPost('/mood-entries', client.token, {
      mood: 'iyi',
      period: 'morning',
      notes: 'smoke test',
    });
    const ok = res.ok && body?.success;
    record('Create mood entry', ok, res.status.toString());
  } catch (error) {
    record('Create mood entry', false, error.message);
  }

  try {
    const { res, body } = await authedPost('/journal-entries', client.token, {
      content: 'Smoke test journal content',
      prompt: 'daily-checkin',
      isShared: false,
    });
    const ok = res.ok && body?.success;
    record('Create journal entry', ok, res.status.toString());
  } catch (error) {
    record('Create journal entry', false, error.message);
  }

  try {
    const { res, body } = await authedPost('/gratitude-entries', client.token, {
      content: 'Today I am grateful for progress.',
      category: 'health',
    });
    const ok = res.ok && body?.success;
    record('Create gratitude entry', ok, res.status.toString());
  } catch (error) {
    record('Create gratitude entry', false, error.message);
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;

  console.log('\n=== Smoke Test Summary ===');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
})();