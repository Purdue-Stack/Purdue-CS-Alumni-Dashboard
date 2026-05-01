import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

export type UserRole = 'student' | 'admin';

export type AuthUser = {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
};

type LoginUser = AuthUser & { password: string };

const sessionCookieName = 'purdue_cs_alumni_session';
const sessionSecret = process.env.SESSION_SECRET ?? 'dev-purdue-cs-alumni-dashboard-secret';
const users = new Map<string, LoginUser>([
  ['student', { id: 'student', username: 'student', password: 'student', displayName: 'Student User', role: 'student' }],
  ['admin', { id: 'admin', username: 'admin', password: 'admin', displayName: 'Admin User', role: 'admin' }]
]);

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 1000 * 60 * 60 * 8
  };
}

function publicUser(user: LoginUser): AuthUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role
  };
}

function getRequestUser(req: Request): AuthUser | undefined {
  return (req as Request & { user?: AuthUser }).user;
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

function createSessionToken(user: AuthUser) {
  const payload = encodeBase64Url(JSON.stringify(user));
  return `${payload}.${signPayload(payload)}`;
}

function parseSessionToken(token: string | undefined): AuthUser | undefined {
  if (!token) return undefined;

  const [payload, signature] = token.split('.');

  if (!payload || !signature || signature !== signPayload(payload)) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as Partial<AuthUser>;
    const knownUser = parsed.username ? users.get(parsed.username) : undefined;

    if (!knownUser || knownUser.role !== parsed.role) {
      return undefined;
    }

    return publicUser(knownUser);
  } catch {
    return undefined;
  }
}

export const attachSession = (req: Request, _res: Response, next: NextFunction): void => {
  const token = (req as Request & { cookies?: Record<string, string> }).cookies?.[sessionCookieName];
  const user = parseSessionToken(token);

  if (user) {
    (req as Request & { user?: AuthUser }).user = user;
  }

  next();
};

export const login = (req: Request, res: Response): void => {
  const { username, password } = req.body as { username?: unknown; password?: unknown };

  if (typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const normalizedUsername = username.trim().toLowerCase();
  const normalizedPassword = password.trim();
  const user = users.get(normalizedUsername);

  if (!user || user.password !== normalizedPassword) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const authUser = publicUser(user);
  res.cookie(sessionCookieName, createSessionToken(authUser), cookieOptions());
  res.status(200).json({ user: authUser });
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie(sessionCookieName, { path: '/' });
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
