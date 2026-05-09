import React from 'react';
import { WordReveal } from './WordReveal';
import { Counter } from './Counter';

interface Props {
  isLoaded: boolean;
}

const Hero: React.FC<Props> = ({ isLoaded }) => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title animate-on-load" style={{ animationDelay: '0.18s' }}>
          <WordReveal text="Curating Western Mumbai's" delayBase={0.16} delayStep={0.1} intersect={false} active={isLoaded} /> <span className="italic text-accent"><WordReveal text="Exclusive" delayBase={0.46} delayStep={0.1} intersect={false} active={isLoaded} /></span> <WordReveal text="Real Estate." delayBase={0.58} delayStep={0.1} intersect={false} active={isLoaded} />
        </h1>
        <p className="hero-subtitle animate-on-load" style={{ animationDelay: '0.38s' }}>
          Avon Housing provides a refined, discreet approach to acquiring and selling premium properties across Bandra, Andheri, Borivali, Kandivali, and the Western Suburbs.
        </p>

        <div className="animate-on-load" style={{ animationDelay: '0.54s' }}>
          <a href="#properties" className="btn-primary">
            Explore Collection
          </a>
        </div>

        <div className="hero-stats animate-on-load" style={{ animationDelay: '0.7s' }}>
          <div className="stat-item">
            <Counter end={50} prefix="₹" suffix={<span className="stat-suffix">Cr+</span>} delay={700} active={isLoaded} />
            <span className="stat-label">Sales Volume</span>
          </div>
          <div className="stat-item">
            <Counter end={10} suffix={<span className="stat-suffix">&nbsp;yrs</span>} delay={700} active={isLoaded} />
            <span className="stat-label">Local Expertise</span>
          </div>
          <div className="stat-item">
            <Counter end={500} suffix={<span className="stat-suffix">+</span>} delay={700} active={isLoaded} />
            <span className="stat-label">Select Clients</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <img
          src="/mumbai-skyline.png"
          alt="Luxury property"
          className="hero-img"
        />
        <div className="hero-badge animate-badge">
          <span className="badge-label">Featured Property</span>
          <span className="badge-price">₹12.5 Cr</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
