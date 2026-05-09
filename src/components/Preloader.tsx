import React, { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

const Preloader: React.FC<Props> = ({ onComplete }) => {
  const [stage, setStage] = useState(0); 

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStage(1);
    }, 1700);
    const timer2 = setTimeout(() => {
      setStage(2);
      onComplete();
    }, 2550);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  if (stage === 2) return null;

  return (
    <div className={`preloader-wrapper ${stage === 1 ? 'split' : ''}`}>
      <div className="preloader-half preloader-top" />
      <div className="preloader-half preloader-bottom" />
      <div className="preloader-content">
        <div className="preloader-logo">
          {['A', 'v', 'o', 'n', '.'].map((letter, i) => (
            <span key={i} className="preloader-letter-wrap">
              <span className="preloader-letter" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                {letter}
              </span>
            </span>
          ))}
        </div>
        <div className="preloader-track" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
};

export default Preloader;
