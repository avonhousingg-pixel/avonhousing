import React, { useEffect, useState } from 'react';
import { getProperties, type PropertyRecord } from '../lib/api';
import PropertyCard from './PropertyCard';
import { WordReveal } from './WordReveal';

const FeaturedListings: React.FC = () => {
  const [adminProperties, setAdminProperties] = useState<PropertyRecord[]>([]);

  useEffect(() => {
    getProperties({ featured: 'true', status: 'active' })
      .then(properties => setAdminProperties(properties.slice(0, 6)))
      .catch(() => setAdminProperties([]));
  }, []);

  return (
    <section className="featured" id="properties">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <WordReveal text="Featured" delayBase={0} intersect={true} />
            <br />
            <span className="italic text-accent">
              <WordReveal text="Collections" delayBase={0.1} intersect={true} />
            </span>
          </h2>
          <a href="/properties" className="section-action">
            View All Properties <span aria-hidden="true">-&gt;</span>
          </a>
        </div>

        {adminProperties.length > 0 && (
          <div className="featured-grid">
            {adminProperties.map((property, index) => (
              <PropertyCard key={property._id} property={property} variant="featured" large={index === 0} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedListings;
