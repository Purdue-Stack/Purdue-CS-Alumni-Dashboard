import express, { Request, Response, NextFunction, Router } from 'express';

const router: Router = express.Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: 'Purdue CS Alumni Dashboard API',
    status: 'running',
    endpoints: {
      upload: '/upload',
      admin: '/admin',
      api: '/api'
    }
  });
});

// Upload Data page route
router.get('/upload', (req: Request, res: Response, next: NextFunction) => {
  res.render('upload', {
    title: 'Upload Data - Purdue CS Alumni Dashboard',
    user: {
      name: 'JOHN L',
      avatar: '/images/user-avatar.png'
    }
  });
});

export default router;