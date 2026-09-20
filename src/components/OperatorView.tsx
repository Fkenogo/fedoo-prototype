import React, { useState } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  BookOpen,
  FlaskConical,
  Languages as LanguagesIcon,
  Compass,
  GitBranch,
  History as HistoryIcon,
  Stethoscope,
  ArrowLeft,
} from 'lucide-react';
import { Measure } from '../types';
import { buildProductOpsModel, OpsDraft } from '../data/productOpsData';
import {
  OpsOverview,
  MeasureLibrary,
  InstrumentsWorkspace,
  LanguagesWorkspace,
  SectorMapping,
  RecommendationsTemplates,
  ChangeHistory,
  Diagnostics,
  OpsSection,
} from './operator/OpsSections';

interface OperatorViewProps {
  measures: Measure[];
  onReturnToApp: () => void;
}

const NAV: { id: OpsSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'measure-library', label: 'Measure Library', icon: BookOpen },
  { id: 'instruments', label: 'Instruments', icon: FlaskConical },
  { id: 'languages', label: 'Languages', icon: LanguagesIcon },
  { id: 'sector-mapping', label: 'Sector & Context Mapping', icon: Compass },
  { id: 'recommendations', label: 'Recommendations & Templates', icon: GitBranch },
  { id: 'history', label: 'Change History', icon: HistoryIcon },
  { id: 'diagnostics', label: 'Diagnostics', icon: Stethoscope },
];

// Fedoo Product Operations — the internal control plane used to curate and
// maintain the governed product. Organisations operate within already-published
// capability; there is no Organisation approval queue here. Prototype
// mutations are experience-only and never touch Organisation session/history.
export const OperatorView: React.FC<OperatorViewProps> = ({ measures, onReturnToApp }) => {
  const [model, setModel] = useState(() => buildProductOpsModel(measures));
  const [activeSection, setActiveSection] = useState<OpsSection>('overview');

  const onCreateDraft = (draft: OpsDraft) =>
    setModel((prev) => ({ ...prev, drafts: [draft, ...prev.drafts] }));

  const onAdvanceDraft = (id: string) =>
    setModel((prev) => ({
      ...prev,
      drafts: prev.drafts.map((d) =>
        d.id === id
          ? { ...d, state: d.state === 'Draft' ? 'Review' : 'Published', updated: 'Just now' }
          : d
      ),
    }));

  const onUpdateDraftBody = (id: string, body: string) =>
    setModel((prev) => ({
      ...prev,
      drafts: prev.drafts.map((d) => (d.id === id ? { ...d, body } : d)),
    }));

  const onToggleDiagnostic = (id: string) =>
    setModel((prev) => ({
      ...prev,
      diagnostics: prev.diagnostics.map((d) =>
        d.id === id ? { ...d, resolved: !d.resolved } : d
      ),
    }));

  const onToggleDescriptor = (id: string) =>
    setModel((prev) => ({
      ...prev,
      descriptors: prev.descriptors.map((d) =>
        d.id === id ? { ...d, reviewed: !d.reviewed } : d
      ),
    }));

  const onToggleRecommendationMeasure = (
    mapId: string,
    measureId: string,
    kind: 'recommended' | 'alsoRelevant'
  ) =>
    setModel((prev) => ({
      ...prev,
      recommendations: prev.recommendations.map((rec) => {
        if (rec.id !== mapId) return rec;
        const list = rec[kind];
        const next = list.includes(measureId)
          ? list.filter((x) => x !== measureId)
          : [...list, measureId];
        return { ...rec, [kind]: next };
      }),
    }));

  const sectionProps = {
    model,
    onNavigate: setActiveSection,
    onCreateDraft,
    onAdvanceDraft,
    onUpdateDraftBody,
    onToggleDiagnostic,
    onToggleDescriptor,
    onToggleRecommendationMeasure,
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OpsOverview {...sectionProps} />;
      case 'measure-library':
        return <MeasureLibrary {...sectionProps} />;
      case 'instruments':
        return <InstrumentsWorkspace {...sectionProps} />;
      case 'languages':
        return <LanguagesWorkspace {...sectionProps} />;
      case 'sector-mapping':
        return <SectorMapping {...sectionProps} />;
      case 'recommendations':
        return <RecommendationsTemplates {...sectionProps} />;
      case 'history':
        return <ChangeHistory {...sectionProps} />;
      case 'diagnostics':
        return <Diagnostics {...sectionProps} />;
      default:
        return <OpsOverview {...sectionProps} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-5 pb-20">
      {/* Operator shell top bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight">Fedoo Product Operations</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                  Internal control plane — prototype
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Curate the governed catalogue centrally. Organisations use published capability
                directly — no approval queue.
              </p>
            </div>
          </div>

          <button
            onClick={onReturnToApp}
            className="self-start sm:self-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Organisation View</span>
          </button>
        </div>
      </div>

      {/* Section navigation */}
      <div className="bg-slate-900/95 rounded-2xl border border-slate-800 p-1.5 overflow-x-auto">
        <nav className="flex items-center gap-1 min-w-max" aria-label="Product Operations sections">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Workspace */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-4 sm:p-6">
        {renderSection()}
      </div>

      <p className="text-[10px] text-slate-400 text-center">
        Prototype experience reference. Operational states, mappings, drafts and diagnostics are
        illustrative and do not define Product Truth.
      </p>
    </div>
  );
};
