import { Suspense } from 'react';
import { SharedView } from './SharedView';

export const metadata = {
  title: 'Project Scope — FlyScope',
  description: 'Shared project scope document',
};

export default function SharedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D0906] flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading scope…</div>
      </div>
    }>
      <SharedView />
    </Suspense>
  );
}
