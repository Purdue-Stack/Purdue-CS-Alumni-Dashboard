# Worklog

## Run commands
1) Start server (needs DATABASE_URL set):
```sh
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require" npm run server
```

2) Start client (separate terminal):
```sh
npm run client
```

## Apply schema (required for admin_logs + indexes)
If you do not have `psql`, use Node with `pg`:
```sh
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require" node - <<'JS'
const fs = require('fs');
const { Client } = require('pg');
const sql = fs.readFileSync('server/src/db/schema.sql', 'utf8');
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
client.connect()
  .then(() => client.query(sql))
  .then(() => console.log('schema applied'))
  .catch((err) => {
    console.error('schema apply failed', err.message);
    process.exitCode = 1;
  })
  .finally(() => client.end());
JS
```

## Upload preview test (API)
```sh
curl -s -X POST -F "file=@sample_upload.csv" http://localhost:3000/api/upload-excel
```
Expected: JSON with `columns`, `rows`, `rowErrors`, `summary`.

## Commit test (API)
1) Save preview response to a file:
```sh
curl -s -X POST -F "file=@sample_upload.csv" http://localhost:3000/api/upload-excel > /tmp/upload_preview_response.json
```
2) Build commit payload:
```sh
python - <<'PY'
import json
with open('/tmp/upload_preview_response.json') as f:
    data = json.load(f)
rows = data.get('rows', [])
with open('/tmp/commit_payload.json','w') as f:
    json.dump({'rows': rows, 'filename': 'sample_upload.csv'}, f)
PY
```
3) Commit:
```sh
curl -s -X POST -H "Content-Type: application/json" --data @/tmp/commit_payload.json http://localhost:3000/api/commit-upload
```
Expected: JSON counts for `inserted`, `updated`, `skipped`, `errors`.

## Admin table test (API)
```sh
curl -s http://localhost:3000/api/admin/alumni
```
Expected: JSON with `rows` and `total`.

## Logs test (API)
```sh
curl -s http://localhost:3000/api/admin/logs
```
Expected: JSON array of log entries (requires `admin_logs` table + write access).
