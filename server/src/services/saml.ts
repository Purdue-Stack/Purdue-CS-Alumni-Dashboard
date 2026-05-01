import type { Request, Response } from 'express';
import passport from 'passport';
import { generateServiceProviderMetadata } from '@node-saml/node-saml';
import { Strategy as SamlStrategy, type Profile as SamlProfile } from '@node-saml/passport-saml';
import type { VerifiedCallback } from '@node-saml/passport-saml/lib/types';
import type { AuthUser, UserRole } from '../middleware/auth';

const samlStrategyName = 'saml';
const relayCookieName = 'purdue_cs_alumni_saml_relay';

type SamlEnvironment = {
  appBaseUrl: string;
  issuer?: string;
  callbackUrl?: string;
  entryPoint?: string;
  idpCert?: string;
  publicCert?: string;
  privateKey?: string;
};

function getEnvString(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function getMultilineEnvString(name: string) {
  const value = process.env[name];
  if (!value) {
    return undefined;
  }

  const normalized = value.replace(/\\n/g, '\n').trim();
  return normalized || undefined;
}

function normalizeBaseUrl(value: string | undefined) {
  if (!value) {
    return 'http://localhost:3000';
  }

  return value.replace(/\/+$/, '');
}

function getSamlEnvironment(): SamlEnvironment {
  return {
    appBaseUrl: normalizeBaseUrl(getEnvString('APP_BASE_URL')),
    issuer: getEnvString('SAML_ISSUER'),
    callbackUrl: getEnvString('SAML_CALLBACK_URL'),
    entryPoint: getEnvString('SAML_ENTRY_POINT'),
    idpCert: getMultilineEnvString('SAML_IDP_CERT'),
    publicCert: getMultilineEnvString('SAML_SP_CERT'),
    privateKey: getMultilineEnvString('SAML_SP_PRIVATE_KEY')
  };
}

function getSetFromEnv(name: string) {
  const raw = getEnvString(name);
  if (!raw) {
    return new Set<string>();
  }

  return new Set(
    raw
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
}

function normalizeIdentity(value: unknown) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return normalized || undefined;
}

function getProfileEmail(profile: SamlProfile) {
  const candidates = [
    profile.email,
    profile.mail,
    profile['urn:oid:0.9.2342.19200300.100.1.3'],
    profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
  ];

  for (const candidate of candidates) {
    const normalized = normalizeIdentity(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return undefined;
}

function getProfileUsername(profile: SamlProfile) {
  const candidates = [
    profile['urn:oid:0.9.2342.19200300.100.1.1'],
    profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
    profile.nameID,
    getProfileEmail(profile)
  ];

  for (const candidate of candidates) {
    const normalized = normalizeIdentity(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return undefined;
}

function getProfileDisplayName(profile: SamlProfile, username: string) {
  const displayCandidates = [
    profile.displayName,
    profile.cn,
    profile[
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
    ]
  ];

  for (const candidate of displayCandidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  const givenName =
    typeof profile.givenName === 'string'
      ? profile.givenName.trim()
      : typeof profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] === 'string'
        ? String(profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname']).trim()
        : '';
  const surname =
    typeof profile.sn === 'string'
      ? profile.sn.trim()
      : typeof profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] === 'string'
        ? String(profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname']).trim()
        : '';

  const fullName = `${givenName} ${surname}`.trim();
  if (fullName) {
    return fullName;
  }

  return username;
}

function getSamlRole(profile: SamlProfile, username: string): UserRole {
  const adminUsernames = getSetFromEnv('SAML_ADMIN_USERNAMES');
  const adminEmails = getSetFromEnv('SAML_ADMIN_EMAILS');
  const email = getProfileEmail(profile);

  if (adminUsernames.has(username) || (email && adminEmails.has(email))) {
    return 'admin';
  }

  return 'student';
}

function buildAuthUserFromProfile(profile: SamlProfile): AuthUser | undefined {
  const username = getProfileUsername(profile);
  if (!username) {
    return undefined;
  }

  return {
    id: normalizeIdentity(profile.nameID) ?? username,
    username,
    displayName: getProfileDisplayName(profile, username),
    role: getSamlRole(profile, username)
  };
}

function verifySamlProfile(
  profile: SamlProfile | null,
  done: VerifiedCallback
) {
  if (!profile) {
    done(new Error('SAML profile was empty.'));
    return;
  }

  const user = buildAuthUserFromProfile(profile);

  if (!user) {
    done(new Error('SAML profile did not include a usable username.'));
    return;
  }

  done(null, user);
}

function getSamlCallbackUrl(env: SamlEnvironment) {
  return env.callbackUrl ?? `${env.appBaseUrl}/api/auth/saml/callback`;
}

function getSamlIssuer(env: SamlEnvironment) {
  return env.issuer ?? `${env.appBaseUrl}/api/auth/saml/metadata`;
}

function getSamlLogoutCallbackUrl(env: SamlEnvironment) {
  return `${env.appBaseUrl}/api/auth/logout`;
}

export function isSamlMetadataConfigured() {
  const env = getSamlEnvironment();
  return Boolean(getSamlIssuer(env) && getSamlCallbackUrl(env));
}

export function isSamlLoginConfigured() {
  const env = getSamlEnvironment();
  return Boolean(env.entryPoint && env.idpCert && getSamlIssuer(env) && getSamlCallbackUrl(env));
}

let strategyConfigured = false;

function ensureSamlStrategy() {
  if (strategyConfigured) {
    return true;
  }

  if (!isSamlLoginConfigured()) {
    return false;
  }

  const env = getSamlEnvironment();

  passport.use(
    samlStrategyName,
    new SamlStrategy(
      {
        callbackUrl: getSamlCallbackUrl(env),
        issuer: getSamlIssuer(env),
        entryPoint: env.entryPoint!,
        idpCert: env.idpCert!,
        privateKey: env.privateKey,
        publicCert: env.publicCert,
        logoutCallbackUrl: getSamlLogoutCallbackUrl(env)
      },
      verifySamlProfile,
      verifySamlProfile
    ) as any
  );

  strategyConfigured = true;
  return true;
}

export function getPassport() {
  ensureSamlStrategy();
  return passport;
}

function sanitizeRedirectTarget(target: string | undefined) {
  if (!target) {
    return '/';
  }

  if (!target.startsWith('/')) {
    return '/';
  }

  if (target.startsWith('//')) {
    return '/';
  }

  return target;
}

export function stashSamlRelayState(res: Response, redirectTarget: string | undefined) {
  res.cookie(relayCookieName, sanitizeRedirectTarget(redirectTarget), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 1000 * 60 * 10
  });
}

export function consumeSamlRelayState(req: Request, res: Response) {
  const relayState = sanitizeRedirectTarget(
    (req as Request & { cookies?: Record<string, string> }).cookies?.[relayCookieName]
  );
  res.clearCookie(relayCookieName, { path: '/' });
  return relayState;
}

export function buildSamlLoginPath(redirectTarget?: string) {
  const query = redirectTarget ? `?redirect=${encodeURIComponent(sanitizeRedirectTarget(redirectTarget))}` : '';
  return `/api/auth/saml/login${query}`;
}

export function generateSamlMetadataXml() {
  if (!isSamlMetadataConfigured()) {
    throw new Error('SAML metadata is not configured. Set APP_BASE_URL or explicit SAML_ISSUER/SAML_CALLBACK_URL values first.');
  }

  const env = getSamlEnvironment();

  return generateServiceProviderMetadata({
    issuer: getSamlIssuer(env),
    callbackUrl: getSamlCallbackUrl(env),
    logoutCallbackUrl: getSamlLogoutCallbackUrl(env),
    publicCerts: env.publicCert
  });
}
