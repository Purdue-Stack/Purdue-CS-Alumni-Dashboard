import { Alumni } from '../models/alumniModel';

export type RowError = { rowIndex: number; messages: string[] };
export type FieldError = { rowIndex: number; field: keyof Alumni; message: string };
export type FieldMapping = Partial<Record<keyof Alumni, string | null>>;

export const CANONICAL_COLUMNS: (keyof Alumni)[] = [
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
  "Student ID",
  "Degree Level",
  "Salary Pay Period",
  "Email",
  "LinkedIn",
  "Mentorship",
  "Mentorship Areas"
] as const;

export const REQUIRED_COLUMNS: (keyof Alumni)[] = [
  "First Name",
  "Last Name",
  "Graduation Year",
  "Outcome Type"
] as const;

const NUMERIC_COLUMNS = new Set<string>([
  "Graduation Year",
  "Base Salary",
  "Student ID"
]);

const ARRAY_COLUMNS = new Set<string>([
  "Mentorship Areas"
]);

const POSITION_OUTCOMES = new Set([
  'job',
  'internship',
  'research',
  'military service',
  'volunteering'
]);

const GRAD_SCHOOL_OUTCOMES = new Set([
  'graduate school'
]);

const MAPPING_PREFERENCES: Record<keyof Alumni, string[]> = {
  "First Name": ['First Name_1', 'First Name', 'first_name'],
  "Last Name": ['Last Name_1', 'Last Name', 'last_name'],
  "Graduation Year": ['Graduation Year_1', 'Graduation Year', 'grad_year'],
  "Graduation Term": ['Graduation Term', 'Term'],
  "Outcome Type": ['Outcome Type', 'Outcome'],
  "Employer": ['Employer', 'Company'],
  "Job Title": ['Job Title', 'Role', 'Title'],
  "Expected Field of Study": ['Expected Field of Study', 'Program', 'Major'],
  "Degree Seeking": ['Degree Seeking', 'Degree'],
  "University": ['University', 'School'],
  "City": ['City'],
  "State": ['US State / Canada Province', 'State', 'Province'],
  "Base Salary": ['Base Salary', 'Salary'],
  "Student ID": ['Student Id', 'Student ID'],
  "Degree Level": ['Degree Level'],
  "Salary Pay Period": ['Base Salary Pay Period', 'Salary Pay Period', 'Pay Period'],
  "Email": ['Email', 'Email Address'],
  "LinkedIn": ['LinkedIn', 'Linkedin'],
  "Mentorship": ['Mentorship', 'Mentor'],
  "Mentorship Areas": ['Mentorship Areas', 'Mentorship Area']
};

function normalizeSalaryPayPeriod(value: unknown): string | null {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === 'per year' || normalized === 'yearly' || normalized === 'annual') {
    return 'Annual';
  }
  if (normalized === 'per month' || normalized === 'monthly') {
    return 'Monthly';
  }
  if (normalized === 'per hour' || normalized === 'hourly') {
    return 'Hourly';
  }
  return String(value).trim();
}

function normalizeCity(value: unknown): string | null {
  const city = String(value ?? '').trim();
  if (!city) return null;

  const separatorMatch = city.match(/^(.*?)(?:\s*-\s*[A-Z]{2})$/);
  if (separatorMatch?.[1]) {
    const trimmed = separatorMatch[1].trim();
    return trimmed || null;
  }

  return city;
}

function normalizeOutcomeType(value: unknown): string | null {
  const outcome = String(value ?? '').trim();
  return outcome || null;
}

function normalizeLinkedIn(value: string): string {
  return value.trim();
}

function isBlank(value: unknown): boolean {
  return value === null
    || value === undefined
    || (typeof value === 'string' && value.trim() === '')
    || (Array.isArray(value) && value.length === 0);
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isLinkedInUrl(value: string): boolean {
  return /^https?:\/\/([\w-]+\.)?linkedin\.com\/.+/i.test(value);
}

function findHeader(rawHeaders: string[], candidates: string[]): string | null {
  const normalizedMap = new Map<string, string[]>();

  rawHeaders.forEach((header) => {
    const key = normalizeHeader(header);
    const bucket = normalizedMap.get(key) ?? [];
    bucket.push(header);
    normalizedMap.set(key, bucket);
  });

  for (const candidate of candidates) {
    const match = normalizedMap.get(normalizeHeader(candidate))?.[0];
    if (match) {
      return match;
    }
  }

  return null;
}

function normalizeCanonicalRow(input: Partial<Record<keyof Alumni, any>>): Alumni {
  const normalized = {} as Alumni;

  CANONICAL_COLUMNS.forEach((column) => {
    const result = normalizeValue(column, input[column]);
    (normalized as any)[column] = result.value ?? null;
  });

  return normalized;
}

function buildRowErrors(fieldErrors: FieldError[]): RowError[] {
  const rowMap = new Map<number, string[]>();

  fieldErrors.forEach((error) => {
    const existing = rowMap.get(error.rowIndex) ?? [];
    existing.push(error.message);
    rowMap.set(error.rowIndex, existing);
  });

  return Array.from(rowMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([rowIndex, messages]) => ({
      rowIndex,
      messages: Array.from(new Set(messages))
    }));
}

export function normalizeHeader(value: string): string {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function normalizeValue(column: keyof Alumni, value: any): { value: any; error?: string } {
  if (value === null || value === undefined) {
    return { value: null };
  }

  if (column === "Salary Pay Period") {
    return { value: normalizeSalaryPayPeriod(value) };
  }

  if (column === "City") {
    return { value: normalizeCity(value) };
  }

  if (column === "Outcome Type") {
    return { value: normalizeOutcomeType(value) };
  }

  if (NUMERIC_COLUMNS.has(column)) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? { value } : { value: null, error: `${column} must be a number` };
    }

    if (typeof value === 'string') {
      const cleaned = value.replace(/[$,]/g, '').trim();
      if (!cleaned) {
        return { value: null };
      }
      const num = Number(cleaned);
      if (!Number.isFinite(num)) {
        return { value: null, error: `${column} must be a number` };
      }
      return { value: num };
    }

    return { value: null, error: `${column} must be a number` };
  }

  if (ARRAY_COLUMNS.has(column)) {
    if (Array.isArray(value)) {
      return { value: value.map((item) => String(item).trim()).filter(Boolean) };
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      return { value: trimmed ? trimmed.split(/[;,|]/).map((item) => item.trim()).filter(Boolean) : [] };
    }

    return { value: [] };
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return { value: null };
    }

    if (column === "LinkedIn") {
      return { value: normalizeLinkedIn(trimmed) };
    }

    return { value: trimmed };
  }

  return { value };
}

export function buildSuggestedMapping(rawHeaders: string[]): FieldMapping {
  const mapping: FieldMapping = {};

  CANONICAL_COLUMNS.forEach((column) => {
    mapping[column] = findHeader(rawHeaders, MAPPING_PREFERENCES[column]) ?? null;
  });

  return mapping;
}

export function getDuplicateMappingErrors(mapping: FieldMapping): string[] {
  const usedByHeader = new Map<string, (keyof Alumni)[]>();

  CANONICAL_COLUMNS.forEach((column) => {
    const header = mapping[column];
    if (!header) {
      return;
    }
    const bucket = usedByHeader.get(header) ?? [];
    bucket.push(column);
    usedByHeader.set(header, bucket);
  });

  return Array.from(usedByHeader.entries())
    .filter(([, columns]) => columns.length > 1)
    .map(([header, columns]) => `${header} is mapped to multiple fields: ${columns.join(', ')}`);
}

export function getMissingRequiredMappings(mapping: FieldMapping): string[] {
  return REQUIRED_COLUMNS.filter((column) => !mapping[column]);
}

export function getUnmappedHeaders(rawHeaders: string[], mapping: FieldMapping): string[] {
  const mappedHeaders = new Set(
    CANONICAL_COLUMNS
      .map((column) => mapping[column])
      .filter((value): value is string => Boolean(value))
  );

  return rawHeaders.filter((header) => !mappedHeaders.has(header));
}

export function mapRawRowsWithMapping(rawRows: Record<string, any>[], mapping: FieldMapping): Partial<Alumni>[] {
  return rawRows.map((rawRow) => {
    const mapped: Partial<Alumni> = {};

    CANONICAL_COLUMNS.forEach((column) => {
      const sourceHeader = mapping[column];
      (mapped as any)[column] = sourceHeader ? rawRow[sourceHeader] : null;
    });

    return mapped;
  });
}

export function validateCanonicalRows(inputRows: Partial<Alumni>[]) {
  const rows: Alumni[] = [];
  const fieldErrors: FieldError[] = [];
  const currentYear = new Date().getFullYear();

  inputRows.forEach((inputRow, index) => {
    const rowIndex = index + 1;
    const normalized = normalizeCanonicalRow(inputRow);
    rows.push(normalized);

    CANONICAL_COLUMNS.forEach((column) => {
      const rawValue = inputRow[column];
      const result = normalizeValue(column, rawValue);
      if (result.error) {
        fieldErrors.push({ rowIndex, field: column, message: result.error });
      }
    });

    REQUIRED_COLUMNS.forEach((column) => {
      if (isBlank(normalized[column])) {
        fieldErrors.push({ rowIndex, field: column, message: `${column} is required` });
      }
    });

    if (normalized["Graduation Year"] !== null) {
      if (!Number.isInteger(normalized["Graduation Year"])) {
        fieldErrors.push({ rowIndex, field: "Graduation Year", message: 'Graduation Year must be a whole number' });
      } else if (normalized["Graduation Year"] < 1900 || normalized["Graduation Year"] > currentYear + 10) {
        fieldErrors.push({ rowIndex, field: "Graduation Year", message: 'Graduation Year is out of range' });
      }
    }

    ["Base Salary"].forEach((columnName) => {
      const column = columnName as keyof Alumni;
      const value = normalized[column] as number | null;
      if (value !== null && value < 0) {
        fieldErrors.push({ rowIndex, field: column, message: `${column} cannot be negative` });
      }
    });

    if (normalized["Base Salary"] !== null && isBlank(normalized["Salary Pay Period"])) {
      fieldErrors.push({
        rowIndex,
        field: "Salary Pay Period",
        message: 'Salary Pay Period is required when Base Salary is provided'
      });
    }

    if (normalized.Email && !isEmail(normalized.Email)) {
      fieldErrors.push({ rowIndex, field: "Email", message: 'Email must be a valid email address' });
    }

    if (normalized["LinkedIn"] && !isLinkedInUrl(normalized["LinkedIn"])) {
      fieldErrors.push({ rowIndex, field: "LinkedIn", message: 'LinkedIn must be a valid LinkedIn URL' });
    }

    const outcome = normalizeHeader(String(normalized["Outcome Type"] ?? ''));

    if (POSITION_OUTCOMES.has(outcome)) {
      if (isBlank(normalized.Employer)) {
        fieldErrors.push({ rowIndex, field: "Employer", message: `Employer is required for ${normalized["Outcome Type"]}` });
      }
      if (isBlank(normalized["Job Title"])) {
        fieldErrors.push({ rowIndex, field: "Job Title", message: `Job Title is required for ${normalized["Outcome Type"]}` });
      }
    }

    if (GRAD_SCHOOL_OUTCOMES.has(outcome)) {
      if (isBlank(normalized.University)) {
        fieldErrors.push({ rowIndex, field: "University", message: 'University is required for Graduate School' });
      }
      if (isBlank(normalized["Degree Seeking"])) {
        fieldErrors.push({ rowIndex, field: "Degree Seeking", message: 'Degree Seeking is required for Graduate School' });
      }
    }
  });

  return {
    rows,
    fieldErrors,
    rowErrors: buildRowErrors(fieldErrors)
  };
}

export function normalizeRowsWithMapping(rawRows: Record<string, any>[], mapping: FieldMapping) {
  const mappedRows = mapRawRowsWithMapping(rawRows, mapping);
  return validateCanonicalRows(mappedRows);
}

export function mapRowToCanonical(rawRow: Record<string, any>): Record<keyof Alumni, any> {
  const mapping = buildSuggestedMapping(Object.keys(rawRow));
  return mapRawRowsWithMapping([rawRow], mapping)[0] as Record<keyof Alumni, any>;
}

export function normalizeRows(rawRows: Record<string, any>[]) {
  const mappedRows = rawRows.map((rawRow) => mapRowToCanonical(rawRow));
  return validateCanonicalRows(mappedRows);
}

export function getMissingColumns(rawRows: Record<string, any>[]): string[] {
  if (!rawRows.length) {
    return [...REQUIRED_COLUMNS];
  }

  const mapping = buildSuggestedMapping(Object.keys(rawRows[0]));
  return getMissingRequiredMappings(mapping);
}

export function buildImportIdentityKey(row: Alumni): string {
  const identityParts = [
    row["Student ID"] ?? '',
    row["First Name"] ?? '',
    row["Last Name"] ?? '',
    row["Graduation Year"] ?? '',
    row["Degree Level"] ?? '',
    row["Outcome Type"] ?? '',
    row.Employer ?? '',
    row["Job Title"] ?? '',
    row.University ?? '',
    row["Degree Seeking"] ?? ''
  ];

  return identityParts.map((item) => String(item).trim().toLowerCase()).join('|');
}
