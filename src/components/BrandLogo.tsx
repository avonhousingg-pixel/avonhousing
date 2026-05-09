import React from 'react';

type BrandLogoProps = {
  compact?: boolean;
};

const BrandLogo: React.FC<BrandLogoProps> = ({ compact = false }) => (
  <img
    className={`brand-logo-image${compact ? ' compact' : ''}`}
    src="/avon-housing-logo.png"
    alt="Avon Housing"
  />
);

export default BrandLogo;
