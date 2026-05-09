import type { PropertyRecord } from './api';

const storageKey = 'avon:favourite-properties';

export const getFavouriteIds = () => {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(storageKey) || '[]'));
  } catch {
    return new Set<string>();
  }
};

export const isFavouriteProperty = (id: string) => getFavouriteIds().has(id);

export const toggleFavouriteProperty = (property: Pick<PropertyRecord, '_id'>) => {
  const favourites = getFavouriteIds();

  if (favourites.has(property._id)) {
    favourites.delete(property._id);
  } else {
    favourites.add(property._id);
  }

  localStorage.setItem(storageKey, JSON.stringify([...favourites]));
  window.dispatchEvent(new CustomEvent('avon:favourites-changed'));
  return favourites.has(property._id);
};
