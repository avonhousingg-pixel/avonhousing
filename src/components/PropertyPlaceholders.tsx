import React, { useEffect, useRef, useState } from 'react';
import { propertyPlaceholderSections } from '../data/siteContent';
import { getProperties, type PropertyCategory, type PropertyRecord } from '../lib/api';
import PropertyCard from './PropertyCard';
import { WordReveal } from './WordReveal';

const sectionCategories: Record<string, PropertyCategory> = {
  assured: 'assured-resale',
  'fast-selling': 'under-construction',
};

const PropertyPlaceholders: React.FC = () => {
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [propertiesByCategory, setPropertiesByCategory] = useState<Record<PropertyCategory, PropertyRecord[]>>({
    'assured-resale': [],
    'under-construction': [],
    featured: [],
  });

  useEffect(() => {
    Promise.all([
      getProperties({ category: 'assured-resale', status: 'active' }),
      getProperties({ category: 'under-construction', status: 'active' }),
    ])
      .then(([assured, underConstruction]) => {
        setPropertiesByCategory(current => ({
          ...current,
          'assured-resale': assured,
          'under-construction': underConstruction,
        }));
      })
      .catch(() => undefined);
  }, []);

  const scrollRow = (sectionKey: string, direction: 'left' | 'right') => {
    const row = rowRefs.current[sectionKey];

    if (!row) return;

    const card = row.querySelector<HTMLElement>('.placeholder-card');
    const distance = card ? card.offsetWidth + 32 : 400;

    row.scrollBy({
      left: direction === 'right' ? distance : -distance,
      behavior: 'smooth',
    });
  };

  return (
    <section className="property-placeholder-sections">
      <div className="container">
        {propertyPlaceholderSections.map(section => {
          const sectionProperties = propertiesByCategory[sectionCategories[section.className]];

          return (
            <div key={section.title} className="property-placeholder-section">
              <div className="section-header compact carousel-header">
                <h2 className="section-title">
                  <WordReveal text={section.title} intersect={true} />
                </h2>
                {sectionProperties.length > 0 && (
                  <div className="carousel-controls" aria-label={`${section.title} controls`}>
                    <button
                      type="button"
                      className="carousel-button"
                      aria-label={`Scroll ${section.title} left`}
                      onClick={() => scrollRow(section.className, 'left')}
                    >
                      &lt;
                    </button>
                    <button
                      type="button"
                      className="carousel-button"
                      aria-label={`Scroll ${section.title} right`}
                      onClick={() => scrollRow(section.className, 'right')}
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </div>

              {sectionProperties.length > 0 && (
                <div
                  className="placeholder-grid"
                  ref={element => {
                    rowRefs.current[section.className] = element;
                  }}
                >
                  {sectionProperties.map(property => (
                    <PropertyCard key={property._id} property={property} className={`placeholder-card ${section.className}`} />
                  ))}
                  <article className={`placeholder-card placeholder-view-all ${section.className}`}>
                    <div className="placeholder-view-all-content">
                      <span className="placeholder-kicker">{section.title}</span>
                      <h3>Explore the complete collection</h3>
                      <a href={`/properties?category=${sectionCategories[section.className]}`} className="btn-primary placeholder-view-all-button">
                        View All Properties
                      </a>
                    </div>
                  </article>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PropertyPlaceholders;
