
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FilterCard, CustomRadio, FilterTag, CategoryLabel } from "../components/DashboardComponents";
import USMapD3 from "../components/USMapD3";
import { fetchDashboardAnalytics } from "../api/api";

// Different datasets for each view
const defaultSalaryData = [
  { name: "50k", value: 15 },
  { name: "60k", value: 25 },
  { name: "70k", value: 35 },
  { name: "80k", value: 45 },
  { name: "90k", value: 38 },
  { name: "100k", value: 42 },
  { name: "110k", value: 35 },
  { name: "120k", value: 28 },
  { name: "130k", value: 20 },
  { name: "140k", value: 15 },
  { name: "150k+", value: 12 },
];

const defaultCompanyData = [
  { name: "Google", value: 45 },
  { name: "Microsoft", value: 38 },
  { name: "Amazon", value: 35 },
  { name: "Apple", value: 32 },
  { name: "Meta", value: 28 },
  { name: "Netflix", value: 25 },
  { name: "Tesla", value: 22 },
  { name: "Uber", value: 18 },
  { name: "Spotify", value: 15 },
  { name: "Airbnb", value: 12 },
];

const defaultAdmissionsData = [
  { name: "Stanford", value: 25 },
  { name: "MIT", value: 22 },
  { name: "Carnegie Mellon", value: 28 },
  { name: "UC Berkeley", value: 35 },
  { name: "Georgia Tech", value: 32 },
  { name: "Caltech", value: 15 },
  { name: "UIUC", value: 40 },
  { name: "University of Washington", value: 30 },
  { name: "Cornell", value: 18 },
  { name: "Columbia", value: 20 },
];

const defaultOutcomesData = [
  { state: "AL", value: 0 },
  { state: "AK", value: 0 },
  { state: "AZ", value: 0 },
  { state: "AR", value: 0 },
  { state: "CA", value: 120 },
  { state: "CO", value: 0 },
  { state: "CT", value: 0 },
  { state: "DE", value: 0 },
  { state: "FL", value: 45 },
  { state: "GA", value: 0 },
  { state: "HI", value: 0 },
  { state: "ID", value: 0 },
  { state: "IL", value: 55 },
  { state: "IN", value: 38 },
  { state: "IA", value: 0 },
  { state: "KS", value: 0 },
  { state: "KY", value: 0 },
  { state: "LA", value: 0 },
  { state: "ME", value: 0 },
  { state: "MD", value: 0 },
  { state: "MA", value: 40 },
  { state: "MI", value: 0 },
  { state: "MN", value: 0 },
  { state: "MS", value: 0 },
  { state: "MO", value: 0 },
  { state: "MT", value: 0 },
  { state: "NE", value: 0 },
  { state: "NV", value: 0 },
  { state: "NH", value: 0 },
  { state: "NJ", value: 0 },
  { state: "NM", value: 0 },
  { state: "NY", value: 85 },
  { state: "NC", value: 0 },
  { state: "ND", value: 0 },
  { state: "OH", value: 35 },
  { state: "OK", value: 0 },
  { state: "OR", value: 0 },
  { state: "PA", value: 42 },
  { state: "RI", value: 0 },
  { state: "SC", value: 0 },
  { state: "SD", value: 0 },
  { state: "TN", value: 0 },
  { state: "TX", value: 95 },
  { state: "UT", value: 0 },
  { state: "VT", value: 0 },
  { state: "VA", value: 0 },
  { state: "WA", value: 65 },
  { state: "WV", value: 0 },
  { state: "WI", value: 0 },
  { state: "WY", value: 0 },
];

const Dashboard: React.FC = () => {
  type BarChartDatum = { name: string; value: number };
  const [selectedDataView, setSelectedDataView] = useState('Outcomes');
  const [searchTerm, setSearchTerm] = useState('');
  const [salaryData, setSalaryData] = useState(defaultSalaryData);
  const [companyData, setCompanyData] = useState(defaultCompanyData);
  const [admissionsData, setAdmissionsData] = useState(defaultAdmissionsData);
  const [outcomesData, setOutcomesData] = useState(defaultOutcomesData);
  
  // Filter states (current selections)
  const [graduationYearFilters, setGraduationYearFilters] = useState<string[]>([]);
  const [majorFilters, setMajorFilters] = useState<string[]>([]);
  const [degreeLevelFilters, setDegreeLevelFilters] = useState<string[]>([]);
  const [employmentTypeFilters, setEmploymentTypeFilters] = useState<string[]>([]);
  const [trackFilters, setTrackFilters] = useState<string[]>([]);
  const [locationFilters, setLocationFilters] = useState<string[]>([]);

  // Applied filter states (only updated when FILTER button is clicked)
  const [appliedGraduationYearFilters, setAppliedGraduationYearFilters] = useState<string[]>([]);
  const [appliedMajorFilters, setAppliedMajorFilters] = useState<string[]>([]);
  const [appliedDegreeLevelFilters, setAppliedDegreeLevelFilters] = useState<string[]>([]);
  const [appliedEmploymentTypeFilters, setAppliedEmploymentTypeFilters] = useState<string[]>([]);
  const [appliedTrackFilters, setAppliedTrackFilters] = useState<string[]>([]);
  const [appliedLocationFilters, setAppliedLocationFilters] = useState<string[]>([]);

  // Scroll state for blur effects
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const dataOptions = ['Outcomes', 'Salary', 'Top Company Placements', 'Grad Admissions'];

  const handleScrollCheck = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    setCanScrollLeft(element.scrollLeft > 0);
    setCanScrollRight(element.scrollLeft + 2 < element.scrollWidth - element.clientWidth);  };

  // Check scroll potential when filters change
  React.useEffect(() => {
    const filterContainer = document.getElementById('filter-tags-container');
    if (filterContainer) {
      setCanScrollLeft(filterContainer.scrollLeft > 0);
      setCanScrollRight(filterContainer.scrollLeft + 2 < filterContainer.scrollWidth - filterContainer.clientWidth);
    }
  }, [appliedGraduationYearFilters, appliedMajorFilters, appliedDegreeLevelFilters, appliedEmploymentTypeFilters, appliedTrackFilters, appliedLocationFilters]);

  const applyFilters = () => {
    setAppliedGraduationYearFilters([...graduationYearFilters]);
    setAppliedMajorFilters([...majorFilters]);
    setAppliedDegreeLevelFilters([...degreeLevelFilters]);
    setAppliedEmploymentTypeFilters([...employmentTypeFilters]);
    setAppliedTrackFilters([...trackFilters]);
    setAppliedLocationFilters([...locationFilters]);
  };

  const removeFilterTag = (category: string, value: string) => {
    switch (category) {
      case 'Graduation Year':
        const newGradYears = appliedGraduationYearFilters.filter(item => item !== value);
        setAppliedGraduationYearFilters(newGradYears);
        setGraduationYearFilters(newGradYears);
        break;
      case 'Major':
        const newMajors = appliedMajorFilters.filter(item => item !== value);
        setAppliedMajorFilters(newMajors);
        setMajorFilters(newMajors);
        break;
      case 'Degree Level':
        const newDegrees = appliedDegreeLevelFilters.filter(item => item !== value);
        setAppliedDegreeLevelFilters(newDegrees);
        setDegreeLevelFilters(newDegrees);
        break;
      case 'Employment Type':
        const newEmployment = appliedEmploymentTypeFilters.filter(item => item !== value);
        setAppliedEmploymentTypeFilters(newEmployment);
        setEmploymentTypeFilters(newEmployment);
        break;
      case 'Track':
        const newTracks = appliedTrackFilters.filter(item => item !== value);
        setAppliedTrackFilters(newTracks);
        setTrackFilters(newTracks);
        break;
      case 'Location':
        const newLocations = appliedLocationFilters.filter(item => item !== value);
        setAppliedLocationFilters(newLocations);
        setLocationFilters(newLocations);
        break;
    }
  };

  const clearAllFilters = () => {
    setGraduationYearFilters([]);
    setMajorFilters([]);
    setDegreeLevelFilters([]);
    setEmploymentTypeFilters([]);
    setTrackFilters([]);
    setLocationFilters([]);
    setAppliedGraduationYearFilters([]);
    setAppliedMajorFilters([]);
    setAppliedDegreeLevelFilters([]);
    setAppliedEmploymentTypeFilters([]);
    setAppliedTrackFilters([]);
    setAppliedLocationFilters([]);
    setSearchTerm('');
  };

  // Get data and title based on selected view
  const getChartData = (): BarChartDatum[] => {
    switch (selectedDataView) {
      case 'Salary':
        return salaryData;
      case 'Top Company Placements':
        return companyData;
      case 'Grad Admissions':
        return admissionsData;
      default:
        return salaryData;
    }
  };

  const getChartTitle = () => {
    switch (selectedDataView) {
      case 'Salary':
        return 'SALARIES FOR FULL-TIME JOBS';
      case 'Top Company Placements':
        return 'TOP COMPANY PLACEMENTS';
      case 'Grad Admissions':
        return 'GRADUATE SCHOOL ADMISSIONS';
      case 'Outcomes':
        return 'ALUMNI OUTCOMES BY STATE';
      default:
        return 'DASHBOARD';
    }
  };

  React.useEffect(() => {
    let isMounted = true;
    const loadAnalytics = async () => {
      try {
        const data = await fetchDashboardAnalytics({
          graduationYears: appliedGraduationYearFilters,
          majors: appliedMajorFilters,
          degreeLevels: appliedDegreeLevelFilters,
          employmentTypes: appliedEmploymentTypeFilters,
          tracks: appliedTrackFilters,
          locations: appliedLocationFilters,
          search: searchTerm
        });
        if (!isMounted) return;
        setSalaryData(data.salaryBands);
        setCompanyData(data.topCompanies);
        setAdmissionsData(data.gradAdmissions);
        setOutcomesData(data.outcomesByState);
      } catch (error) {
        console.error('Failed to load dashboard analytics:', error);
      }
    };

    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, [
    appliedGraduationYearFilters,
    appliedMajorFilters,
    appliedDegreeLevelFilters,
    appliedEmploymentTypeFilters,
    appliedTrackFilters,
    appliedLocationFilters,
    searchTerm
  ]);

  return (
    <>
      <style>
        {`
          #filter-tags-container::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <div className="dashboard-page" style={{ display: 'flex', width: '100%', minHeight: 400, gap: 32, padding: '20px', position: 'relative' }}>

      <div style={{ flex: '0 0 260px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <FilterCard 
          title="Graduation Year"
          options={['2020', '2021', '2022', '2023', '2024']}
          selectedOptions={graduationYearFilters}
          onSelectionChange={setGraduationYearFilters}
        />
        <FilterCard 
          title="Major"
          options={['Computer Science', 'Data Science', 'Artificial Intelligence']}
          selectedOptions={majorFilters}
          onSelectionChange={setMajorFilters}
        />
        <FilterCard 
          title="Degree Level"
          options={['Bachelor\'s', 'Master\'s', 'PhD']}
          selectedOptions={degreeLevelFilters}
          onSelectionChange={setDegreeLevelFilters}
        />
        <FilterCard 
          title="Employment Type"
          options={['Full Time', 'Part Time', 'Internship']}
          selectedOptions={employmentTypeFilters}
          onSelectionChange={setEmploymentTypeFilters}
        />
        <FilterCard
          title="Track"
          options={['CS', 'Data Science', 'Artificial Intelligence', 'Software', 'Systems']}
          selectedOptions={trackFilters}
          onSelectionChange={setTrackFilters}
        />
        <FilterCard
          title="Location"
          options={['CA', 'IL', 'IN', 'MA', 'NY', 'TX', 'WA']}
          selectedOptions={locationFilters}
          onSelectionChange={setLocationFilters}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <a 
            className="hero-data-button hero-data-button--border" 
            style={{ width: 130, margin: 0, cursor: 'pointer' }}
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
            style={{ width: 130, margin: 0, cursor: 'pointer' }}
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
              style={{ transform: 'translateX(4px)' }}
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

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #C4BFC0',
          padding: '15px 20px',
          width: '100%',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 30,
          }}>
            <span style={{
              fontFamily: 'United Sans Condensed',
              fontWeight: 600,
              fontSize: 20,
              color: 'black'
            }}>
              DATA:
            </span>
            <div style={{ display: 'flex', gap: 25 }}>
              {dataOptions.map((option) => (
                <CustomRadio
                  key={option}
                  checked={selectedDataView === option}
                  onChange={() => setSelectedDataView(option)}
                  label={option}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #C4BFC0',
          padding: '15px 20px',
          width: '100%',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="11"
                cy="11"
                r="8"
                stroke="#666"
                strokeWidth="2"
              />
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
              placeholder="Search by Job Title and/or Company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: 16,
                fontFamily: 'Acumin Pro',
                color: '#333',
                backgroundColor: 'transparent',
              }}
            />
          </div>
        </div>

        {/* Applied Filters Bar */}
        {((appliedGraduationYearFilters.length > 0 && appliedGraduationYearFilters.length < 5) || 
          (appliedMajorFilters.length > 0 && appliedMajorFilters.length < 3) || 
          (appliedDegreeLevelFilters.length > 0 && appliedDegreeLevelFilters.length < 3) || 
          (appliedEmploymentTypeFilters.length > 0 && appliedEmploymentTypeFilters.length < 3) ||
          (appliedTrackFilters.length > 0 && appliedTrackFilters.length < 5) ||
          (appliedLocationFilters.length > 0 && appliedLocationFilters.length < 7)) && (
          <div style={{
            position: 'relative',
            marginTop: -14,
          }}>
            {/* Left blur overlay */}
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 4,
              width: 20,
              opacity: canScrollLeft ? 1 : 0,
              background: 'linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))',
              zIndex: 1,
              pointerEvents: 'none',
              transition: 'opacity 0.2s ease',
            }} />
            
            {/* Right blur overlay */}
            <div style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 4,
              width: 30,
              opacity: canScrollRight ? 1 : 0,
              background: 'linear-gradient(to left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))',
              zIndex: 1,
              pointerEvents: 'none',
              transition: 'opacity 0.1s ease',
            }} />

            <div 
              id="filter-tags-container"
              onScroll={handleScrollCheck}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                overflowX: 'auto',
                overflowY: 'hidden',
                flexWrap: 'nowrap',
                paddingLeft: 1,
                paddingBottom: 4,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {appliedGraduationYearFilters.length > 0 && appliedGraduationYearFilters.length < 5 && (
                <>
                  <CategoryLabel category="Graduation Year" />
                  {appliedGraduationYearFilters.map((year) => (
                    <FilterTag
                      key={`graduation-${year}`}
                      value={year}
                      onRemove={() => removeFilterTag('Graduation Year', year)}
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
                      onRemove={() => removeFilterTag('Major', major)}
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
                      onRemove={() => removeFilterTag('Degree Level', degree)}
                    />
                  ))}
                </>
              )}
              
              {appliedEmploymentTypeFilters.length > 0 && appliedEmploymentTypeFilters.length < 3 && (
                <>
                  <CategoryLabel category="Employment Type" />
                  {appliedEmploymentTypeFilters.map((employment) => (
                    <FilterTag
                      key={`employment-${employment}`}
                      value={employment}
                      onRemove={() => removeFilterTag('Employment Type', employment)}
                    />
                  ))}
                </>
              )}

              {appliedTrackFilters.length > 0 && appliedTrackFilters.length < 5 && (
                <>
                  <CategoryLabel category="Track" />
                  {appliedTrackFilters.map((track) => (
                    <FilterTag
                      key={`track-${track}`}
                      value={track}
                      onRemove={() => removeFilterTag('Track', track)}
                    />
                  ))}
                </>
              )}

              {appliedLocationFilters.length > 0 && appliedLocationFilters.length < 7 && (
                <>
                  <CategoryLabel category="Location" />
                  {appliedLocationFilters.map((location) => (
                    <FilterTag
                      key={`location-${location}`}
                      value={location}
                      onRemove={() => removeFilterTag('Location', location)}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* Chart Title */}
        <h2 style={{
          margin: 0,
          fontFamily: 'United Sans Condensed',
          fontWeight: 600,
          fontSize: 32,
          color: 'black',
          textAlign: 'center',
        }}>
          {getChartTitle()}
        </h2>

        {/* Chart */}
        <div style={{ height: 500 }}>
          {selectedDataView === 'Outcomes' ? (
            <USMapD3 data={outcomesData} height={500} />
          ) : (
            <ResponsiveContainer>
              <BarChart data={getChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#CFB991" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default Dashboard;
