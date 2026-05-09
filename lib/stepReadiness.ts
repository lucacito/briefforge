import { ProjectState } from '@/types/project';

export interface StepReadiness {
  ready: boolean;
  prerequisite: string;
}

export function getStepReadiness(state: ProjectState, stepIndex: number): StepReadiness {
  if (stepIndex === 6 || stepIndex === 7) {
    if (!state.projectType) {
      return { ready: false, prerequisite: 'Select a project type first (Step 1) to generate estimates.' };
    }
    if (state.features.length === 0) {
      return { ready: false, prerequisite: 'Add at least one feature (Step 2) so estimates have something to work with.' };
    }
  }
  return { ready: true, prerequisite: '' };
}
