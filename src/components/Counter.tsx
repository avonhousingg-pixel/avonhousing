import React, { useEffect, useRef, useState } from 'react';

interface Props {
  end: number;
  prefix?: string;
  suffix?: React.ReactNode;
  padZero?: boolean;
  delay?: number;
  active?: boolean;
}

const easeOutExpo = (x: number): number => {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
};

export const Counter: React.FC<Props> = ({ end, prefix = '', suffix = '', padZero = false, delay = 0, active = true }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsIntersecting(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isIntersecting && active) {
      const duration = 2000;
      const timeoutId = setTimeout(() => {
        const startTime = performance.now();
        const update = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const current = Math.floor(easeOutExpo(progress) * end);
          setCount(current);
          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            setCount(end);
          }
        };
        requestAnimationFrame(update);
      }, delay);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isIntersecting, active, delay, end]);

  return (
    <span ref={ref} className="stat-num">
      {prefix}{padZero ? count.toString().padStart(2, '0') : count}{suffix}
    </span>
  );
};
