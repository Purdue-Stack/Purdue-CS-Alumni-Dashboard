// db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: "postgresql://developer_user:DevUser%402025_ReadOnly%21@ep-misty-mud-aeu3sc0f.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

export const query = (text: string, params?: any[]) => pool.query(text, params);