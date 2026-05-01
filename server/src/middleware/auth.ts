import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

export type UserRole = 'student' | 'admin';
export type AuthMode = 'local' | 'saml';

export type AuthUser = {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
};

type LoginUser = AuthUser & { password: string };
type SessionPayload = AuthUser & { authMode: AuthMode };

const sessionCookieName = 'purdue_cs_alumni_session';
const sessionSecret = process.env.SESSION_SECRET ?? 'dev-purdue-cs-alumni-dashboard-secret';

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 1000 * 60 * 60 * 8
  };
}

function encodeBase64Url(value: string) {
  return Buffer.from(value).toString('base64url');
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signPayload(payload: string) {
  return crypto.createHmac('sha256', sessionSecret).update(payload).digest('base64url');
}

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function getEnvString(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function getLocalUsers(): Map<string, LoginUser> {
  const users = new Map<string, LoginUser>();

  const studentUsername = getEnvString('LOCAL_STUDENT_USERNAME');
  const studentPassword = process.env.LOCAL_STUDENT_PASSWORD?.trim();
  if (studentUsername && studentPassword) {
    users.set(studentUsername.toLowerCase(), {
      id: 'student',
      username: studentUsername.toLowerCase(),
      password: studentPassword,
      displayName: getEnvString('LOCAL_STUDENT_DISPLAY_NAME') ?? 'Student User',
      role: 'student'
    });
  }

  const adminUsername = getEnvString('LOCAL_ADMIN_USERNAME');
  const adminPassword = process.env.LOCAL_ADMIN_PASSWORD?.trim();
  if (adminUsername && adminPassword) {
    users.set(adminUsername.toLowerCase(), {
      id: 'admin',
      username: adminUsername.toLowerCase(),
      password: adminPassword,
      displayName: getEnvString('LOCAL_ADMIN_DISPLAY_NAME') ?? 'Admin User',
      role: 'admin'
    });
  }

  return users;
}

export function getAuthMode(): AuthMode {
  return process.env.AUTH_MODE === 'saml' ? 'saml' : 'local';
}

export function createSessionToken(user: AuthUser, authMode: AuthMode = getAuthMode()) {
  const payload = encodeBase64Url(JSON.stringify({ ...user, authMode } satisfies SessionPayload));
  return `${payload}.${signPayload(payload)}`;
}

function parseSessionToken(token: string | undefined): AuthUser | undefined {
  if (!token) return undefined;

  const [payload, signature] = token.split('.');
  if (!payload || !signature || signature !== signPayload(payload)) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as Partial<SessionPayload>;
    if (!parsed.username || !parsed.displayName || !parsed.role || !parsed.authMode) {
      return undefined;
    }

    if (parsed.authMode !== getAuthMode()) {
      return undefined;
    }

    if (parsed.authMode === 'local') {
      const localUser = getLocalUsers().get(parsed.username);
      if (!localUser || localUser.role !== parsed.role) {
        return undefined;
      }

      return {
        id: localUser.id,
        username: localUser.username,
        displayName: localUser.displayName,
        role: localUser.role
      };
    }

    return {
      id: parsed.id ?? parsed.username,
      username: parsed.username,
      displayName: parsed.displayName,
      role: parsed.role
    };
  } catch {
    return undefined;
  }
}

export function issueSession(res: Response, user: AuthUser, authMode: AuthMode = getAuthMode()): void {
  res.cookie(sessionCookieName, createSessionToken(user, authMode), cookieOptions());
}

export function clearSession(res: Response): void {
  res.clearCookie(sessionCookieName, { path: '/' });
}

export function getRequestUser(req: Request): AuthUser | undefined {
  return (req as Request & { user?: AuthUser }).user;
}

export function authenticateLocalUser(username: string, password: string): AuthUser | undefined {
  const user = getLocalUsers().get(normalizeUsername(username));
  if (!user || user.password !== password.trim()) {
    return undefined;
  }

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role
  };
}

export const attachSession = (req: Request, _res: Response, next: NextFunction): void => {
  const token = (req as Request & { cookies?: Record<string, string> }).cookies?.[sessionCookieName];
  const user = parseSessionToken(token);

  if (user) {
    (req as Request & { user?: AuthUser }).user = user;
  }

  next();
};

export const logout = (_req: Request, res: Response): void => {
  clearSession(res);
  res.status(200).json({ message: 'Logged out' });
};

export const me = (req: Request, res: Response): void => {
  res.status(200).json({ user: getRequestUser(req) ?? null });
};

export const requireStudentAccess = (req: Request, res: Response, next: NextFunction): void => {
  if (!getRequestUser(req)) {
    res.status(401).json({ error: 'Login required' });
    return;
  }

  next();
};

export const requireAdminAccess = (req: Request, res: Response, next: NextFunction): void => {
  const user = getRequestUser(req);

  if (!user) {
    res.status(401).json({ error: 'Login required' });
    return;
  }

  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
};
