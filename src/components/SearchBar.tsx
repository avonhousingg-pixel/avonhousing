import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { bhkOptions as definedBhkOptions, propertyTypeOptions as definedPropertyTypes, westernSuburbAreas } from '../data/siteContent';
import { saveRecentSearch } from '../lib/userActivity';

type SelectOption = {
  value: string;
  label: string;
};

type CustomSelectProps = {
  label: string;
  value: string;
  placeholder: string;
  options: SelectOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
};

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  placeholder,
  options,
  disabled = false,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();
  const selectedOption = options.find(option => option.value === value);
  const isMenuOpen = isOpen && !disabled;

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  return (
    <div
      ref={rootRef}
      className={`search-field custom-select ${disabled ? 'is-disabled' : ''} ${isMenuOpen ? 'is-open' : ''}`}
    >
      <label>{label}</label>
      <button
        type="button"
        className={`custom-select-trigger ${!selectedOption ? 'is-placeholder' : ''}`}
        onClick={() => !disabled && setIsOpen(open => !open)}
        onKeyDown={event => {
          if (disabled) {
            return;
          }

          if (event.key === 'Escape') {
            setIsOpen(false);
          }

          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={isMenuOpen}
        aria-controls={listboxId}
        disabled={disabled}
      >
        <span>{selectedOption?.label ?? placeholder}</span>
        <span className="custom-select-chevron" aria-hidden="true" />
      </button>

      <div
        id={listboxId}
        className="custom-select-menu"
        role="listbox"
        aria-label={label}
      >
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            role="option"
            className={`custom-select-option ${option.value === value ? 'is-selected' : ''}`}
            aria-selected={option.value === value}
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const SearchBar: React.FC = () => {
  const [area, setArea] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bhk, setBhk] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [searchError, setSearchError] = useState('');

  const areas = westernSuburbAreas;
  const areaOptions = useMemo(
    () => areas.map(item => ({ value: item.name, label: item.name })),
    [areas]
  );

  const propertyTypeOptions: SelectOption[] = [
    { value: '', label: 'Any Type' },
    ...definedPropertyTypes.map(type => ({ value: type, label: type })),
  ];

  const bhkSelectOptions: SelectOption[] = [
    { value: '', label: 'Any BHK' },
    ...definedBhkOptions.map(option => ({ value: option, label: option })),
  ];

  const priceRangeOptions: SelectOption[] = [
    { value: '', label: 'Any Price' },
    { value: 'under-80l', label: 'Under \u20B980 L' },
    { value: '80l-1cr', label: '\u20B980 L - \u20B91 Cr' },
    { value: '1cr-3cr', label: '\u20B91 Cr - \u20B93 Cr' },
    { value: '3cr-5cr', label: '\u20B93 Cr - \u20B95 Cr' },
    { value: '5cr-plus', label: '\u20B95 Cr +' },
  ];

  const buildSearchQuery = () => {
    const query: Record<string, string> = {};

    if (area) {
      query.location = area;
    }

    if (propertyType) {
      query.type = propertyType;
    }

    if (bhk) {
      query.bhk = bhk;
    }

    if (priceRange === 'under-80l') {
      query.maxPrice = '8000000';
    } else if (priceRange === '80l-1cr') {
      query.minPrice = '8000000';
      query.maxPrice = '10000000';
    } else if (priceRange === '1cr-3cr') {
      query.minPrice = '10000000';
      query.maxPrice = '30000000';
    } else if (priceRange === '3cr-5cr') {
      query.minPrice = '30000000';
      query.maxPrice = '50000000';
    } else if (priceRange === '5cr-plus') {
      query.minPrice = '50000000';
    }

    return query;
  };

  const handleSearch = () => {
    const query = buildSearchQuery();

    if (!Object.keys(query).length) {
      setSearchError('Select an area, property type, BHK, or price range to search.');
      return;
    }

    setSearchError('');
    const labels = [
      area ? areaOptions.find(option => option.value === area)?.label : '',
      propertyType ? propertyTypeOptions.find(option => option.value === propertyType)?.label : '',
      bhk ? bhkSelectOptions.find(option => option.value === bhk)?.label : '',
      priceRange ? priceRangeOptions.find(option => option.value === priceRange)?.label : '',
    ].filter(Boolean);
    const label = labels.length ? labels.join(' - ') : 'All active properties';
    const params = new URLSearchParams(query);
    const nextPath = `/properties${params.size ? `?${params.toString()}` : ''}`;

    saveRecentSearch(label, query);
    window.history.pushState({}, '', nextPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <section className="search-section">
      <div className="container">
        <div className="search-container">
          <CustomSelect
            label="Area"
            value={area}
            placeholder="Select Western Suburb"
            options={areaOptions}
            onChange={setArea}
          />

          <CustomSelect
            label="Property Type"
            value={propertyType}
            placeholder="Select Type"
            options={propertyTypeOptions}
            onChange={setPropertyType}
          />

          <CustomSelect
            label="BHK"
            value={bhk}
            placeholder="Any BHK"
            options={bhkSelectOptions}
            onChange={setBhk}
          />

          <CustomSelect
            label="Price Range"
            value={priceRange}
            placeholder="Any Price"
            options={priceRangeOptions}
            onChange={setPriceRange}
          />

          <button className="btn-search" type="button" onClick={handleSearch}>
            Search
          </button>
        </div>
        {searchError && <p className="search-error" role="alert">{searchError}</p>}
      </div>
    </section>
  );
};

export default SearchBar;
