import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="nav-logo">
              Avon<span className="text-accent">.</span>
            </a>
            <p className="footer-tagline">
              Western Mumbai's focused real estate consultancy, driven by relationships and defined by local expertise.
            </p>
          </div>
          
          <div>
            <h4 className="footer-title">Contact</h4>
            <div className="footer-links">
              <a href="tel:9702376038">+91 97023 76038</a>
              <a href="tel:8369426349">+91 83694 26349</a>
              <a href="mailto:avon_housing@rediffmail.com" className="footer-email">avon_housing@rediffmail.com</a>
            </div>
          </div>
          
          <div>
            <h4 className="footer-title">Office</h4>
            <div className="footer-links footer-address">
              <p>
                Shop No. 28, Crown Building,<br/>
                Vasant Marvel Complex,<br/>
                Near Magathane Metro Station,<br/>
                W.E. Highway, Borivali (E),<br/>
                Mumbai
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="footer-title">Quick Links</h4>
            <div className="footer-links">
              <a href="/#properties">Properties</a>
              <a href="/#services">Services</a>
              <a href="/about">About Us</a>
              <a href="/privacy-policy">Privacy Policy</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Avon Housing. All rights reserved.</p>
          <p>RERA Registration: <span className="text-accent">A51800013493</span></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
