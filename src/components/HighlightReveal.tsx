import React, { useEffect, useRef, useState } from 'react';

interface Props {
  text: string;
  className?: string;
  delayStep?: number;
}

export const HighlightReveal: React.FC<Props> = ({ 
  text, 
  className = '', 
  delayStep = 0.1
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={className}>
      {text.split(' ').map((word, i) => (
        <span key={i} className={`testimonial-word ${isVisible ? 'revealed' : ''}`} style={{ transitionDelay: `${i * delayStep}s`, paddingRight: '0.25em', display: 'inline-block' }}>
          {word}
        </span>
      ))}
    </span>
  );
};
