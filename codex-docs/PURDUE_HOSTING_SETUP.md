# Purdue Hosting Setup

This app is prepared to run under:

- `https://stackapps.cs.purdue.edu/placement` for the React frontend
- `https://stackapps.cs.purdue.edu/placement/api` for the Express backend

## What Daniel's note means

- Purdue IT already created the host account and URL root: `https://stackapps.cs.purdue.edu`
- Your admin account is `stack-wiki`
- Purdue wants this app deployed as a subpath, not a separate hostname:
  - `https://stackapps.cs.purdue.edu/placement`
- Apache is the front door
- Node can run behind Apache as an internal service
- PHP is not required

## App changes already made

- Vite build supports a configurable subpath via `VITE_APP_BASE_PATH`
- React Router uses the deployment basename automatically
- API calls can target either:
  - the default subpath-based proxy routes, or
  - explicit URLs via env vars

## Recommended Purdue deployment shape

1. Build the client with:

```bash
cd client
cp .env.production.example .env.production
npm install
npm run build
```

2. Run the server as a local Node service:

```bash
cd server
cp .env.example .env
# edit DATABASE_URL
npm install
npm run build
PORT=3000 npm start
```

3. Have Apache:
- serve the built frontend from the `/placement` subpath
- reverse proxy `/placement/api` to `http://127.0.0.1:3000/api`
- rewrite unknown `/placement/*` routes back to the SPA entrypoint

## Apache behavior needed

The exact Apache config is Purdue IT's call, but functionally you need:

```apache
Alias /placement/ /homes/stack-wiki/htdocs/placement/

<Directory /homes/stack-wiki/htdocs/placement/>
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>

ProxyPass /placement/api http://127.0.0.1:3000/api
ProxyPassReverse /placement/api http://127.0.0.1:3000/api
```

If they prefer a local socket instead of a TCP port, that also fits their hosting doc better.

## SPA route handling

If Apache serves the static frontend, deep links such as:

- `/placement/dashboard`
- `/placement/admin/upload`

must resolve to the client `index.html` instead of 404ing.

One common way is an `.htaccess` file inside the deployed frontend directory:

```apache
RewriteEngine On
RewriteBase /placement/

RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /placement/index.html [L]
```

## First deployment checklist

- `client npm run build` passes
- `server npm run build` passes
- `/placement` loads
- `/placement/dashboard` loads directly on refresh
- `/placement/admin/upload` loads directly on refresh
- `/placement/api/analytics/dashboard` returns JSON through Apache
- upload and commit endpoints work through `/placement/api/...`

## Questions to send Purdue IT if needed

- Can Apache proxy `/placement/api` to a local Node process for `stack-wiki`?
- Do they want the Node app listening on localhost TCP, or through a Unix socket?
- Where should the built frontend files live under the `stack-wiki` account?
- Do they want SPA route rewrites handled by `.htaccess` or by a vhost config they manage?
