import React from 'react';
import { 
  Building2, 
  MapPin, 
  QrCode, 
  Sparkles, 
  SlidersHorizontal, 
  Globe, 
  ShieldCheck,
  ChevronDown,
  Smartphone
} from 'lucide-react';
import { Location } from '../types';

interface HeaderProps {
  currentScope: string; // 'all' or locationId
  locations: Location[];
  onScopeChange: (scope: string) => void;
  activeAppMode: 'organisation' | 'first-run' | 'operator';
  onAppModeChange: (mode: 'organisation' | 'first-run' | 'operator') => void;
  onOpenParticipantView: () => void;
  primaryLanguage: 'en' | 'fr';
  onToggleLanguage: () => void;
  totalResponsesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentScope,
  locations,
  onScopeChange,
  activeAppMode,
  onAppModeChange,
  onOpenParticipantView,
  primaryLanguage,
  onToggleLanguage,
  totalResponsesCount,
}) => {
  const [scopeDropdownOpen, setScopeDropdownOpen] = React.useState(false);
  const activeLocation = locations.find(l => l.id === currentScope);

  const scopeLabel = currentScope === 'all' 
    ? `All Locations (${locations.length})` 
    : activeLocation?.name || 'Selected Location';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Prototype Context Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            EXPERIENCE REFERENCE
          </span>
          <span className="text-slate-400 hidden sm:inline">
            Prototype establishing Fedoo product shell, persistent doorways & service signals.
          </span>
        </div>

        {/* Prototype Perspectives switcher */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-0.5 rounded-md border border-slate-700">
          <button
            onClick={() => onAppModeChange('organisation')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              activeAppMode === 'organisation' 
                ? 'bg-slate-700 text-white shadow-xs' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Organisation App
          </button>
          <button
            onClick={() => onAppModeChange('first-run')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
              activeAppMode === 'first-run' 
                ? 'bg-slate-700 text-white shadow-xs' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            First-Run Journey
          </button>
          <button
            onClick={() => onAppModeChange('operator')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
              activeAppMode === 'operator' 
                ? 'bg-slate-700 text-white shadow-xs' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            Fedoo Platform Operator
          </button>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand and Scope Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold tracking-tight text-lg shadow-sm">
              F
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-slate-900">Fedoo</span>
                <span className="text-xs text-slate-500 font-normal">/ Bubbles Café</span>
              </div>
              <div className="text-[11px] text-slate-500">Hospitality & Dining</div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Scope Dropdown */}
          <div className="relative">
            <button
              onClick={() => setScopeDropdownOpen(!scopeDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-xs font-semibold text-slate-800 transition-colors border border-slate-200/70"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span className="max-w-[140px] sm:max-w-xs truncate">{scopeLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {scopeDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setScopeDropdownOpen(false)} 
                />
                <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    Service Scope
                  </div>
                  <button
                    onClick={() => {
                      onScopeChange('all');
                      setScopeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                      currentScope === 'all' ? 'bg-emerald-50/60 font-semibold text-emerald-900' : 'text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      All Locations (Organisation Overview)
                    </span>
                    <span className="text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {locations.reduce((acc, l) => acc + l.totalResponses, 0)}
                    </span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        onScopeChange(loc.id);
                        setScopeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                        currentScope === loc.id ? 'bg-emerald-50/60 font-semibold text-emerald-900' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-slate-800">{loc.name}</div>
                        <div className="text-[10px] text-slate-500">{loc.addressOrDetail}</div>
                      </div>
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {loc.totalResponses}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2.5">
          {/* Evidence counter badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full text-xs text-slate-600 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span><strong className="font-semibold text-slate-800">{totalResponsesCount}</strong> responses collected</span>
          </div>

          {/* Language toggle */}
          <button
            onClick={onToggleLanguage}
            title="Switch Language"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium uppercase">{primaryLanguage}</span>
          </button>

          {/* Test Participant Experience button */}
          <button
            onClick={onOpenParticipantView}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow-sm transition-all active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Test Customer Feedback</span>
          </button>
        </div>
      </div>
    </header>
  );
};
