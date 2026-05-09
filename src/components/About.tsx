import React from 'react';
import { WordReveal } from './WordReveal';

const leaders = [
  {
    name: 'Sonal Jain',
    role: 'Founder and Principal Advisor',
  },
  {
    name: 'Avon Advisory Desk',
    role: 'Client Experience',
  },
  {
    name: 'Market Research Team',
    role: 'Property Intelligence',
  },
];

const About: React.FC = () => {
  return (
    <section className="about-page" id="about">
      <div className="container">
        <div className="about-hero">
          <div>
            <span className="about-eyebrow">About Avon</span>
            <h2 className="about-hero-title">
              <WordReveal text="A refined way to discover, evaluate, and secure real estate." intersect={true} />
            </h2>
          </div>
          <div className="about-hero-media image-placeholder scale-reveal">
            <span>Brand Image</span>
          </div>
        </div>

        <div className="about-intro-grid">
          <div className="about-heading-stack">
            <span>Transform</span>
            <h3>
              <WordReveal text="the journey of buying and selling premium homes" intersect={true} />
            </h3>
          </div>
          <div className="about-copy scroll-animate">
            <p>
              Avon Housing brings a private, advisory-led approach to real estate across Borivali,
              Kandivali, and Mumbai's western suburbs.
            </p>
            <p style={{ transitionDelay: '0.2s' }}>
              We combine local market relationships, verified property intelligence, and careful
              negotiation support so every client can move with clarity.
            </p>
          </div>
        </div>

        <div className="about-split">
          <div className="about-panel scroll-animate-left">
            <span className="about-panel-index">01</span>
            <h3>Our Mission</h3>
            <p>
              Simplify complex property decisions with transparent guidance, curated options, and
              dependable support from first search to final handover.
            </p>
          </div>
          <div className="about-panel scroll-animate-right">
            <span className="about-panel-index">02</span>
            <h3>Our Vision</h3>
            <p>
              Build the most trusted local destination for discerning buyers, sellers, and investors
              who value discretion and certainty.
            </p>
          </div>
        </div>

        <div className="about-feature-row">
          <div className="about-feature-media image-placeholder scale-reveal">
            <span>Process Image</span>
          </div>
          <div className="about-feature-copy scroll-animate">
            <span className="about-eyebrow">Our Approach</span>
            <h3>Reimagine today's property journey</h3>
            <p>
              We blend digital convenience with expert human judgement: shortlisting, site visits,
              pricing context, legal coordination, and closing support are handled as one thoughtful
              experience.
            </p>
          </div>
        </div>

        <div className="about-milestone scroll-animate">
          <h3>
            Redefining the local real estate landscape, one considered move at a time.
          </h3>
        </div>

        <div className="about-team">
          {leaders.map((leader, index) => (
            <article className="about-person scroll-animate" key={leader.name} style={{ transitionDelay: `${index * 0.15}s` }}>
              <div className="about-person-mark">Avon.</div>
              <div className="about-person-image image-placeholder scale-reveal" style={{ transitionDelay: `${index * 0.15 + 0.1}s` }}>
                <span>Portrait</span>
              </div>
              <h4>{leader.name}</h4>
              <p>{leader.role}</p>
            </article>
          ))}
        </div>

        <div className="about-culture scroll-animate">
          <div className="about-culture-heading">
            <h3>Our Work, Our Standard</h3>
            <p>A look into the client-first culture behind every transaction.</p>
          </div>
          <div className="about-gallery">
            <div className="about-gallery-large image-placeholder scale-reveal">
              <span>Office Image</span>
            </div>
            <div className="about-gallery-stack">
              <div className="image-placeholder scale-reveal" style={{ transitionDelay: '0.2s' }}>
                <span>Meeting Image</span>
              </div>
              <div className="image-placeholder scale-reveal" style={{ transitionDelay: '0.3s' }}>
                <span>Visit Image</span>
              </div>
            </div>
          </div>
        </div>

        <div className="about-cta scroll-animate">
          <div>
            <h3>Work with Avon Housing</h3>
            <p>Looking for a sharper, more personal real estate experience?</p>
          </div>
          <a href="/consultation" className="btn-primary">Book Consultation</a>
        </div>
      </div>
    </section>
  );
};

export default About;
