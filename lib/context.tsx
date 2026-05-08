'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { ProjectState, DEFAULT_PROJECT_STATE, ProjectScores } from '@/types/project';
import { computeAllScores } from './calculations';
import { saveActiveProject, saveProject } from './storage';

interface ProjectContextValue {
  state: ProjectState;
  scores: ProjectScores;
  updateState: (partial: Partial<ProjectState>) => void;
  goToStep: (step: number) => void;
  resetProject: () => void;
  saveCurrentProject: () => void;
  isViewing: boolean;
  setIsViewing: (v: boolean) => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

function createNewProject(): ProjectState {
  return {
    ...DEFAULT_PROJECT_STATE,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const EMPTY_SCORES: ProjectScores = {
  complexity: 0,
  complexityLabel: 'Simple',
  complexityColor: '#22c55e',
  risk: 0,
  riskLabel: 'Low',
  riskColor: '#22c55e',
  riskFlags: [],
  scopeHealth: 50,
  scopeHealthIssues: [],
  pricing: { minimum: 0, realistic: 0, premium: 0 },
  timeline: { discovery: 0, design: 0, development: 0, qa: 0, launch: 0, total: 0 },
};

export function ProjectProvider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: ProjectState;
}) {
  const [state, setState] = useState<ProjectState>(initialState ?? createNewProject());
  const [scores, setScores] = useState<ProjectScores>(EMPTY_SCORES);
  const [isViewing, setIsViewing] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setScores(computeAllScores(state));
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveActiveProject(state);
    }, 800);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state]);

  const updateState = useCallback((partial: Partial<ProjectState>) => {
    setState(prev => ({ ...prev, ...partial, updatedAt: new Date().toISOString() }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step, updatedAt: new Date().toISOString() }));
  }, []);

  const resetProject = useCallback(() => {
    setState(createNewProject());
  }, []);

  const saveCurrentProject = useCallback(() => {
    setState(prev => {
      const updated = { ...prev, updatedAt: new Date().toISOString() };
      saveProject(updated);
      return updated;
    });
  }, []);

  return (
    <ProjectContext.Provider value={{ state, scores, updateState, goToStep, resetProject, saveCurrentProject, isViewing, setIsViewing }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}
