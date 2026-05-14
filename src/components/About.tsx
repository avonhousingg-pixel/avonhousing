import React from 'react';
import { WordReveal } from './WordReveal';

const leaders = [
  {
    name: 'Shubh Singh',
    role: 'Relationship Manager',
    image: '/team/shubh-singh.jpg',
    description: 'Guides clients through requirements, shortlisting, site visits, and follow-ups with a calm, relationship-first approach.',
  },
  {
    name: 'Nunnu Jha',
    role: 'Residential Resale Expert',
    image: '/team/nunnu-jha.jpg',
    description: 'Specializes in resale homes, local pricing context, buyer-seller coordination, and practical transaction guidance.',
  },
  {
    name: 'Ankit Singh',
    role: 'Rental Advisory Specialist',
    image: '/team/ankit-singh.jpg',
    description: 'Helps owners and tenants match the right rental requirements with verified options and smooth visit coordination.',
  },
  {
    name: 'Shubham Singh',
    role: 'Rental Portfolio Manager',
    image: '/team/shubham-singh.jpg',
    description: 'Manages rental inventory, owner relationships, tenant follow-ups, and portfolio availability across key local markets.',
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
              <WordReveal text="Mumbai's trusted real estate partner since 1998." intersect={true} />
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
              Avon Housing was founded and built in 1998 as a trusted real estate firm in Mumbai.
              Our main motto has always been to help people buy their ideal home without hassle or risk.
            </p>
            <p style={{ transitionDelay: '0.2s' }}>
              Our mission is simple: to make property affordable, transactions smooth, secure, and
              valuable for every client.
            </p>
            <p style={{ transitionDelay: '0.3s' }}>
              Whether you are searching for your dream home, a profitable investment, or the right
              rental, Avon Housing ensures personalized guidance at every step.
            </p>
            <p style={{ transitionDelay: '0.4s' }}>
              Built on the pillars of trust, professionalism, and long-term relationships, we have
              successfully assisted countless families, investors, and businesses in finding
              properties that truly match their goals.
            </p>
          </div>
        </div>

        <div className="about-split">
          <div className="about-panel scroll-animate-left">
            <span className="about-panel-index">01</span>
            <h3>Our Mission</h3>
            <p>
              Make property affordable, transactions smooth, secure, and valuable while giving every
              client clear, personalized guidance from search to final handover.
            </p>
          </div>
          <div className="about-panel scroll-animate-right">
            <span className="about-panel-index">02</span>
            <h3>Our Vision</h3>
            <p>
              Continue growing as Mumbai's most dependable real estate partner for families,
              investors, businesses, buyers, sellers, and renters.
            </p>
          </div>
        </div>

        <div className="about-feature-row">
          <div className="about-feature-media image-placeholder scale-reveal">
            <span>Process Image</span>
          </div>
          <div className="about-feature-copy scroll-animate">
            <span className="about-eyebrow">Our Approach</span>
            <h3>Personalized guidance at every step</h3>
            <p>
              We combine local market relationships, verified property intelligence, careful
              shortlisting, site visits, pricing context, documentation support, and negotiation
              guidance into one thoughtful experience.
            </p>
          </div>
        </div>

        <div className="about-milestone scroll-animate">
          <h3>
            Built on trust, professionalism, and long-term relationships since 1998.
          </h3>
        </div>

        <div className="about-team">
          {leaders.map((leader, index) => (
            <article className="about-person scroll-animate" key={leader.name} style={{ transitionDelay: `${index * 0.15}s` }}>
              <div className="about-person-mark">Avon.</div>
              <div className="about-person-image scale-reveal" style={{ transitionDelay: `${index * 0.15 + 0.1}s` }}>
                <img src={leader.image} alt={`${leader.name}, ${leader.role}`} />
              </div>
              <h4>{leader.name}</h4>
              <p className="about-person-role">{leader.role}</p>
              <p className="about-person-description">{leader.description}</p>
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



