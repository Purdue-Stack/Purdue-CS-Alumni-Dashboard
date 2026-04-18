function normalizeBasePath(path: string | undefined): string {
  if (!path || path === '/') {
    return '/';
  }

  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  return withLeadingSlash.replace(/\/+$/, '');
}

function defaultApiPath(basePath: string, suffix: string): string {
  return basePath === '/' ? suffix : `${basePath}${suffix}`;
}

export const appBasePath = normalizeBasePath(import.meta.env.BASE_URL);
export const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() || defaultApiPath(appBasePath, '/api');
