import React from 'react';
import AdminPanel from './components/AdminPanel';
import AllPropertiesPage from './components/AllPropertiesPage';
import About from './components/About';
import ConsultationPage from './components/ConsultationPage';
import FeaturedListings from './components/FeaturedListings';
import Footer from './components/Footer';
import Hero from './components/Hero';
import LoginPage from './components/LoginPage';
import Marquee from './components/Marquee';
import Navbar from './components/Navbar';
import Preloader from './components/Preloader';
import PrivacyPolicy from './components/PrivacyPolicy';
import PropertyDetailPage from './components/PropertyDetailPage';
import PropertyPlaceholders from './components/PropertyPlaceholders';
import ScrollObserver from './components/ScrollObserver';
import SearchBar from './components/SearchBar';
import ServiceDetail from './components/ServiceDetail';
import Services from './components/Services';
import Testimonial from './components/Testimonial';
import UserPropertyPage from './components/UserPropertyPage';
import { usePageNavigation } from './hooks/usePageNavigation';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const { hash, isTransitioning, path } = usePageNavigation();
  const isAboutPage = path === '/about';
  const isPrivacyPolicyPage = path === '/privacy-policy';
  const isConsultationPage = path === '/consultation';
  const isAllPropertiesPage = path === '/properties';
  const isMyPropertiesPage = path === '/my-properties';
  const isMySearchesPage = path === '/my-searches';
  const isLikedPage = path === '/liked';
  const isFavouritedPage = path === '/favourited';
  const isPropertyDetailPage = path.startsWith('/properties/');
  const isLoginPage = path === '/login';
  const isAdminPage = path === '/admin';
  const isServiceDetailPage = path.startsWith('/services/');
  const handlePreloaderComplete = React.useCallback(() => setIsLoaded(true), []);

  return (
    <>
      <Preloader onComplete={handlePreloaderComplete} />
      <div className={`page-transition-layer ${isTransitioning ? 'active' : ''}`} aria-hidden="true" />
      {isLoaded && <Navbar currentPath={path} currentHash={hash} />}
      <div className={`site-shell ${isLoaded ? 'app-loaded' : ''} ${isTransitioning ? 'is-transitioning' : ''}`}>
        {isLoaded && !isTransitioning && <ScrollObserver />}
        <main>
          {isPropertyDetailPage ? (
            <PropertyDetailPage />
          ) : isAdminPage ? (
            <AdminPanel />
          ) : isConsultationPage ? (
            <ConsultationPage />
          ) : isLoginPage ? (
            <LoginPage />
          ) : isAllPropertiesPage ? (
            <AllPropertiesPage />
          ) : isMyPropertiesPage ? (
            <UserPropertyPage kind="properties" />
          ) : isMySearchesPage ? (
            <UserPropertyPage kind="searches" />
          ) : isLikedPage ? (
            <UserPropertyPage kind="liked" />
          ) : isFavouritedPage ? (
            <UserPropertyPage kind="favourited" />
          ) : isServiceDetailPage ? (
            <ServiceDetail />
          ) : isPrivacyPolicyPage ? (
            <PrivacyPolicy />
          ) : isAboutPage ? (
            <About />
          ) : (
            <>
              <Hero isLoaded={isLoaded} />
              <Marquee />
              <SearchBar />
              <PropertyPlaceholders />
              <FeaturedListings />
              <Services />
              <Testimonial />
            </>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default App;
