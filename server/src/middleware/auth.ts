import { NextFunction, Request, Response } from 'express';

export const attachStubSession = (req: Request, _res: Response, next: NextFunction): void => {
  const role = req.header('x-stub-role') ?? 'student';
  (req as Request & { user?: { id: string; role: string } }).user = {
    id: 'stub-user',
    role
  };
  next();
};

export const requireStudentAccess = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};

export const requireAdminAccess = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};
