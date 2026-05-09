import React from 'react';

const Marquee: React.FC = () => {
  const items = [
    "Luxury Penthouses",
    "Sea-facing Apartments",
    "Commercial Spaces",
    "Vasant Marvel Complex",
    "Premium Villas",
    "Bespoke Interiors",
    "High-yield Investments"
  ];

  return (
    <div className="marquee-wrapper">
      <div className="marquee-content">
        {items.map((item, i) => (
          <div key={i} className="marquee-item">{item}</div>
        ))}
      </div>
      {/* Duplicate for seamless loop */}
      <div className="marquee-content" aria-hidden="true">
        {items.map((item, i) => (
          <div key={`dup-${i}`} className="marquee-item">{item}</div>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
