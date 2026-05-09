import { ProjectTypeData } from '@/types/project';

export const PROJECT_TYPES: ProjectTypeData[] = [
  {
    id: 'landing-page',
    label: 'Landing Page',
    description: 'Single page or 1 to 3 page site focused on one conversion goal.',
    icon: 'FileText',
    baseComplexity: 8,
    baseHours: 30,
    /** @deprecated Use baseHours. Will be removed in a future release. */
    basePrice: 3000,
    highlights: ['One conversion goal', 'Fast turnaround', 'Form or signup'],
  },
  {
    id: 'marketing-website',
    label: 'Marketing Website',
    description: 'Multi-page brand site, typically 5 to 12 pages, with CMS and lead capture.',
    icon: 'Globe',
    baseComplexity: 15,
    baseHours: 50,
    /** @deprecated Use baseHours. Will be removed in a future release. */
    basePrice: 5000,
    highlights: ['Multi-page CMS', 'SEO optimized', 'Lead capture'],
  },
  {
    id: 'ecommerce',
    label: 'Ecommerce',
    description: 'Full product catalog, cart, checkout, and order management.',
    icon: 'ShoppingCart',
    baseComplexity: 45,
    baseHours: 150,
    /** @deprecated Use baseHours. Will be removed in a future release. */
    basePrice: 15000,
    highlights: ['Product catalog', 'Payment processing', 'Inventory management'],
  },
  {
    id: 'membership-site',
    label: 'Membership Site',
    description: 'Gated content, subscriptions, and member management.',
    icon: 'Users',
    baseComplexity: 40,
    baseHours: 120,
    /** @deprecated Use baseHours. Will be removed in a future release. */
    basePrice: 12000,
    highlights: ['Member gating', 'Subscriptions', 'Profile management'],
  },
  {
    id: 'lms-courses',
    label: 'LMS / Courses',
    description: 'Online learning platform with courses, lessons, and progress tracking.',
    icon: 'BookOpen',
    baseComplexity: 50,
    baseHours: 180,
    /** @deprecated Use baseHours. Will be removed in a future release. */
    basePrice: 18000,
    highlights: ['Video lessons', 'Progress tracking', 'Certificates'],
  },
  {
    id: 'web-application',
    label: 'Web Application',
    description: 'Custom interactive tool with complex business logic and workflows.',
    icon: 'Monitor',
    baseComplexity: 55,
    baseHours: 200,
    /** @deprecated Use baseHours. Will be removed in a future release. */
    basePrice: 20000,
    highlights: ['Custom workflows', 'User roles', 'Data management'],
  },
  {
    id: 'saas-mvp',
    label: 'SaaS MVP',
    description: 'Minimum viable product for a software-as-a-service business.',
    icon: 'Rocket',
    baseComplexity: 60,
    baseHours: 250,
    /** @deprecated Use baseHours. Will be removed in a future release. */
    basePrice: 25000,
    highlights: ['Auth & billing', 'Dashboard', 'API integration'],
  },
  {
    id: 'website-redesign',
    label: 'Website Redesign',
    description: 'Full redesign of an existing site with migration and content transfer.',
    icon: 'RefreshCw',
    baseComplexity: 30,
    baseHours: 80,
    /** @deprecated Use baseHours. Will be removed in a future release. */
    basePrice: 8000,
    highlights: ['Design overhaul', 'Content migration', 'Performance boost'],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    description: 'Multi-vendor platform connecting buyers and sellers.',
    icon: 'Store',
    baseComplexity: 70,
    baseHours: 350,
    /** @deprecated Use baseHours. Will be removed in a future release. */
    basePrice: 35000,
    highlights: ['Vendor management', 'Commission system', 'Reviews'],
  },
  {
    id: 'internal-tool',
    label: 'Internal Tool',
    description: 'Internal dashboard, admin panel, or workflow automation tool.',
    icon: 'Settings',
    baseComplexity: 35,
    baseHours: 100,
    /** @deprecated Use baseHours. Will be removed in a future release. */
    basePrice: 10000,
    highlights: ['Role permissions', 'Data views', 'Process automation'],
  },
];
