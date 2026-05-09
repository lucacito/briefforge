import { ProjectState, SavedProject, DEFAULT_PROJECT_STATE } from '@/types/project';
import { RateConfig, DEFAULT_RATE_CONFIG } from '@/types/rateConfig';

const PROJECTS_KEY = 'briefforge_projects';
const ACTIVE_KEY = 'briefforge_active';
const DEFAULT_RATE_KEY = 'briefforge_default_rate';

export function loadDefaultRate(): RateConfig {
  if (typeof window === 'undefined') return DEFAULT_RATE_CONFIG;
  try {
    const raw = localStorage.getItem(DEFAULT_RATE_KEY);
    return raw ? { ...DEFAULT_RATE_CONFIG, ...JSON.parse(raw) } : DEFAULT_RATE_CONFIG;
  } catch {
    return DEFAULT_RATE_CONFIG;
  }
}

export function saveDefaultRate(rate: RateConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEFAULT_RATE_KEY, JSON.stringify(rate));
}

export function migrateProject(raw: any): ProjectState {
  return {
    ...DEFAULT_PROJECT_STATE,
    ...raw,
    visitedSteps: Array.isArray(raw.visitedSteps) ? raw.visitedSteps : [],
    pricingOverride: raw.pricingOverride ?? { realistic: null },
    rateConfig: raw.rateConfig
      ? { ...DEFAULT_RATE_CONFIG, ...raw.rateConfig }
      : loadDefaultRate(),
  };
}

export function loadProjects(): SavedProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed: any[] = JSON.parse(raw);
    return parsed.map(p => ({ ...p, state: migrateProject(p.state) }));
  } catch {
    return [];
  }
}

export function saveProject(state: ProjectState): void {
  if (typeof window === 'undefined') return;
  const projects = loadProjects();
  const saved: SavedProject = {
    id: state.id,
    name: state.name,
    createdAt: state.createdAt,
    updatedAt: new Date().toISOString(),
    projectType: state.projectType,
    featureCount: state.features.length,
    state,
  };
  const idx = projects.findIndex(p => p.id === state.id);
  if (idx >= 0) projects[idx] = saved;
  else projects.unshift(saved);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects.slice(0, 20)));
}

export function deleteProject(id: string): void {
  if (typeof window === 'undefined') return;
  const projects = loadProjects().filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function loadActiveProject(): ProjectState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    return raw ? migrateProject(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveActiveProject(state: ProjectState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(state));
}

export function clearActiveProject(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACTIVE_KEY);
}
