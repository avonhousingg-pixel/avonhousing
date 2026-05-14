import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { PropertyRecord } from '../lib/api';
import { isFavouriteProperty, toggleFavouriteProperty } from '../lib/favourites';
import { getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase';
import { getPropertyTypeLabel } from '../data/siteContent';

type PropertyCardProps = {
  property: PropertyRecord;
  className?: string;
  large?: boolean;
  variant?: 'featured' | 'collection' | 'list';
};

const formatPrice = (price: number) => `Rs. ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price)}`;

const PropertyCard: React.FC<PropertyCardProps> = ({ property, className = '', large = false, variant = 'collection' }) => {
  const [favourite, setFavourite] = useState(() => isFavouriteProperty(property._id));
  const [imageIndex, setImageIndex] = useState(0);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const href = `/properties/${property._id}`;
  const images = property.images?.length ? property.images : ['/mumbai-skyline.png'];
  const image = images[imageIndex] || images[0];
  const showCarousel = images.length > 1;
  const propertyTypeLabel = getPropertyTypeLabel(property.type);

  useEffect(() => {
    const handleChange = () => setFavourite(isFavouriteProperty(property._id));
    window.addEventListener('avon:favourites-changed', handleChange);
    return () => window.removeEventListener('avon:favourites-changed', handleChange);
  }, [property._id]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsLoggedIn(false);
      return;
    }

    return onAuthStateChanged(getFirebaseAuth(), nextUser => {
      setIsLoggedIn(Boolean(nextUser));
    });
  }, []);

  useEffect(() => {
    if (!showCarousel || !isPreviewing) {
      return;
    }

    const timer = window.setInterval(() => {
      setImageIndex(current => (current + 1) % images.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [images.length, isPreviewing, showCarousel]);

  const startPreview = () => {
    if (showCarousel) {
      setIsPreviewing(true);
    }
  };

  const stopPreview = () => {
    setIsPreviewing(false);
    setImageIndex(0);
  };

  const handleFavourite = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn) {
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }

    setFavourite(toggleFavouriteProperty(property));
  };

  const showPreviousImage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setImageIndex(current => (current - 1 + images.length) % images.length);
  };

  const showNextImage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setImageIndex(current => (current + 1) % images.length);
  };

  const carouselControls = showCarousel && isPreviewing ? (
    <>
      <button type="button" className="property-card-arrow previous" aria-label="Previous property image" onClick={showPreviousImage}>
        <span aria-hidden="true">&lt;</span>
      </button>
      <button type="button" className="property-card-arrow next" aria-label="Next property image" onClick={showNextImage}>
        <span aria-hidden="true">&gt;</span>
      </button>
      <div className="property-card-progress" key={imageIndex}>
        {images.map((item, index) => (
          <span key={`${item}-${index}`} className={index < imageIndex ? 'complete' : index === imageIndex ? 'active' : ''} />
        ))}
      </div>
    </>
  ) : null;

  if (variant === 'featured') {
    return (
      <a
        href={href}
        className={`property-card ${large ? 'card-large' : ''} ${className}`}
        onMouseEnter={startPreview}
        onMouseLeave={stopPreview}
        onFocus={startPreview}
        onBlur={stopPreview}
      >
        <img src={image} alt={property.title} className="card-img" loading="lazy" />
        {carouselControls}
        <button type="button" className={`favourite-button ${favourite ? 'active' : ''}`} onClick={handleFavourite} aria-label={favourite ? 'Remove from favourites' : 'Add to favourites'}>
          {favourite ? 'Saved' : 'Save'}
        </button>
        <div className="card-overlay">
          <span className="card-tag">{propertyTypeLabel}</span>
          <h3 className="card-title">{property.title}</h3>
          <div className="card-details">
            <span className="card-location">{property.location}</span>
            <span className="card-price">{formatPrice(property.price)}</span>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={href}
      className={`property-listing-card ${className}`}
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      onFocus={startPreview}
      onBlur={stopPreview}
    >
      <div className="property-listing-media">
        <img src={image} alt={property.title} loading="lazy" />
        {carouselControls}
      </div>
      <div className="property-listing-body">
        <span className="placeholder-kicker">{propertyTypeLabel} - {property.status}</span>
        <h3>{property.title}</h3>
        <p>{property.location}</p>
        <strong>{formatPrice(property.price)}</strong>
        <div className="property-card-actions">
          <span>{property.bhk || property.area || property.category}</span>
          <button type="button" className={`favourite-button inline ${favourite ? 'active' : ''}`} onClick={handleFavourite}>
            {favourite ? 'Saved' : 'Favourite'}
          </button>
        </div>
      </div>
    </a>
  );
};

export default PropertyCard;
