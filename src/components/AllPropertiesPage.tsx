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

const categoryLabels: Record<string, string> = {
  'featured': 'Featured Collection',
  'under-construction': 'Under Construction',
  'assured-resale': 'Assured Resale',
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

  const query = getPropertyQuery();
  const isFilteredByCategory = Boolean(query.category);

  const renderPropertyGrid = (props: PropertyRecord[]) => (
    <div className="all-properties-grid" aria-label="Properties">
      {props.map(property => (
        <PropertyCard key={property._id} property={property} variant="list" />
      ))}
    </div>
  );

  const grouped = properties.reduce((acc, property) => {
    const cat = property.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(property);
    return acc;
  }, {} as Record<string, PropertyRecord[]>);

  // Define sort order for categories
  const categoryOrder = ['featured', 'under-construction', 'assured-resale'];
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <section className="all-properties-page">
      <div className="container">
        <a href="/" className="property-back-link">Back to Home</a>
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
          <div className="all-properties-content">
            {isFilteredByCategory ? (
              renderPropertyGrid(properties)
            ) : (
              sortedCategories.map(cat => (
                <div key={cat} className="property-category-section">
                  <h2 className="category-section-title">{categoryLabels[cat] || cat}</h2>
                  {renderPropertyGrid(grouped[cat])}
                </div>
              ))
            )}
          </div>
        ) : (
          <p className="property-empty-state">No properties match this search yet.</p>
        )}
      </div>
    </section>
  );
};

export default AllPropertiesPage;
