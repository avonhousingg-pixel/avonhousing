import type { PropertyRecord } from './api';

export type SavedSearch = {
  id: string;
  label: string;
  query: Record<string, string>;
  createdAt: string;
};

const searchStorageKey = 'avon:recent-searches';
const viewedStorageKey = 'avon:recently-viewed-properties';
const maxItems = 12;

const readJsonArray = <T>(key: string) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value as T[] : [];
  } catch {
    return [];
  }
};

export const getRecentSearches = () => readJsonArray<SavedSearch>(searchStorageKey);

export const saveRecentSearch = (label: string, query: Record<string, string>) => {
  const nextSearch: SavedSearch = {
    id: `${Date.now()}`,
    label,
    query,
    createdAt: new Date().toISOString(),
  };
  const existing = getRecentSearches().filter(search => JSON.stringify(search.query) !== JSON.stringify(query));
  localStorage.setItem(searchStorageKey, JSON.stringify([nextSearch, ...existing].slice(0, maxItems)));
  window.dispatchEvent(new CustomEvent('avon:searches-changed'));
};

export const getRecentlyViewedIds = () => readJsonArray<string>(viewedStorageKey);

export const trackRecentlyViewedProperty = (property: Pick<PropertyRecord, '_id'>) => {
  const nextIds = [property._id, ...getRecentlyViewedIds().filter(id => id !== property._id)].slice(0, maxItems);
  localStorage.setItem(viewedStorageKey, JSON.stringify(nextIds));
  window.dispatchEvent(new CustomEvent('avon:recently-viewed-changed'));
};
