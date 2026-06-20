export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  avatar?: string;
  isActive: boolean;
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setAuth(user: User, token: string, refreshToken: string) {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refreshToken);
}

export function clearAuth() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
}

export function isAdmin(user: User | null) {
  return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
}
