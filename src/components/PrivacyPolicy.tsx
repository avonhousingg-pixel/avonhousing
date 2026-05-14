import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <section className="policy-page">
      <div className="container policy-container">
        <div className="policy-hero">
          <span className="about-eyebrow">Privacy Policy</span>
          <h1>Privacy Policy</h1>
          <p>Last Updated: 5 May 2026</p>
        </div>

        <div className="policy-content">
          <article>
            <h2>1. Introduction</h2>
            <p>
              Welcome to Avon Housing. We are committed to protecting your privacy and ensuring
              that your personal information is handled in a safe and responsible manner. This
              Privacy Policy explains how we collect, use, and safeguard your information when you
              use our website, search for properties, or request consultations.
            </p>
          </article>

          <article>
            <h2>2. Information We Collect</h2>
            <h3>a) Personal Information</h3>
            <p>We collect personal information that you voluntarily provide to us, including:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, phone number, and profile picture provided when you sign in via Firebase Authentication.</li>
              <li><strong>Consultation & Inquiry Details:</strong> Name, phone number, email, property preferences (budget, location, BHK, type), and specific properties you are interested in.</li>
            </ul>
            <p>This information is collected when you:</p>
            <ul>
              <li>Sign in or create an account</li>
              <li>Submit a property consultation or inquiry form</li>
              <li>Interact with our property listings</li>
            </ul>

            <h3>b) Usage Information</h3>
            <p>We automatically collect certain data to improve your experience, such as:</p>
            <ul>
              <li><strong>Activity Data:</strong> Property views, saved favorites, and recently viewed properties.</li>
              <li><strong>Device Information:</strong> IP address, browser type, and device identifiers.</li>
              <li><strong>Interaction Logs:</strong> Pages visited and time spent on specific property details.</li>
            </ul>
          </article>

          <article>
            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul>
              <li>Process your property inquiries and schedule consultations</li>
              <li>Personalize your experience (e.g., "Saved Properties", "Recently Viewed")</li>
              <li>Provide customer support and respond to your requests</li>
              <li>Analyze market trends and property popularity to improve our services</li>
              <li>Maintain the security of our platform and prevent fraudulent activity</li>
            </ul>
          </article>

          <article>
            <h2>4. Storage and Security</h2>
            <p>
              We use <strong>Firebase</strong> (a Google service) for secure authentication and user management. 
              Personal data submitted through forms (such as inquiries and consultation requests) is 
              stored in our <strong>MongoDB</strong> database.
            </p>
            <p>
              While we implement robust security measures to protect your data within our database and 
              hosting environment, no electronic transmission or storage is 100% secure, and we 
              cannot guarantee absolute security.
            </p>
          </article>

          <article>
            <h2>5. Cookies and Local Storage</h2>
            <p>
              We use <strong>Local Storage</strong> and cookies to provide essential features such as:
            </p>
            <ul>
              <li>Maintaining your session and login state</li>
              <li>Storing your "Favorite Properties" locally for quick access</li>
              <li>Tracking your "Recently Viewed" history</li>
            </ul>
            <p>You can manage or clear these through your browser settings.</p>
          </article>

          <article>
            <h2>6. Sharing of Information</h2>
            <p>We value your privacy and do not sell or rent your personal data to third parties.</p>
            <p>We may share your information in limited circumstances:</p>
            <ul>
              <li><strong>Internal Experts:</strong> With our real estate consultants to fulfill your consultation requests.</li>
              <li><strong>Third-Party Services:</strong> With providers like Firebase for authentication and Google Maps for property location services.</li>
              <li><strong>Legal Requirements:</strong> If required by law or to protect our legal rights.</li>
            </ul>
          </article>

          <article>
            <h2>7. Third-Party Services</h2>
            <p>Our website integrates services from third-party providers:</p>
            <ul>
              <li><strong>Firebase:</strong> Authentication and user data management.</li>
              <li><strong>MongoDB:</strong> Secure database hosting for property and inquiry data.</li>
              <li><strong>Google Maps:</strong> Displaying property locations.</li>
              <li><strong>YouTube:</strong> Displaying property video walkthroughs.</li>
            </ul>
            <p>These providers have their own privacy policies governing how they handle your data.</p>
          </article>

          <article>
            <h2>8. User Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and personal information</li>
              <li>Opt-out of property tracking and personalization</li>
            </ul>
            <p>To exercise these rights, please contact us using the details below.</p>
          </article>

          <article>
            <h2>9. Contact Us</h2>
            <p>If you have any questions or concerns regarding this Privacy Policy or your data, please contact us:</p>
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

