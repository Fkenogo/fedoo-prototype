import React from 'react';
import { 
  Compass, 
  Smartphone, 
  Monitor, 
  Building2, 
  Sparkles, 
  Layers, 
  RotateCcw, 
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react';
import { AppRoute, PrototypeScenario } from '../types';

interface PrototypeReviewBarProps {
  currentRoute: AppRoute;
  onRouteChange: (route: AppRoute) => void;
  currentScenario: PrototypeScenario;
  onScenarioChange: (scenario: PrototypeScenario) => void;
  participantViewMode: 'standalone' | 'phone';
  onParticipantViewModeChange: (mode: 'standalone' | 'phone') => void;
  onResetData: () => void;
  // REFERENCE ONLY: exposes the future-state Attention interaction inside the
  // Organisation Overview for prototype review. Default off; never production.
  showAttentionReference: boolean;
  onToggleAttentionReference: () => void;
}

export const PrototypeReviewBar: React.FC<PrototypeReviewBarProps> = ({
  currentRoute,
  onRouteChange,
  currentScenario,
  onScenarioChange,
  participantViewMode,
  onParticipantViewModeChange,
  onResetData,
  showAttentionReference,
  onToggleAttentionReference,
}) => {
  return (
    <aside aria-label="Prototype Evaluation Panel (reference only — not production)" className="bg-slate-950 text-white border-b border-slate-800 text-xs py-2 px-3 sm:px-6 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Prototype Identifier */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-mono text-[11px] font-semibold">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>FEDOO EXPERIENCE REFERENCE — PROTOTYPE</span>
          </div>
          <span className="hidden md:inline text-slate-400 text-[11px]">
            Scenario controls (REFERENCE) • Simulation data — not production
          </span>
        </div>

        {/* Center: Route Switcher */}
        <nav aria-label="Prototype Perspective Routes" className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800">
          <button
            onClick={() => onRouteChange('app')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              currentRoute === 'app'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Organisation App</span>
          </button>

          <button
            onClick={() => onRouteChange('setup')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              currentRoute === 'setup'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>First-Run Setup</span>
          </button>

          <button
            onClick={() => onRouteChange('feedback')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              currentRoute === 'feedback'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Customer Page</span>
          </button>

          <button
            onClick={() => onRouteChange('operator')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              currentRoute === 'operator'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Product Operations</span>
          </button>
        </nav>

        {/* Right: State Scenarios & Tools */}
        <div className="flex items-center gap-2">
          {/* Scenario selector */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 hidden lg:inline">Scenario:</span>
            <select
              value={currentScenario}
              onChange={(e) => onScenarioChange(e.target.value as PrototypeScenario)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-500"
            >
              <option value="multi-location">Multi-Location (Bubbles Café)</option>
              <option value="single-location">Single-Location SME (Corner Bistro)</option>
              <option value="empty-state">New Organisation (Zero Data)</option>
            </select>
          </div>

          {/* Device viewport toggle when in feedback view */}
          {currentRoute === 'feedback' && (
            <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5">
              <button
                onClick={() => onParticipantViewModeChange('standalone')}
                className={`p-1 rounded-md transition-colors ${
                  participantViewMode === 'standalone' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Full Responsive Web Page"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onParticipantViewModeChange('phone')}
                className={`p-1 rounded-md transition-colors ${
                  participantViewMode === 'phone' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Simulated Phone Frame"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Attention reference toggle (REFERENCE ONLY, Overview route) */}
          {currentRoute === 'app' && (
            <button
              onClick={onToggleAttentionReference}
              title="Show the future-state Attention interaction (reference only — non-authoritative, not for production adoption)"
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                showAttentionReference
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'text-slate-400 border-slate-700 hover:text-white hover:bg-slate-800'
              }`}
            >
              Attention ref: {showAttentionReference ? 'on' : 'off'}
            </button>
          )}

          {/* Reset button */}
          <button
            onClick={onResetData}
            title="Reset prototype to initial state"
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
