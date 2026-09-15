import React, { useState } from 'react';
import { 
  Plus, 
  QrCode, 
  MapPin, 
  ExternalLink, 
  Clock, 
  Copy, 
  Check, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { Endpoint, Location, Measure } from '../types';

interface FeedbackPointsViewProps {
  currentScope: string;
  scopeLocationName: string;
  endpoints: Endpoint[];
  locations: Location[];
  measures: Measure[];
  onSelectEndpoint: (endpointId: string) => void;
  onCreateEndpointClick: () => void;
  onOpenCustomerViewForEndpoint: (endpointId: string) => void;
}

export const FeedbackPointsView: React.FC<FeedbackPointsViewProps> = ({
  currentScope,
  scopeLocationName,
  endpoints,
  locations,
  measures,
  onSelectEndpoint,
  onCreateEndpointClick,
  onOpenCustomerViewForEndpoint,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter endpoints by scope
  const filteredEndpoints = currentScope === 'all'
    ? endpoints
    : endpoints.filter((e) => e.locationId === currentScope);

  const handleCopy = (e: React.MouseEvent, endpointId: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/feedback/${endpointId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(endpointId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Feedback Points
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Physical QR stands, table cards, and digital links where customers share thoughts • Viewing {scopeLocationName}
          </p>
        </div>

        <button
          onClick={onCreateEndpointClick}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Feedback Point</span>
        </button>
      </div>

      {/* Endpoints List */}
      {filteredEndpoints.length > 0 ? (
        <div className="space-y-3">
          {filteredEndpoints.map((ep) => {
            const loc = locations.find((l) => l.id === ep.locationId);
            const activeMeasureCount = ep.activeMeasureIds.length;

            return (
              <div
                key={ep.id}
                onClick={() => onSelectEndpoint(ep.id)}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-600/50 hover:shadow-md transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                    <QrCode className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {ep.humanName}
                      </h2>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ep.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {ep.status === 'active' ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <MapPin className="w-3 h-3 text-emerald-700" />
                        {loc?.name || 'Location'}
                      </span>
                      <span>•</span>
                      <span>{activeMeasureCount} questions tracked</span>
                      <span>•</span>
                      <span>Last feedback {ep.lastResponseAt || 'none yet'}</span>
                    </div>

                    {ep.channelNotes && (
                      <p className="text-xs text-slate-500 line-clamp-1 italic">
                        "{ep.channelNotes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Metrics & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900 leading-tight">
                      {ep.totalResponses}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      responses
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleCopy(e, ep.id)}
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
                      title="Copy customer feedback link"
                    >
                      {copiedId === ep.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => onOpenCustomerViewForEndpoint(ep.id)}
                      className="p-2 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors text-xs font-semibold"
                      title="Open feedback page as customer"
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-900">
            No Feedback Points in {scopeLocationName}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Create a feedback point to generate a QR stand or link for this location.
          </p>
          <button
            onClick={onCreateEndpointClick}
            className="mt-6 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Feedback Point</span>
          </button>
        </div>
      )}
    </div>
  );
};
