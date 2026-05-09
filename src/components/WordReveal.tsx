import React, { useEffect, useRef, useState } from 'react';

interface Props {
  text: string;
  className?: string;
  delayBase?: number;
  delayStep?: number;
  intersect?: boolean;
  active?: boolean;
}

export const WordReveal: React.FC<Props> = ({ 
  text, 
  className = '', 
  delayBase = 0,
  delayStep = 0.1,
  intersect = true,
  active = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!intersect) {
      if (!active) return;
      // Small timeout to allow initial render at false, then trigger transition
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [active, intersect]);

  return (
    <span ref={ref} className={`${className} ${isVisible ? 'revealed' : ''}`}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="word-wrap" style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingRight: '0.25em' }}>
          <span className="word-inner" style={{ 
            display: 'inline-block', 
            transform: isVisible ? 'translateY(0)' : 'translateY(110%)',
            transition: `transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delayBase + i * delayStep}s`
          }}>
            {word}
          </span>
        </span>
      ))}
    </span>
  );
};
