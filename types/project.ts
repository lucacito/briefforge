import { RateConfig, DEFAULT_RATE_CONFIG } from './rateConfig';
export type { RateConfig };
export { DEFAULT_RATE_CONFIG };

// ── Scope editing ─────────────────────────────────────────────────────────────

export interface ScopeItem {
  id: string;
  text: string;
  source: 'generated' | 'user';
  hidden?: boolean;
}

export interface EditableRisk {
  id: string;
  label: string;
  clientLabel: string;
  description: string;
  mitigation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: 'generated' | 'user';
  hidden?: boolean;
}

export interface CustomLineItem {
  id: string;
  label: string;
  hours: number;
  category: 'feature' | 'integration' | 'content' | 'other';
}

export interface ScopeEdits {
  deliverables: ScopeItem[];
  assumptions: ScopeItem[];
  exclusions: ScopeItem[];
  risks: EditableRisk[];
  customLineItems: CustomLineItem[];
  nextSteps: ScopeItem[];
  executiveSummaryOverride: string | null;
  scopeNotes: string;
}

export const DEFAULT_SCOPE_EDITS: ScopeEdits = {
  deliverables: [],
  assumptions: [],
  exclusions: [],
  risks: [],
  customLineItems: [],
  nextSteps: [],
  executiveSummaryOverride: null,
  scopeNotes: '',
};

// ── Project type ──────────────────────────────────────────────────────────────

export type ProjectTypeId =
  | 'landing-page'
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

  // Meta
  clientName: string;
  visitedSteps: number[];
  pricingOverride: { realistic: number | null };
  rateConfig: RateConfig;
  scopeEdits: ScopeEdits;
}

export interface ProjectTypeData {
  id: ProjectTypeId;
  label: string;
  description: string;
  icon: string;
  baseComplexity: number;
  baseHours: number;
  /** @deprecated Use baseHours. Will be removed in a future release. */
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
  pricingSource: 'computed' | 'override';
}

export interface ScoreBreakdown {
  complexity: Array<{ source: string; points: number }>;
  pricing: {
    baseHours: number;
    featureHours: number;
    integrationHours: number;
    contentHours: number;
    migrationHours: number;
    complianceHours: number;
    customHours: number;
    overheadMultiplier: number;
    urgencyMultiplier: number;
    totalHours: number;
    hourlyRate: number;
  };
  timeline: Array<{ phase: string; weeks: number; reason: string }>;
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
  clientLabel: string;
  description: string;
  mitigation: string;
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
  breakdown: ScoreBreakdown;
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
  contentReadiness: 'ready',
  copywriting: 'none',
  imageAssets: 'provided',
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
  clientName: '',
  visitedSteps: [],
  pricingOverride: { realistic: null },
  rateConfig: DEFAULT_RATE_CONFIG,
  scopeEdits: DEFAULT_SCOPE_EDITS,
};
