import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { FilterCard, FilterTag, CategoryLabel } from "../components/DashboardComponents";
import USMapD3 from "../components/USMapD3";
import {
  fetchDashboardAnalytics,
  type DashboardAnalyticsResponse,
} from "../api/api";

type DashboardTab = "Outcome" | "Salary" | "Placements" | "Graduate School" | "Internship";
type GraphType = "pie" | "histogram" | "map" | "bar" | "stacked-bar";
type StateDatum = { state: string; value: number };
type GraphDefinition = {
  title: string;
  type: GraphType;
  dataKey: keyof DashboardAnalyticsResponse;
  valueLabel?: string;
  valueFormatter?: "currency";
};

const pieColors = ["#8E6F3E", "#CFB991", "#6F7A85", "#D9D9D9"];
const tabAccent = "rgba(207, 185, 145, 0.18)";
const activeTabColor = "#9D7A28";
const emptyStateData: StateDatum[] = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS",
  "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY",
  "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV",
  "WI", "WY"
].map((state) => ({ state, value: 0 }));

const defaultAnalyticsData: DashboardAnalyticsResponse = {
  outcomeBreakdown: [],
  salaryHistogram: [
    { name: "50k", value: 0 },
    { name: "60k", value: 0 },
    { name: "70k", value: 0 },
    { name: "80k", value: 0 },
    { name: "90k", value: 0 },
    { name: "100k", value: 0 },
    { name: "110k", value: 0 },
    { name: "120k", value: 0 },
    { name: "130k", value: 0 },
    { name: "140k", value: 0 },
    { name: "150k+", value: 0 },
  ],
  salaryByRegion: emptyStateData,
  jobPlacementsByRegion: emptyStateData,
  topPlacementFocus: [],
  topPlacementsTop10: [],
  gradAdmissionsByRegion: emptyStateData,
  gradAdmissionsFocus: [],
  gradAdmissionsTop10: [],
  internshipConversions: [
    { name: "Converted at Same Company", value: 0 },
    { name: "Hired at Different Company", value: 0 },
    { name: "No Recorded Job Outcome", value: 0 },
  ],
  internshipPlacementFocus: [],
  internshipPlacementsTop10: [],
};

const graphGroups: Record<DashboardTab, GraphDefinition[]> = {
  Outcome: [
    {
      title: "Outcome",
      type: "pie",
      dataKey: "outcomeBreakdown",
      valueLabel: "Outcomes",
    },
  ],
  Salary: [
    {
      title: "Salary",
      type: "histogram",
      dataKey: "salaryHistogram",
      valueLabel: "Placements",
    },
    {
      title: "Salary by Region",
      type: "map",
      dataKey: "salaryByRegion",
      valueLabel: "Average Salary",
      valueFormatter: "currency",
    },
  ],
  Placements: [
    {
      title: "Job Placements by Region",
      type: "map",
      dataKey: "jobPlacementsByRegion",
      valueLabel: "Placements",
    },
    {
      title: "Top Placements",
      type: "bar",
      dataKey: "topPlacementFocus",
      valueLabel: "Placements",
    },
    {
      title: "Top 10 Most Common Placements",
      type: "bar",
      dataKey: "topPlacementsTop10",
      valueLabel: "Placements",
    },
  ],
  "Graduate School": [
    {
      title: "Grad School Admissions by Region",
      type: "map",
      dataKey: "gradAdmissionsByRegion",
      valueLabel: "Admissions",
    },
    {
      title: "Top Grad School Admissions",
      type: "bar",
      dataKey: "gradAdmissionsFocus",
      valueLabel: "Admissions",
    },
    {
      title: "Top 10 Most Common Grad Schl Admissions",
      type: "bar",
      dataKey: "gradAdmissionsTop10",
      valueLabel: "Admissions",
    },
  ],
  Internship: [
    {
      title: "Internship Conversion",
      type: "stacked-bar",
      dataKey: "internshipConversions",
      valueLabel: "Students",
    },
    {
      title: "Top Placements",
      type: "bar",
      dataKey: "internshipPlacementFocus",
      valueLabel: "Internships",
    },
    {
      title: "Top 10 Most Common Placements",
      type: "bar",
      dataKey: "internshipPlacementsTop10",
      valueLabel: "Internships",
    },
  ],
};

const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
const dashboardTabs: DashboardTab[] = ["Outcome", "Salary", "Placements", "Graduate School", "Internship"];

function parseDashboardTab(value: string | null): DashboardTab {
  if (value && dashboardTabs.includes(value as DashboardTab)) {
    return value as DashboardTab;
  }
  return "Outcome";
}

function parseGraphIndex(value: string | null, max: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed >= max) {
    return 0;
  }
  return parsed;
}

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = parseDashboardTab(searchParams.get("tab"));
  const [selectedTab, setSelectedTab] = useState<DashboardTab>(initialTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [analyticsData, setAnalyticsData] = useState<DashboardAnalyticsResponse>(defaultAnalyticsData);

  const [graduationYearFilters, setGraduationYearFilters] = useState<string[]>([]);
  const [majorFilters, setMajorFilters] = useState<string[]>([]);
  const [degreeLevelFilters, setDegreeLevelFilters] = useState<string[]>([]);

  const [appliedGraduationYearFilters, setAppliedGraduationYearFilters] = useState<string[]>([]);
  const [appliedMajorFilters, setAppliedMajorFilters] = useState<string[]>([]);
  const [appliedDegreeLevelFilters, setAppliedDegreeLevelFilters] = useState<string[]>([]);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [graphIndices, setGraphIndices] = useState<Record<DashboardTab, number>>({
    Outcome: 0,
    Salary: 0,
    Placements: 0,
    "Graduate School": 0,
    Internship: 0,
  });

  const dataOptions: DashboardTab[] = dashboardTabs;
  const currentGraphSet = graphGroups[selectedTab];
  const currentGraphIndex = graphIndices[selectedTab] ?? 0;
  const currentGraph = currentGraphSet[currentGraphIndex];

  React.useEffect(() => {
    const nextTab = parseDashboardTab(searchParams.get("tab"));
    const nextGraph = parseGraphIndex(searchParams.get("graph"), graphGroups[nextTab].length);

    setSelectedTab((current) => (current === nextTab ? current : nextTab));
    setGraphIndices((current) => (
      current[nextTab] === nextGraph
        ? current
        : { ...current, [nextTab]: nextGraph }
    ));
  }, [searchParams]);

  React.useEffect(() => {
    const currentTabParam = searchParams.get("tab");
    const currentGraphParam = searchParams.get("graph");
    const nextGraph = String(currentGraphIndex);

    if (currentTabParam === selectedTab && currentGraphParam === nextGraph) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", selectedTab);
    nextParams.set("graph", nextGraph);
    setSearchParams(nextParams, { replace: true });
  }, [currentGraphIndex, searchParams, selectedTab, setSearchParams]);

  const handleScrollCheck = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    setCanScrollLeft(element.scrollLeft > 0);
    setCanScrollRight(element.scrollLeft + 2 < element.scrollWidth - element.clientWidth);
  };

  React.useEffect(() => {
    const filterContainer = document.getElementById("filter-tags-container");
    if (filterContainer) {
      setCanScrollLeft(filterContainer.scrollLeft > 0);
      setCanScrollRight(filterContainer.scrollLeft + 2 < filterContainer.scrollWidth - filterContainer.clientWidth);
    }
  }, [appliedGraduationYearFilters, appliedMajorFilters, appliedDegreeLevelFilters]);

  const applyFilters = () => {
    setAppliedGraduationYearFilters([...graduationYearFilters]);
    setAppliedMajorFilters([...majorFilters]);
    setAppliedDegreeLevelFilters([...degreeLevelFilters]);
  };

  const removeFilterTag = (category: string, value: string) => {
    switch (category) {
      case "Graduation Year": {
        const nextValues = appliedGraduationYearFilters.filter((item) => item !== value);
        setAppliedGraduationYearFilters(nextValues);
        setGraduationYearFilters(nextValues);
        break;
      }
      case "Major": {
        const nextValues = appliedMajorFilters.filter((item) => item !== value);
        setAppliedMajorFilters(nextValues);
        setMajorFilters(nextValues);
        break;
      }
      case "Degree Level": {
        const nextValues = appliedDegreeLevelFilters.filter((item) => item !== value);
        setAppliedDegreeLevelFilters(nextValues);
        setDegreeLevelFilters(nextValues);
        break;
      }
    }
  };

  const clearAllFilters = () => {
    setGraduationYearFilters([]);
    setMajorFilters([]);
    setDegreeLevelFilters([]);
    setAppliedGraduationYearFilters([]);
    setAppliedMajorFilters([]);
    setAppliedDegreeLevelFilters([]);
    setSearchTerm("");
  };

  const changeGraph = (direction: -1 | 1) => {
    if (currentGraphSet.length <= 1) return;
    setGraphIndices((current) => {
      const nextIndex = (current[selectedTab] + direction + currentGraphSet.length) % currentGraphSet.length;
      return { ...current, [selectedTab]: nextIndex };
    });
  };

  React.useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      try {
        const data = await fetchDashboardAnalytics({
          graduationYears: appliedGraduationYearFilters,
          majors: appliedMajorFilters,
          degreeLevels: appliedDegreeLevelFilters,
          search: searchTerm,
        });
        if (!isMounted) return;
        setAnalyticsData(data);
      } catch (error) {
        console.error("Failed to load dashboard analytics:", error);
      }
    };

    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, [appliedGraduationYearFilters, appliedMajorFilters, appliedDegreeLevelFilters, searchTerm]);

  const renderBarChart = (
    data: Array<{ name: string; value: number }>,
    valueLabel: string,
    color = "#CFB991",
    valueFormatter?: "currency"
  ) => (
    <ResponsiveContainer>
      <BarChart data={data} layout="vertical" margin={{ top: 12, right: 24, left: 120, bottom: 12 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tickFormatter={valueFormatter === "currency" ? (value) => formatCurrency(Number(value)) : undefined}
        />
        <YAxis type="category" dataKey="name" width={220} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number) => [
            valueFormatter === "currency" ? formatCurrency(value) : value,
            valueLabel,
          ]}
        />
        <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderHistogram = (data: Array<{ name: string; value: number }>, valueLabel: string) => (
    <ResponsiveContainer>
      <BarChart data={data} margin={{ top: 20, right: 24, left: 0, bottom: 12 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip formatter={(value: number) => [value, valueLabel]} />
        <Bar dataKey="value" fill="#CFB991" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPie = (data: Array<{ name: string; value: number }>) => (
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={data.filter((item) => item.value > 0)}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={140}
          label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [value, "Outcomes"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderInternshipConversions = (data: Array<{ name: string; value: number }>) => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
        {data.map((item, index) => {
          const colors = ["#8E6F3E", "#CFB991", "#D9D9D9"];
          return (
            <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 999, background: colors[index] }} />
              <span style={{ fontFamily: "Acumin Pro", fontSize: 14, color: "#333" }}>
                {item.name}: {item.value}
              </span>
            </div>
          );
        })}
      </div>
      <ResponsiveContainer>
        <BarChart
          data={[
            {
              name: "Internship Outcomes",
              sameCompany: data[0]?.value ?? 0,
              differentCompany: data[1]?.value ?? 0,
              noRecordedJob: data[2]?.value ?? 0,
            },
          ]}
          layout="vertical"
          margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={140} />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === "sameCompany") return [value, "Converted at Same Company"];
              if (name === "differentCompany") return [value, "Hired at Different Company"];
              if (name === "noRecordedJob") return [value, "No Recorded Job Outcome"];
              return [value, name];
            }}
          />
          <Bar dataKey="sameCompany" stackId="a" fill="#8E6F3E" radius={[6, 0, 0, 6]} />
          <Bar dataKey="differentCompany" stackId="a" fill="#CFB991" />
          <Bar dataKey="noRecordedJob" stackId="a" fill="#D9D9D9" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderCurrentGraph = () => {
    const data = analyticsData[currentGraph.dataKey];

    if (currentGraph.type === "pie") {
      return renderPie(data as Array<{ name: string; value: number }>);
    }

    if (currentGraph.type === "histogram") {
      return renderHistogram(data as Array<{ name: string; value: number }>, currentGraph.valueLabel ?? "Count");
    }

    if (currentGraph.type === "map") {
      const label = currentGraph.valueLabel ?? "Value";
      return (
        <USMapD3
          data={data as StateDatum[]}
          height={470}
          tooltipLabel={label}
          legendLabel={label}
          formatValue={currentGraph.valueFormatter === "currency" ? formatCurrency : undefined}
        />
      );
    }

    if (currentGraph.type === "stacked-bar") {
      return renderInternshipConversions(data as Array<{ name: string; value: number }>);
    }

    return renderBarChart(
      data as Array<{ name: string; value: number }>,
      currentGraph.valueLabel ?? "Count",
      "#CFB991",
      currentGraph.valueFormatter
    );
  };

  return (
    <>
      <style>
        {`
          #filter-tags-container::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <div className="dashboard-page" style={{ display: "flex", width: "100%", minHeight: 400, gap: 32, padding: "20px", position: "relative" }}>
        <div style={{ flex: "0 0 260px", display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: 12 }}>
          <FilterCard
            title="Graduation Year"
            options={["2020", "2021", "2022", "2023", "2024", "2025"]}
            selectedOptions={graduationYearFilters}
            onSelectionChange={setGraduationYearFilters}
          />
          <FilterCard
            title="Major"
            options={["Computer Science", "Data Science", "Artificial Intelligence"]}
            selectedOptions={majorFilters}
            onSelectionChange={setMajorFilters}
          />
          <FilterCard
            title="Degree Level"
            options={["Bachelor's", "Master's", "PhD"]}
            selectedOptions={degreeLevelFilters}
            onSelectionChange={setDegreeLevelFilters}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <a
              className="hero-data-button hero-data-button--border"
              style={{ width: 130, margin: 0, cursor: "pointer" }}
              onClick={applyFilters}
            >
              FILTER
              <svg
                className="hero-data-button__arrow"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 5L21 12M21 12L14 19M21 12H3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              className="hero-data-button hero-data-button--red-border"
              style={{ width: 130, margin: 0, cursor: "pointer" }}
              onClick={clearAllFilters}
            >
              CLEAR
              <svg
                className="hero-data-button__arrow"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ transform: "translateX(4px)" }}
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <div
              style={{
                display: "inline-flex",
                flexWrap: "nowrap",
                borderRadius: 16,
                padding: 6,
                background: tabAccent,
                width: "100%",
                maxWidth: 1180,
                justifyContent: "center",
              }}
            >
              {dataOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedTab(option)}
                  style={{
                    flex: "1 1 0",
                    whiteSpace: "nowrap",
                    padding: "12px 20px",
                    border: "none",
                    borderRadius: 12,
                    background: selectedTab === option ? activeTabColor : "transparent",
                    color: selectedTab === option ? "#fff" : "#2D2926",
                    fontFamily: "Acumin Pro",
                    fontSize: 14,
                    fontWeight: 800,
                    letterSpacing: 0.2,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease, color 0.2s ease",
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              border: "1px solid #C4BFC0",
              padding: "15px 20px",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="11" cy="11" r="8" stroke="#666" strokeWidth="2" />
                <path
                  d="M21 21L16.65 16.65"
                  stroke="#666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                placeholder="Search by company, title, university, city, or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: 16,
                  fontFamily: "Acumin Pro",
                  color: "#333",
                  backgroundColor: "transparent",
                }}
              />
            </div>
          </div>

          {((appliedGraduationYearFilters.length > 0 && appliedGraduationYearFilters.length < 6) ||
            (appliedMajorFilters.length > 0 && appliedMajorFilters.length < 3) ||
            (appliedDegreeLevelFilters.length > 0 && appliedDegreeLevelFilters.length < 3)) && (
            <div style={{ position: "relative", marginTop: -14 }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 4,
                  width: 20,
                  opacity: canScrollLeft ? 1 : 0,
                  background: "linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))",
                  zIndex: 1,
                  pointerEvents: "none",
                  transition: "opacity 0.2s ease",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 4,
                  width: 30,
                  opacity: canScrollRight ? 1 : 0,
                  background: "linear-gradient(to left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))",
                  zIndex: 1,
                  pointerEvents: "none",
                  transition: "opacity 0.1s ease",
                }}
              />

              <div
                id="filter-tags-container"
                onScroll={handleScrollCheck}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  overflowX: "auto",
                  overflowY: "hidden",
                  flexWrap: "nowrap",
                  paddingLeft: 1,
                  paddingBottom: 4,
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {appliedGraduationYearFilters.length > 0 && appliedGraduationYearFilters.length < 6 && (
                  <>
                    <CategoryLabel category="Graduation Year" />
                    {appliedGraduationYearFilters.map((year) => (
                      <FilterTag
                        key={`graduation-${year}`}
                        value={year}
                        onRemove={() => removeFilterTag("Graduation Year", year)}
                      />
                    ))}
                  </>
                )}

                {appliedMajorFilters.length > 0 && appliedMajorFilters.length < 3 && (
                  <>
                    <CategoryLabel category="Major" />
                    {appliedMajorFilters.map((major) => (
                      <FilterTag
                        key={`major-${major}`}
                        value={major}
                        onRemove={() => removeFilterTag("Major", major)}
                      />
                    ))}
                  </>
                )}

                {appliedDegreeLevelFilters.length > 0 && appliedDegreeLevelFilters.length < 3 && (
                  <>
                    <CategoryLabel category="Degree Level" />
                    {appliedDegreeLevelFilters.map((degree) => (
                      <FilterTag
                        key={`degree-${degree}`}
                        value={degree}
                        onRemove={() => removeFilterTag("Degree Level", degree)}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              border: "1px solid #C4BFC0",
              padding: "18px 20px 20px",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "United Sans Condensed",
                  fontWeight: 600,
                  fontSize: 32,
                  color: "black",
                }}
              >
                {currentGraph.title}
              </h2>

              {currentGraphSet.length > 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => changeGraph(-1)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 999,
                      border: "1px solid #C4BFC0",
                      background: "#fff",
                      color: "#8E6F3E",
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {"<"}
                  </button>
                  <span style={{ fontFamily: "Acumin Pro", fontSize: 13, color: "#6B6768", minWidth: 36, textAlign: "center" }}>
                    {currentGraphIndex + 1}/{currentGraphSet.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeGraph(1)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 999,
                      border: "1px solid #C4BFC0",
                      background: "#fff",
                      color: "#8E6F3E",
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {">"}
                  </button>
                </div>
              )}
            </div>

            <div style={{ height: 500 }}>{renderCurrentGraph()}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
