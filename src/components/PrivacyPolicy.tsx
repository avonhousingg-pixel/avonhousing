import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <section className="policy-page">
      <div className="container policy-container">
        <div className="policy-hero">
          <span className="about-eyebrow">Privacy Policy</span>
          <h1>Privacy Policy</h1>
          <p>Last Updated: 1 May 2026</p>
        </div>

        <div className="policy-content">
          <article>
            <h2>1. Introduction</h2>
            <p>
              Welcome to Avon Housing. We are committed to protecting your privacy and ensuring
              that your personal information is handled in a safe and responsible manner. This
              Privacy Policy explains how we collect, use, and safeguard your information when you
              visit our website.
            </p>
          </article>

          <article>
            <h2>2. Information We Collect</h2>
            <h3>a) Personal Information</h3>
            <p>We may collect personal information that you voluntarily provide, including:</p>
            <ul>
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Property inquiry details</li>
            </ul>
            <p>This information is collected when you:</p>
            <ul>
              <li>Fill out contact or inquiry forms</li>
              <li>Request a consultation</li>
            </ul>

            <h3>b) Non-Personal Information</h3>
            <p>We may automatically collect certain non-personal data, such as:</p>
            <ul>
              <li>IP address</li>
              <li>Browser type and device information</li>
              <li>Pages visited and time spent on the website</li>
            </ul>
          </article>

          <article>
            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul>
              <li>Respond to your inquiries and provide property-related assistance</li>
              <li>Connect you with relevant property listings or services</li>
              <li>Improve our website functionality and user experience</li>
              <li>Ensure security and prevent fraudulent activity</li>
            </ul>
          </article>

          <article>
            <h2>4. Cookies and Tracking Technologies</h2>
            <p>Our website may use cookies or similar technologies to:</p>
            <ul>
              <li>Enhance user experience</li>
              <li>Analyze website traffic</li>
            </ul>
            <p>You can choose to disable cookies through your browser settings.</p>
          </article>

          <article>
            <h2>5. Sharing of Information</h2>
            <p>We do not sell, rent, or trade your personal information.</p>
            <p>We may share your information only in the following cases:</p>
            <ul>
              <li>With property owners or representatives when you make an inquiry</li>
              <li>With service providers, such as hosting or analytics tools</li>
              <li>If required by law or legal process</li>
            </ul>
          </article>

          <article>
            <h2>6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your
              personal data. However, no online platform can guarantee complete security.
            </p>
          </article>

          <article>
            <h2>7. Third-Party Services</h2>
            <p>Our website may use third-party services such as:</p>
            <ul>
              <li>Google Maps, for property location display</li>
              <li>Analytics tools, if implemented in future</li>
            </ul>
            <p>These services may collect data according to their own privacy policies.</p>
          </article>

          <article>
            <h2>8. Links to External Websites</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the
              privacy practices or content of those websites.
            </p>
          </article>

          <article>
            <h2>9. User Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Request access to your personal data</li>
              <li>Request correction or deletion of your data</li>
            </ul>
            <p>To exercise these rights, contact us using the details below.</p>
          </article>

          <article>
            <h2>10. Future Updates</h2>
            <p>
              If features like user accounts, login/signup, or databases such as Firebase or
              MongoDB are implemented in the future, this Privacy Policy will be updated
              accordingly.
            </p>
          </article>

          <article>
            <h2>11. Contact Us</h2>
            <p>If you have any questions or concerns regarding this Privacy Policy, you may contact us:</p>
            <address>
              <strong>Avon Housing</strong><br />
              Email: <a href="mailto:avon_housing@rediffmail.com">avon_housing@rediffmail.com</a><br />
              Phone: <a href="tel:9702376038">+91 97023 76038</a> / <a href="tel:8369426349">+91 83694 26349</a><br />
              Shop No. 28, Crown Building, Vasant Marvel Complex,<br />
              Near Magathane Metro Station, W.E. Highway,<br />
              Borivali (E), Mumbai
            </address>
          </article>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
