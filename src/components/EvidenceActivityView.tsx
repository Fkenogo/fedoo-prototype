import React, { useState } from 'react';
import { 
  Activity, 
  Filter, 
  MessageSquare, 
  Download, 
  Calendar, 
  Building2, 
  QrCode, 
  Search, 
  CheckCircle2,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import { FeedbackSession, Location, Endpoint, Measure } from '../types';

interface EvidenceActivityViewProps {
  sessions: FeedbackSession[];
  locations: Location[];
  endpoints: Endpoint[];
  measures: Measure[];
  currentScope: string;
}

export const EvidenceActivityView: React.FC<EvidenceActivityViewProps> = ({
  sessions,
  locations,
  endpoints,
  measures,
  currentScope,
}) => {
  const [filterWithCommentOnly, setFilterWithCommentOnly] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const scopedSessions = sessions.filter((sess) => {
    const matchesScope = currentScope === 'all' || sess.locationId === currentScope;
    const matchesComment = !filterWithCommentOnly || Boolean(sess.optionalComment);
    const matchesSearch = !searchFilter.trim() || 
      (sess.optionalComment && sess.optionalComment.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesScope && matchesComment && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
              <Activity className="w-3.5 h-3.5 text-emerald-700" />
              Empirical Evidence Audit
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Customer Feedback Stream
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl leading-relaxed">
              Every customer session accumulates into governed Measure signals. Inspect recent submissions and qualitative customer notes without turning the tool into a reactive inbox.
            </p>
          </div>

          <button
            onClick={() => alert('Exporting structured feedback dataset (CSV / PDF report format)...')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Evidence Data</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterWithCommentOnly(!filterWithCommentOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                filterWithCommentOnly
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>With Comments Only</span>
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong className="font-semibold text-slate-800">{scopedSessions.length}</strong> recorded sessions in scope
          </div>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-3">
        {scopedSessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            No feedback sessions match the selected filter.
          </div>
        ) : (
          scopedSessions.map((session) => {
            const loc = locations.find((l) => l.id === session.locationId);
            const ep = endpoints.find((e) => e.id === session.endpointId);

            return (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900">{loc?.name}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">{ep?.humanName}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {session.channel}
                    </span>
                  </div>

                  <div className="text-slate-400 text-xs flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{session.timestamp}</span>
                  </div>
                </div>

                {/* Answers pills */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {session.answers.map((ans) => {
                    const measure = measures.find((m) => m.id === ans.measureId);
                    const isFavourable = ans.scoreIndex >= 4;

                    return (
                      <div
                        key={ans.measureId}
                        className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                          isFavourable
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 font-medium'
                            : ans.scoreIndex === 3
                            ? 'bg-slate-50 border-slate-200 text-slate-700'
                            : 'bg-rose-50/70 border-rose-200 text-rose-900'
                        }`}
                      >
                        <span className="text-[11px] text-slate-500">{measure?.name}:</span>
                        <span className="font-semibold">{ans.selectedValue}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Qualitative comment if present */}
                {session.optionalComment && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-800 flex items-start gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div className="italic">"{session.optionalComment}"</div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
