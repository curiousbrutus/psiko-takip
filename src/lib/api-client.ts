/**
 * API Client for making authenticated requests to the backend
 */

const LOCAL_API_BASE = '/api';
const REMOTE_API_BASE = process.env.NEXT_PUBLIC_API_URL || LOCAL_API_BASE;

const REMOTE_ENDPOINT_PREFIXES = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/me',
  '/users/profile',
  '/users/password',
  '/mood-entries',
  '/journal-entries',
  '/gratitude-entries',
  '/gamification',
  '/appointments',
  '/assessment-tasks',
  '/assessment-results',
  '/collaborative-tasks',
  '/test-submissions',
];

function getApiBase(endpoint: string): string {
  return REMOTE_ENDPOINT_PREFIXES.some(prefix => endpoint.startsWith(prefix))
    ? REMOTE_API_BASE
    : LOCAL_API_BASE;
}

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export function getStoredUser(): any | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setStoredUser(user: any) {
  localStorage.setItem('user', JSON.stringify(user));
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${REMOTE_API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data = await res.json();
    if (data.accessToken) {
      setTokens(data.accessToken, data.refreshToken || refreshToken);
      return data.accessToken;
    }
    return null;
  } catch {
    clearTokens();
    return null;
  }
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBase(endpoint);
  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  // If 401, try refreshing token
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
      });
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Bir hata oluştu' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth API
export async function apiLogin(email: string, password: string) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setTokens(data.accessToken, data.refreshToken);
  setStoredUser(data.user);
  return data;
}

export async function apiRegister(
  email: string,
  password: string,
  displayName: string,
  role: string
) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName, role }),
  });
  setTokens(data.accessToken, data.refreshToken);
  setStoredUser(data.user);
  return data;
}

export async function apiLogout() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch {
    // Ignore logout errors
  }
  clearTokens();
}

// User API
export async function apiGetMe() {
  return apiFetch('/auth/me');
}

export async function apiUpdateProfile(displayName: string, phone?: string) {
  return apiFetch('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify({ displayName, phone }),
  });
}

export async function apiChangePassword(
  currentPassword: string,
  newPassword: string
) {
  return apiFetch('/users/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// Gamification API
export async function apiGetGamification() {
  return apiFetch('/gamification');
}

export async function apiUpdateGamification(xp: number, activityType?: string) {
  return apiFetch('/gamification', {
    method: 'PUT',
    body: JSON.stringify({ xp, activityType }),
  });
}

export async function apiSetCompanion(companionType: string) {
  return apiFetch('/gamification/companion', {
    method: 'PUT',
    body: JSON.stringify({ companionType }),
  });
}

// Mood Entries API
export async function apiCreateMoodEntry(
  mood: string,
  period: string,
  notes?: string
) {
  return apiFetch('/mood-entries', {
    method: 'POST',
    body: JSON.stringify({ mood, period, notes }),
  });
}

export async function apiGetMoodEntries(startDate?: string) {
  const params = startDate ? `?startDate=${startDate}` : '';
  return apiFetch(`/mood-entries${params}`);
}

// Journal Entries API
export async function apiCreateJournalEntry(
  content: string,
  prompt: string,
  isShared: boolean = false
) {
  return apiFetch('/journal-entries', {
    method: 'POST',
    body: JSON.stringify({ content, prompt, isShared }),
  });
}

export async function apiGetJournalEntries(filters?: {
  prompt?: string;
  startDate?: string;
  isShared?: boolean;
}) {
  const params = new URLSearchParams();
  if (filters?.prompt) params.set('prompt', filters.prompt);
  if (filters?.startDate) params.set('startDate', filters.startDate);
  if (filters?.isShared !== undefined)
    params.set('isShared', String(filters.isShared));
  const qs = params.toString();
  return apiFetch(`/journal-entries${qs ? '?' + qs : ''}`);
}

// Test Submissions API
export async function apiCreateTestSubmission(
  testName: string,
  totalScore: number,
  answers: any,
  severityLevel?: string
) {
  return apiFetch('/test-submissions', {
    method: 'POST',
    body: JSON.stringify({ testName, totalScore, answers, severityLevel }),
  });
}

export async function apiGetTestSubmissions(filters?: {
  testName?: string;
  clientId?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.testName) params.set('testName', filters.testName);
  if (filters?.clientId) params.set('clientId', filters.clientId);
  const qs = params.toString();
  return apiFetch(`/test-submissions${qs ? '?' + qs : ''}`);
}


// Appointments API
export async function apiGetAppointments(role?: string) {
  const params = role ? `?role=${role}` : '';
  return apiFetch(`/appointments${params}`);
}

export async function apiCreateAppointment(data: any) {
  return apiFetch('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Collaborative Tasks API
export async function apiGetCollaborativeTasks(clientId?: string) {
  const params = clientId ? `?clientId=${clientId}` : '';
  return apiFetch(`/collaborative-tasks${params}`);
}

export async function apiCreateCollaborativeTask(data: any) {
  return apiFetch('/collaborative-tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateCollaborativeTask(taskId: string, data: any) {
  return apiFetch(`/collaborative-tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiGetCollaborativeTask(taskId: string) {
  return apiFetch(`/collaborative-tasks/${taskId}`);
}

// Assessment Tasks API
export async function apiGetAssessmentTasks(clientId?: string) {
  const params = clientId ? `?clientId=${clientId}` : '';
  return apiFetch(`/assessment-tasks${params}`);
}

export async function apiCreateAssessmentTask(data: any) {
  return apiFetch('/assessment-tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiGetAssessmentTask(taskId: string) {
  return apiFetch(`/assessment-tasks/${taskId}`);
}

export async function apiCreateAssessmentResult(data: any) {
  return apiFetch('/assessment-results', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Therapist API
export async function apiGetClients() {
  return apiFetch('/users/clients');
}

export async function apiGetClientDetail(clientId: string) {
  return apiFetch(`/users/clients/${clientId}`);
}

export async function apiSearchUsers(query: string, role?: string) {
  const params = new URLSearchParams({ q: query });
  if (role) params.set('role', role);
  return apiFetch(`/users/search?${params}`);
}

export async function apiConnectClient(clientEmail: string) {
  return apiFetch('/users/clients', {
    method: 'POST',
    body: JSON.stringify({ email: clientEmail }),
  });
}

// Gratitude Jar API
export async function apiCreateGratitudeEntry(content: string) {
  return apiFetch('/gratitude-entries', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function apiGetGratitudeEntries() {
  return apiFetch('/gratitude-entries');
}
