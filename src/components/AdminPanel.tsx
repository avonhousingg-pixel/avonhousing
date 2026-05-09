import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  deleteAdminProperty,
  getAdminDashboard,
  getAdminInquiries,
  getAdminProperties,
  getUserAccess,
  patchAdminProperty,
  saveAdminProperty,
  updateAdminInquiryStatus,
  type InquiryRecord,
  type InquiryStatus,
  type PropertyInsightDetails,
  type PropertyCategory,
  type PropertyPayload,
  type PropertyRecord,
  type PropertyStatus,
} from '../lib/api';
import { getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase';
import { amenityOptions, bhkOptions, getPropertyTypeLabel, propertyTypeOptions, westernSuburbAreas } from '../data/siteContent';

type DashboardData = Awaited<ReturnType<typeof getAdminDashboard>>;
type AdminTab = 'dashboard' | 'properties' | 'inquiries' | 'analytics' | 'manage';
const adminTabs: AdminTab[] = ['dashboard', 'properties', 'inquiries', 'analytics', 'manage'];
const adminTabLabels: Record<AdminTab, string> = {
  dashboard: 'Dashboard',
  properties: 'Properties',
  inquiries: 'Inquiries',
  analytics: 'Market Insights',
  manage: 'Manage Properties',
};

const getTabFromHash = (hash: string): AdminTab => {
  const normalizedHash = hash.replace(/^#/, '').toLowerCase();
  return adminTabs.includes(normalizedHash as AdminTab) ? (normalizedHash as AdminTab) : 'dashboard';
};

const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'avonhousingadmin2026@gmail.com').toLowerCase();
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const cloudinaryFolder = import.meta.env.VITE_CLOUDINARY_FOLDER || 'avon-housing/properties';

const emptyProperty: PropertyPayload = {
  title: '',
  price: 0,
  location: '',
  type: 'Residential Purchase',
  bhk: '',
  area: '',
  description: '',
  amenities: [],
  images: [],
  videoUrl: '',
  mapLocation: { lat: 0, lng: 0 },
  insightDetails: {
    floorPlanImage: '',
    floorPlanSummary: '',
    facing: '',
    vastuImage: '',
    naturalLight: '',
    naturalLightNote: '',
    ventilation: '',
    ventilationNote: '',
    bestSeason: '',
    agreementValue: '',
    pricePerSqft: '',
    includes: [],
    expenses: [],
  },
  category: 'assured-resale',
  featured: false,
  status: 'active',
};

const categoryLabels: Record<PropertyCategory, string> = {
  'assured-resale': 'Assured Resale',
  'under-construction': 'Under Construction',
  featured: 'Featured Collections',
};

const adminCategoryOptions: Array<{ value: PropertyCategory; label: string }> = [
  { value: 'assured-resale', label: 'Assured Resale' },
  { value: 'under-construction', label: 'Under Construction' },
  { value: 'featured', label: 'Featured Collections' },
];

const statusLabels: Record<PropertyStatus, string> = {
  active: 'Active',
  sold: 'Sold',
  rented: 'Rented',
};

const locationOptions = westernSuburbAreas.flatMap(area =>
  area.subAreas ? area.subAreas.map(subArea => `${area.name} ${subArea}`) : area.name
);

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price);

const formatPercent = (value: number) => `${Math.round(value)}%`;

const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

const formatPriceRange = (price: number) => `Rs. ${formatCompactNumber(price)}`;

const formatBhk = (bhk: string) => {
  const value = bhk.trim();

  if (!value) return 'Not set';
  if (/^\d+$/.test(value)) return `${value} BHK`;
  if (/^\d+\+$/.test(value)) return `${value.replace('+', '')} BHK+`;

  return value;
};

const AdminPanel: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>(() => (
    typeof window === 'undefined' ? 'dashboard' : getTabFromHash(window.location.hash)
  ));
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [form, setForm] = useState<PropertyPayload>(emptyProperty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: '', location: '', status: '', type: '', bhk: '', sort: 'latest' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [previewProperty, setPreviewProperty] = useState<PropertyRecord | null>(null);

  const isAdmin = hasAdminAccess || Boolean(user?.email && user.email.toLowerCase() === adminEmail);

  const navigateToAdminTab = (tab: AdminTab) => {
    const nextUrl = `/admin#${tab}`;
    window.history.replaceState({}, '', nextUrl);
    setActiveTab(tab);
  };

  const marketInsights = useMemo(() => {
    if (!dashboard) return null;

    const totalProperties = dashboard.stats.totalProperties || properties.length;
    const totalViews = properties.reduce((sum, property) => sum + (property.views || 0), 0);
    const propertyInquiryTotal = properties.reduce((sum, property) => sum + (property.inquiryCount || 0), 0);
    const totalInquiries = Math.max(propertyInquiryTotal, inquiries.length);
    const activeShare = totalProperties ? (dashboard.stats.active / totalProperties) * 100 : 0;
    const conversionRate = totalViews ? (totalInquiries / totalViews) * 100 : 0;
    const averagePrice = properties.length
      ? properties.reduce((sum, property) => sum + property.price, 0) / properties.length
      : 0;
    const propertyById = new Map(properties.map(property => [property._id, property]));

    const hotLocations = dashboard.popularLocations.map(location => {
      const locationProperties = properties.filter(property => property.location === location._id);
      const views = locationProperties.reduce((sum, property) => sum + (property.views || 0), 0);
      const inquiriesForLocation = locationProperties.reduce((sum, property) => sum + (property.inquiryCount || 0), 0);
      const avgPrice = locationProperties.length
        ? locationProperties.reduce((sum, property) => sum + property.price, 0) / locationProperties.length
        : 0;
      const score = Math.min(100, Math.round((location.count * 12) + (views * 2) + (inquiriesForLocation * 18)));

      return {
        name: location._id || 'Unknown',
        count: location.count,
        views,
        inquiries: inquiriesForLocation,
        avgPrice,
        score,
      };
    });

    const typeDemand = Object.values(properties.reduce<Record<string, { type: string; count: number; views: number; inquiries: number }>>((groups, property) => {
      const key = getPropertyTypeLabel(property.type) || 'Other';
      groups[key] = groups[key] || { type: key, count: 0, views: 0, inquiries: 0 };
      groups[key].count += 1;
      groups[key].views += property.views || 0;
      groups[key].inquiries += property.inquiryCount || 0;
      return groups;
    }, {})).sort((a, b) => (b.views + b.inquiries * 8) - (a.views + a.inquiries * 8));

    const priceBands = [
      { label: 'Value', range: 'Under Rs. 1 Cr', count: properties.filter(property => property.price < 10000000).length },
      { label: 'Core', range: 'Rs. 1 Cr - Rs. 3 Cr', count: properties.filter(property => property.price >= 10000000 && property.price < 30000000).length },
      { label: 'Premium', range: 'Above Rs. 3 Cr', count: properties.filter(property => property.price >= 30000000).length },
    ];

    const inquiryLeaders = dashboard.inquiryCounts.map(item => {
      const property = propertyById.get(item._id);
      return {
        id: item._id || 'general',
        title: property?.title || (item._id ? 'Unmatched property' : 'General inquiries'),
        location: property?.location || 'Website leads',
        count: item.count,
      };
    });

    const underActivated = properties
      .filter(property => property.status === 'active' && (property.views || 0) > 0 && (property.inquiryCount || 0) === 0)
      .sort((a, b) => (b.views || 0) - (a.views || 0))[0];
    const premiumAnchor = [...properties].sort((a, b) => b.price - a.price)[0];

    return {
      totalViews,
      totalInquiries,
      activeShare,
      conversionRate,
      averagePrice,
      topLocation: hotLocations[0],
      hotLocations,
      typeDemand,
      priceBands,
      inquiryLeaders,
      underActivated,
      premiumAnchor,
    };
  }, [dashboard, properties, inquiries]);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!isFirebaseConfigured) {
      const timer = window.setTimeout(() => setAuthChecked(true), 0);
      return () => window.clearTimeout(timer);
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), nextUser => {
      setUser(nextUser);
      setAuthChecked(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      setActiveTab(getTabFromHash(window.location.hash));
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('popstate', syncFromHash);

    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('popstate', syncFromHash);
    };
  }, []);

  useEffect(() => {
    if (!authChecked) {
      return;
    }

    if (!user?.email) {
      setHasAdminAccess(false);
      setRoleChecked(true);
      return;
    }

    if (user.email.toLowerCase() === adminEmail) {
      setHasAdminAccess(true);
      setRoleChecked(true);
      return;
    }

    let cancelled = false;

    void getUserAccess(user.email.toLowerCase())
      .then(access => {
        if (!cancelled) {
          setHasAdminAccess(access.isAdmin);
          setRoleChecked(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHasAdminAccess(false);
          setRoleChecked(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authChecked, user?.email]);

  useEffect(() => {
    if (!isAdmin || !user?.email) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadAdminData();
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, user?.email, filters.search, filters.location, filters.status, filters.type, filters.bhk, filters.sort]);

  async function loadAdminData() {
    if (!isAdmin || !user?.email) return;

    setLoading(true);
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value && value !== 'latest'));
      const [nextDashboard, nextProperties, nextInquiries] = await Promise.all([
        getAdminDashboard(user.email),
        getAdminProperties(user.email, activeFilters),
        getAdminInquiries(user.email),
      ]);

      setDashboard(nextDashboard);
      setProperties(nextProperties);
      setInquiries(nextInquiries);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  }

  const visibleInquiries = useMemo(() => inquiries, [inquiries]);

  const updateForm = (field: keyof PropertyPayload, value: unknown) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const updateInsightDetails = (updates: Partial<PropertyInsightDetails>) => {
    updateForm('insightDetails', { ...(form.insightDetails || {}), ...updates });
  };

  const uploadInsightImage = async (field: 'floorPlanImage' | 'vastuImage', files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    if (!cloudName || !uploadPreset) {
      setMessage('Cloudinary is not configured yet. Add the Cloudinary env values before uploading detail images.');
      return;
    }

    setUploadingImages(true);
    setMessage('Uploading detail image to Cloudinary...');

    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', uploadPreset);
      data.append('folder', `${cloudinaryFolder}/details`);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: data,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Cloudinary upload failed.');
      }

      updateInsightDetails({ [field]: result.secure_url as string });
      setMessage('Detail image uploaded to Cloudinary.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Cloudinary upload failed.');
    } finally {
      setUploadingImages(false);
    }
  };

  const addImageUrl = (url: string) => {
    if (!url.trim()) return;
    updateForm('images', [...form.images, url.trim()]);
  };

  const toggleAmenity = (amenity: string) => {
    updateForm(
      'amenities',
      form.amenities.includes(amenity)
        ? form.amenities.filter(item => item !== amenity)
        : [...form.amenities, amenity],
    );
  };

  const uploadToCloudinary = async (files: FileList | null) => {
    if (!files?.length) return;

    if (!cloudName || !uploadPreset) {
      setMessage('Cloudinary is not configured yet. Add the Cloudinary env values before uploading property images.');
      return;
    }

    setUploadingImages(true);
    setMessage('Uploading images to Cloudinary...');

    try {
      const uploads = await Promise.all(Array.from(files).map(async file => {
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', uploadPreset);
        data.append('folder', cloudinaryFolder);
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: data,
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || 'Cloudinary upload failed.');
        }

        return result.secure_url as string;
      }));

      updateForm('images', [...form.images, ...uploads]);
      setMessage(`${uploads.length} image${uploads.length > 1 ? 's' : ''} uploaded to Cloudinary.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Cloudinary upload failed.');
    } finally {
      setUploadingImages(false);
    }
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= form.images.length) return;

    const nextImages = [...form.images];
    [nextImages[index], nextImages[nextIndex]] = [nextImages[nextIndex], nextImages[index]];
    updateForm('images', nextImages);
  };

  const submitProperty = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.email) return;

    if (uploadingImages) {
      setMessage('Wait for the Cloudinary upload to finish before saving the property.');
      return;
    }

    if (form.images.some(image => image.startsWith('blob:'))) {
      setMessage('One or more images are still local previews. Upload them to Cloudinary before saving.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await saveAdminProperty(user.email, {
        ...form,
        featured: form.featured || form.category === 'featured',
      }, editingId || undefined);
      setForm(emptyProperty);
      setEditingId(null);
      setMessage(editingId ? 'Property updated.' : 'Property added.');
      await loadAdminData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save property.');
    } finally {
      setLoading(false);
    }
  };

  const editProperty = (property: PropertyRecord) => {
    setEditingId(property._id);
    setForm({
      title: property.title,
      price: property.price,
      location: property.location,
      type: getPropertyTypeLabel(property.type),
      bhk: property.bhk,
      area: property.area,
      description: property.description,
      amenities: property.amenities || [],
      images: property.images || [],
      videoUrl: property.videoUrl || '',
      mapLocation: property.mapLocation || { lat: 0, lng: 0 },
      insightDetails: property.insightDetails || emptyProperty.insightDetails,
      category: property.category,
      featured: property.featured,
      status: property.status,
    });
    navigateToAdminTab('properties');
  };

  const patchProperty = async (id: string, payload: Partial<PropertyPayload>) => {
    if (!user?.email) return;
    await patchAdminProperty(user.email, id, payload);
    await loadAdminData();
  };

  const removeProperty = async (id: string) => {
    if (!user?.email || !window.confirm('Delete this property?')) return;
    await deleteAdminProperty(user.email, id);
    await loadAdminData();
  };

  const updateInquiry = async (id: string, status: InquiryStatus) => {
    if (!user?.email) return;
    setInquiries(current => current.map(inquiry => (
      inquiry._id === id ? { ...inquiry, status } : inquiry
    )));

    try {
      const { inquiry } = await updateAdminInquiryStatus(user.email, id, status);
      setInquiries(current => current.map(item => (
        item._id === id ? { ...item, ...inquiry } : item
      )));
      await loadAdminData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update inquiry status.');
      await loadAdminData();
    }
  };

  if (!authChecked || !roleChecked) {
    return <section className="admin-shell"><div className="container">Checking admin access...</div></section>;
  }

  if (!isAdmin) {
    return (
      <section className="admin-shell">
        <div className="container admin-locked">
          <h1>Admin Access</h1>
          <p>Only {adminEmail} can open this page. Sign in with the admin account to continue.</p>
          <a href="/login" className="btn-primary">Sign In</a>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-shell">
      <div className="container">
        <header className="admin-header">
          <div>
            <span className="about-eyebrow">Control Center</span>
            <h1>Admin Panel</h1>
            <p>Manage properties, featured collections, inquiries, and simple analytics.</p>
          </div>
          <button type="button" className="btn-primary" onClick={loadAdminData} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </header>

        {message && <div className="login-message success">{message}</div>}

        <div className="admin-tabs" role="tablist">
          {adminTabs.map(tab => (
            <button key={tab} type="button" className={activeTab === tab ? 'active' : ''} onClick={() => navigateToAdminTab(tab)}>
              {adminTabLabels[tab]}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && dashboard && (
          <div className="admin-dashboard">
            <div className="admin-stat-grid">
              <div><span>Total Properties</span><strong>{dashboard.stats.totalProperties}</strong></div>
              <div><span>Active</span><strong>{dashboard.stats.active}</strong></div>
              <div><span>Sold</span><strong>{dashboard.stats.sold}</strong></div>
              <div><span>Rented</span><strong>{dashboard.stats.rented}</strong></div>
              <div><span>New Inquiries</span><strong>{dashboard.stats.newInquiries}</strong></div>
            </div>
            <div className="admin-two-column">
              <Panel title="Most Viewed Properties">
                {dashboard.mostViewed.map(property => (
                  <p key={property._id}>{property.title} <span>{property.views || 0} views</span></p>
                ))}
              </Panel>
              <Panel title="Recent Activity">
                {dashboard.recentActivity.map(item => (
                  <p key={item.id}>{item.label}</p>
                ))}
              </Panel>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="admin-properties">
            <form className="admin-form" onSubmit={submitProperty}>
              <h2>{editingId ? 'Edit Property' : 'Add Property'}</h2>
              <div className="admin-form-grid">
                <label>Title<input value={form.title} onChange={event => updateForm('title', event.target.value)} required /></label>
                <label>Price<input type="number" value={form.price || ''} onChange={event => updateForm('price', Number(event.target.value))} required /></label>
                <label>Location<select value={form.location} onChange={event => updateForm('location', event.target.value)} required><option value="">Select</option>{locationOptions.map(location => <option key={location}>{location}</option>)}</select></label>
                <label>Type<select value={form.type} onChange={event => updateForm('type', event.target.value)}>{propertyTypeOptions.map(type => <option key={type}>{type}</option>)}</select></label>
                <label>BHK<select value={form.bhk} onChange={event => updateForm('bhk', event.target.value)}><option value="">Select BHK</option>{form.bhk && !bhkOptions.includes(form.bhk as (typeof bhkOptions)[number]) && <option value={form.bhk}>{form.bhk}</option>}{bhkOptions.map(option => <option key={option}>{option}</option>)}</select></label>
                <label>Area<input value={form.area} onChange={event => updateForm('area', event.target.value)} placeholder="1200 sq.ft" /></label>
                <label>Category<select value={form.category} onChange={event => updateForm('category', event.target.value as PropertyCategory)}>{adminCategoryOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                <label>Status<select value={form.status} onChange={event => updateForm('status', event.target.value as PropertyStatus)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label>Video URL<input value={form.videoUrl || ''} onChange={event => updateForm('videoUrl', event.target.value)} /></label>
                <label>Map Lat<input value={form.mapLocation?.lat || ''} onChange={event => updateForm('mapLocation', { ...form.mapLocation, lat: Number(event.target.value) })} /></label>
                <label>Map Lng<input value={form.mapLocation?.lng || ''} onChange={event => updateForm('mapLocation', { ...form.mapLocation, lng: Number(event.target.value) })} /></label>
                <label className="admin-check"><input type="checkbox" checked={form.featured} onChange={event => updateForm('featured', event.target.checked)} /> Show on homepage</label>
              </div>
              <label>Description<textarea value={form.description} onChange={event => updateForm('description', event.target.value)} /></label>
              <div className="admin-amenity-picker">
                <span>Amenities</span>
                <div>
                  {amenityOptions.map(amenity => {
                    const selected = form.amenities.includes(amenity.label);
                    return (
                      <button
                        key={amenity.label}
                        type="button"
                        className={selected ? 'selected' : ''}
                        aria-pressed={selected}
                        onClick={() => toggleAmenity(amenity.label)}
                      >
                        {amenity.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <ImageManager
                images={form.images}
                addImageUrl={addImageUrl}
                uploadToCloudinary={uploadToCloudinary}
                moveImage={moveImage}
                removeImage={index => updateForm('images', form.images.filter((_, itemIndex) => itemIndex !== index))}
                cloudinaryReady={Boolean(cloudName && uploadPreset)}
                uploadingImages={uploadingImages}
              />
              <div className="admin-form-actions">
                <button type="submit" className="btn-primary" disabled={loading || uploadingImages}>{editingId ? 'Update Property' : 'Add Property'}</button>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyProperty); }}>Cancel Edit</button>}
              </div>
            </form>

            <PropertyInsightEditor
              details={form.insightDetails || {}}
              updateDetails={updateInsightDetails}
              uploadInsightImage={uploadInsightImage}
              uploadingImages={uploadingImages}
              cloudinaryReady={Boolean(cloudName && uploadPreset)}
            />
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="admin-table-wrap">
            <h2>Manage Properties</h2>
            <div className="admin-filters">
              <input placeholder="Search title" value={filters.search} onChange={event => setFilters({ ...filters, search: event.target.value })} />
              <select value={filters.location} onChange={event => setFilters({ ...filters, location: event.target.value })}><option value="">All locations</option>{locationOptions.map(location => <option key={location}>{location}</option>)}</select>
              <select value={filters.type} onChange={event => setFilters({ ...filters, type: event.target.value })}><option value="">All types</option>{propertyTypeOptions.map(type => <option key={type}>{type}</option>)}</select>
              <select value={filters.bhk} onChange={event => setFilters({ ...filters, bhk: event.target.value })}><option value="">All BHK</option>{bhkOptions.map(option => <option key={option}>{option}</option>)}</select>
              <select value={filters.status} onChange={event => setFilters({ ...filters, status: event.target.value })}><option value="">All status</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <select value={filters.sort} onChange={event => setFilters({ ...filters, sort: event.target.value })}><option value="latest">Latest</option><option value="price-high-low">Price high-low</option><option value="price-low-high">Price low-high</option></select>
            </div>
            <PropertyTable properties={properties} editProperty={editProperty} removeProperty={removeProperty} patchProperty={patchProperty} previewProperty={setPreviewProperty} />
          </div>
        )}

        {activeTab === 'inquiries' && (
          <div className="admin-table-wrap">
            <h2>Lead / Inquiry Management</h2>
            <InquiryTable inquiries={visibleInquiries} updateInquiry={updateInquiry} />
          </div>
        )}

        {activeTab === 'analytics' && dashboard && marketInsights && (
          <div className="market-insights">
            <div className="market-hero-panel">
              <div>
                <span className="about-eyebrow">Market command view</span>
                <h2>{marketInsights.topLocation?.name || 'Mumbai Western Suburbs'} is leading current supply</h2>
                <p>Use views, inquiries, inventory mix, and price bands to decide what to promote next.</p>
              </div>
              <div className="market-signal-grid">
                <div><span>Total Views</span><strong>{formatCompactNumber(marketInsights.totalViews)}</strong></div>
                <div><span>Lead Conversion</span><strong>{formatPercent(marketInsights.conversionRate)}</strong></div>
                <div><span>Active Supply</span><strong>{formatPercent(marketInsights.activeShare)}</strong></div>
                <div><span>Avg. Ticket</span><strong>{marketInsights.averagePrice ? formatPriceRange(marketInsights.averagePrice) : 'Rs. 0'}</strong></div>
              </div>
            </div>

            <div className="market-insight-grid">
              <Panel title="Location Heat Index">
                {marketInsights.hotLocations.map(item => (
                  <div className="market-heat-row" key={item.name}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.count} listings | {item.views} views | {item.inquiries} leads</span>
                    </div>
                    <div className="market-meter" aria-label={`${item.score} heat score`}>
                      <span style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </Panel>

              <Panel title="Buyer Intent Leaders">
                {marketInsights.inquiryLeaders.map(item => (
                  <p key={item.id}><strong>{item.title}</strong><span>{item.location} | {item.count} leads</span></p>
                ))}
              </Panel>

              <Panel title="Inventory By Price Band">
                {marketInsights.priceBands.map(item => (
                  <div className="market-band-row" key={item.label}>
                    <strong>{item.label}</strong>
                    <span>{item.range}</span>
                    <b>{item.count}</b>
                  </div>
                ))}
              </Panel>

              <Panel title="Property Type Demand">
                {marketInsights.typeDemand.map(item => (
                  <p key={item.type}><strong>{item.type}</strong><span>{item.count} listings | {item.views} views | {item.inquiries} leads</span></p>
                ))}
              </Panel>
            </div>

            <div className="market-opportunity-strip">
              <div>
                <span>Promotion Gap</span>
                <strong>{marketInsights.underActivated?.title || 'No active gap found'}</strong>
                <p>{marketInsights.underActivated ? `${marketInsights.underActivated.views} views with no leads yet` : 'Every viewed active listing has some lead signal.'}</p>
              </div>
              <div>
                <span>Premium Anchor</span>
                <strong>{marketInsights.premiumAnchor?.title || 'Add premium inventory'}</strong>
                <p>{marketInsights.premiumAnchor ? `${marketInsights.premiumAnchor.location} at Rs. ${formatPrice(marketInsights.premiumAnchor.price)}` : 'No property pricing data available.'}</p>
              </div>
              <div>
                <span>Fresh Leads</span>
                <strong>{dashboard.stats.newInquiries}</strong>
                <p>New inquiries waiting for follow-up in the lead pipeline.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {previewProperty && (
        <div className="admin-modal" role="dialog" aria-modal="true">
          <article className="admin-preview">
            <button type="button" className="mobile-close" onClick={() => setPreviewProperty(null)}>x</button>
            <img src={previewProperty.images?.[0] || '/mumbai-skyline.png'} alt={previewProperty.title} />
            <h2>{previewProperty.title}</h2>
            <p>{previewProperty.location} • Rs. {formatPrice(previewProperty.price)}</p>
            <p>{previewProperty.description}</p>
          </article>
        </div>
      )}
    </section>
  );
};

const Panel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="admin-panel-card">
    <h2>{title}</h2>
    <div className="admin-list">{children}</div>
  </div>
);

const parseLines = (value: string) => value.split('\n').map(item => item.trim()).filter(Boolean);

const parseExpenses = (value: string) => parseLines(value).map(line => {
  const [label, ...rest] = line.split('|');
  return {
    label: label.trim(),
    value: rest.join('|').trim(),
  };
}).filter(item => item.label || item.value);

const formatExpensesForInput = (expenses: PropertyInsightDetails['expenses'] = []) =>
  expenses.map(item => `${item.label}${item.value ? ` | ${item.value}` : ''}`).join('\n');

const PropertyInsightEditor: React.FC<{
  details: PropertyInsightDetails;
  updateDetails: (updates: Partial<PropertyInsightDetails>) => void;
  uploadInsightImage: (field: 'floorPlanImage' | 'vastuImage', files: FileList | null) => void;
  uploadingImages: boolean;
  cloudinaryReady: boolean;
}> = ({ details, updateDetails, uploadInsightImage, uploadingImages, cloudinaryReady }) => (
  <section className="admin-form admin-detail-editor">
    <div>
      <span className="about-eyebrow">Property detail sections</span>
      <h2>Floor Plan, Vastu, Light and Pricing</h2>
      <p>Add the extra presentation details shown on the property page. Use the main Add/Update Property button on the left to save.</p>
    </div>

    <div className="admin-detail-block">
      <h3>Floor Plan and Area</h3>
      <div className="admin-form-grid">
        <label>Floor Plan Image URL<input value={details.floorPlanImage || ''} onChange={event => updateDetails({ floorPlanImage: event.target.value })} /></label>
        <label>Upload Floor Plan<input type="file" accept="image/*" disabled={!cloudinaryReady || uploadingImages} onChange={event => uploadInsightImage('floorPlanImage', event.target.files)} /></label>
        <label>Facing<input value={details.facing || ''} onChange={event => updateDetails({ facing: event.target.value })} placeholder="North facing home" /></label>
      </div>
      <label>Floor Plan Summary<textarea value={details.floorPlanSummary || ''} onChange={event => updateDetails({ floorPlanSummary: event.target.value })} placeholder="3 BHK layout with balcony, dry area and efficient passage planning." /></label>
    </div>

    <div className="admin-detail-block">
      <h3>Vastu Chart</h3>
      <div className="admin-form-grid">
        <label>Vastu Grid Image URL<input value={details.vastuImage || ''} onChange={event => updateDetails({ vastuImage: event.target.value })} /></label>
        <label>Upload Vastu Grid<input type="file" accept="image/*" disabled={!cloudinaryReady || uploadingImages} onChange={event => uploadInsightImage('vastuImage', event.target.files)} /></label>
      </div>
    </div>

    <div className="admin-detail-block">
      <h3>Sunlight and Ventilation</h3>
      <div className="admin-form-grid">
        <label>Natural Light<input value={details.naturalLight || ''} onChange={event => updateDetails({ naturalLight: event.target.value })} placeholder="Radiant" /></label>
        <label>Ventilation<input value={details.ventilation || ''} onChange={event => updateDetails({ ventilation: event.target.value })} placeholder="Limited Airflow" /></label>
        <label>Best Season<input value={details.bestSeason || ''} onChange={event => updateDetails({ bestSeason: event.target.value })} placeholder="Monsoon, Jun - Sep" /></label>
      </div>
      <label>Natural Light Note<textarea value={details.naturalLightNote || ''} onChange={event => updateDetails({ naturalLightNote: event.target.value })} placeholder="Generous midday sun with bonus evening glow in bedrooms." /></label>
      <label>Ventilation Note<textarea value={details.ventilationNote || ''} onChange={event => updateDetails({ ventilationNote: event.target.value })} placeholder="South-facing rooms catch gentle breezes." /></label>
    </div>

    <div className="admin-detail-block">
      <h3>Price Breakdown</h3>
      <div className="admin-form-grid">
        <label>Agreement Value<input value={details.agreementValue || ''} onChange={event => updateDetails({ agreementValue: event.target.value })} placeholder="4.2 Cr." /></label>
        <label>Per Sq Ft<input value={details.pricePerSqft || ''} onChange={event => updateDetails({ pricePerSqft: event.target.value })} placeholder="38.7k / sqft" /></label>
      </div>
      <label>Includes<textarea value={(details.includes || []).join('\n')} onChange={event => updateDetails({ includes: parseLines(event.target.value) })} placeholder={'AC and Electrical Fittings\nKitchen and Bathroom Fittings\nLegal Fees'} /></label>
      <label>Other Expenses<textarea value={formatExpensesForInput(details.expenses)} onChange={event => updateDetails({ expenses: parseExpenses(event.target.value) })} placeholder={'Stamp Duty | 5 - 6%\nRegistration Fees (INR) | Rs. 33000 / One time\nProperty Tax (INR) | Rs. 34120 / Yearly'} /></label>
    </div>
  </section>
);

const ImageManager: React.FC<{
  images: string[];
  addImageUrl: (url: string) => void;
  uploadToCloudinary: (files: FileList | null) => void;
  moveImage: (index: number, direction: -1 | 1) => void;
  removeImage: (index: number) => void;
  cloudinaryReady: boolean;
  uploadingImages: boolean;
}> = ({ images, addImageUrl, uploadToCloudinary, moveImage, removeImage, cloudinaryReady, uploadingImages }) => {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <div className="admin-media-manager">
      <div className="admin-media-controls">
        <input type="url" placeholder="Image URL" value={imageUrl} onChange={event => setImageUrl(event.target.value)} />
        <button type="button" onClick={() => { addImageUrl(imageUrl); setImageUrl(''); }}>Add URL</button>
        <input type="file" accept="image/*" multiple disabled={!cloudinaryReady || uploadingImages} onChange={event => uploadToCloudinary(event.target.files)} />
      </div>
      <p>{cloudinaryReady ? (uploadingImages ? 'Uploading to Cloudinary...' : `Uploads will be saved in the ${cloudinaryFolder} Cloudinary folder.`) : 'Add Cloudinary env values to enable permanent image uploads.'}</p>
      <div className="admin-image-grid">
        {images.map((image, index) => (
          <div key={`${image}-${index}`} className="admin-image-tile">
            <img src={image} alt="" />
            <div>
              <button type="button" onClick={() => moveImage(index, -1)}>Up</button>
              <button type="button" onClick={() => moveImage(index, 1)}>Down</button>
              <button type="button" onClick={() => removeImage(index)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PropertyTable: React.FC<{
  properties: PropertyRecord[];
  editProperty: (property: PropertyRecord) => void;
  removeProperty: (id: string) => void;
  patchProperty: (id: string, payload: Partial<PropertyPayload>) => void;
  previewProperty: (property: PropertyRecord) => void;
}> = ({ properties, editProperty, removeProperty, patchProperty, previewProperty }) => (
  <table className="admin-table">
    <thead><tr><th>Property</th><th>BHK</th><th>Category</th><th>Status</th><th>Price</th><th>Actions</th></tr></thead>
    <tbody>
      {properties.map(property => (
        <tr key={property._id}>
          <td><strong>{property.title}</strong><span>{property.location} • {getPropertyTypeLabel(property.type)}</span></td>
          <td>{formatBhk(property.bhk || '')}</td>
          <td>{categoryLabels[property.category] || property.category}</td>
          <td><PropertyStatusDropdown value={property.status} onChange={status => patchProperty(property._id, { status })} /></td>
          <td>Rs. {formatPrice(property.price)}</td>
          <td className="admin-actions">
            <button type="button" onClick={() => editProperty(property)}>Edit</button>
            <button type="button" onClick={() => removeProperty(property._id)}>Delete</button>
            <button type="button" onClick={() => previewProperty(property)}>Preview</button>
            <button type="button" onClick={() => patchProperty(property._id, { featured: !property.featured, category: property.featured ? property.category : 'featured' })}>{property.featured ? 'Unfeature' : 'Feature'}</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const PropertyStatusDropdown: React.FC<{
  value: PropertyStatus;
  onChange: (status: PropertyStatus) => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-status-dropdown" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setOpen(false);
      }
    }}>
      <button type="button" className="admin-status-trigger" aria-expanded={open} onClick={() => setOpen(current => !current)}>
        {statusLabels[value]}
        <span aria-hidden="true" />
      </button>
      {open && (
        <div className="admin-status-menu">
          {Object.entries(statusLabels).map(([status, label]) => (
            <button
              key={status}
              type="button"
              className={status === value ? 'active' : ''}
              onClick={() => {
                onChange(status as PropertyStatus);
                setOpen(false);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const InquiryTable: React.FC<{
  inquiries: InquiryRecord[];
  updateInquiry: (id: string, status: InquiryStatus) => void;
}> = ({ inquiries, updateInquiry }) => (
  <table className="admin-table">
    <thead><tr><th>Name</th><th>Contact</th><th>Interested Property</th><th>BHK</th><th>Budget</th><th>Status</th></tr></thead>
    <tbody>
      {inquiries.map(inquiry => (
        <tr key={inquiry._id}>
          <td><strong>{inquiry.name}</strong><span>{inquiry.location}</span></td>
          <td>{inquiry.phone}<span>{inquiry.email}</span></td>
          <td>{inquiry.interestedProperty || inquiry.propertyType}</td>
          <td>{formatBhk(inquiry.bhk || '')}</td>
          <td>{inquiry.budget}</td>
          <td><select value={inquiry.status || 'new'} onChange={event => updateInquiry(inquiry._id, event.target.value as InquiryStatus)}><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default AdminPanel;
