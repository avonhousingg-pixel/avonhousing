import React, { useEffect, useState } from 'react';
import { bhkOptions, getPropertyTypeLabel, propertyTypeOptions, westernSuburbAreas } from '../data/siteContent';
import { saveConsultation } from '../lib/api';
import { getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase';
import { WordReveal } from './WordReveal';

const preferredLocations = westernSuburbAreas.flatMap(area =>
  area.subAreas ? area.subAreas.map(subArea => `${area.name} ${subArea}`) : area.name
);

const nextSteps = [
  'You submit your requirement',
  'Our expert contacts you within 24 hours',
  'We shortlist properties',
  'Schedule site visits',
];

const ConsultationPage: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState(() => {
    const params = new URLSearchParams(window.location.search);

    return {
      id: params.get('propertyId') || '',
      title: params.get('property') || '',
      location: params.get('location') || '',
      type: getPropertyTypeLabel(params.get('type') || ''),
      bhk: params.get('bhk') || '',
    };
  });
  const [submitState, setSubmitState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitState('saving');
    setMessage('');

    const form = event.currentTarget;
    const formData = new FormData(form);
    const currentUser = isFirebaseConfigured ? getFirebaseAuth().currentUser : null;

    try {
      await saveConsultation({
        name: String(formData.get('name') || ''),
        phone: String(formData.get('phone') || ''),
        email: String(formData.get('email') || ''),
        purpose: String(formData.get('purpose') || ''),
        location: String(formData.get('location') || ''),
        budget: String(formData.get('budget') || ''),
        propertyType: String(formData.get('propertyType') || ''),
        bhk: String(formData.get('bhk') || ''),
        interestedProperty: selectedProperty.title,
        propertyId: selectedProperty.id,
        firebaseUid: currentUser?.uid,
      });

      form.reset();
      setSubmitState('success');
      setMessage('Thank you! Your requirement has been submitted.');
    } catch (error) {
      setSubmitState('error');
      setMessage(error instanceof Error ? error.message : 'Unable to submit your requirement right now.');
    }
  };

  return (
    <section className="consultation-page">
      <div className="container">
        <div className="consultation-hero">
          <span className="about-eyebrow">Consultation</span>
          <h1>
            <WordReveal text="Book a Free Property Consultation" intersect={true} />
          </h1>
          <p>Get expert guidance tailored to your budget and preferred Western Suburbs location.</p>
          {selectedProperty.title && (
            <p className="selected-property-note">Inquiry for {selectedProperty.title}</p>
          )}
        </div>

        <div className="consultation-grid">
          <div className="consultation-copy">
            <div className="quick-contact">
              <a href="tel:9702376038">Call Now</a>
              <a href="https://wa.me/919702376038" target="_blank" rel="noreferrer">
                WhatsApp Chat
              </a>
            </div>

            <div className="consultation-trust">
              <h3>Trusted by clients across the Western Suburbs</h3>
              <p>Expertise in Bandra, Andheri, Goregaon, Malad, Kandivali, Borivali, and nearby pockets.</p>
              <blockquote>"Clear advice, strong local knowledge, and fast shortlisting."</blockquote>
              <blockquote>"The site visits were organized and the options were genuinely relevant."</blockquote>
            </div>

            <div className="next-steps">
              <h3>What Happens Next</h3>
              {nextSteps.map((step, index) => (
                <div className="next-step" key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>

          <form
            className="consultation-form"
            onSubmit={handleSubmit}
          >
            {message && (
              <div className={`login-message ${submitState === 'error' ? 'error' : 'success'}`} role={submitState === 'error' ? 'alert' : 'status'}>
                {message}
              </div>
            )}

            <label>
              Full Name
              <input type="text" name="name" placeholder="Your name" required />
            </label>

            <label>
              Phone Number
              <input type="tel" name="phone" placeholder="+91" required />
            </label>

            <label>
              Email
              <input type="email" name="email" placeholder="you@example.com" />
            </label>

            <label>
              Purpose
              <select name="purpose" defaultValue="" required>
                <option value="" disabled>
                  Select purpose
                </option>
                <option value="buy">Buy</option>
                <option value="rent">Rent</option>
                <option value="commercial">Commercial</option>
              </select>
            </label>

            <label>
              Preferred Location
              <select name="location" value={selectedProperty.location} onChange={event => setSelectedProperty(current => ({ ...current, location: event.target.value }))} required>
                <option value="" disabled>
                  Select location
                </option>
                {selectedProperty.location && !preferredLocations.includes(selectedProperty.location) && (
                  <option value={selectedProperty.location}>{selectedProperty.location}</option>
                )}
                {preferredLocations.map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Budget Range
              <select name="budget" defaultValue="" required>
                <option value="" disabled>
                  Select budget
                </option>
                <option value="under-1cr">Under Rs. 1 Cr</option>
                <option value="1cr-3cr">Rs. 1 Cr - Rs. 3 Cr</option>
                <option value="3cr-5cr">Rs. 3 Cr - Rs. 5 Cr</option>
                <option value="5cr-plus">Rs. 5 Cr +</option>
              </select>
            </label>

            <label>
              Property Type
              <select name="propertyType" value={selectedProperty.type} onChange={event => setSelectedProperty(current => ({ ...current, type: event.target.value }))} required>
                <option value="" disabled>
                  Select type
                </option>
                {selectedProperty.type && !propertyTypeOptions.includes(selectedProperty.type as (typeof propertyTypeOptions)[number]) && (
                  <option value={selectedProperty.type}>{selectedProperty.type}</option>
                )}
                {propertyTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>

            <label>
              BHK
              <select name="bhk" value={selectedProperty.bhk} onChange={event => setSelectedProperty(current => ({ ...current, bhk: event.target.value }))} required>
                <option value="" disabled>
                  Select BHK
                </option>
                {selectedProperty.bhk && !bhkOptions.includes(selectedProperty.bhk as (typeof bhkOptions)[number]) && (
                  <option value={selectedProperty.bhk}>{selectedProperty.bhk}</option>
                )}
                {bhkOptions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>

            <button type="submit" className="btn-primary" disabled={submitState === 'saving'}>
              {submitState === 'saving' ? 'Submitting...' : 'Submit Requirement'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ConsultationPage;
