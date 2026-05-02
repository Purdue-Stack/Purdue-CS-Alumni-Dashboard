type CanonicalRule = {
  canonical: string;
  aliases: string[];
};

function normalizeBasic(value: string | null | undefined) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeEmployerKey(value: string | null | undefined) {
  return normalizeBasic(value)
    .replace(/\b(incorporated|inc|corp|corporation|llc|ltd|co|company|lp)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeUniversityKey(value: string | null | undefined) {
  return normalizeBasic(value)
    .replace(/\(.*?\)/g, ' ')
    .replace(/\buniv\b/g, ' university ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeJobTitleKey(value: string | null | undefined) {
  return normalizeBasic(value)
    .replace(/\bsr\b/g, ' senior ')
    .replace(/\bassoc\b/g, ' associate ')
    .replace(/\bsde\b/g, ' software development engineer ')
    .replace(/\bswe\b/g, ' software engineer ')
    .replace(/\benginner\b/g, ' engineer ')
    .replace(/\bengineer internship\b/g, ' engineer intern ')
    .replace(/\binternship\b/g, ' intern ')
    .replace(/\bsoftware engineering intern\b/g, ' software engineer intern ')
    .replace(/\bsoftware engineer intern\b/g, ' software engineer intern ')
    .replace(/\bsoftware engineer i\b/g, ' software engineer 1 ')
    .replace(/\bsoftware engineer ii\b/g, ' software engineer 2 ')
    .replace(/\bsoftware development engineer i\b/g, ' software development engineer 1 ')
    .replace(/\s+/g, ' ')
    .trim();
}

const employerRules: CanonicalRule[] = [
  { canonical: 'Amazon', aliases: ['amazon', 'amazon com'] },
  { canonical: 'Amazon Web Services', aliases: ['amazon web services'] },
  { canonical: 'Google', aliases: ['google'] },
  { canonical: 'Meta', aliases: ['meta', 'meta platforms', 'facebook'] },
  { canonical: 'Microsoft', aliases: ['microsoft'] },
  { canonical: 'Apple', aliases: ['apple'] },
  { canonical: 'Salesforce', aliases: ['salesforce', 'salesforce com'] },
  { canonical: 'Capital One', aliases: ['capital one', 'capital one financial'] },
  { canonical: 'JPMorgan Chase', aliases: ['jpmorgan chase', 'jpmorgan chase and'] },
  { canonical: 'Bloomberg', aliases: ['bloomberg', 'bloomberg lp'] },
  { canonical: 'AT&T', aliases: ['at and t', 'atandt'] },
  { canonical: 'Cerner', aliases: ['cerner'] },
  { canonical: 'Qualcomm', aliases: ['qualcomm'] },
  { canonical: 'Epic Systems', aliases: ['epic systems', 'epic healthcare software wisconsin', 'epic'] },
  { canonical: 'Cisco', aliases: ['cisco systems cisco', 'cisco'] },
  { canonical: 'Eli Lilly', aliases: ['eli lilly', 'eli lilly and'] },
  { canonical: 'Northrop Grumman', aliases: ['northrop grumman'] },
  { canonical: 'FactSet Research Systems', aliases: ['factset research systems', 'factset'] },
  { canonical: 'MathWorks', aliases: ['mathworks'] },
  { canonical: 'Garmin', aliases: ['garmin'] }
];

const universityRules: CanonicalRule[] = [
  { canonical: 'Carnegie Mellon University', aliases: ['carnegie mellon university'] },
  { canonical: 'Cornell University', aliases: ['cornell university'] },
  { canonical: 'University of Illinois Urbana-Champaign', aliases: ['university of illinois urbana champaign', 'university of illinois uiuc urbana champaign', 'university of illinois urbana'] },
  { canonical: 'University of Michigan--Ann Arbor', aliases: ['university of michigan ann arbor'] },
  { canonical: 'University of Southern California', aliases: ['university of southern california'] },
  { canonical: 'Columbia University', aliases: ['columbia university'] },
  { canonical: 'University of California, San Diego', aliases: ['university of california san diego ucsd'] },
  { canonical: 'University of California, Los Angeles', aliases: ['university of california los angeles ucla'] },
  { canonical: 'University of California, Berkeley', aliases: ['university of california berkeley'] },
  { canonical: 'Georgia Institute of Technology', aliases: ['georgia institute of technology'] },
  { canonical: 'Purdue University', aliases: ['purdue', 'purdue university'] },
  { canonical: 'Purdue University--West Lafayette', aliases: ['purdue university west lafayette'] },
  { canonical: 'Boston University', aliases: ['boston university'] },
  { canonical: 'Arizona State University', aliases: ['arizona state university', 'arizona state'] },
  { canonical: 'University of Washington', aliases: ['university of washington'] },
  { canonical: 'New York University', aliases: ['new york university'] }
];

const jobTitleRules: CanonicalRule[] = [
  { canonical: 'Software Development Engineer', aliases: ['software development engineer'] },
  { canonical: 'Software Development Engineer 1', aliases: ['software development engineer 1'] },
  { canonical: 'Software Development Engineer Intern', aliases: ['software development engineer intern'] },
  { canonical: 'Software Engineer', aliases: ['software engineer', 'computer software engineer', 'software enginner'] },
  { canonical: 'Software Engineer 1', aliases: ['software engineer 1'] },
  { canonical: 'Software Engineer 2', aliases: ['software engineer 2'] },
  { canonical: 'Software Engineer Intern', aliases: ['software engineer intern'] },
  { canonical: 'Senior Software Engineer', aliases: ['senior software engineer'] },
  { canonical: 'Data Scientist', aliases: ['data scientist'] },
  { canonical: 'Member of Technical Staff', aliases: ['member of technical staff'] },
  { canonical: 'AMTS Software Engineer', aliases: ['amts software engineer'] },
  { canonical: 'Associate Software Developer', aliases: ['associate software developer'] },
  { canonical: 'Machine Learning Scientist', aliases: ['machine learning scientist'] },
  { canonical: 'Automation Engineer', aliases: ['automation engineer'] },
  { canonical: 'Front End Developer', aliases: ['front end developer'] },
  { canonical: 'Post-Doctoral Research Associate', aliases: ['post doctoral research associate'] }
];

function canonicalizeWithRules(
  rawValue: string | null | undefined,
  keyNormalizer: (value: string | null | undefined) => string,
  rules: CanonicalRule[]
) {
  const trimmed = String(rawValue ?? '').trim();
  if (!trimmed) {
    return null;
  }

  const normalized = keyNormalizer(trimmed);
  const matched = rules.find((rule) => rule.aliases.includes(normalized));
  return matched?.canonical ?? trimmed;
}

export function canonicalizeCompany(value: string | null | undefined) {
  return canonicalizeWithRules(value, normalizeEmployerKey, employerRules);
}

export function canonicalizeUniversity(value: string | null | undefined) {
  return canonicalizeWithRules(value, normalizeUniversityKey, universityRules);
}

export function canonicalizeJobTitle(value: string | null | undefined) {
  return canonicalizeWithRules(value, normalizeJobTitleKey, jobTitleRules);
}

export function matchesCanonicalSelection(
  rawValue: string | null | undefined,
  selected: string[],
  canonicalize: (value: string | null | undefined) => string | null
) {
  if (!selected.length) {
    return true;
  }

  const canonicalValue = canonicalize(rawValue);
  return canonicalValue ? selected.includes(canonicalValue) : false;
}

export function uniqueCanonicalOptions(
  values: Array<string | null | undefined>,
  canonicalize: (value: string | null | undefined) => string | null
) {
  return Array.from(
    new Set(
      values
        .map((value) => canonicalize(value))
        .filter((value): value is string => Boolean(value))
    )
  ).sort((left, right) => left.localeCompare(right));
}

export function topCanonicalSeries(
  values: Array<string | null | undefined>,
  canonicalize: (value: string | null | undefined) => string | null,
  limit: number
) {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    const canonical = canonicalize(value);
    if (!canonical) {
      return;
    }

    counts.set(canonical, (counts.get(canonical) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

export function canonicalCountMap(
  values: Array<string | null | undefined>,
  canonicalize: (value: string | null | undefined) => string | null
) {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    const canonical = canonicalize(value);
    if (!canonical) {
      return;
    }

    counts.set(canonical, (counts.get(canonical) ?? 0) + 1);
  });

  return counts;
}
