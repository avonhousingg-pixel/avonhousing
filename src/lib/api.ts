import type { User } from 'firebase/auth';

type UserProfilePayload = {
  fullName?: string;
  mobileNumber?: string;
};

type ConsultationPayload = {
  name: string;
  phone: string;
  email: string;
  purpose: string;
  location: string;
  budget: string;
  propertyType: string;
  bhk?: string;
  interestedProperty?: string;
  propertyId?: string;
  firebaseUid?: string;
};

export type PropertyCategory = 'assured-resale' | 'under-construction' | 'featured';
export type PropertyStatus = 'active' | 'sold' | 'rented';
export type InquiryStatus = 'new' | 'contacted' | 'closed';
export type UserRole = 'admin' | 'user';
export type PropertyInsightDetails = {
  floorPlanImage?: string;
  floorPlanSummary?: string;
  facing?: string;
  vastuImage?: string;
  naturalLight?: string;
  naturalLightNote?: string;
  ventilation?: string;
  ventilationNote?: string;
  bestSeason?: string;
  agreementValue?: string;
  pricePerSqft?: string;
  includes?: string[];
  expenses?: { label: string; value: string }[];
};
export type UserAccess = {
  ok: true;
  role: UserRole;
  roles: UserRole[];
  isAdmin: boolean;
};

export type PropertyRecord = {
  _id: string;
  title: string;
  price: number;
  location: string;
  type: string;
  bhk: string;
  area: string;
  description: string;
  amenities: string[];
  images: string[];
  videoUrl?: string;
  mapLocation?: { lat: number; lng: number };
  insightDetails?: PropertyInsightDetails;
  category: PropertyCategory;
  featured: boolean;
  status: PropertyStatus;
  views: number;
  inquiryCount: number;
  createdAt: string;
};

export type InquiryRecord = {
  _id: string;
  name: string;
  phone: string;
  email: string;
  interestedProperty?: string;
  propertyType: string;
  bhk?: string;
  location: string;
  budget: string;
  status: InquiryStatus;
  createdAt: string;
};

export type PropertyPayload = Omit<PropertyRecord, '_id' | 'views' | 'inquiryCount' | 'createdAt'> & {
  mapLat?: string;
  mapLng?: string;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

const getFriendlyApiError = (message: string) => {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes('ssl') ||
    lowerMessage.includes('tls') ||
    lowerMessage.includes('openssl') ||
    lowerMessage.includes('mongo')
  ) {
    return 'Server database connection failed. Please restart the backend and try again.';
  }

  return message;
};

const requestJson = async <T = void>(path: string, options: RequestInit = {}) => {
  let response: Response;
  const headers = new Headers(options.headers);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('API route is not reachable. Restart the dev server, then submit again.');
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(getFriendlyApiError(data?.error || 'Unable to save data right now.'));
  }

  return response.status === 204 ? (undefined as T) : response.json() as Promise<T>;
};

const postJson = async (path: string, payload: unknown) => {
  await requestJson(path, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const saveUserProfile = async (user: User, profile: UserProfilePayload = {}) => {
  await postJson('/api/users', {
    firebaseUid: user.uid,
    email: user.email || '',
    fullName: profile.fullName || user.displayName || '',
    displayName: profile.fullName || user.displayName || '',
    mobileNumber: profile.mobileNumber || user.phoneNumber || '',
    phoneNumber: profile.mobileNumber || user.phoneNumber || '',
    photoURL: user.photoURL || '',
    providers: user.providerData.map(provider => provider.providerId),
  });
};

export const saveConsultation = async (payload: ConsultationPayload) => {
  await postJson('/api/consultations', payload);
};

export const getUserAccess = async (email: string) => {
  const query = new URLSearchParams({ email });
  return requestJson<UserAccess>(`/api/users/access?${query.toString()}`);
};

export const getProperties = async (query: Record<string, string> = {}) => {
  const search = new URLSearchParams(query);
  const suffix = search.size ? `?${search.toString()}` : '';
  const data = await requestJson<{ properties: PropertyRecord[] }>(`/api/properties${suffix}`);
  return data.properties;
};

export const getProperty = async (id: string) => {
  const data = await requestJson<{ property: PropertyRecord }>(`/api/properties/${id}`);
  return data.property;
};

export const trackPropertyView = async (id: string) => {
  await requestJson(`/api/properties/${id}/view`, { method: 'POST' });
};

const getAdminHeaders = (adminEmail: string) => ({
  'x-admin-email': adminEmail,
});

export const getAdminDashboard = async (adminEmail: string) => {
  return requestJson<{
    stats: { totalProperties: number; active: number; sold: number; rented: number; newInquiries: number };
    mostViewed: PropertyRecord[];
    recentActivity: { id: string; label: string; createdAt: string }[];
    popularLocations: { _id: string; count: number }[];
    inquiryCounts: { _id: string; count: number }[];
  }>('/api/admin/dashboard', { headers: getAdminHeaders(adminEmail) });
};

export const getAdminProperties = async (adminEmail: string, query: Record<string, string> = {}) => {
  const search = new URLSearchParams(query);
  const suffix = search.size ? `?${search.toString()}` : '';
  const data = await requestJson<{ properties: PropertyRecord[] }>(`/api/admin/properties${suffix}`, {
    headers: getAdminHeaders(adminEmail),
  });
  return data.properties;
};

export const saveAdminProperty = async (adminEmail: string, payload: PropertyPayload, id?: string) => {
  return requestJson<{ property: PropertyRecord }>(id ? `/api/admin/properties/${id}` : '/api/admin/properties', {
    method: id ? 'PUT' : 'POST',
    headers: getAdminHeaders(adminEmail),
    body: JSON.stringify(payload),
  });
};

export const patchAdminProperty = async (adminEmail: string, id: string, payload: Partial<PropertyPayload>) => {
  return requestJson<{ property: PropertyRecord }>(`/api/admin/properties/${id}`, {
    method: 'PATCH',
    headers: getAdminHeaders(adminEmail),
    body: JSON.stringify(payload),
  });
};

export const deleteAdminProperty = async (adminEmail: string, id: string) => {
  await requestJson(`/api/admin/properties/${id}`, {
    method: 'DELETE',
    headers: getAdminHeaders(adminEmail),
  });
};

export const getAdminInquiries = async (adminEmail: string) => {
  const data = await requestJson<{ inquiries: InquiryRecord[] }>('/api/admin/inquiries', {
    headers: getAdminHeaders(adminEmail),
  });
  return data.inquiries;
};

export const updateAdminInquiryStatus = async (adminEmail: string, id: string, status: InquiryStatus) => {
  return requestJson<{ inquiry: InquiryRecord }>(`/api/admin/inquiries/${id}`, {
    method: 'PATCH',
    headers: getAdminHeaders(adminEmail),
    body: JSON.stringify({ status }),
  });
};
