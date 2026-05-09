import React from 'react';
import {
  caseStudies,
  serviceDetails,
  serviceFaqs,
  serviceProcessSteps,
} from '../data/siteContent';

const ServiceDetail: React.FC = () => {
  const slug = window.location.pathname.split('/').filter(Boolean).pop() ?? 'property-acquisition';
  const content = serviceDetails[slug as keyof typeof serviceDetails] ?? serviceDetails['property-acquisition'];

  return (
    <section className="service-detail-page">
      <div className="container">
        <div className="service-detail-hero">
          <div>
            <span className="about-eyebrow">{content.eyebrow}</span>
            <h1>{content.title}</h1>
            <p>{content.summary}</p>
            <a href="/consultation" className="btn-primary">Consultation</a>
          </div>
          <div className="service-detail-hero-media image-placeholder">
            <span>Service Image</span>
          </div>
        </div>

        <div className="service-detail-section">
          <span className="about-eyebrow">Detailed Explanation</span>
          <div className="service-detail-copy-grid">
            <h2>Built for clarity at every decision point.</h2>
            <div>
              <p>
                Avon Housing combines neighborhood knowledge, property verification, buyer and
                seller context, and negotiation support into one calm, structured experience.
              </p>
              <p>
                The goal is simple: reduce noise, protect your time, and help you move forward
                with the strongest available options.
              </p>
            </div>
          </div>
        </div>

        <div className="service-detail-section">
          <span className="about-eyebrow">Process</span>
          <div className="service-process-grid">
            {serviceProcessSteps.map((step, index) => (
              <article className="service-process-card" key={step}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{step}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="service-detail-section">
          <span className="about-eyebrow">Case Studies</span>
          <div className="case-study-grid">
            {caseStudies.map(study => (
              <article className="case-study-card" key={study.title}>
                <div className="case-study-media image-placeholder">
                  <span>Case Image</span>
                </div>
                <h3>{study.title}</h3>
                <p>{study.result}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="service-detail-section">
          <span className="about-eyebrow">FAQs</span>
          <div className="faq-list">
            {serviceFaqs.map(item => (
              <details className="faq-item" key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="service-detail-cta" id="consultation">
          <div>
            <span className="about-eyebrow">Consultation</span>
            <h2>Ready to discuss your property plans?</h2>
            <p>Share your requirement and Avon Housing will help you plan the next step.</p>
          </div>
          <a href="/consultation" className="btn-primary">Book Consultation</a>
        </div>
      </div>
    </section>
  );
};

export default ServiceDetail;
