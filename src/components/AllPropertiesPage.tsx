import React, { useEffect, useState } from 'react';
import { getProperties, type PropertyRecord } from '../lib/api';
import PropertyCard from './PropertyCard';
import { WordReveal } from './WordReveal';

const getPropertyQuery = () => {
  const params = new URLSearchParams(window.location.search);
  const query: Record<string, string> = { status: 'active' };

  ['location', 'type', 'bhk', 'category', 'minPrice', 'maxPrice', 'search', 'sort'].forEach(key => {
    const value = params.get(key);
    if (value) {
      query[key] = value;
    }
  });

  return query;
};

const getFilterSummary = () => {
  const params = new URLSearchParams(window.location.search);
  const categoryLabels: Record<string, string> = {
    'assured-resale': 'Resale',
    'under-construction': 'Under Construction',
    featured: 'Featured Collections',
  };
  const minPrice = params.get('minPrice');
  const maxPrice = params.get('maxPrice');
  const priceSummary = (() => {
    if (minPrice === '8000000' && maxPrice === '10000000') return 'Rs. 80 L - Rs. 1 Cr';
    if (minPrice === '10000000' && maxPrice === '30000000') return 'Rs. 1 Cr - Rs. 3 Cr';
    if (minPrice === '30000000' && maxPrice === '50000000') return 'Rs. 3 Cr - Rs. 5 Cr';
    if (minPrice === '50000000' && !maxPrice) return 'Rs. 5 Cr+';
    if (!minPrice && maxPrice === '8000000') return 'Under Rs. 80 L';
    if (minPrice || maxPrice) return 'Budget filtered';
    return '';
  })();
  const summary = [
    params.get('category') ? categoryLabels[params.get('category') || ''] || params.get('category') : '',
    params.get('location'),
    params.get('type'),
    params.get('bhk'),
    priceSummary,
  ].filter(Boolean);

  return summary.length ? summary.join(' - ') : 'All active listings';
};

const AllPropertiesPage: React.FC = () => {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSummary, setFilterSummary] = useState(getFilterSummary);

  useEffect(() => {
    const loadProperties = () => {
      setLoading(true);
      setFilterSummary(getFilterSummary());
      getProperties(getPropertyQuery())
        .then(setProperties)
        .catch(() => setProperties([]))
        .finally(() => setLoading(false));
    };

    window.scrollTo(0, 0);
    loadProperties();
    window.addEventListener('popstate', loadProperties);

    return () => window.removeEventListener('popstate', loadProperties);
  }, []);

  return (
    <section className="all-properties-page">
      <div className="container">
        <div className="all-properties-hero">
          <span className="about-eyebrow">Properties</span>
          <h1>
            <WordReveal text="All Properties" intersect={false} />
          </h1>
          <p>{filterSummary}</p>
        </div>

        {loading ? (
          <p className="property-empty-state">Loading properties...</p>
        ) : properties.length > 0 ? (
          <div className="all-properties-grid" aria-label="All properties">
            {properties.map(property => (
              <PropertyCard key={property._id} property={property} variant="list" />
            ))}
          </div>
        ) : (
          <p className="property-empty-state">No properties match this search yet.</p>
        )}
      </div>
    </section>
  );
};

export default AllPropertiesPage;
