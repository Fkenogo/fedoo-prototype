import React, { useState } from 'react';
import {
  MapPin,
  ChevronRight,
  QrCode,
  Clock,
  Plus,
} from 'lucide-react';
import { Location, Endpoint, FeedbackSession } from '../types';
import { resolveRecency } from '../utils/feedbackUtils';
import { AddLocationModal } from './AddLocationModal';

interface LocationsViewProps {
  locations: Location[];
  endpoints: Endpoint[];
  sessions: FeedbackSession[];
  onSelectLocation: (locId: string) => void;
  onCreateLocation: (location: Location) => void;
  // Gentle, non-blocking reminder when onboarding recorded more Locations.
  hasMoreLocationsHint?: boolean;
}

// Locations: where the Organisation delivers service. A Location is not a
// Feedback Point — each Location may have zero, one or several. Operational
// status is factual (Active / Inactive); evidence volume is shown separately.
export const LocationsView: React.FC<LocationsViewProps> = ({
  locations,
  endpoints,
  sessions,
  onSelectLocation,
  onCreateLocation,
  hasMoreLocationsHint = false,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Locations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Places where your Organisation delivers service and collects customer feedback.
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Each Location can have one or more Feedback Points.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="self-start sm:self-auto px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Location</span>
        </button>
      </div>

      {/* Multi-location reminder (non-blocking) */}
      {hasMoreLocationsHint && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            You mentioned you have more Locations. Add another Location when you're ready.
          </p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="shrink-0 px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:border-emerald-500 transition-colors"
          >
            Add Location
          </button>
        </div>
      )}

      <div className="space-y-3">
        {locations.map((loc) => {
          const locEndpoints = endpoints.filter((e) => e.locationId === loc.id);
          const activeCount = locEndpoints.filter((e) => e.status === 'active').length;
          const pausedCount = locEndpoints.length - activeCount;
          const locSessions = sessions.filter((s) => s.locationId === loc.id);
          const recency = resolveRecency([
            ...locEndpoints.map((e) => e.lastResponseAt),
            ...locSessions.map((s) => s.timestamp),
          ]);

          const operationalStatus = loc.status === 'inactive' ? 'Inactive' : 'Active';
          const hasEvidence = loc.totalResponses > 0;

          return (
            <div
              key={loc.id}
              onClick={() => onSelectLocation(loc.id)}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-600/50 hover:shadow-md transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                  <MapPin className="w-6 h-6" />
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {loc.name}
                    </h2>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        operationalStatus === 'Active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {operationalStatus}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">{loc.addressOrDetail}</p>

                  <div className="flex items-center gap-x-3 gap-y-1 text-xs text-slate-500 flex-wrap">
                    <span className="font-medium text-slate-700">
                      {locEndpoints.length} Feedback Point{locEndpoints.length === 1 ? '' : 's'}
                      {locEndpoints.length > 0 && (
                        <span className="text-slate-400 font-normal">
                          {' '}
                          · {activeCount} Active
                          {pausedCount > 0 ? ` · ${pausedCount} Paused` : ''}
                        </span>
                      )}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>{hasEvidence ? `${loc.totalResponses} responses` : 'No feedback yet'}</span>
                    {recency.kind === 'latest' && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Latest feedback {recency.label}
                        </span>
                      </>
                    )}
                    {recency.kind === 'recent' && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Recent feedback received
                        </span>
                      </>
                    )}
                  </div>

                  {loc.managerName && (
                    <div className="text-[11px] text-slate-400">Manager: {loc.managerName}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <span className="text-xs font-bold text-emerald-800 group-hover:text-emerald-950 flex items-center gap-0.5">
                  <span>View Location</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {isAddOpen && (
        <AddLocationModal onClose={() => setIsAddOpen(false)} onCreateLocation={onCreateLocation} />
      )}
    </div>
  );
};
