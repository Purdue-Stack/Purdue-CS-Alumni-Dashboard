import React, { useState, useMemo } from 'react';
import styles from '../styles/AdminAlumniTable.module.css';

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

const dummyData: Alumni[] = [
    {
      "First Name": "Alice",
      "Last Name": "Smith",
      "Graduation Year": 2020,
      "Graduation Term": "Fall",
      "Outcome Type": "Employed",
      Employer: "Google",
      "Job Title": "Software Engineer",
      "Expected Field of Study": "Computer Science",
      "Degree Seeking": "MS",
      University: "MIT",
      City: "Cambridge",
      State: "MA",
      "Base Salary": 120000,
      "Signing Bonus": 15000,
      "Relocation Reimbursement": 5000,
      "Student ID": 1001,
      "Degree Level": "Masters",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Bob",
      "Last Name": "Johnson",
      "Graduation Year": 2021,
      "Graduation Term": "Spring",
      "Outcome Type": "Seeking",
      Employer: "Amazon",
      "Job Title": "Data Analyst",
      "Expected Field of Study": "Data Science",
      "Degree Seeking": "PhD",
      University: "Stanford",
      City: "Stanford",
      State: "CA",
      "Base Salary": 90000,
      "Signing Bonus": 10000,
      "Relocation Reimbursement": 7000,
      "Student ID": 1002,
      "Degree Level": "Doctorate",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Charlie",
      "Last Name": "Lee",
      "Graduation Year": 2019,
      "Graduation Term": "Summer",
      "Outcome Type": "Employed",
      Employer: "Microsoft",
      "Job Title": "UX Designer",
      "Expected Field of Study": "Design",
      "Degree Seeking": "BS",
      University: "Purdue",
      City: "West Lafayette",
      State: "IN",
      "Base Salary": 70000,
      "Signing Bonus": 5000,
      "Relocation Reimbursement": 3000,
      "Student ID": 1003,
      "Degree Level": "Bachelors",
      "Salary Pay Period": "Monthly"
    },
    {
      "First Name": "Diana",
      "Last Name": "Patel",
      "Graduation Year": 2022,
      "Graduation Term": "Fall",
      "Outcome Type": "Employed",
      Employer: "Facebook",
      "Job Title": "Product Manager",
      "Expected Field of Study": "Management",
      "Degree Seeking": "MBA",
      University: "Harvard",
      City: "Cambridge",
      State: "MA",
      "Base Salary": 140000,
      "Signing Bonus": 20000,
      "Relocation Reimbursement": 8000,
      "Student ID": 1004,
      "Degree Level": "Masters",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Evan",
      "Last Name": "Chen",
      "Graduation Year": 2020,
      "Graduation Term": "Spring",
      "Outcome Type": "Employed",
      Employer: "Apple",
      "Job Title": "Hardware Engineer",
      "Expected Field of Study": "Electrical Engineering",
      "Degree Seeking": "BS",
      University: "UC Berkeley",
      City: "Berkeley",
      State: "CA",
      "Base Salary": 110000,
      "Signing Bonus": 10000,
      "Relocation Reimbursement": 6000,
      "Student ID": 1005,
      "Degree Level": "Bachelors",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Fiona",
      "Last Name": "Garcia",
      "Graduation Year": 2018,
      "Graduation Term": "Fall",
      "Outcome Type": "Seeking",
      Employer: "Tesla",
      "Job Title": "Marketing Coordinator",
      "Expected Field of Study": "Marketing",
      "Degree Seeking": "MS",
      University: "CMU",
      City: "Pittsburgh",
      State: "PA",
      "Base Salary": 65000,
      "Signing Bonus": 5000,
      "Relocation Reimbursement": 2000,
      "Student ID": 1006,
      "Degree Level": "Masters",
      "Salary Pay Period": "Monthly"
    },
    {
      "First Name": "George",
      "Last Name": "Brown",
      "Graduation Year": 2017,
      "Graduation Term": "Summer",
      "Outcome Type": "Employed",
      Employer: "Netflix",
      "Job Title": "Data Scientist",
      "Expected Field of Study": "Data Science",
      "Degree Seeking": "PhD",
      University: "UCLA",
      City: "Los Angeles",
      State: "CA",
      "Base Salary": 150000,
      "Signing Bonus": 25000,
      "Relocation Reimbursement": 10000,
      "Student ID": 1007,
      "Degree Level": "Doctorate",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Hannah",
      "Last Name": "Wilson",
      "Graduation Year": 2021,
      "Graduation Term": "Fall",
      "Outcome Type": "Employed",
      Employer: "Tesla",
      "Job Title": "Software Engineer",
      "Expected Field of Study": "Mechanical Engineering",
      "Degree Seeking": "BS",
      University: "UT Austin",
      City: "Austin",
      State: "TX",
      "Base Salary": 95000,
      "Signing Bonus": 8000,
      "Relocation Reimbursement": 4000,
      "Student ID": 1008,
      "Degree Level": "Bachelors",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Ian",
      "Last Name": "Martinez",
      "Graduation Year": 2022,
      "Graduation Term": "Spring",
      "Outcome Type": "Seeking",
      Employer: "Deloitte",
      "Job Title": "Financial Analyst",
      "Expected Field of Study": "Finance",
      "Degree Seeking": "MS",
      University: "University of Michigan",
      City: "Ann Arbor",
      State: "MI",
      "Base Salary": 70000,
      "Signing Bonus": 10000,
      "Relocation Reimbursement": 3000,
      "Student ID": 1009,
      "Degree Level": "Masters",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Julia",
      "Last Name": "Kim",
      "Graduation Year": 2019,
      "Graduation Term": "Fall",
      "Outcome Type": "Employed",
      Employer: "PwC",
      "Job Title": "Consultant",
      "Expected Field of Study": "Business",
      "Degree Seeking": "MS",
      University: "Harvard",
      City: "Cambridge",
      State: "MA",
      "Base Salary": 105000,
      "Signing Bonus": 12000,
      "Relocation Reimbursement": 7000,
      "Student ID": 1010,
      "Degree Level": "Masters",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Kevin",
      "Last Name": "Liu",
      "Graduation Year": 2020,
      "Graduation Term": "Summer",
      "Outcome Type": "Employed",
      Employer: "EY",
      "Job Title": "Auditor",
      "Expected Field of Study": "Accounting",
      "Degree Seeking": "BS",
      University: "University of Pennsylvania",
      City: "Philadelphia",
      State: "PA",
      "Base Salary": 80000,
      "Signing Bonus": 8000,
      "Relocation Reimbursement": 4000,
      "Student ID": 1011,
      "Degree Level": "Bachelors",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Laura",
      "Last Name": "Davis",
      "Graduation Year": 2021,
      "Graduation Term": "Spring",
      "Outcome Type": "Employed",
      Employer: "KPMG",
      "Job Title": "Tax Associate",
      "Expected Field of Study": "Finance",
      "Degree Seeking": "BS",
      University: "Georgia Tech",
      City: "Atlanta",
      State: "GA",
      "Base Salary": 85000,
      "Signing Bonus": 9000,
      "Relocation Reimbursement": 3000,
      "Student ID": 1012,
      "Degree Level": "Bachelors",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Michael",
      "Last Name": "Clark",
      "Graduation Year": 2022,
      "Graduation Term": "Summer",
      "Outcome Type": "Employed",
      Employer: "Goldman Sachs",
      "Job Title": "Financial Analyst",
      "Expected Field of Study": "Finance",
      "Degree Seeking": "MS",
      University: "Princeton",
      City: "Princeton",
      State: "NJ",
      "Base Salary": 115000,
      "Signing Bonus": 15000,
      "Relocation Reimbursement": 6000,
      "Student ID": 1013,
      "Degree Level": "Masters",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Natalie",
      "Last Name": "Rodriguez",
      "Graduation Year": 2018,
      "Graduation Term": "Fall",
      "Outcome Type": "Seeking",
      Employer: "JPMorgan",
      "Job Title": "Investment Banking Analyst",
      "Expected Field of Study": "Finance",
      "Degree Seeking": "BS",
      University: "Yale",
      City: "New Haven",
      State: "CT",
      "Base Salary": 0,
      "Signing Bonus": 0,
      "Relocation Reimbursement": 0,
      "Student ID": 1014,
      "Degree Level": "Bachelors",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Oscar",
      "Last Name": "Hernandez",
      "Graduation Year": 2019,
      "Graduation Term": "Spring",
      "Outcome Type": "Employed",
      Employer: "Morgan Stanley",
      "Job Title": "Business Analyst",
      "Expected Field of Study": "Economics",
      "Degree Seeking": "BS",
      University: "Columbia",
      City: "New York",
      State: "NY",
      "Base Salary": 95000,
      "Signing Bonus": 8000,
      "Relocation Reimbursement": 4000,
      "Student ID": 1015,
      "Degree Level": "Bachelors",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Priya",
      "Last Name": "Shah",
      "Graduation Year": 2020,
      "Graduation Term": "Fall",
      "Outcome Type": "Employed",
      Employer: "Bank of America",
      "Job Title": "Project Manager",
      "Expected Field of Study": "Business",
      "Degree Seeking": "MS",
      University: "MIT",
      City: "Cambridge",
      State: "MA",
      "Base Salary": 100000,
      "Signing Bonus": 12000,
      "Relocation Reimbursement": 5000,
      "Student ID": 1016,
      "Degree Level": "Masters",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Quentin",
      "Last Name": "Young",
      "Graduation Year": 2021,
      "Graduation Term": "Summer",
      "Outcome Type": "Employed",
      Employer: "McKinsey",
      "Job Title": "Consultant",
      "Expected Field of Study": "Management",
      "Degree Seeking": "MBA",
      University: "Harvard",
      City: "Cambridge",
      State: "MA",
      "Base Salary": 130000,
      "Signing Bonus": 20000,
      "Relocation Reimbursement": 7000,
      "Student ID": 1017,
      "Degree Level": "Masters",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Rachel",
      "Last Name": "Adams",
      "Graduation Year": 2022,
      "Graduation Term": "Fall",
      "Outcome Type": "Employed",
      Employer: "BCG",
      "Job Title": "Consultant",
      "Expected Field of Study": "Business",
      "Degree Seeking": "MS",
      University: "Stanford",
      City: "Stanford",
      State: "CA",
      "Base Salary": 125000,
      "Signing Bonus": 18000,
      "Relocation Reimbursement": 6000,
      "Student ID": 1018,
      "Degree Level": "Masters",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Samuel",
      "Last Name": "Thompson",
      "Graduation Year": 2019,
      "Graduation Term": "Spring",
      "Outcome Type": "Employed",
      Employer: "Accenture",
      "Job Title": "Technology Consultant",
      "Expected Field of Study": "Computer Science",
      "Degree Seeking": "BS",
      University: "Purdue",
      City: "West Lafayette",
      State: "IN",
      "Base Salary": 90000,
      "Signing Bonus": 10000,
      "Relocation Reimbursement": 4000,
      "Student ID": 1019,
      "Degree Level": "Bachelors",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Tina",
      "Last Name": "Nguyen",
      "Graduation Year": 2020,
      "Graduation Term": "Fall",
      "Outcome Type": "Seeking",
      Employer: "Uber",
      "Job Title": "UX Designer",
      "Expected Field of Study": "Design",
      "Degree Seeking": "MS",
      University: "CMU",
      City: "Pittsburgh",
      State: "PA",
      "Base Salary": 0,
      "Signing Bonus": 0,
      "Relocation Reimbursement": 0,
      "Student ID": 1020,
      "Degree Level": "Masters",
      "Salary Pay Period": "Monthly"
    },
    {
      "First Name": "Umar",
      "Last Name": "Ali",
      "Graduation Year": 2021,
      "Graduation Term": "Summer",
      "Outcome Type": "Employed",
      Employer: "Lyft",
      "Job Title": "Data Engineer",
      "Expected Field of Study": "Computer Science",
      "Degree Seeking": "MS",
      University: "UC Berkeley",
      City: "Berkeley",
      State: "CA",
      "Base Salary": 115000,
      "Signing Bonus": 14000,
      "Relocation Reimbursement": 6000,
      "Student ID": 1021,
      "Degree Level": "Masters",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Veronica",
      "Last Name": "Lopez",
      "Graduation Year": 2018,
      "Graduation Term": "Spring",
      "Outcome Type": "Employed",
      Employer: "Airbnb",
      "Job Title": "Operations Manager",
      "Expected Field of Study": "Business",
      "Degree Seeking": "BS",
      University: "UCLA",
      City: "Los Angeles",
      State: "CA",
      "Base Salary": 85000,
      "Signing Bonus": 8000,
      "Relocation Reimbursement": 3000,
      "Student ID": 1022,
      "Degree Level": "Bachelors",
      "Salary Pay Period": "Monthly"
    },
    {
      "First Name": "William",
      "Last Name": "Scott",
      "Graduation Year": 2019,
      "Graduation Term": "Fall",
      "Outcome Type": "Employed",
      Employer: "Twitter",
      "Job Title": "Software Engineer",
      "Expected Field of Study": "Computer Science",
      "Degree Seeking": "BS",
      University: "CMU",
      City: "Pittsburgh",
      State: "PA",
      "Base Salary": 98000,
      "Signing Bonus": 12000,
      "Relocation Reimbursement": 5000,
      "Student ID": 1023,
      "Degree Level": "Bachelors",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Xena",
      "Last Name": "Zhao",
      "Graduation Year": 2020,
      "Graduation Term": "Spring",
      "Outcome Type": "Seeking",
      Employer: "LinkedIn",
      "Job Title": "Product Manager",
      "Expected Field of Study": "Marketing",
      "Degree Seeking": "MBA",
      University: "Stanford",
      City: "Stanford",
      State: "CA",
      "Base Salary": 0,
      "Signing Bonus": 0,
      "Relocation Reimbursement": 0,
      "Student ID": 1024,
      "Degree Level": "Masters",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Yan",
      "Last Name": "He",
      "Graduation Year": 2017,
      "Graduation Term": "Summer",
      "Outcome Type": "Employed",
      Employer: "Spotify",
      "Job Title": "Data Scientist",
      "Expected Field of Study": "Data Science",
      "Degree Seeking": "MS",
      University: "University of Michigan",
      City: "Ann Arbor",
      State: "MI",
      "Base Salary": 130000,
      "Signing Bonus": 20000,
      "Relocation Reimbursement": 7000,
      "Student ID": 1025,
      "Degree Level": "Masters",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Zoe",
      "Last Name": "Patel",
      "Graduation Year": 2022,
      "Graduation Term": "Fall",
      "Outcome Type": "Employed",
      Employer: "Oracle",
      "Job Title": "Database Administrator",
      "Expected Field of Study": "Computer Science",
      "Degree Seeking": "BS",
      University: "UIUC",
      City: "Champaign",
      State: "IL",
      "Base Salary": 92000,
      "Signing Bonus": 10000,
      "Relocation Reimbursement": 4000,
      "Student ID": 1026,
      "Degree Level": "Bachelors",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Aaron",
      "Last Name": "Brooks",
      "Graduation Year": 2021,
      "Graduation Term": "Spring",
      "Outcome Type": "Employed",
      Employer: "Cisco",
      "Job Title": "Network Engineer",
      "Expected Field of Study": "Computer Science",
      "Degree Seeking": "BS",
      University: "Georgia Tech",
      City: "Atlanta",
      State: "GA",
      "Base Salary": 96000,
      "Signing Bonus": 9000,
      "Relocation Reimbursement": 3000,
      "Student ID": 1027,
      "Degree Level": "Bachelors",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Bella",
      "Last Name": "Turner",
      "Graduation Year": 2020,
      "Graduation Term": "Fall",
      "Outcome Type": "Employed",
      Employer: "Adobe",
      "Job Title": "UX Researcher",
      "Expected Field of Study": "Design",
      "Degree Seeking": "MS",
      University: "UC Berkeley",
      City: "Berkeley",
      State: "CA",
      "Base Salary": 89000,
      "Signing Bonus": 8000,
      "Relocation Reimbursement": 3500,
      "Student ID": 1028,
      "Degree Level": "Masters",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Carter",
      "Last Name": "Evans",
      "Graduation Year": 2019,
      "Graduation Term": "Summer",
      "Outcome Type": "Employed",
      Employer: "IBM",
      "Job Title": "Cloud Architect",
      "Expected Field of Study": "Computer Science",
      "Degree Seeking": "MS",
      University: "MIT",
      City: "Cambridge",
      State: "MA",
      "Base Salary": 135000,
      "Signing Bonus": 18000,
      "Relocation Reimbursement": 7000,
      "Student ID": 1029,
      "Degree Level": "Masters",
      "Salary Pay Period": "Annual"
    },
    {
      "First Name": "Delilah",
      "Last Name": "Foster",
      "Graduation Year": 2022,
      "Graduation Term": "Spring",
      "Outcome Type": "Seeking",
      Employer: "Salesforce",
      "Job Title": "Sales Associate",
      "Expected Field of Study": "Business",
      "Degree Seeking": "BS",
      University: "Harvard",
      City: "Cambridge",
      State: "MA",
      "Base Salary": 0,
      "Signing Bonus": 0,
      "Relocation Reimbursement": 0,
      "Student ID": 1030,
      "Degree Level": "Bachelors",
      "Salary Pay Period": "Monthly"
    }
  ];  

const numericFields: (keyof Alumni)[] = [
  "Graduation Year",
  "Base Salary",
  "Signing Bonus",
  "Relocation Reimbursement"
];

const enumFields: (keyof Alumni)[] = [
  "Graduation Term",
  "Outcome Type",
  "Degree Seeking",
  "Degree Level",
  "Salary Pay Period"
];

const searchableFields: (keyof Alumni)[] = [
  "Employer",
  "Job Title",
  "Expected Field of Study",
  "University",
  "City",
  "State"
];

type Filters = {
  [K in keyof Alumni]?: Alumni[K] extends number
    ? { min?: number; max?: number }
    : string[];
};

const ENTRIES_PER_PAGE = 50;

const AdminAlumniTable: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({});
  const [sortConfig, setSortConfig] = useState<{ key?: keyof Alumni; direction: "asc" | "desc" | "" }>({ direction: "" });
  const [page, setPage] = useState(0);

  const enumOptions = useMemo(() => {
    const map: { [K in keyof Alumni]?: string[] } = {};
    enumFields.forEach((f) => {
      map[f] = Array.from(new Set(dummyData.map((r) => r[f] as string))).sort();
    });
    return map;
  }, []);

  const searchableOptions = useMemo(() => {
    const map: { [K in keyof Alumni]?: string[] } = {};
    searchableFields.forEach((f) => {
      const freq: Record<string, number> = {};
      dummyData.forEach((r) => {
        const v = r[f] as string;
        freq[v] = (freq[v] || 0) + 1;
      });
      map[f] = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .map(([val]) => val);
    });
    return map;
  }, []);

  const filteredData = useMemo(() => {
    let data = [...dummyData];

    // numeric range filters
    numericFields.forEach((f) => {
      const cfg = filters[f] as { min?: number; max?: number };
      if (cfg) {
        if (cfg.min != null) data = data.filter((r) => (r[f] as number) >= cfg.min!);
        if (cfg.max != null) data = data.filter((r) => (r[f] as number) <= cfg.max!);
      }
    });

    // enum & searchable multi-select filters
    [...enumFields, ...searchableFields].forEach((f) => {
      const sel = filters[f] as string[];
      if (sel?.length) data = data.filter((r) => sel.includes(r[f] as string));
    });

    // global search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter((r) =>
        Object.values(r).some(
          (v) => typeof v === "string" && v.toLowerCase().includes(q)
        )
      );
    }

    // sorting
    if (sortConfig.key && sortConfig.direction) {
      data.sort((a, b) => {
        const aV = a[sortConfig.key!], bV = b[sortConfig.key!];
        if (aV === bV) return 0;
        return (aV! > bV! ? 1 : -1) * (sortConfig.direction === "asc" ? 1 : -1);
      });
    }

    return data;
  }, [filters, searchQuery, sortConfig]);

  const pageCount = Math.ceil(filteredData.length / ENTRIES_PER_PAGE);
  const currentData = filteredData.slice(
    page * ENTRIES_PER_PAGE,
    (page + 1) * ENTRIES_PER_PAGE
  );

  const handleSort = (key: keyof Alumni) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        const dir = prev.direction === "asc" ? "desc" : prev.direction === "desc" ? "" : "asc";
        return { key: dir ? key : undefined, direction: dir };
      }
      return { key, direction: "asc" };
    });
  };

  const updateFilter = <K extends keyof Alumni>(field: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(0);
  };

  return (
    <div className={styles["alumni-page"]}>
      <h1 className={styles.heading}>Alumni Data Dashboard</h1>
      <p className={styles.subheading}>
        Explore employment outcomes and academic paths of our alumni
      </p>

      <input
        type="text"
        className={styles["search-bar"]}
        placeholder="Search visible rows..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setPage(0);
        }}
      />

      <div className={styles["filter-panel"]}>
        {numericFields.map((field) => {
          const cfg = (filters[field] as { min?: number; max?: number }) || {};
          return (
            <div key={field} className={styles["filter-group"]}>
              <label className={styles["filter-label"]}>{field}</label>
              <input
                type="number"
                placeholder="Min"
                className={styles["filter-input"]}
                value={cfg.min ?? ""}
                onChange={(e) =>
                  updateFilter(field, { ...cfg, min: e.target.value ? Number(e.target.value) : undefined })
                }
              />
              <input
                type="number"
                placeholder="Max"
                className={styles["filter-input"]}
                value={cfg.max ?? ""}
                onChange={(e) =>
                  updateFilter(field, { ...cfg, max: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </div>
          );
        })}

        {enumFields.map((field) => {
          const opts = enumOptions[field] || [];
          const sel = (filters[field] as string[]) || [];
          return (
            <div key={field} className={styles["filter-group"]}>
              <label className={styles["filter-label"]}>{field}</label>
              <select
                multiple
                className={styles["filter-select"]}
                value={sel}
                onChange={(e) => {
                  const vals = Array.from(e.target.selectedOptions, (o) => o.value);
                  updateFilter(field, vals);
                }}
              >
                {opts.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          );
        })}

        {searchableFields.map((field) => {
          const opts = searchableOptions[field] || [];
          const sel = (filters[field] as string[]) || [];
          return (
            <SearchableMultiSelectFilter
              key={field}
              field={field as string}
              options={opts}
              selected={sel}
              onChange={(vals) => updateFilter(field, vals)}
            />
          );
        })}
      </div>

      <div className={styles["table-wrapper"]}>
        <table className={styles.table}>
          <thead>
            <tr>
              {Object.keys(dummyData[0]).map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col as keyof Alumni)}
                  className={styles["table-header"]}
                >
                  {col}
                  {sortConfig.key === col &&
                    (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((v, j) => (
                  <td key={j} className={styles["table-cell"]}>
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles["pagination-controls"]}>
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
          className={styles["page-btn"]}
        >
          ◀ Prev
        </button>
        <span className={styles["page-info"]}>
          Page {page + 1} of {pageCount}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, pageCount - 1))}
          disabled={page + 1 >= pageCount}
          className={styles["page-btn"]}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
};

type SMProps = {
  field: string;
  options: string[];
  selected: string[];
  onChange: (vals: string[]) => void;
};

const SearchableMultiSelectFilter: React.FC<SMProps> = ({
  field,
  options,
  selected,
  onChange
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const visible = search
    ? options.filter((o) =>
        o.toLowerCase().includes(search.toLowerCase())
      )
    : options.slice(0, 5);

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter((s) => s !== opt));
    else onChange([...selected, opt]);
  };

  return (
    <div className={`${styles["filter-group"]} ${styles.multiSelectWrapper}`}>
      <label className={styles["filter-label"]}>{field}</label>
      <div
        className={styles.selectDisplay}
        onClick={() => setOpen((o) => !o)}
      >
        {selected.length ? selected.join(", ") : `Select ${field}`}
      </div>
      {open && (
        <div className={styles.dropdown}>
          <input
            type="text"
            className={styles.dropdownSearch}
            placeholder={`Search ${field}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {visible.map((opt) => (
            <div key={opt}>
              <label>
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => toggleOption(opt)}
                />{" "}
                {opt}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAlumniTable;