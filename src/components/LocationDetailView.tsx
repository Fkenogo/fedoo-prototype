import React from 'react';
import {
  ArrowLeft,
  MapPin,
  QrCode,
  ChevronRight,
  Plus,
  MessageSquare,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { Location, Endpoint, Measure, FeedbackSession } from '../types';
import { resolveRecency, channelLabel } from '../utils/feedbackUtils';

interface LocationDetailViewProps {
  location: Location;
  endpoints: Endpoint[];
  measures: Measure[];
  recentSessions: FeedbackSession[];
  onBack: () => void;
  onSelectEndpoint: (epId: string) => void;
  onCreateFeedbackPoint: () => void;
  onViewActivity: () => void;
  onViewLocationOverview?: () => void;
}

// Location detail summarises one Location and links outward. It is not another
// Overview and does not reproduce the Signals dashboard.
export const LocationDetailView: React.FC<LocationDetailViewProps> = ({
  location,
  endpoints,
  measures,
  recentSessions,
  onBack,
  onSelectEndpoint,
  onCreateFeedbackPoint,
  onViewActivity,
  onViewLocationOverview,
}) => {
  const locEndpoints = endpoints.filter((e) => e.locationId === location.id);
  const locSessions = recentSessions.filter((s) => s.locationId === location.id);

  const activeMeasureIds = Array.from(new Set(locEndpoints.flatMap((e) => e.activeMeasureIds)));
  const activeMeasures = measures.filter((m) => activeMeasureIds.includes(m.id));

  const recency = resolveRecency([
    ...locEndpoints.map((e) => e.lastResponseAt),
    ...locSessions.map((s) => s.timestamp),
  ]);

  const operationalStatus = location.status === 'inactive' ? 'Inactive' : 'Active';
  const commentSessions = locSessions.filter((s) => s.optionalComment).slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Locations</span>
      </button>

      {/* Identity */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3">
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
            operationalStatus === 'Active'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${operationalStatus === 'Active' ? 'bg-emerald-600' : 'bg-slate-400'}`} />
          {operationalStatus}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {location.name}
        </h1>
        <p className="text-sm text-slate-600 flex items-center gap-1.5 flex-wrap">
          <MapPin className="w-3.5 h-3.5 text-emerald-700" />
          <span>{location.addressOrDetail}</span>
          {location.managerName && (
            <>
              <span className="text-slate-300">•</span>
              <span>
                Manager: <strong className="font-semibold">{location.managerName}</strong>
              </span>
            </>
          )}
        </p>
      </div>

      {/* Feedback collection */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Feedback collection</h2>
            <p className="text-xs text-slate-500 mt-0.5">Feedback Points at this Location.</p>
          </div>
          {locEndpoints.length > 0 && (
            <button
              onClick={onCreateFeedbackPoint}
              className="shrink-0 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Feedback Point</span>
            </button>
          )}
        </div>

        {locEndpoints.length === 0 ? (
          <div className="text-center py-8">
            <QrCode className="w-9 h-9 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-900">No Feedback Points yet</div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Set one up so customers can share feedback at this Location.
            </p>
            <button
              onClick={onCreateFeedbackPoint}
              className="mt-4 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Feedback Point</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {locEndpoints.map((ep) => (
              <button
                key={ep.id}
                onClick={() => onSelectEndpoint(ep.id)}
                className="w-full text-left p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-600/40 hover:bg-slate-100/70 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                    {ep.humanName}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {ep.status === 'active' ? 'Active' : 'Paused'} · {ep.totalResponses} response
                    {ep.totalResponses === 1 ? '' : 's'} · Tracks {ep.activeMeasureIds.length} area
                    {ep.activeMeasureIds.length === 1 ? '' : 's'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Customer feedback summary */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Customer feedback</h2>
          {onViewLocationOverview && (
            <button
              onClick={onViewLocationOverview}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 shrink-0"
            >
              <span>View Location Overview</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Fact label="Responses" value={String(location.totalResponses)} />
          <Fact label="Feedback Points" value={String(locEndpoints.length)} />
          <Fact label="Areas tracked" value={String(activeMeasures.length)} />
          <Fact
            label="Latest activity"
            value={
              recency.kind === 'latest'
                ? recency.label || '—'
                : recency.kind === 'recent'
                ? 'Recent'
                : 'No feedback yet'
            }
          />
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <h2 className="text-base font-bold text-slate-900">Recent activity</h2>
          </div>
          <button
            onClick={onViewActivity}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            <span>View all activity</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {commentSessions.length > 0 ? (
          <div className="space-y-2">
            {commentSessions.map((s) => {
              const ep = endpoints.find((e) => e.id === s.endpointId);
              return (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 text-slate-500 flex-wrap">
                    <span className="font-semibold text-slate-800">
                      {ep?.humanName || 'Feedback Point'} · {channelLabel(s.channel)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" />
                      {s.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium italic leading-relaxed">
                    "{s.optionalComment}"
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic py-2">
            No customer comments yet at this Location.
          </div>
        )}
      </div>
    </div>
  );
};

const Fact: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
    <div className="text-lg font-black text-slate-900 leading-tight truncate">{value}</div>
    <div className="text-[10px] text-slate-500 font-medium mt-0.5">{label}</div>
  </div>
);
