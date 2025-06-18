// models/alumniModel.ts
import { query } from '../db';

export interface Alumni {
  Name: string;
  "Graduation Year": number;
  "Graduation Term": string;
  "Outcome Type": string;
  Employer: string;
  "Job Title": string;
  "Field of Study": string;
  "Degree Seeking": string;
  University: string;
  City: string;
  State: string;
  "Base Salary": number;
  "Signing Bonus": number;
  "Relocation Reimbursement": number;
  "Student ID": number;
  "Degree Level": string;
  "Salary Period": string;
}

export async function insertAlumni(data: Alumni): Promise<void> {
  const sql = `
    INSERT INTO alumni (
      "Name", "Graduation Year", "Graduation Term", "Outcome Type",
      "Employer", "Job Title", "Field of Study", "Degree Seeking",
      "University", "City", "State", "Base Salary",
      "Signing Bonus", "Relocation Reimbursement", "Student ID",
      "Degree Level", "Salary Period"
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
    )
  `;
  const values = [
    data.Name,
    data["Graduation Year"],
    data["Graduation Term"],
    data["Outcome Type"],
    data.Employer,
    data["Job Title"],
    data["Field of Study"],
    data["Degree Seeking"],
    data.University,
    data.City,
    data.State,
    data["Base Salary"],
    data["Signing Bonus"],
    data["Relocation Reimbursement"],
    data["Student ID"],
    data["Degree Level"],
    data["Salary Period"]
  ];
  await query(sql, values);
}

export async function insertManyAlumni(rows: Alumni[]): Promise<void> {
  for (const row of rows) {
    await insertAlumni(row);
  }
}