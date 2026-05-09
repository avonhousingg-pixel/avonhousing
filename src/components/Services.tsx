import React from 'react';
import { services } from '../data/siteContent';
import { Counter } from './Counter';
import { WordReveal } from './WordReveal';

const Services: React.FC = () => {
  return (
    <section className="services" id="services">
      <div className="container">
        <h2 className="section-title">
          <WordReveal text="Our" delayBase={0} intersect={true} />{' '}
          <span className="italic">
            <WordReveal text="Expertise" delayBase={0.1} intersect={true} />
          </span>
        </h2>

        <div className="services-grid">
          {services.map(service => (
            <div key={service.slug} className="service-card">
              <span className="service-index">
                <Counter end={parseInt(service.index, 10)} padZero={true} />
              </span>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-desc">{service.description}</p>
              <a href={`/services/${service.slug}`} className="service-link">
                Learn More <span className="arrow">&gt;</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
