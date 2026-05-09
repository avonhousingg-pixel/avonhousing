import React, { useEffect, useMemo, useState } from 'react';
import { getProperties, type PropertyRecord } from '../lib/api';
import { getFavouriteIds } from '../lib/favourites';
import { getRecentSearches, getRecentlyViewedIds } from '../lib/userActivity';
import PropertyCard from './PropertyCard';
import { WordReveal } from './WordReveal';

type UserPageKind = 'properties' | 'searches' | 'liked' | 'favourited';

type UserPropertyPageProps = {
  kind: UserPageKind;
};

const pageCopy: Record<UserPageKind, { eyebrow: string; title: string; empty: string }> = {
  properties: {
    eyebrow: 'Member Profile',
    title: 'My Properties',
    empty: 'Save homes or view property details to build your personal property hub.',
  },
  searches: {
    eyebrow: 'Member Profile',
    title: 'My Searches',
    empty: 'Your recent searches will appear here after you use the property search.',
  },
  liked: {
    eyebrow: 'Member Profile',
    title: 'Liked',
    empty: 'Open property details to build a list of homes you recently liked exploring.',
  },
  favourited: {
    eyebrow: 'Member Profile',
    title: 'Favourited',
    empty: 'Tap Favourite or Save on any property to create your shortlist.',
  },
};

const toSearchHref = (query: Record<string, string>) => {
  const params = new URLSearchParams(query);
  return `/properties${params.size ? `?${params.toString()}` : ''}`;
};

const orderByIds = (properties: PropertyRecord[], ids: string[]) => {
  const indexById = new Map(ids.map((id, index) => [id, index]));
  return properties
    .filter(property => indexById.has(property._id))
    .sort((a, b) => (indexById.get(a._id) || 0) - (indexById.get(b._id) || 0));
};

const UserPropertyPage: React.FC<UserPropertyPageProps> = ({ kind }) => {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [loading, setLoading] = useState(kind !== 'searches');
  const [refreshKey, setRefreshKey] = useState(0);
  const copy = pageCopy[kind];
  const searches = useMemo(() => getRecentSearches(), [refreshKey]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [kind]);

  useEffect(() => {
    const refresh = () => setRefreshKey(key => key + 1);
    window.addEventListener('avon:favourites-changed', refresh);
    window.addEventListener('avon:searches-changed', refresh);
    window.addEventListener('avon:recently-viewed-changed', refresh);

    return () => {
      window.removeEventListener('avon:favourites-changed', refresh);
      window.removeEventListener('avon:searches-changed', refresh);
      window.removeEventListener('avon:recently-viewed-changed', refresh);
    };
  }, []);

  useEffect(() => {
    if (kind === 'searches') {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getProperties({ status: 'active' })
      .then(nextProperties => {
        if (!cancelled) {
          setProperties(nextProperties);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProperties([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [kind, refreshKey]);

  const visibleProperties = useMemo(() => {
    if (kind === 'properties') {
      const ids = Array.from(new Set([...getFavouriteIds(), ...getRecentlyViewedIds()]));
      return orderByIds(properties, ids);
    }

    if (kind === 'liked') {
      return orderByIds(properties, getRecentlyViewedIds());
    }

    if (kind === 'favourited') {
      return orderByIds(properties, [...getFavouriteIds()]);
    }

    return [];
  }, [kind, properties, refreshKey]);

  return (
    <section className="user-property-page">
      <div className="container">
        <div className="all-properties-hero user-property-hero">
          <span className="about-eyebrow">{copy.eyebrow}</span>
          <h1>
            <WordReveal text={copy.title} intersect={false} />
          </h1>
        </div>

        {kind === 'searches' ? (
          searches.length > 0 ? (
            <div className="user-search-list" aria-label="Recent searches">
              {searches.map(search => (
                <a key={search.id} href={toSearchHref(search.query)} className="user-search-item">
                  <span>{new Date(search.createdAt).toLocaleDateString('en-IN')}</span>
                  <strong>{search.label}</strong>
                  <small>View matching properties</small>
                </a>
              ))}
            </div>
          ) : (
            <div className="property-empty-state user-empty-state">
              <p>{copy.empty}</p>
              <a href="/#properties" className="btn-primary">Start Searching</a>
            </div>
          )
        ) : loading ? (
          <p className="property-empty-state">Loading your properties...</p>
        ) : visibleProperties.length > 0 ? (
          <div className="all-properties-grid" aria-label={copy.title}>
            {visibleProperties.map(property => (
              <PropertyCard key={property._id} property={property} variant="list" />
            ))}
          </div>
        ) : (
          <div className="property-empty-state user-empty-state">
            <p>{copy.empty}</p>
            <a href="/properties" className="btn-primary">Browse Properties</a>
          </div>
        )}
      </div>
    </section>
  );
};

export default UserPropertyPage;
