// models/alumniModel.ts
import { query } from '../db';
import type { PoolClient } from 'pg';

export interface Alumni {
  "First Name": string;
  "Last Name": string;
  "Graduation Year": number;
  "Graduation Term": string;
  "Outcome Type": string;
  Employer: string;
  "Job Title": string;
  "Expected Field of Study": string;
  "Degree Seeking": string;
  University: string;
  City: string;
  State: string;
  "Base Salary": number;
  "Signing Bonus": number;
  "Relocation Reimbursement": number;
  "Student ID": number;
  "Degree Level": string;
  "Salary Pay Period": string;
}

type Queryable = Pick<PoolClient, 'query'>;

const alumniColumns: (keyof Alumni)[] = [
  "First Name",
  "Last Name",
  "Graduation Year",
  "Graduation Term",
  "Outcome Type",
  "Employer",
  "Job Title",
  "Expected Field of Study",
  "Degree Seeking",
  "University",
  "City",
  "State",
  "Base Salary",
  "Signing Bonus",
  "Relocation Reimbursement",
  "Student ID",
  "Degree Level",
  "Salary Pay Period"
];

function rowToValues(data: Alumni): any[] {
  return [
    data["First Name"],
    data["Last Name"],
    data["Graduation Year"],
    data["Graduation Term"],
    data["Outcome Type"],
    data.Employer,
    data["Job Title"],
    data["Expected Field of Study"],
    data["Degree Seeking"],
    data.University,
    data.City,
    data.State,
    data["Base Salary"],
    data["Signing Bonus"],
    data["Relocation Reimbursement"],
    data["Student ID"],
    data["Degree Level"],
    data["Salary Pay Period"]
  ];
}

export async function insertAlumni(data: Alumni, client?: Queryable): Promise<void> {
  const executor = client ?? { query };
  const sql = `
    INSERT INTO alumni (
      "First Name", "Last Name", "Graduation Year", "Graduation Term", "Outcome Type",
      "Employer", "Job Title", "Expected Field of Study", "Degree Seeking",
      "University", "City", "State", "Base Salary",
      "Signing Bonus", "Relocation Reimbursement", "Student ID",
      "Degree Level", "Salary Pay Period"
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
    )
  `;
  const values = rowToValues(data);
  await executor.query(sql, values);
}

export async function insertManyAlumni(rows: Alumni[], client?: Queryable): Promise<void> {
  for (const row of rows) {
    await insertAlumni(row, client);
  }
}

export async function updateAlumniByStudentId(data: Alumni, client?: Queryable): Promise<void> {
  const executor = client ?? { query };
  const sql = `
    UPDATE alumni SET
      "First Name" = $1,
      "Last Name" = $2,
      "Graduation Year" = $3,
      "Graduation Term" = $4,
      "Outcome Type" = $5,
      "Employer" = $6,
      "Job Title" = $7,
      "Expected Field of Study" = $8,
      "Degree Seeking" = $9,
      "University" = $10,
      "City" = $11,
      "State" = $12,
      "Base Salary" = $13,
      "Signing Bonus" = $14,
      "Relocation Reimbursement" = $15,
      "Degree Level" = $16,
      "Salary Pay Period" = $17
    WHERE "Student ID" = $18
  `;
  const values = [
    data["First Name"],
    data["Last Name"],
    data["Graduation Year"],
    data["Graduation Term"],
    data["Outcome Type"],
    data.Employer,
    data["Job Title"],
    data["Expected Field of Study"],
    data["Degree Seeking"],
    data.University,
    data.City,
    data.State,
    data["Base Salary"],
    data["Signing Bonus"],
    data["Relocation Reimbursement"],
    data["Degree Level"],
    data["Salary Pay Period"],
    data["Student ID"]
  ];
  await executor.query(sql, values);
}

export async function updateAlumniByNameGradYear(data: Alumni, client?: Queryable): Promise<void> {
  const executor = client ?? { query };
  const sql = `
    UPDATE alumni SET
      "Graduation Term" = $1,
      "Outcome Type" = $2,
      "Employer" = $3,
      "Job Title" = $4,
      "Expected Field of Study" = $5,
      "Degree Seeking" = $6,
      "University" = $7,
      "City" = $8,
      "State" = $9,
      "Base Salary" = $10,
      "Signing Bonus" = $11,
      "Relocation Reimbursement" = $12,
      "Student ID" = $13,
      "Degree Level" = $14,
      "Salary Pay Period" = $15
    WHERE "First Name" = $16
      AND "Last Name" = $17
      AND "Graduation Year" = $18
  `;
  const values = [
    data["Graduation Term"],
    data["Outcome Type"],
    data.Employer,
    data["Job Title"],
    data["Expected Field of Study"],
    data["Degree Seeking"],
    data.University,
    data.City,
    data.State,
    data["Base Salary"],
    data["Signing Bonus"],
    data["Relocation Reimbursement"],
    data["Student ID"],
    data["Degree Level"],
    data["Salary Pay Period"],
    data["First Name"],
    data["Last Name"],
    data["Graduation Year"]
  ];
  await executor.query(sql, values);
}

export async function findAlumniByStudentId(studentId: number, client?: Queryable): Promise<Alumni | null> {
  const executor = client ?? { query };
  const result = await executor.query(
    `SELECT * FROM alumni WHERE "Student ID" = $1 LIMIT 1`,
    [studentId]
  );
  return result.rows[0] ?? null;
}

export async function findAlumniByNameGradYear(
  firstName: string,
  lastName: string,
  graduationYear: number,
  client?: Queryable
): Promise<Alumni | null> {
  const executor = client ?? { query };
  const result = await executor.query(
    `SELECT * FROM alumni WHERE "First Name" = $1 AND "Last Name" = $2 AND "Graduation Year" = $3 LIMIT 1`,
    [firstName, lastName, graduationYear]
  );
  return result.rows[0] ?? null;
}

export type AlumniListOptions = {
  limit?: number;
  offset?: number;
  search?: string;
  sortKey?: keyof Alumni;
  sortDir?: 'asc' | 'desc';
};

const sortableColumns: Record<string, string> = alumniColumns.reduce((acc, key) => {
  acc[key] = `"${key}"`;
  return acc;
}, {} as Record<string, string>);

export async function listAlumni(options: AlumniListOptions = {}): Promise<{ rows: Alumni[]; total: number; }> {
  const params: any[] = [];
  const whereClauses: string[] = [];

  if (options.search) {
    const q = `%${options.search}%`;
    params.push(q);
    const idx = params.length;
    const searchable = [
      '"First Name"',
      '"Last Name"',
      '"Employer"',
      '"Job Title"',
      '"Expected Field of Study"',
      '"University"',
      '"City"',
      '"State"'
    ];
    whereClauses.push(`(${searchable.map(col => `${col} ILIKE $${idx}`).join(' OR ')})`);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  let orderSql = '';
  if (options.sortKey && sortableColumns[options.sortKey]) {
    const dir = options.sortDir === 'desc' ? 'DESC' : 'ASC';
    orderSql = `ORDER BY ${sortableColumns[options.sortKey]} ${dir}`;
  }

  let limitSql = '';
  if (typeof options.limit === 'number') {
    params.push(options.limit);
    limitSql += ` LIMIT $${params.length}`;
  }
  if (typeof options.offset === 'number') {
    params.push(options.offset);
    limitSql += ` OFFSET $${params.length}`;
  }

  const dataSql = `SELECT * FROM alumni ${whereSql} ${orderSql} ${limitSql}`;
  const dataResult = await query(dataSql, params);

  const countResult = await query(`SELECT COUNT(*) FROM alumni ${whereSql}`, options.search ? [params[0]] : []);
  const total = Number(countResult.rows[0]?.count ?? 0);

  return { rows: dataResult.rows, total };
}
