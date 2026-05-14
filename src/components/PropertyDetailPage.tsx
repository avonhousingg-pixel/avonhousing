import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getProperty, trackPropertyView, type PropertyRecord } from '../lib/api';
import { isFavouriteProperty, toggleFavouriteProperty } from '../lib/favourites';
import { trackRecentlyViewedProperty } from '../lib/userActivity';
import { getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase';
import { amenityOptions, getPropertyTypeLabel, type AmenityOption } from '../data/siteContent';

const categoryLabels: Record<string, string> = {
  'assured-resale': 'Assured Resale',
  'under-construction': 'Under Construction',
  featured: 'Featured Collection',
};

const formatPrice = (price: number) => `Rs. ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price)}`;

const amenityIconByLabel = new Map(amenityOptions.map(amenity => [amenity.label, amenity.icon]));

type NearbyAmenityCategory = 'notables' | 'school' | 'hospital' | 'grocery' | 'travel' | 'lifestyle';

type NearbyAmenity = {
  name: string;
  distance: string;
  category: NearbyAmenityCategory;
};

const nearbyCategoryLabels: Record<NearbyAmenityCategory, string> = {
  notables: 'Notables',
  school: 'School',
  hospital: 'Hospital',
  grocery: 'Grocery',
  travel: 'Travel',
  lifestyle: 'Lifestyle',
};

const nearbyCategoryOrder = Object.keys(nearbyCategoryLabels) as NearbyAmenityCategory[];

const fallbackNearbyAmenities: NearbyAmenity[] = [
  { name: 'Western Express Highway', distance: '2.60 kms', category: 'travel' },
  { name: 'Metro Station', distance: '1.80 kms', category: 'travel' },
  { name: 'Local Market', distance: '0.90 kms', category: 'grocery' },
  { name: 'Neighbourhood Hospital', distance: '1.60 kms', category: 'hospital' },
  { name: 'International School', distance: '2.20 kms', category: 'school' },
  { name: 'Shopping Mall', distance: '2.80 kms', category: 'lifestyle' },
];

const nearbyAmenitiesByArea: Record<string, NearbyAmenity[]> = {
  andheri: [
    { name: 'Courtyard by Marriott Mumbai International Airport', distance: '0.30 kms', category: 'notables' },
    { name: 'Gundavali Metro Station', distance: '0.75 kms', category: 'travel' },
    { name: 'Western Express Highway Metro Station', distance: '1.20 kms', category: 'travel' },
    { name: 'Solitaire Corporate Park', distance: '0.85 kms', category: 'notables' },
    { name: 'Holy Family High School and Junior College', distance: '2.90 kms', category: 'school' },
    { name: 'SevenHills Hospital', distance: '3.20 kms', category: 'hospital' },
    { name: 'D Mart, Andheri East', distance: '2.10 kms', category: 'grocery' },
    { name: 'Phoenix Marketcity Kurla', distance: '4.90 kms', category: 'lifestyle' },
    { name: 'Mumbai Airport Terminal 2', distance: '3.70 kms', category: 'travel' },
  ],
  goregaon: [
    { name: 'Oberoi Mall', distance: '1.80 kms', category: 'lifestyle' },
    { name: 'Oberoi International School', distance: '2.20 kms', category: 'school' },
    { name: 'Goregaon Railway Station', distance: '2.40 kms', category: 'travel' },
    { name: 'Lifeline Medicare Hospital', distance: '2.10 kms', category: 'hospital' },
    { name: "Nature's Basket Goregaon", distance: '2.70 kms', category: 'grocery' },
    { name: 'NESCO IT Park', distance: '3.10 kms', category: 'notables' },
  ],
  malad: [
    { name: 'Inorbit Mall Malad', distance: '2.20 kms', category: 'lifestyle' },
    { name: 'Infinity Mall Malad', distance: '2.60 kms', category: 'lifestyle' },
    { name: 'Malad Railway Station', distance: '1.80 kms', category: 'travel' },
    { name: 'Lifeline Hospital Malad', distance: '1.70 kms', category: 'hospital' },
    { name: 'Ryan International School', distance: '2.40 kms', category: 'school' },
    { name: 'D Mart Malad West', distance: '2.00 kms', category: 'grocery' },
  ],
  kandivali: [
    { name: 'Growel 101 Mall', distance: '2.50 kms', category: 'lifestyle' },
    { name: 'Kandivali Railway Station', distance: '1.70 kms', category: 'travel' },
    { name: 'Thakur Public School', distance: '2.10 kms', category: 'school' },
    { name: 'Apex Hospital', distance: '1.90 kms', category: 'hospital' },
    { name: 'D Mart Kandivali', distance: '1.80 kms', category: 'grocery' },
    { name: 'Thakur Village', distance: '2.30 kms', category: 'notables' },
  ],
  borivali: [
    { name: 'Borivali Railway Station', distance: '1.90 kms', category: 'travel' },
    { name: 'Metro Cash and Carry', distance: '2.30 kms', category: 'grocery' },
    { name: 'Apex Superspeciality Hospital', distance: '2.00 kms', category: 'hospital' },
    { name: 'St. Francis D Assisi High School', distance: '2.40 kms', category: 'school' },
    { name: 'Sanjay Gandhi National Park', distance: '3.40 kms', category: 'lifestyle' },
    { name: 'Magathane Metro Station', distance: '1.60 kms', category: 'travel' },
  ],
};

const getNearbyAmenities = (property: PropertyRecord) => {
  const location = property.location.toLowerCase();
  const matchedArea = Object.keys(nearbyAmenitiesByArea).find(area => location.includes(area));

  return matchedArea ? nearbyAmenitiesByArea[matchedArea] : fallbackNearbyAmenities;
};

const getVideoThumbnail = (url: string) => {
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);

  if (youtubeMatch?.[1]) {
    return `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`;
  }

  return '';
};

const AmenityIcon = ({ type }: { type?: AmenityOption['icon'] }) => {
  if (type === 'clubhouse') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M9 22l15-10 15 10v16H9V22z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M15 38v-9h18v9M20 38v-9M28 38v-9M14 22h20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'gym') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M7 20h6v8H7zM35 20h6v8h-6zM17 16h5v16h-5zM26 16h5v16h-5zM13 24h22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'pool-table') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="14" fill="none" stroke="currentColor" strokeWidth="2.3" />
        <text x="24" y="29" textAnchor="middle" fontSize="15" fontWeight="600" fill="currentColor">8</text>
      </svg>
    );
  }

  if (type === 'play-area') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 24c-5.5-3-7.5-8.8-4.6-12.2C24.8 12.2 27 17.7 24 24zM24 24c3-5.5 8.8-7.5 12.2-4.6C35.8 24.8 30.3 27 24 24zM24 24c5.5 3 7.5 8.8 4.6 12.2C23.2 35.8 21 30.3 24 24zM24 24c-3 5.5-8.8 7.5-12.2 4.6C12.2 23.2 17.7 21 24 24z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="24" cy="24" r="2" fill="currentColor" />
      </svg>
    );
  }

  if (type === 'parking') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M17 38V10h10c6 0 9.5 3.4 9.5 8.5S33 27 27 27h-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'security') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 7l14 6v9c0 8.8-5.8 15.4-14 19-8.2-3.6-14-10.2-14-19v-9l14-6z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M18 24l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'garden') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 38V22M24 23c-8-1-12-6-12-13 8 1 12 6 12 13zM25 27c8 0 12-5 12-12-8 0-12 5-12 12z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'lift') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M13 8h22v32H13zM21 17l3-4 3 4M21 31l3 4 3-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'power') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M27 5L13 27h10l-2 16 14-22H25l2-16z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'pool') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M10 30c3 0 3-2 6-2s3 2 6 2 3-2 6-2 3 2 6 2 3-2 6-2M10 37c3 0 3-2 6-2s3 2 6 2 3-2 6-2 3 2 6 2 3-2 6-2M20 25V10h12v15M20 17h12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 6l5.4 11 12.1 1.8-8.8 8.5 2.1 12-10.8-5.7-10.8 5.7 2.1-12-8.8-8.5L18.6 17 24 6z" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" />
    </svg>
  );
};

const NearbyAmenityIcon = ({ category }: { category: NearbyAmenityCategory }) => {
  if (category === 'school') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M5 12l11-5 11 5-11 5-11-5zM10 15v5c2.8 2.2 9.2 2.2 12 0v-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }

  if (category === 'hospital') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M8 8h16v16H8zM16 11v10M11 16h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (category === 'grocery') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M8 12h16l-2 12H10L8 12zM11 12l2-5M21 12l-2-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (category === 'travel') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M8 23h16M10 9h12c2 0 3 1 3 3v7H7v-7c0-2 1-3 3-3zM11 23l-2 3M21 23l2 3M11 14h10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (category === 'lifestyle') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M10 10h12l2 14H8l2-14zM12 10a4 4 0 0 1 8 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 5l2.7 6 6.5.7-4.8 4.4 1.3 6.4L16 19.2l-5.7 3.3 1.3-6.4-4.8-4.4 6.5-.7L16 5z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
};

const NearbyAmenitiesPanel = ({ amenities }: { amenities: NearbyAmenity[] }) => {
  const [activeCategory, setActiveCategory] = useState<NearbyAmenityCategory>('notables');
  const availableCategories = nearbyCategoryOrder.filter(category => amenities.some(amenity => amenity.category === category));
  const selectedCategory = availableCategories.includes(activeCategory) ? activeCategory : availableCategories[0];
  const visibleAmenities = amenities.filter(amenity => amenity.category === selectedCategory);

  if (!visibleAmenities.length) return null;

  return (
    <div className="nearby-amenities-panel">
      <div className="nearby-amenity-tabs" aria-label="Nearby amenity categories">
        {availableCategories.map(category => (
          <button
            key={category}
            type="button"
            className={category === selectedCategory ? 'active' : ''}
            onClick={() => setActiveCategory(category)}
          >
            <span className="nearby-tab-icon"><NearbyAmenityIcon category={category} /></span>
            {nearbyCategoryLabels[category]}
          </button>
        ))}
      </div>
      <div className="nearby-amenity-list">
        {visibleAmenities.map(amenity => (
          <div className="nearby-amenity-row" key={`${amenity.category}-${amenity.name}`}>
            <span className="nearby-amenity-icon"><NearbyAmenityIcon category={amenity.category} /></span>
            <span className="nearby-amenity-name">{amenity.name}</span>
            <span className="nearby-amenity-distance">{amenity.distance}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const hasInsightDetails = (property: PropertyRecord) => {
  const details = property.insightDetails;
  if (!details) return false;

  return Boolean(
    details.floorPlanImage ||
    details.floorPlanSummary ||
    details.facing ||
    details.vastuImage ||
    details.naturalLight ||
    details.naturalLightNote ||
    details.ventilation ||
    details.ventilationNote ||
    details.bestSeason ||
    details.agreementValue ||
    details.pricePerSqft ||
    details.includes?.length ||
    details.expenses?.length,
  );
};

const PropertyInsightSections = ({ property, isUserLoggedIn }: { property: PropertyRecord; isUserLoggedIn: boolean }) => {
  const details = property.insightDetails;
  const [vastuAccessMessage, setVastuAccessMessage] = useState('');
  if (!details || !hasInsightDetails(property)) return null;

  const handleVastuClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isUserLoggedIn) {
      setVastuAccessMessage('');
      return;
    }

    event.preventDefault();
    setVastuAccessMessage('Only logged in users can view it.');
  };

  return (
    <section className="property-info-panel property-wide-panel property-insights-panel">
      {(details.floorPlanImage || details.floorPlanSummary || details.facing) && (
        <div className="property-insight-section" id="floor-plan">
          <h2>Floor Plan and Area</h2>
          {details.floorPlanImage && <img className="property-floor-plan-image" src={details.floorPlanImage} alt={`${property.title} floor plan`} />}
          {(details.floorPlanSummary || details.facing) && (
            <div className="property-floor-plan-copy">
              {details.floorPlanSummary && <p>{details.floorPlanSummary}</p>}
              {details.facing && <span>{details.facing}</span>}
            </div>
          )}
        </div>
      )}

      {details.vastuImage && (
        <div className="property-insight-section" id="vastu-chart">
          <h2>Vastu Chart</h2>
          <a className="property-vastu-card" href={details.vastuImage} target="_blank" rel="noreferrer" onClick={handleVastuClick}>
            <img src={details.vastuImage} alt={`${property.title} Vastu grid`} />
            <span className="property-vastu-overlay">
              <span className="property-vastu-mark" aria-hidden="true">View</span>
              <strong>View Vastu Grid</strong>
            </span>
          </a>
          {vastuAccessMessage && <p className="property-access-message" role="alert">{vastuAccessMessage}</p>}
        </div>
      )}

      {(details.naturalLight || details.naturalLightNote || details.ventilation || details.ventilationNote || details.bestSeason) && (
        <div className="property-insight-section" id="sunlight-ventilation">
          <h2>Sunlight and Ventilation</h2>
          <div className="property-climate-grid">
            <article className="property-light-card">
              <span>Natural Light</span>
              <strong>{details.naturalLight || 'Not specified'}</strong>
              <p>{details.naturalLightNote || 'Light details will be updated soon.'}</p>
            </article>
            <article className="property-ventilation-card">
              <span>Ventilation</span>
              <strong>{details.ventilation || 'Not specified'}</strong>
              {details.bestSeason && <small>Best season: {details.bestSeason}</small>}
              <p>{details.ventilationNote || 'Ventilation details will be updated soon.'}</p>
            </article>
          </div>
        </div>
      )}

      {(details.agreementValue || details.pricePerSqft || details.includes?.length || details.expenses?.length) && (
        <div className="property-insight-section" id="price-breakdown">
          <h2>Price Breakdown</h2>
          <div className="property-price-summary">
            <div>
              <span>Agreement Value</span>
              <strong>{details.agreementValue || formatPrice(property.price)}</strong>
            </div>
            <div>
              <span>Per Sq Ft (Usable Area)</span>
              <strong>{details.pricePerSqft || 'On request'}</strong>
            </div>
          </div>
          <div className="property-price-detail-grid">
            {details.includes?.length ? (
              <div>
                <h3>Includes</h3>
                {details.includes.map(item => <p key={item}><span aria-hidden="true" />{item}</p>)}
              </div>
            ) : null}
            {details.expenses?.length ? (
              <div>
                <h3>Other Expenses</h3>
                {details.expenses.map(item => (
                  <p key={`${item.label}-${item.value}`}><strong>{item.label}</strong><span>{item.value}</span></p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
};

const PropertyDetailPage: React.FC = () => {
  const [property, setProperty] = useState<PropertyRecord | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [favourite, setFavourite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    const id = window.location.pathname.split('/').filter(Boolean).pop() || '';

    window.scrollTo(0, 0);

    getProperty(id)
      .then(nextProperty => {
        setProperty(nextProperty);
        setActiveImageIndex(0);
        setFavourite(isFavouriteProperty(nextProperty._id));
        trackRecentlyViewedProperty(nextProperty);
        void trackPropertyView(nextProperty._id);
      })
      .catch(error => setError(error instanceof Error ? error.message : 'Unable to load this property.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsUserLoggedIn(false);
      return;
    }

    return onAuthStateChanged(getFirebaseAuth(), nextUser => {
      setIsUserLoggedIn(Boolean(nextUser));
    });
  }, []);

  if (loading) {
    return <section className="property-detail-page"><div className="container">Loading property...</div></section>;
  }

  if (error || !property) {
    return (
      <section className="property-detail-page">
        <div className="container property-empty-state">
          <h1>Property not found</h1>
          <p>{error || 'This property is unavailable.'}</p>
          <a href="/properties" className="btn-primary">View Properties</a>
        </div>
      </section>
    );
  }

  const inquiryHref = `/consultation?propertyId=${encodeURIComponent(property._id)}&property=${encodeURIComponent(property.title)}&location=${encodeURIComponent(property.location)}&type=${encodeURIComponent(getPropertyTypeLabel(property.type))}&bhk=${encodeURIComponent(property.bhk || '')}`;
  const mapsEmbedHref = property.mapLocation?.lat && property.mapLocation?.lng
    ? `https://www.google.com/maps?q=${property.mapLocation.lat},${property.mapLocation.lng}&output=embed`
    : '';
  const galleryImages = property.images?.length ? property.images : ['/mumbai-skyline.png'];
  const activeImage = galleryImages[activeImageIndex] || galleryImages[0];
  const videoThumbnail = property.videoUrl ? getVideoThumbnail(property.videoUrl) : '';
  const showGalleryControls = galleryImages.length > 1;
  const nearbyAmenities = getNearbyAmenities(property);
  const showPreviousImage = () => setActiveImageIndex(current => (current - 1 + galleryImages.length) % galleryImages.length);
  const showNextImage = () => setActiveImageIndex(current => (current + 1) % galleryImages.length);

  return (
    <section className="property-detail-page">
      <div className="container">
        <a href="/properties" className="property-back-link">Back to Properties</a>

        <div className="property-detail-hero">
          <div>
            <span className="about-eyebrow">{categoryLabels[property.category] || property.category}</span>
            <h1>{property.title}</h1>
            <p>{property.location}</p>
          </div>
          <div className="property-detail-price">
            <span>{property.status}</span>
            <strong>{formatPrice(property.price)}</strong>
          </div>
        </div>

        <div className="property-detail-layout">
          <div className="property-gallery">
            <div className="property-gallery-stage">
              <img src={activeImage} alt={property.title} className="property-main-image" />
              {showGalleryControls && (
                  <>
                  <button type="button" className="property-gallery-arrow previous" aria-label="Previous property image" onClick={showPreviousImage}>
                    <span aria-hidden="true">&lt;</span>
                  </button>
                  <button type="button" className="property-gallery-arrow next" aria-label="Next property image" onClick={showNextImage}>
                    <span aria-hidden="true">&gt;</span>
                  </button>
                </>
              )}
            </div>
            {showGalleryControls && (
              <div className="property-thumbnails">
                {galleryImages.map((image, index) => (
                  <button key={image} type="button" className={activeImageIndex === index ? 'active' : ''} onClick={() => setActiveImageIndex(index)}>
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            )}
            {property.videoUrl && (
              <div className={`property-video-preview ${videoThumbnail ? '' : 'no-thumbnail'}`}>
                {videoThumbnail && <img src={videoThumbnail} alt={`${property.title} video preview`} />}
                <a href={property.videoUrl} target="_blank" rel="noreferrer" className="btn-primary property-video-button">View Property Video</a>
              </div>
            )}
          </div>

          <aside className="property-action-panel">
            <button
              type="button"
              className={`btn-primary property-wide-action ${favourite ? 'saved' : ''}`}
              onClick={() => {
                if (!isUserLoggedIn) {
                  window.history.pushState({}, '', '/login');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                  return;
                }
                setFavourite(toggleFavouriteProperty(property));
              }}
            >
              {favourite ? 'Remove from Favourites' : 'Add to Favourites'}
            </button>
            <a href={inquiryHref} className="btn-primary property-wide-action">Inquiry Request</a>
          </aside>
        </div>

        <div className="property-detail-grid">
          <section className="property-info-panel">
            <h2>Property Details</h2>
            <dl className="property-detail-list">
              <div><dt>Type</dt><dd>{getPropertyTypeLabel(property.type)}</dd></div>
              <div><dt>BHK / Rooms</dt><dd>{property.bhk || 'Not specified'}</dd></div>
              <div><dt>Area</dt><dd>{property.area || 'Not specified'}</dd></div>
              <div><dt>Status</dt><dd>{property.status}</dd></div>
              <div><dt>Category</dt><dd>{categoryLabels[property.category] || property.category}</dd></div>
              <div><dt>Featured</dt><dd>{property.featured ? 'Yes' : 'No'}</dd></div>
            </dl>
          </section>

          <section className="property-info-panel">
            <h2>Description</h2>
            <p>{property.description || 'No description has been added yet.'}</p>
          </section>

          {property.amenities?.length > 0 && (
            <section className="property-info-panel property-wide-panel property-amenities-panel">
              <h2>Amenities</h2>
              <div className="property-amenities">
                {property.amenities.map(amenity => (
                  <div className="property-amenity-item" key={amenity}>
                    <span className="property-amenity-icon">
                      <AmenityIcon type={amenityIconByLabel.get(amenity)} />
                    </span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <PropertyInsightSections property={property} isUserLoggedIn={isUserLoggedIn} />

          {mapsEmbedHref && (
            <section className="property-info-panel property-wide-panel property-location-panel">
              <h2>Location</h2>
              <div className="property-location-layout">
                {mapsEmbedHref && (
                  <iframe
                    title={`${property.title} map location`}
                    src={mapsEmbedHref}
                    className="property-map-frame"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                )}
              </div>
              <NearbyAmenitiesPanel amenities={nearbyAmenities} />
            </section>
          )}
        </div>
      </div>
    </section>
  );
};

export default PropertyDetailPage;
