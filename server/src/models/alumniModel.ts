// models/alumniModel.ts
import { query } from '../db';

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

export async function insertAlumni(data: Alumni): Promise<void> {
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
    data["Student ID"],
    data["Degree Level"],
    data["Salary Pay Period"]
  ];
  await query(sql, values);
}

export async function insertManyAlumni(rows: Alumni[]): Promise<void> {
  for (const row of rows) {
    await insertAlumni(row);
  }
}