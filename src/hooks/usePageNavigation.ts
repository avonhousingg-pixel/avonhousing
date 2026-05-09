import { useCallback, useEffect, useRef, useState } from 'react';

const EXIT_DURATION = 320;
const ENTER_DELAY = 120;
const POP_EXIT_DURATION = 280;

const scrollToHash = (hash: string) => {
  if (!hash) return;

  document.querySelector(hash)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
};

export const usePageNavigation = () => {
  const [path, setPath] = useState('/');
  const [hash, setHash] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigateTo = useCallback(
    (nextHref: string) => {
      const nextUrl = new URL(nextHref, window.location.origin);
      const nextPath = nextUrl.pathname;
      const nextCleanHref = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
      const currentPath = window.location.pathname;
      const currentCleanHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      // Handle same page hash changes
      if (nextPath === currentPath) {
        if (nextUrl.hash) {
          scrollToHash(nextUrl.hash);
          setHash(nextUrl.hash);
          window.history.pushState({}, '', nextCleanHref);
        } else {
          window.scrollTo({ top: 0, behavior: nextCleanHref === currentCleanHref ? 'smooth' : 'auto' });
          setHash('');
          window.history.pushState({}, '', nextCleanHref);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
        return;
      }

      setIsTransitioning(true);

      window.setTimeout(() => {
        window.history.pushState({}, '', nextCleanHref);
        setPath(nextPath);
        setHash(nextUrl.hash);
        window.scrollTo({ top: 0, behavior: 'auto' });

        window.setTimeout(() => {
          setIsTransitioning(false);
          scrollToHash(nextUrl.hash);
        }, ENTER_DELAY);
      }, EXIT_DURATION);
    },
    []
  );

  const isInitialMount = useRef(true);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
      if (!link || link.target || link.hasAttribute('download')) return;

      const url = new URL(link.href, window.location.href);
      const isInternal = url.origin === window.location.origin;

      if (!isInternal) return;

      event.preventDefault();
      navigateTo(`${url.pathname}${url.search}${url.hash}`);
    };

    const handlePopState = () => {
      setIsTransitioning(true);

      window.setTimeout(() => {
        setPath(window.location.pathname);
        setHash(window.location.hash);
        window.scrollTo({ top: 0, behavior: 'auto' });
        window.setTimeout(() => setIsTransitioning(false), ENTER_DELAY);
      }, POP_EXIT_DURATION);
    };

    const handleHashChange = () => {
      setHash(window.location.hash);
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);

    // Force redirect to home ONLY on initial refresh/mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      if (window.location.hash) {
        window.history.replaceState({}, '', '/');
      }
      setPath(window.location.pathname);
      setHash(window.location.hash);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [navigateTo]);

  return {
    hash,
    isTransitioning,
    path,
  };
};
