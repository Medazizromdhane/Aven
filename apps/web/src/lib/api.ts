const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('vh_token');
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_URL}/api${path}`, { ...options, headers });
  if (!res.ok) {
    throw new Error(await readableApiError(res, `Request failed: ${res.status}`));
  }
  const contentType = res.headers.get('content-type') ?? '';
  return (contentType.includes('application/json') ? res.json() : res.text()) as Promise<T>;
}

export async function downloadApi(path: string): Promise<Blob> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new Error(await readableApiError(res, `Request failed: ${res.status}`));
  }
  return res.blob();
}

async function readableApiError(res: Response, fallback: string): Promise<string> {
  const raw = await res.text();
  if (!raw) return fallback;
  try {
    const body = JSON.parse(raw) as { message?: string | string[]; error?: string };
    if (Array.isArray(body.message)) return body.message.join('. ');
    if (body.message) return body.message;
    if (body.error && !body.error.startsWith('{')) return body.error;
  } catch {
    // The server may return a plain-text or proxy-generated response.
  }
  return raw.length > 240 ? `${raw.slice(0, 237)}...` : raw;
}

export const apiUrl = API_URL;
