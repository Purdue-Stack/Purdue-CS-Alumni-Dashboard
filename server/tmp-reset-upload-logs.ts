import { getClient } from './src/db';

const entries = [
  ['Full academic yr placement, Fall n Summer 2015 and Spring 2016.xls', 177, 0, 177],
  ['CustomReport full academic yr Fall16, Summer16, Spring 17.xls', 221, 0, 221],
  ['2017-18 Final Placement Results (Fall17, Summer 17, Spring 18).xlsx', 314, 27, 287],
  ['2018-19 full academic yr custom report.xls', 282, 1, 281],
  ['2019-20 full academic yr custom report.xls', 375, 0, 375],
  ['2020-21 full academic yr CS and DS 12Twenty report4.8.22.xlsx', 341, 0, 341],
  ['12Twenty 2021-22 full academic yr CS and DS.xlsx', 304, 0, 304],
  ['12Twenty report 2022-23 full academic yr CS, DS, AI.xlsx', 443, 1, 442]
] as const;

async function main() {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    await client.query('ALTER TABLE admin_logs ADD COLUMN IF NOT EXISTS total_rows_read INTEGER');
    await client.query('ALTER TABLE admin_logs ADD COLUMN IF NOT EXISTS errors INTEGER');
    await client.query('ALTER TABLE admin_logs ADD COLUMN IF NOT EXISTS total_uploaded INTEGER');
    await client.query('DELETE FROM admin_logs');
    await client.query('ALTER TABLE admin_logs DROP CONSTRAINT IF EXISTS admin_logs_action_check');
    await client.query(`ALTER TABLE admin_logs ADD CONSTRAINT admin_logs_action_check CHECK (action IN ('UPLOAD', 'EDIT', 'APPROVE', 'DENY', 'EXPORT'))`);
    await client.query('ALTER TABLE admin_logs DROP COLUMN IF EXISTS description');

    for (let index = 0; index < entries.length; index += 1) {
      const [target, totalRowsRead, errors, totalUploaded] = entries[index];
      await client.query(
        `INSERT INTO admin_logs (timestamp, action, target, total_rows_read, errors, total_uploaded)
         VALUES (NOW() - ($1::int * INTERVAL '1 day'), 'UPLOAD', $2, $3, $4, $5)`,
        [entries.length - index, target, totalRowsRead, errors, totalUploaded]
      );
    }

    await client.query('COMMIT');

    const result = await client.query(
      'SELECT action, target, total_rows_read, errors, total_uploaded FROM admin_logs ORDER BY timestamp ASC'
    );
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
