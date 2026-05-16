import React, { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { getUserAccess } from '../lib/api';
import BrandLogo from './BrandLogo';
import { getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase';

interface Props {
  currentPath: string;
  currentHash: string;
}

type NavigationRole = 'guest' | 'user' | 'admin';

type ProfileMenuItem = {
  label: string;
  href: string;
  icon: 'admin' | 'properties' | 'searches' | 'liked' | 'favourited' | 'logout';
  description?: string;
  emphasis?: 'default' | 'accent';
};

const propertyMenuItems = [
  { label: 'Rental Properties', href: '/properties?type=Residential+Rent' },
  { label: 'Resale', href: '/properties?type=Residential+Purchase' },
  { label: 'Under Construction', href: '/properties?type=Under+Construction' },
];

const ProfileMenuIcon = ({ type }: { type: 'admin' | 'properties' | 'searches' | 'liked' | 'favourited' | 'logout' }) => {
  if (type === 'admin') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l7 4v5c0 4.4-2.8 8.4-7 9-4.2-.6-7-4.6-7-9V7l7-4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9.5 12l1.7 1.7 3.3-3.7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'properties') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10.5L12 4l8 6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 9.5V20h11V9.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M10 20v-5h4v5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'searches') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M15 15l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'liked') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20.5l-1.1-1C6.2 15.2 3 12.3 3 8.8 3 6.3 5 4.5 7.5 4.5c1.5 0 2.9.7 3.8 1.9.9-1.2 2.3-1.9 3.8-1.9C17.9 4.5 20 6.3 20 8.8c0 3.5-3.2 6.4-7.9 10.7l-1.1 1z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'favourited') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.8l2.5 5.1 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3.8z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 7H5.5A1.5 1.5 0 0 0 4 8.5v7A1.5 1.5 0 0 0 5.5 17H9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 8l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 12h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

const Navbar: React.FC<Props> = ({ currentPath, currentHash }) => {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [navigationRole, setNavigationRole] = useState<NavigationRole>('guest');
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 60);
      setScrollProgress(maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthResolved(true);
      return;
    }

    return onAuthStateChanged(getFirebaseAuth(), nextUser => {
      setUser(nextUser);
      setProfileMenuOpen(false);
      setAuthResolved(true);
    });
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (!user?.email) {
      setNavigationRole('guest');
      return;
    }

    let cancelled = false;
    setNavigationRole('user');

    void getUserAccess(user.email.toLowerCase())
      .then(access => {
        if (!cancelled) {
          setNavigationRole(access.isAdmin ? 'admin' : 'user');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNavigationRole('user');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  const isHome = currentPath === '/';
  const isAbout = currentPath === '/about';
  const isLogin = currentPath === '/login';
  const isAdmin = currentPath === '/admin';
  const isProperties = (isHome && currentHash === '#properties') || currentPath === '/properties';
  const isServices = isHome && currentHash === '#services';
  const userIsAdmin = navigationRole === 'admin';
  const profileName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const profileEmail = user?.email || 'Signed in';
  const profileInitial = profileName.trim().charAt(0).toUpperCase() || 'U';

  const navigateHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleLogout = async () => {
    if (!isFirebaseConfigured) return;

    await signOut(getFirebaseAuth());
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    navigateHome();
  };

  const profileMenuItems: ProfileMenuItem[] = userIsAdmin
    ? [
        {
          label: 'Command Center',
          href: '/admin#dashboard',
          icon: 'admin',
          description: 'Portfolio snapshot and recent activity',
          emphasis: 'accent',
        },
        {
          label: 'Market Insights',
          href: '/admin#analytics',
          icon: 'favourited',
          description: 'Spot hot locations, conversion gaps, and pricing signals',
        },
      ]
    : [
        { label: 'My Searches', href: '/my-searches', icon: 'searches', description: 'Recent searches and preferred areas' },
        { label: 'Favourited', href: '/favourited', icon: 'favourited', description: 'Your curated shortlist' },
      ];

  return (
    <>
      <nav
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        style={{ '--nav-progress': scrollProgress } as React.CSSProperties}
      >
        <div className="container navbar-container">
          <a href="/" className="nav-logo">
            <BrandLogo />
          </a>
          
          {userIsAdmin ? (
            <div className="nav-admin-label desktop-only">Control Center</div>
          ) : (
            <div className="nav-links desktop-only">
              <div className="nav-link-dropdown">
                <button type="button" className={isProperties ? 'active' : ''} aria-haspopup="true">
                  Properties
                </button>
                <div className="nav-dropdown-menu" aria-label="Property categories">
                  {propertyMenuItems.map(item => (
                    <a key={item.href} href={item.href}>
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
              <a href="/#services" className={isServices ? 'active' : ''}>Services</a>
              <a href="/about" className={isAbout ? 'active' : ''}>About</a>
            </div>
          )}
          
          <div className="nav-actions desktop-only">
            {authResolved && user ? (
              <div className="profile-menu-wrap" ref={profileRef}>
                <button
                  type="button"
                  className="profile-trigger"
                  aria-label="Open profile menu"
                  aria-expanded={profileMenuOpen}
                  onClick={() => setProfileMenuOpen(open => !open)}
                >
                  <span className="profile-avatar">{profileInitial}</span>
                  <span className="profile-trigger-copy">
                    <strong>{profileName}</strong>
                    <small>{userIsAdmin ? 'Account access' : 'Member profile'}</small>
                  </span>
                  <span className="profile-chevron" aria-hidden="true" />
                </button>

                <div className={`profile-dropdown ${profileMenuOpen ? 'open' : ''}`}>
                  <div className="profile-summary">
                    <span className="profile-avatar large">{profileInitial}</span>
                    <span className="profile-summary-copy">
                      <small className="profile-summary-kicker">{userIsAdmin ? 'Administrator' : 'Signed in as'}</small>
                      <strong>{profileName}</strong>
                      <small>{profileEmail}</small>
                    </span>
                  </div>

                  {userIsAdmin && (
                    <div className="profile-admin-banner">
                      <div>
                        <span className="profile-admin-banner-label">Quick Access</span>
                        <strong>Control critical actions from one menu</strong>
                      </div>
                      <a href="/admin#properties" onClick={() => setProfileMenuOpen(false)}>
                        Add Listing
                      </a>
                    </div>
                  )}

                  <div className="profile-menu-list">
                    {profileMenuItems.map(item => (
                      <a
                        key={item.label}
                        href={item.href}
                        className={item.emphasis === 'accent' ? 'is-accent' : ''}
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <span className="profile-menu-icon" aria-hidden="true">
                          <ProfileMenuIcon type={item.icon} />
                        </span>
                        <span className="profile-menu-copy">
                          <strong>{item.label}</strong>
                          {item.description && <small>{item.description}</small>}
                        </span>
                      </a>
                    ))}
                    <button type="button" onClick={handleLogout}>
                      <span className="profile-menu-icon logout" aria-hidden="true">
                        <ProfileMenuIcon type="logout" />
                      </span>
                      <span className="profile-menu-copy">
                        <strong>Logout</strong>
                        <small>Sign out of your current session</small>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <a href="/login" className={`btn-primary nav-consultation ${isLogin ? 'active' : ''}`}>
                Login
              </a>
            )}
          </div>

          <button className="hamburger mobile-only" onClick={() => setMobileMenuOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <button className="mobile-close" onClick={() => setMobileMenuOpen(false)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="mobile-nav-links">
          <a href="/#properties" className={isProperties ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Properties</a>
          {propertyMenuItems.map(item => (
            <a key={item.href} href={item.href} className="mobile-sub-link" onClick={() => setMobileMenuOpen(false)}>{item.label}</a>
          ))}
          <a href="/#services" className={isServices ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Services</a>
          <a href="/about" className={isAbout ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>About</a>
          {authResolved && user ? (
            <>
              <a href="/my-properties" onClick={() => setMobileMenuOpen(false)}>My Properties</a>
              <a href="/my-searches" onClick={() => setMobileMenuOpen(false)}>My Searches</a>
              <a href="/liked" onClick={() => setMobileMenuOpen(false)}>Liked</a>
              <a href="/favourited" onClick={() => setMobileMenuOpen(false)}>Favourited</a>
              {userIsAdmin && <a href="/admin" className={isAdmin ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Admin Panel</a>}
              <button type="button" className="mobile-menu-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <a href="/login" className={isLogin ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Login</a>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
