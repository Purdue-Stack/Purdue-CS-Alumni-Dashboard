import express from 'express';
import type { Request, Response } from 'express';
import {
  authenticateLocalUser,
  clearSession,
  getAuthMode,
  getRequestUser,
  issueSession,
  logout,
  me
} from '../middleware/auth';
import {
  buildSamlLoginPath,
  consumeSamlRelayState,
  generateSamlMetadataXml,
  getPassport,
  isSamlLoginConfigured,
  isSamlMetadataConfigured,
  stashSamlRelayState
} from '../services/saml';

const router = express.Router();
const passport = getPassport();

router.get('/config', (_req, res) => {
  res.status(200).json({
    authMode: getAuthMode(),
    localLoginEnabled: getAuthMode() === 'local',
    samlConfigured: isSamlLoginConfigured(),
    samlMetadataConfigured: isSamlMetadataConfigured(),
    samlLoginPath: buildSamlLoginPath()
  });
});

router.get('/me', me);

router.post('/login', (req: Request, res: Response) => {
  if (getAuthMode() !== 'local') {
    res.status(409).json({ error: 'Password login is disabled while AUTH_MODE is set to saml.' });
    return;
  }

  const username = typeof req.body?.username === 'string' ? req.body.username : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const user = authenticateLocalUser(username, password);

  if (!user) {
    res.status(401).json({ error: 'Invalid username or password.' });
    return;
  }

  issueSession(res, user, 'local');
  res.status(200).json({ user });
});

router.post('/logout', logout);

router.get('/saml/login', (req: Request, res: Response, next) => {
  if (getAuthMode() !== 'saml') {
    res.status(409).json({ error: 'SAML login is not active while AUTH_MODE is set to local.' });
    return;
  }

  if (!isSamlLoginConfigured()) {
    res.status(503).json({ error: 'SAML login is not fully configured yet.' });
    return;
  }

  const redirectTarget =
    typeof req.query.redirect === 'string'
      ? req.query.redirect
      : typeof req.query.RelayState === 'string'
        ? req.query.RelayState
        : '/';

  stashSamlRelayState(res, redirectTarget);
  passport.authenticate('saml', { session: false })(req, res, next);
});

router.post(
  '/saml/callback',
  passport.authenticate('saml', { failureRedirect: '/', session: false }),
  (req: Request, res: Response) => {
    const user = getRequestUser(req) ?? (req.user as ReturnType<typeof getRequestUser> | undefined);

    if (!user) {
      clearSession(res);
      res.redirect('/');
      return;
    }

    issueSession(res, user, 'saml');
    res.redirect(consumeSamlRelayState(req, res));
  }
);

router.get('/saml/metadata', (_req, res) => {
  try {
    const metadata = generateSamlMetadataXml();
    res.type('application/xml').status(200).send(metadata);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate SAML metadata.';
    res.status(503).json({ error: message });
  }
});

export default router;
