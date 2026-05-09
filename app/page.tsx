'use client';

import { useState, useEffect } from 'react';
import { ProjectState, DEFAULT_PROJECT_STATE } from '@/types/project';
import { ProjectProvider } from '@/lib/context';
import { loadActiveProject, loadDefaultRate, loadProjects, hasDefaultRate, migrateStorageKeys } from '@/lib/storage';
import { Dashboard } from '@/components/Dashboard';
import { WizardShell } from '@/components/WizardShell';
import { Onboarding } from '@/components/Onboarding';

function createNewProject(): ProjectState {
  return {
    ...DEFAULT_PROJECT_STATE,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rateConfig: loadDefaultRate(),
    visitedSteps: [],
    pricingOverride: { realistic: null },
  };
}

export default function Home() {
  const [activeProject, setActiveProject] = useState<ProjectState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    migrateStorageKeys();
    const saved = loadActiveProject();
    if (saved) {
      setActiveProject(saved);
    } else if (!loadProjects().length && !hasDefaultRate()) {
      setShowOnboarding(true);
    }
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#7F2020]/30 border-t-[#7F2020] rounded-full animate-spin" />
      </div>
    );
  }

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  if (!activeProject) {
    return (
      <Dashboard
        onNewProject={() => setActiveProject(createNewProject())}
        onLoadProject={state => setActiveProject(state)}
      />
    );
  }

  return (
    <ProjectProvider initialState={activeProject}>
      <WizardShell onDashboard={() => setActiveProject(null)} />
    </ProjectProvider>
  );
}
