export type Service = {
  index: string;
  title: string;
  slug: string;
  description: string;
};

export type FeaturedProperty = {
  id: number;
  title: string;
  location: string;
  price: string;
  tag: string;
  image: string;
  large?: boolean;
};

export type LocationArea = {
  name: string;
  subAreas?: string[];
};

export type AmenityOption = {
  label: string;
  icon: 'clubhouse' | 'gym' | 'pool-table' | 'play-area' | 'parking' | 'security' | 'garden' | 'lift' | 'power' | 'pool';
};

export const propertyTypeOptions = [
  'Residential Purchase',
  'Residential Rent',
  'Commercial Spaces',
  'Under Construction',
] as const;

export const bhkOptions = [
  '1 BHK',
  '2 BHK',
  '3 BHK',
  '4 BHK+',
] as const;

export const getPropertyTypeLabel = (type: string) => {
  if (type === 'Flat' || type === 'Villa') return 'Residential Purchase';
  if (type === 'Office') return 'Commercial Spaces';
  return type;
};

export const services: Service[] = [
  {
    index: '01',
    title: 'Property Acquisition',
    slug: 'property-acquisition',
    description:
      'Our relationship managers leverage extensive local networks to find off-market premium properties tailored to your exact lifestyle and investment requirements.',
  },
  {
    index: '02',
    title: 'Strategic Sales',
    slug: 'strategic-sales',
    description:
      'We position your property to attract qualified buyers through high-end editorial marketing, ensuring maximum value with total discretion.',
  },
  {
    index: '03',
    title: 'Commercial Leasing',
    slug: 'commercial-leasing',
    description:
      'Comprehensive advisory for businesses seeking prime retail or office spaces near W.E. Highway and other high-footfall corridors across the Western Suburbs.',
  },
];

export const featuredProperties: FeaturedProperty[] = [
  {
    id: 1,
    title: 'The Crown Penthouse',
    location: 'Vasant Marvel Complex, Borivali',
    price: '₹8.5 Cr',
    tag: 'For Sale',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000',
    large: true,
  },
  {
    id: 2,
    title: 'Ocean View Villa',
    location: 'Kandivali West',
    price: '₹12.0 Cr',
    tag: 'Premium',
    image: 'https://images.unsplash.com/photo-1600607687931-cebfad2114ce?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 3,
    title: 'Modern Duplex',
    location: 'Magathane Metro, Borivali',
    price: '₹4.2 Cr',
    tag: 'New Launch',
    image: 'https://images.unsplash.com/photo-1600566753086-00f18efc2291?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 4,
    title: 'Corporate HQ',
    location: 'W.E. Highway',
    price: '₹25.0 Cr',
    tag: 'Commercial',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 5,
    title: 'Skyline Apartment',
    location: 'Borivali East',
    price: '₹2.8 Cr',
    tag: 'For Sale',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
  },
];

export const propertyPlaceholderSections = [
  {
    title: 'Resale Properties',
    className: 'assured',
  },
  {
    title: 'Under Construction Properties',
    className: 'fast-selling',
  },
] as const;

export const westernSuburbAreas: LocationArea[] = [
  { name: 'Bandra', subAreas: ['West', 'East'] },
  { name: 'Khar' },
  { name: 'Santacruz' },
  { name: 'Vile Parle' },
  { name: 'Andheri', subAreas: ['East', 'West'] },
  { name: 'Jogeshwari' },
  { name: 'Goregaon' },
  { name: 'Malad' },
  { name: 'Kandivali' },
  { name: 'Borivali' },
  { name: 'Dahisar' },
];

export const locationGroups: Record<string, LocationArea[]> = {
  'Western Suburbs': westernSuburbAreas,
};

export const amenityOptions: AmenityOption[] = [
  { label: 'Clubhouse', icon: 'clubhouse' },
  { label: 'Gym', icon: 'gym' },
  { label: 'Pool Table', icon: 'pool-table' },
  { label: "Children's Play Area", icon: 'play-area' },
  { label: 'Parking', icon: 'parking' },
  { label: '24x7 Security', icon: 'security' },
  { label: 'Garden', icon: 'garden' },
  { label: 'Lift', icon: 'lift' },
  { label: 'Power Backup', icon: 'power' },
  { label: 'Swimming Pool', icon: 'pool' },
];

export const serviceDetails = {
  'property-acquisition': {
    eyebrow: 'Property Acquisition',
    title: 'Find the right property with private, end-to-end advisory.',
    summary:
      'A guided acquisition service for buyers who want verified options, local insight, and confident negotiation support.',
  },
  'strategic-sales': {
    eyebrow: 'Strategic Sales',
    title: 'Position your property for stronger, more qualified demand.',
    summary:
      'A discreet sales process built around pricing strategy, premium presentation, buyer qualification, and closing support.',
  },
  'commercial-leasing': {
    eyebrow: 'Commercial Leasing',
    title: 'Secure commercial spaces that match your business priorities.',
    summary:
      'Advisory for retail, office, and high-street leasing across Western Suburbs corridors with practical market intelligence.',
  },
} as const;

export const serviceProcessSteps = [
  'Understand goals, timelines, budget, and preferred locations.',
  'Create a curated shortlist using verified listings and local relationships.',
  'Coordinate visits, comparisons, pricing context, and due diligence.',
  'Negotiate terms and support documentation through closure.',
];

export const caseStudies = [
  {
    title: 'Family Upgrade in Borivali',
    result: 'Shortlisted 12 options into 3 strong matches and closed within 21 days.',
  },
  {
    title: 'Premium Seller Mandate',
    result: 'Repositioned the property and brought qualified buyer interest within two weeks.',
  },
  {
    title: 'Retail Lease Search',
    result: 'Identified a high-visibility location with better footfall and rental efficiency.',
  },
];

export const serviceFaqs = [
  {
    question: 'Do you only work with premium properties?',
    answer:
      'We focus on well-matched requirements across residential and commercial segments, with extra care around verification and fit.',
  },
  {
    question: 'Can you help with documentation?',
    answer:
      'Yes. We coordinate with the right professionals and keep the process organized from offer to handover.',
  },
  {
    question: 'How soon can consultations begin?',
    answer:
      'Most consultations can begin within one working day after we receive the basic requirement details.',
  },
];
