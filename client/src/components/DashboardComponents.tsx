import React, { useState } from 'react';

type FilterCardProps = {
  title: string;
  options: string[];
  selectedOptions: string[];
  onSelectionChange: (options: string[]) => void;
};

export const CustomRadio = ({ checked, onChange, label }: { 
  checked: boolean; 
  onChange: () => void; 
  label: string;
}) => (
  <div 
    onClick={onChange}
    style={{
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
    }}
  >
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        width: 18,
        height: 18,
        marginRight: 8,
        border: `2px solid ${checked ? '#8E6F3E' : '#d1d5db'}`,
        borderRadius: '50%',
        background: 'transparent',
        transition: 'all 0.2s ease'
      }}
    >
      {checked && (
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: 3,
            width: 8,
            height: 8,
            backgroundColor: '#8E6F3E',
            borderRadius: '50%',
          }}
        />
      )}
    </div>
    <span style={{ fontSize: 14 }}>{label}</span>
  </div>
);

export const CustomCheckbox = ({ checked, onChange, label, fontWeight }: { 
  checked: boolean; 
  onChange: () => void; 
  label: string;
  fontWeight?: number;
}) => (
  <div 
    onClick={onChange}
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      cursor: 'pointer',
    }}
  >
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        width: 18,
        height: 18,
        marginRight: 8,
        marginTop: 1,
        flexShrink: 0,
        border: `2px solid ${checked ? '#8E6F3E' : '#d1d5db'}`,
        borderRadius: 4,
        background: 'transparent',
        transition: 'all 0.2s ease'
      }}
    >
    <div
      style={{
        position: 'absolute',
        top: 1.2,
        left: 4,
        width: 6,
        height: 10,
        border: 'solid #8E6F3E',
        borderWidth: '0 2px 2px 0',
        transform: 'rotate(50deg) skewX(10deg)',
        transition: 'opacity 0.2s ease',
        opacity: checked ? 1 : 0,
      }}
    />
    </div>
    <span style={{ fontSize: 14, fontWeight: fontWeight || 400, lineHeight: 1.35, wordBreak: 'break-word' }}>{label}</span>
  </div>
);

export const FilterCard: React.FC<FilterCardProps> = ({ title, options, selectedOptions, onSelectionChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleOptionToggle = (option: string) => {
    if (selectedOptions.includes(option)) {
      onSelectionChange(selectedOptions.filter(item => item !== option));
    } else {
      onSelectionChange([...selectedOptions, option]);
    }
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 8,
      border: '1px solid #C4BFC0',
      padding: 0,
      width: '100%',
      minWidth: 0,
      maxWidth: 'none',
      overflow: 'hidden',
    }}>
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          padding: '15px 20px',
          margin: 0,
          borderBottom: isCollapsed ? 'solid 0px #C4BFC0' : 'solid 1px #C4BFC0',
          fontFamily: "Acumin Pro",
          fontSize: 19,
          textTransform: 'capitalize',
          color: 'black',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'border-bottom 0.3s ease'
        }}
      >
        <span>
          <span style={{fontFamily: 'United Sans Condensed', fontWeight: 600, fontSize: 20 }}>FILTER BY:</span> {title}
        </span>
        <div style={{
          transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease',
          fontSize: 16,
          fontWeight: 'bold',
          color: '#666'
        }}>
          <div style={{
            width: 10,
            height: 10,
            borderRight: '2px solid #666',
            borderTop: '2px solid #666',
            transform: 'rotate(135deg)',
            transition: 'border-top 0.3s ease',
            marginBottom: 5,
          }}></div>
        </div>
      </div>
      <div style={{
        maxHeight: isCollapsed ? '0px' : '400px',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease-in-out',
      }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 10,
            padding: '15px 25px'
          }}
        >
          {options.map((option, index) => (
            <div key={index} style={{ minWidth: 0 }}>
              <CustomCheckbox 
                checked={selectedOptions.includes(option)}
                onChange={() => handleOptionToggle(option)}
                label={option}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const FilterTag = ({ value, onRemove }: {
  value: string;
  onRemove: () => void;
}) => (
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    background: 'transparent',
    color: 'black',
    borderRadius: 5,
    padding: '6px 12px',
    fontSize: 14,
    fontFamily: 'Acumin Pro',
    border: '1px solid #C4BFC0',
    margin: '0 -1px',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  }}>
    <span style={{ marginRight: 6 }}>
      {value}
    </span>
    <div
      onClick={onRemove}
      style={{
        cursor: 'pointer',
        width: 16,
        height: 16,
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 'bold',
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 3L3 9M3 3L9 9"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  </div>
);

export const CategoryLabel = ({ category }: { category: string }) => (
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    background: '#8E6F3E',
    color: 'white',
    borderRadius: 5,
    padding: '6px 12px',
    fontSize: 14,
    fontFamily: 'United Sans Condensed',
    fontWeight: 600,
    margin: '0 4px 0 0',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  }}>
    {category.toUpperCase()}:
  </div>
);
