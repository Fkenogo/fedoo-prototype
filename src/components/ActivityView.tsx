import React, { useMemo, useState } from 'react';
import {
  MessageSquare,
  Search,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  QrCode,
} from 'lucide-react';
import { FeedbackSession, Location, Endpoint, Measure } from '../types';
import { recencyMinutes, channelLabel } from '../utils/feedbackUtils';

interface ActivityViewProps {
  sessions: FeedbackSession[];
  locations: Location[];
  endpoints: Endpoint[];
  measures: Measure[];
  currentScope: string;
  scopeLocationName: string;
  // Founder review tooling: force the genuine no-activity state.
  forceEmpty?: boolean;
  onViewFeedbackPoints?: () => void;
  onTestAsCustomer?: () => void;
}

export interface ActivityFilters {
  commentsOnly: boolean;
  searchQuery: string;
  locationId: string;
  endpointId: string;
  channel: string;
}

// Orders sessions newest-first only when every timestamp can be reliably
// ordered; otherwise keeps fixture order without claiming chronology.
export function orderSessionsNewestFirst(sessions: FeedbackSession[]): FeedbackSession[] {
  const orderable = sessions.every((s) => recencyMinutes(s.timestamp) !== null);
  if (!orderable) return sessions;
  return [...sessions].sort(
    (a, b) => (recencyMinutes(a.timestamp) as number) - (recencyMinutes(b.timestamp) as number)
  );
}

// Applies the lightweight Activity filters. Search covers customer comments,
// visible response labels, and question/Measure display names.
export function applyActivityFilters(
  sessions: FeedbackSession[],
  measures: Measure[],
  filters: ActivityFilters
): FeedbackSession[] {
  return sessions.filter((s) => {
    if (filters.commentsOnly && !s.optionalComment) return false;
    if (filters.locationId !== 'all' && s.locationId !== filters.locationId) return false;
    if (filters.endpointId !== 'all' && s.endpointId !== filters.endpointId) return false;
    if (filters.channel !== 'all' && s.channel !== filters.channel) return false;
    const q = filters.searchQuery.trim().toLowerCase();
    if (q) {
      const matchComment = s.optionalComment?.toLowerCase().includes(q);
      const matchAnswer = s.answers.some((a) => {
        const m = measures.find((item) => item.id === a.measureId);
        return (
          a.selectedValue.toLowerCase().includes(q) ||
          (m?.name || a.questionText).toLowerCase().includes(q)
        );
      });
      return Boolean(matchComment || matchAnswer);
    }
    return true;
  });
}

// Customer Activity is the detailed session/event feed: what came in, when,
// from where, through which Feedback Point, and what was answered. It does not
// interpret responses — no favourable %, movement, benchmarks or trends.
export const ActivityView: React.FC<ActivityViewProps> = ({
  sessions,
  locations,
  endpoints,
  measures,
  currentScope,
  scopeLocationName,
  forceEmpty = false,
  onViewFeedbackPoints,
  onTestAsCustomer,
}) => {
  const [commentsOnly, setCommentsOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterEndpoint, setFilterEndpoint] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const scopedSessions = useMemo<FeedbackSession[]>(
    () =>
      forceEmpty
        ? []
        : currentScope === 'all'
        ? sessions
        : sessions.filter((s) => s.locationId === currentScope),
    [sessions, currentScope, forceEmpty]
  );

  const orderedSessions = useMemo(
    () => orderSessionsNewestFirst(scopedSessions),
    [scopedSessions]
  );

  const scopedEndpoints = currentScope === 'all'
    ? endpoints
    : endpoints.filter((e) => e.locationId === currentScope);

  const endpointOptions = filterLocation === 'all'
    ? scopedEndpoints
    : scopedEndpoints.filter((e) => e.locationId === filterLocation);

  const channelOptions: string[] = Array.from(
    new Set(scopedSessions.map((s) => s.channel as string))
  );

  const filteredSessions = applyActivityFilters(orderedSessions, measures, {
    commentsOnly,
    searchQuery,
    locationId: filterLocation,
    endpointId: filterEndpoint,
    channel: filterChannel,
  });

  const hasAnyInScope = scopedSessions.length > 0;
  const hasActiveFilters =
    commentsOnly ||
    filterLocation !== 'all' ||
    filterEndpoint !== 'all' ||
    filterChannel !== 'all' ||
    searchQuery.trim().length > 0;

  const clearFilters = () => {
    setCommentsOnly(false);
    setSearchQuery('');
    setFilterLocation('all');
    setFilterEndpoint('all');
    setFilterChannel('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Customer Activity
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Feedback received across <span className="font-semibold text-slate-700">{scopeLocationName}</span>.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search activity"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCommentsOnly((v) => !v)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            commentsOnly
              ? 'bg-emerald-700 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Comments only</span>
        </button>

        {currentScope === 'all' && (
          <select
            value={filterLocation}
            onChange={(e) => {
              setFilterLocation(e.target.value);
              setFilterEndpoint('all');
            }}
            className="bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
            aria-label="Filter by Location"
          >
            <option value="all">All Locations</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        )}

        <select
          value={filterEndpoint}
          onChange={(e) => setFilterEndpoint(e.target.value)}
          className="bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
          aria-label="Filter by Feedback Point"
        >
          <option value="all">All Feedback Points</option>
          {endpointOptions.map((ep) => (
            <option key={ep.id} value={ep.id}>
              {ep.humanName}
            </option>
          ))}
        </select>

        {channelOptions.length > 1 && (
          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
            aria-label="Filter by channel"
          >
            <option value="all">All channels</option>
            {channelOptions.map((ch) => (
              <option key={ch} value={ch}>
                {channelLabel(ch)}
              </option>
            ))}
          </select>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {filteredSessions.map((session) => {
          const loc = locations.find((l) => l.id === session.locationId);
          const ep = endpoints.find((e) => e.id === session.endpointId);
          const isExpanded = expandedId === session.id;
          const visibleAnswers = isExpanded ? session.answers : session.answers.slice(0, 3);
          const hiddenCount = session.answers.length - visibleAnswers.length;

          return (
            <div
              key={session.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    {loc?.name || 'Location'}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="font-medium text-slate-700">
                    {ep?.humanName || 'Feedback Point'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{session.timestamp}</span>
                  <span className="text-slate-300">·</span>
                  <span>{channelLabel(session.channel)}</span>
                </div>
              </div>

              {/* Customer comment */}
              {session.optionalComment && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>Customer comment</span>
                  </div>
                  <p className="text-slate-800 font-medium italic leading-relaxed">
                    "{session.optionalComment}"
                  </p>
                </div>
              )}

              {/* Answers (neutral) */}
              <div className="flex flex-wrap gap-2">
                {visibleAnswers.map((answer) => {
                  const m = measures.find((item) => item.id === answer.measureId);
                  return (
                    <div
                      key={answer.measureId}
                      className="px-3 py-1.5 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-800 flex items-center gap-2"
                    >
                      <span className="text-slate-500 font-medium">
                        {m?.name || answer.questionText}
                      </span>
                      <span className="text-slate-300">—</span>
                      <strong className="font-bold text-slate-900">{answer.selectedValue}</strong>
                    </div>
                  );
                })}
              </div>

              {session.answers.length > 3 && (
                <button
                  onClick={() => setExpandedId(isExpanded ? null : session.id)}
                  className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Hide details</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>View details (+{hiddenCount})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}

        {/* Genuine no-activity state */}
        {!hasAnyInScope && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <QrCode className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <div className="text-sm font-bold text-slate-900">No feedback yet</div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Customer feedback will appear here once responses are submitted.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
              {onViewFeedbackPoints && (
                <button
                  onClick={onViewFeedbackPoints}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  View Feedback Points
                </button>
              )}
              {onTestAsCustomer && (
                <button
                  onClick={onTestAsCustomer}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Test as customer
                </button>
              )}
            </div>
          </div>
        )}

        {/* No-match state (activity exists, filters exclude it) */}
        {hasAnyInScope && filteredSessions.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
            <div className="text-sm font-bold text-slate-900">No activity matches these filters</div>
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
