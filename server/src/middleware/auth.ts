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
const users = new Map<string, LoginUser>([
  ['student', { id: 'student', username: 'student', password: 'student', displayName: 'Student User', role: 'student' }],
  ['admin', { id: 'admin', username: 'admin', password: 'admin', displayName: 'Admin User', role: 'admin' }]
]);
const sessions = new Map<string, AuthUser>();

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

export const attachSession = (req: Request, _res: Response, next: NextFunction): void => {
  const sessionId = (req as Request & { cookies?: Record<string, string> }).cookies?.[sessionCookieName];
  const user = sessionId ? sessions.get(sessionId) : undefined;

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
  const user = users.get(normalizedUsername);

  if (!user || user.password !== password) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const sessionId = crypto.randomUUID();
  const authUser = publicUser(user);
  sessions.set(sessionId, authUser);
  res.cookie(sessionCookieName, sessionId, cookieOptions());
  res.status(200).json({ user: authUser });
};

export const logout = (req: Request, res: Response): void => {
  const sessionId = (req as Request & { cookies?: Record<string, string> }).cookies?.[sessionCookieName];

  if (sessionId) {
    sessions.delete(sessionId);
  }

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
