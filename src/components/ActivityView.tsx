import React, { useState } from 'react';
import { 
  Activity, 
  MessageSquare, 
  Search, 
  Filter, 
  MapPin, 
  QrCode, 
  Clock,
  Sparkles
} from 'lucide-react';
import { FeedbackSession, Location, Endpoint, Measure } from '../types';

interface ActivityViewProps {
  sessions: FeedbackSession[];
  locations: Location[];
  endpoints: Endpoint[];
  measures: Measure[];
  currentScope: string;
  scopeLocationName: string;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  sessions,
  locations,
  endpoints,
  measures,
  currentScope,
  scopeLocationName,
}) => {
  const [filterWithCommentsOnly, setFilterWithCommentsOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredByScope = currentScope === 'all'
    ? sessions
    : sessions.filter((s) => s.locationId === currentScope);

  const filteredSessions = filteredByScope.filter((s) => {
    if (filterWithCommentsOnly && !s.optionalComment) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchComment = s.optionalComment?.toLowerCase().includes(q);
      const matchAnswer = s.answers.some(
        (a) => a.selectedValue.toLowerCase().includes(q) || a.questionText.toLowerCase().includes(q)
      );
      return matchComment || matchAnswer;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Customer Activity
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time feed of ratings and comments received across {scopeLocationName}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
            />
          </div>

          <button
            onClick={() => setFilterWithCommentsOnly(!filterWithCommentsOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              filterWithCommentsOnly
                ? 'bg-emerald-700 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Notes Only</span>
          </button>
        </div>
      </div>

      {/* Stream of Customer Sessions */}
      <div className="space-y-3">
        {filteredSessions.map((session) => {
          const loc = locations.find((l) => l.id === session.locationId);
          const ep = endpoints.find((e) => e.id === session.endpointId);

          return (
            <div
              key={session.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    {loc?.name || 'Location'}
                  </span>
                  <span>•</span>
                  <span>{ep?.humanName || 'Feedback Point'}</span>
                  <span>•</span>
                  <span className="uppercase text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {session.channel}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{session.timestamp}</span>
                </div>
              </div>

              {/* Customer Comment if present */}
              {session.optionalComment && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs">
                  <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>Customer Note</span>
                  </div>
                  <p className="text-slate-900 font-medium italic leading-relaxed">
                    "{session.optionalComment}"
                  </p>
                </div>
              )}

              {/* Ratings Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {session.answers.map((answer) => {
                  const m = measures.find((item) => item.id === answer.measureId);
                  const isFavourable = answer.scoreIndex >= 4;

                  return (
                    <div
                      key={answer.measureId}
                      className={`px-3 py-1.5 rounded-xl text-xs border flex items-center gap-2 ${
                        isFavourable
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <span className="text-slate-500 font-medium">
                        {m?.name || answer.questionText}:
                      </span>
                      <strong className="font-bold text-slate-900">
                        {answer.selectedValue}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredSessions.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            No customer activity matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};
