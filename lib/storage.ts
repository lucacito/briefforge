import { ProjectState, SavedProject } from '@/types/project';

const PROJECTS_KEY = 'briefforge_projects';
const ACTIVE_KEY = 'briefforge_active';

export function loadProjects(): SavedProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
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
    return raw ? JSON.parse(raw) : null;
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
