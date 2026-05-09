import React from 'react';
import { HighlightReveal } from './HighlightReveal';

const Testimonial: React.FC = () => {
  return (
    <section className="testimonial" id="about">
      <div className="container">
        <div className="testimonial-grid">
          <div className="testimonial-content">
            <blockquote className="testimonial-quote">
              <span className="testimonial-quote-mark">"</span>
              <HighlightReveal text="Avon Housing completely redefined our expectation of a real estate transaction. Their approach isn't transactional; it's deeply relational. They found us a home that wasn't even on the market yet." delayStep={0.05} />
            </blockquote>
            <div className="testimonial-author">Dr. Meera Desai</div>
            <div className="testimonial-role">Acquired Penthouse in Borivali</div>
          </div>
          
          <div>
            <img 
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1000" 
              alt="Luxury Interior" 
              className="testimonial-img"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
