import React, { useState } from 'react';
import { 
  Building2, 
  ChevronDown, 
  MapPin, 
  Smartphone, 
  Globe, 
  Check, 
  User, 
  Settings, 
  LogOut,
  ShieldCheck,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { Location, Organisation } from '../types';

interface HeaderProps {
  organisation: Organisation;
  currentScope: string; // 'all' or locationId
  locations: Location[];
  onScopeChange: (scopeId: string) => void;
  onOpenCustomerView: () => void;
  onOpenSettings: () => void;
  primaryLanguage: 'en' | 'fr';
  onToggleLanguage: () => void;
  totalResponsesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  organisation,
  currentScope,
  locations,
  onScopeChange,
  onOpenCustomerView,
  onOpenSettings,
  primaryLanguage,
  onToggleLanguage,
  totalResponsesCount,
}) => {
  const [isScopeDropdownOpen, setIsScopeDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const activeLocation = locations.find((l) => l.id === currentScope);
  const isMultiLocation = locations.length > 1;

  const getScopeLabel = () => {
    if (currentScope === 'all') {
      return isMultiLocation 
        ? `All Locations (${locations.length})` 
        : locations[0]?.name || 'All Locations';
    }
    return activeLocation?.name || 'Selected Location';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-9 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand & Organisation Context */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center shadow-xs">
                F
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-sm tracking-tight">
                    {organisation.name}
                  </span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Live
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 hidden sm:block">
                  {organisation.businessType}
                </div>
              </div>
            </div>
          </div>

          {/* Scope Selector: First-Class Experience Primitive */}
          <div className="relative">
            <button
              onClick={() => setIsScopeDropdownOpen(!isScopeDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200/90 transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
              aria-expanded={isScopeDropdownOpen}
              aria-haspopup="listbox"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <div className="text-left">
                <span className="block font-bold text-slate-900 leading-tight">
                  {getScopeLabel()}
                </span>
                <span className="text-[10px] text-slate-500 font-normal leading-none">
                  {currentScope === 'all'
                    ? `${totalResponsesCount} total responses`
                    : `${activeLocation?.totalResponses || 0} responses`}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isScopeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Scope Dropdown Menu */}
            {isScopeDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setIsScopeDropdownOpen(false)} 
                />
                <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-30 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Viewing Scope
                  </div>

                  {isMultiLocation && (
                    <button
                      onClick={() => {
                        onScopeChange('all');
                        setIsScopeDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl text-left text-xs transition-colors flex items-center justify-between ${
                        currentScope === 'all'
                          ? 'bg-emerald-50 text-emerald-950 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${currentScope === 'all' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div>All Locations</div>
                          <div className="text-[11px] text-slate-400 font-normal">Entire organisation overview ({totalResponsesCount} responses)</div>
                        </div>
                      </div>
                      {currentScope === 'all' && <Check className="w-4 h-4 text-emerald-700" />}
                    </button>
                  )}

                  <div className="my-1 border-t border-slate-100" />

                  <div className="space-y-0.5">
                    {locations.map((loc) => {
                      const isSelected = currentScope === loc.id;
                      return (
                        <button
                          key={loc.id}
                          onClick={() => {
                            onScopeChange(loc.id);
                            setIsScopeDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 rounded-xl text-left text-xs transition-colors flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-950 font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                              <MapPin className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div>{loc.name}</div>
                              <div className="text-[11px] text-slate-400 font-normal">
                                {loc.totalResponses} responses • {loc.endpointsCount} feedback points
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-700" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Direct Customer View trigger */}
            <button
              onClick={onOpenCustomerView}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 rounded-xl text-xs font-semibold transition-colors"
              title="Open the customer feedback page for this location"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Test Customer Experience</span>
              <span className="sm:hidden">Test</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={onToggleLanguage}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors text-xs font-bold flex items-center gap-1"
              title="Toggle English / French standard phrasing"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase">{primaryLanguage}</span>
            </button>

            {/* Profile / Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 transition-colors"
                title="Account & Organisation Settings"
              >
                SK
              </button>

              {isProfileMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setIsProfileMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-30 text-xs animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900">Sarah Kamau</div>
                      <div className="text-[11px] text-slate-500">sarah@bubblescafe.ke</div>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Organisation Admin</div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenSettings();
                        }}
                        className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Organisation & Team Access</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100 px-3 py-1.5 text-[10px] text-slate-400">
                      Fedoo Service Feedback • Connected
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
