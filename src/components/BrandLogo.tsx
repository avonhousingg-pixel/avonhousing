import React from 'react';

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

const BrandLogo: React.FC<BrandLogoProps> = ({ compact = false, className = '' }) => (
  <img
    className={`brand-logo-image${compact ? ' compact' : ''}${className ? ` ${className}` : ''}`}
    src="/avon-housing-logo.png"
    alt="Avon Housing"
  />
);

export default BrandLogo;
