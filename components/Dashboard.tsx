'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, Trash2, FileText, BookOpen, ShoppingCart, Users, Rocket, Sun, Moon, type LucideIcon } from 'lucide-react';
import { SavedProject, DEFAULT_PROJECT_STATE, ProjectState } from '@/types/project';
import { TEMPLATES, applyTemplate, Template } from '@/data/templates';
import { loadProjects, deleteProject } from '@/lib/storage';
import { PROJECT_TYPES } from '@/data/projectTypes';
import { useTheme } from '@/lib/themeContext';

const TEMPLATE_ICONS: Record<string, LucideIcon> = {
  FileText, BookOpen, ShoppingCart, Users, Rocket,
};

interface DashboardProps {
  onNewProject: () => void;
  onLoadProject: (state: ProjectState) => void;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function ProjectCard({ project, onLoad, onDelete }: {
  project: SavedProject;
  onLoad: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const ptLabel = PROJECT_TYPES.find(pt => pt.id === project.projectType)?.label ?? 'Unknown type';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] hover:border-white/[0.14] rounded-xl p-4 cursor-pointer transition-all duration-200"
      onClick={onLoad}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white/80 truncate">{project.name}</h3>
          <div className="text-[11px] text-white/60 mt-1">{ptLabel}</div>
          <div className="flex items-center gap-3 mt-2.5">
            <span className="text-[10px] text-white/60">{project.featureCount} features</span>
            <span className="text-[10px] text-white/25" aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-[10px] text-white/60">
              <Clock className="w-3 h-3" />
              {formatDate(project.updatedAt)}
            </span>
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); if (confirmDelete) { onDelete(); } else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 2500); } }}
          className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all duration-200 ml-2 flex-shrink-0 ${
            confirmDelete ? 'bg-[#7F2020]/20 text-[#9B3030]' : 'hover:bg-white/[0.06] text-white/60 hover:text-white/80'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function TemplateCard({ template, onApply }: { template: Template; onApply: () => void }) {
  const Icon: LucideIcon = TEMPLATE_ICONS[template.icon] ?? FileText;
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onApply}
      className="text-left bg-white/[0.03] hover:bg-white/[0.055] border border-white/[0.07] hover:border-white/[0.18] rounded-xl p-4 transition-all duration-200 h-full"
    >
      <div className="w-8 h-8 rounded-lg bg-[#7F2020]/20 flex items-center justify-center mb-3 border border-[#7F2020]/30">
        <Icon className="w-4 h-4 text-[#656656]" />
      </div>
      <div className="text-sm font-semibold text-white/80">{template.label}</div>
      <div className="text-[11px] text-white/60 mt-1 leading-snug">{template.description}</div>
    </motion.button>
  );
}

export function Dashboard({ onNewProject, onLoadProject }: DashboardProps) {
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setSavedProjects(loadProjects());
  }, []);

  const handleDelete = (id: string) => {
    deleteProject(id);
    setSavedProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleApplyTemplate = (template: Template) => {
    const state = applyTemplate(template);
    onLoadProject(state);
  };

  return (
    <div className="min-h-screen bg-bg-main flex flex-col">
      {/* Header */}
      <header className="border-b border-white/[0.06] px-8 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/flyscope-favicon.png" alt="FlyScope" className="w-8 h-8 rounded-lg" />
            <div>
              <div className="font-bold text-white tracking-tight text-sm">FlyScope</div>
              <div className="text-[10px] text-white/60 -mt-0.5">Project Scoping Tool</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-white/60 hover:text-white/80 transition-all duration-200"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onNewProject}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7F2020] hover:bg-[#9B3030] text-[#F6F3EB] font-medium text-sm shadow-lg shadow-[#7F2020]/25 hover:shadow-[#7F2020]/40 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              New Scope
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="px-8 py-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
            Scope projects<br />
            <span className="bg-gradient-to-r from-[#656656] to-[#586851] bg-clip-text text-transparent">with confidence.</span>
          </h1>
          <p className="text-white/55 text-base max-w-md mx-auto leading-relaxed">
            Answer a few questions about your project, get a pricing range grounded in your hourly rate, a phase-by-phase timeline, and an exportable scope document.
          </p>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-8 pb-12">
        <div className="max-w-5xl mx-auto space-y-10">

          {/* Templates */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white/65 uppercase tracking-widest">Start from a Template</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {TEMPLATES.map((template, i) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="h-full"
                >
                  <TemplateCard template={template} onApply={() => handleApplyTemplate(template)} />
                </motion.div>
              ))}
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: TEMPLATES.length * 0.06 }}
                whileTap={{ scale: 0.98 }}
                onClick={onNewProject}
                className="text-left bg-white/[0.02] hover:bg-white/[0.04] border border-dashed border-white/[0.1] hover:border-white/[0.2] rounded-xl p-4 transition-all duration-200 flex flex-col items-center justify-center text-center h-full"
              >
                <Plus className="w-6 h-6 text-white/55 mb-2" />
                <div className="text-xs text-white/60 font-medium">Blank Project</div>
              </motion.button>
            </div>
          </section>

          {/* Recent Projects */}
          {savedProjects.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white/65 uppercase tracking-widest">Recent Scopes</h2>
                <span className="text-xs text-white/60">{savedProjects.length} saved</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedProjects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onLoad={() => onLoadProject(project.state)}
                    onDelete={() => handleDelete(project.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {savedProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center py-8 space-y-1"
            >
              <div className="text-sm text-white/55">Your saved scopes will appear here.</div>
              <div className="text-xs text-white/30">Scopes are saved in your browser — clearing site data will remove them.</div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
