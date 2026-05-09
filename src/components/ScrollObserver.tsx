import React, { useEffect } from 'react';

const ScrollObserver: React.FC = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    // Add scroll-animate class to sections and cards that need it
    const elementsToObserve = document.querySelectorAll(
      'section:not(.hero), .property-card, .service-card, .placeholder-card, .search-container, .testimonial-quote, .scroll-animate, .scroll-animate-left, .scroll-animate-right, .scale-reveal'
    );
    
    elementsToObserve.forEach((el) => {
      el.classList.add('scroll-animate');
      // Set transition delay for stagger in grid/lists if it's a child
      if (el.classList.contains('property-card') || el.classList.contains('service-card') || el.classList.contains('placeholder-card')) {
        const index = Array.from(el.parentElement?.children || []).indexOf(el);
        if (index > -1) {
          (el as HTMLElement).style.transitionDelay = `${index * 0.15}s`;
        }
      }
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return null;
};

export default ScrollObserver;
