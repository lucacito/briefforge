export type ProjectTypeId =
  | 'marketing-website'
  | 'ecommerce'
  | 'membership-site'
  | 'lms-courses'
  | 'web-application'
  | 'saas-mvp'
  | 'website-redesign'
  | 'marketplace'
  | 'internal-tool';

export type ContentReadiness = 'ready' | 'partial' | 'none';
export type CopywritingLevel = 'none' | 'light' | 'full';
export type ImageAssets = 'provided' | 'partial' | 'stock' | 'full-art';
export type BrandingLevel = 'existing' | 'partial' | 'full';
export type MigrationLevel = 'none' | 'simple' | 'full';
export type ApprovalLayers = 'direct' | 'manager' | 'committee';
export type CommunicationStyle = 'async' | 'weekly' | 'frequent';
export type BrowserSupport = 'modern' | 'legacy';
export type HostingResponsibility = 'client' | 'agency' | 'undecided';
export type ComplianceType = 'gdpr' | 'accessibility' | 'legal-review' | 'hipaa' | 'enterprise-security';

export interface ProjectState {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  currentStep: number;

  // Step 1
  projectType: ProjectTypeId | null;

  // Step 2
  features: string[];

  // Step 3
  contentReadiness: ContentReadiness;
  copywriting: CopywritingLevel;
  imageAssets: ImageAssets;
  branding: BrandingLevel;
  migration: MigrationLevel;
  seoMigration: boolean;

  // Step 4
  integrations: string[];
  externalSystems: number;

  // Step 5
  stakeholders: number;
  approvalLayers: ApprovalLayers;
  revisionRounds: number;
  communicationStyle: CommunicationStyle;
  trainingRequired: boolean;
  documentationRequired: boolean;

  // Step 6
  deadlineUrgency: number;
  compliance: ComplianceType[];
  browserSupport: BrowserSupport;
  hostingResponsibility: HostingResponsibility;
  maintenanceNeeded: boolean;
}

export interface ProjectTypeData {
  id: ProjectTypeId;
  label: string;
  description: string;
  icon: string;
  baseComplexity: number;
  basePrice: number;
  highlights: string[];
}

export interface FeatureData {
  id: string;
  label: string;
  description: string;
  complexityPoints: number;
  timelineImpact: number;
  category: string;
}

export interface IntegrationData {
  id: string;
  label: string;
  complexityPoints: number;
  category: string;
}

export interface PricingEstimate {
  minimum: number;
  realistic: number;
  premium: number;
}

export interface TimelineBreakdown {
  discovery: number;
  design: number;
  development: number;
  qa: number;
  launch: number;
  total: number;
}

export interface RiskFlag {
  id: string;
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ScopeHealthIssue {
  id: string;
  label: string;
}

export interface ProjectScores {
  complexity: number;
  complexityLabel: string;
  complexityColor: string;
  risk: number;
  riskLabel: string;
  riskColor: string;
  riskFlags: RiskFlag[];
  scopeHealth: number;
  scopeHealthIssues: ScopeHealthIssue[];
  pricing: PricingEstimate;
  timeline: TimelineBreakdown;
}

export interface SavedProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  projectType: ProjectTypeId | null;
  featureCount: number;
  state: ProjectState;
}

export const DEFAULT_PROJECT_STATE: ProjectState = {
  id: '',
  name: 'Untitled Project',
  createdAt: '',
  updatedAt: '',
  currentStep: 0,
  projectType: null,
  features: [],
  contentReadiness: 'partial',
  copywriting: 'none',
  imageAssets: 'partial',
  branding: 'existing',
  migration: 'none',
  seoMigration: false,
  integrations: [],
  externalSystems: 0,
  stakeholders: 2,
  approvalLayers: 'direct',
  revisionRounds: 2,
  communicationStyle: 'weekly',
  trainingRequired: false,
  documentationRequired: false,
  deadlineUrgency: 30,
  compliance: [],
  browserSupport: 'modern',
  hostingResponsibility: 'client',
  maintenanceNeeded: false,
};
