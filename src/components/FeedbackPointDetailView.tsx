import React, { useState } from 'react';
import { 
  ArrowLeft, 
  QrCode, 
  Copy, 
  Check, 
  Download, 
  Smartphone, 
  ExternalLink, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  History, 
  Edit3, 
  SlidersHorizontal,
  FileText,
  MapPin,
  Share2
} from 'lucide-react';
import { Endpoint, Measure, Location, FeedbackSession } from '../types';

interface FeedbackPointDetailViewProps {
  endpoint: Endpoint;
  location?: Location;
  allMeasures: Measure[];
  recentSessions: FeedbackSession[];
  onBack: () => void;
  onToggleStatus: (endpointId: string) => void;
  onStartChangeWhatWeTrack: () => void;
  onOpenCustomerViewForEndpoint: (endpointId: string) => void;
  onOpenPrintFlyer: (endpoint: Endpoint) => void;
}

export const FeedbackPointDetailView: React.FC<FeedbackPointDetailViewProps> = ({
  endpoint,
  location,
  allMeasures,
  recentSessions,
  onBack,
  onToggleStatus,
  onStartChangeWhatWeTrack,
  onOpenCustomerViewForEndpoint,
  onOpenPrintFlyer,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  // Active measures configured for this feedback point
  const activeMeasures = allMeasures.filter((m) =>
    endpoint.activeMeasureIds.includes(m.id)
  );

  // Sessions collected specifically through this endpoint
  const endpointSessions = recentSessions.filter((s) => s.endpointId === endpoint.id);

  // Direct participant link
  const feedbackUrl = `${window.location.origin}/feedback/${endpoint.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(feedbackUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getEstimatedDuration = (count: number) => {
    if (count <= 3) return '~20 seconds';
    if (count <= 5) return '~30 seconds';
    return '~45 seconds';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feedback Points</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Active / Paused Toggle */}
          <button
            onClick={() => onToggleStatus(endpoint.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              endpoint.status === 'active'
                ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${endpoint.status === 'active' ? 'bg-emerald-600' : 'bg-slate-500'}`} />
            <span>{endpoint.status === 'active' ? 'Active & Receiving Responses' : 'Paused (Closed to Public)'}</span>
          </button>
        </div>
      </div>

      {/* Header Info Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-semibold text-slate-900">{location?.name || 'Location'}</span>
              <span>•</span>
              <span>Created {endpoint.createdAt}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {endpoint.humanName}
            </h1>
            {endpoint.channelNotes && (
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                {endpoint.channelNotes}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl shrink-0">
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none">
                {endpoint.totalResponses}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Responses Collected
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <div className="text-2xl font-black text-emerald-700 leading-none">
                {activeMeasures.length}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Active Questions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: QR & Physical Deployment on Left, Measures & History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: QR Code & Access Points */}
        <div className="space-y-6">
          {/* QR Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs text-center space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              Customer Access QR Code
            </h2>

            {/* Simulated QR Visual */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block mx-auto">
              <div className="w-44 h-44 bg-white p-3 rounded-xl shadow-xs border border-slate-200/70 flex flex-col items-center justify-center relative">
                <QrCode className="w-36 h-36 text-slate-900" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-black text-xs flex items-center justify-center shadow-md">
                    F
                  </div>
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-2">
                Persistent QR identity — reprint never required
              </div>
            </div>

            {/* Direct Link Action */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Direct Feedback Link'}</span>
              </button>

              <button
                onClick={() => onOpenPrintFlyer(endpoint)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Print Table Flyer Preview</span>
              </button>

              <button
                onClick={() => onOpenCustomerViewForEndpoint(endpoint.id)}
                className="w-full py-2 px-4 text-emerald-800 hover:text-emerald-950 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Test Feedback as Customer</span>
              </button>
            </div>
          </div>

          {/* Reassurance Banner */}
          <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-5 text-xs text-emerald-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Permanent QR Code</span>
            </div>
            <p className="text-emerald-900/80 leading-relaxed">
              This QR code and web link stay constant forever. Publishing creates or supersedes the governed configuration — future sessions use the new effective configuration, while existing sessions and history retain their frozen lineage. You do not need to replace physical table stands or stickers.
            </p>
          </div>
        </div>

        {/* Right Column: What Customers See & Configuration History */}
        <div className="lg:col-span-2 space-y-6">
          {/* What This Feedback Point Asks Customers */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  What This Feedback Point Asks
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="font-semibold text-slate-800">
                    {activeMeasures.length} questions
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Estimated time: {getEstimatedDuration(activeMeasures.length)}
                  </span>
                </div>
              </div>

              {/* Dedicated "Change what we track" button */}
              <button
                onClick={onStartChangeWhatWeTrack}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Change What We Track</span>
              </button>
            </div>

            {/* List of active measures */}
            <div className="space-y-3">
              {activeMeasures.map((measure, idx) => (
                <div
                  key={measure.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {measure.name}
                      </h3>
                      <span className="text-[10px] font-semibold text-slate-500 px-2 py-0.5 bg-white rounded-md border border-slate-200">
                        {measure.scaleFamily} scale
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 italic">
                      "{measure.standardQuestion}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration History: governed lineage (prototype simulation) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <h2 className="text-base font-bold text-slate-900">
                Configuration History
              </h2>
            </div>
            <p className="text-[11px] text-slate-500">
              Each publish supersedes the governed configuration for future sessions. Past sessions keep their frozen effective configuration (prototype illustrates the lineage interaction).
            </p>

            <div className="space-y-3">
              {endpoint.configHistory && endpoint.configHistory.length > 0 ? (
                endpoint.configHistory.map((hist) => (
                  <div
                    key={hist.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {hist.description}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {hist.activeMeasureIds.length} active questions
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      {hist.timestamp}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic py-2">
                  Published on {endpoint.createdAt} with {endpoint.activeMeasureIds.length} initial measures.
                </div>
              )}
            </div>
          </div>

          {/* Recent feedback from this endpoint */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Recent Feedback from this Point
            </h2>

            {endpointSessions.length > 0 ? (
              <div className="space-y-3">
                {endpointSessions.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-[11px]">Response {s.timestamp}</span>
                      <span className="text-[11px]">{s.timestamp}</span>
                    </div>
                    {s.optionalComment && (
                      <p className="text-slate-800 font-medium italic">
                        "{s.optionalComment}"
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {s.answers.map((a) => (
                        <span
                          key={a.measureId}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-700"
                        >
                          {a.questionText}: <strong className="text-slate-900">{a.selectedValue}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic py-3 text-center">
                No recent responses recorded yet for this feedback point.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
