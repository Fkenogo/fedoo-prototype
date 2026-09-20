import React, { useState } from 'react';
import {
  ArrowLeft,
  QrCode,
  Copy,
  Check,
  Download,
  Smartphone,
  Clock,
  CheckCircle2,
  History,
  SlidersHorizontal,
  FileText,
  MapPin,
  ChevronRight,
  PauseCircle,
  PlayCircle,
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
  onViewAllActivity: () => void;
}

const CHANNEL_LABELS: Record<string, string> = {
  qr: 'QR code',
  link: 'Web link',
  whatsapp: 'WhatsApp',
  sms: 'SMS',
};

function burdenLabel(count: number): string {
  if (count <= 3) return 'Quick';
  if (count <= 5) return 'Standard';
  return 'Extended';
}

// Business-facing Feedback Point detail. Identity, customer access, what it
// tracks, changes and recent feedback — no configuration lineage, no governed
// vocabulary, no analytics.
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
  onViewAllActivity,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [qrNote, setQrNote] = useState(false);

  const activeMeasures = allMeasures.filter((m) =>
    endpoint.activeMeasureIds.includes(m.id)
  );

  const endpointSessions = recentSessions.filter((s) => s.endpointId === endpoint.id);

  const friendlyLink = endpoint.friendlyLink || `fedoo.me/${endpoint.id}`;
  const isActive = endpoint.status === 'active';

  const handleCopyLink = () => {
    const url = `https://${friendlyLink}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadQr = () => {
    setQrNote(true);
    setTimeout(() => setQrNote(false), 2500);
  };

  const changes = endpoint.configHistory || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Feedback Points</span>
      </button>

      {/* Identity */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-semibold text-slate-900">{location?.name || 'Location'}</span>
              {location?.addressOrDetail && (
                <>
                  <span>·</span>
                  <span>{location.addressOrDetail}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {endpoint.humanName}
            </h1>
            {(endpoint.contextNote || endpoint.channelNotes) && (
              <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {endpoint.contextNote || endpoint.channelNotes}
              </p>
            )}
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-slate-400'}`} />
              {isActive ? 'Active' : 'Paused'}
            </span>

            {isActive ? (
              <button
                onClick={() => setShowPauseConfirm(true)}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={() => onToggleStatus(endpoint.id)}
                className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Resume Feedback Point</span>
              </button>
            )}
          </div>
        </div>

        {!isActive && (
          <p className="text-[11px] text-slate-500">
            Customers cannot start new feedback sessions from this Feedback Point while it is
            paused.
          </p>
        )}

        {/* Pause confirmation */}
        {showPauseConfirm && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
            <div className="text-sm font-bold text-slate-900">
              Pause {endpoint.humanName}?
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Existing feedback and history will remain available.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onToggleStatus(endpoint.id);
                  setShowPauseConfirm(false);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Pause Feedback Point
              </button>
              <button
                onClick={() => setShowPauseConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer access */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900">Customer access</h2>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* QR */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="w-32 h-32 bg-white p-2 rounded-xl border border-slate-200/70 flex items-center justify-center relative">
                <QrCode className="w-24 h-24 text-slate-900" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-black text-[11px] flex items-center justify-center">
                    F
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 min-w-0">
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Customer link
              </div>
              <div className="text-sm font-bold text-emerald-800 break-all">{friendlyLink}</div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Enabled channels
              </div>
              <div className="flex flex-wrap gap-1.5">
                {endpoint.supportedChannels.map((ch) => (
                  <span
                    key={ch}
                    className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md"
                  >
                    {CHANNEL_LABELS[ch] || ch}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleCopyLink}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link copied' : 'Copy link'}</span>
              </button>
              <button
                onClick={handleDownloadQr}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download QR</span>
              </button>
              <button
                onClick={() => onOpenCustomerViewForEndpoint(endpoint.id)}
                className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Test as customer</span>
              </button>
              <button
                onClick={() => onOpenPrintFlyer(endpoint)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Print flyer</span>
              </button>
            </div>

            {qrNote && (
              <p className="text-[11px] text-slate-400">
                Prototype: QR download is simulated — no file is generated.
              </p>
            )}

            <p className="text-[11px] text-slate-500 flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              Your customer link stays the same when you change what you track.
            </p>
          </div>
        </div>
      </div>

      {/* What this Feedback Point tracks */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              What this Feedback Point tracks
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="font-semibold text-slate-800">
                {activeMeasures.length} {activeMeasures.length === 1 ? 'area' : 'areas'}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {burdenLabel(activeMeasures.length)} customer experience
              </span>
            </div>
          </div>
          <button
            onClick={onStartChangeWhatWeTrack}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Change what we track</span>
          </button>
        </div>

        <div className="space-y-2">
          {activeMeasures.map((measure) => (
            <div
              key={measure.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <h3 className="font-bold text-slate-900 text-sm">{measure.name}</h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 pl-6 italic">
                {measure.standardQuestion}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Changes */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          <h2 className="text-base font-bold text-slate-900">Changes</h2>
        </div>

        {changes.length > 0 ? (
          <div className="space-y-2">
            {changes.map((hist) => (
              <div
                key={hist.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-900">{hist.description}</span>
                  <span className="text-[11px] text-slate-400 shrink-0">{hist.timestamp}</span>
                </div>
                {hist.added && hist.added.length > 0 && (
                  <div className="text-[11px] text-emerald-800">
                    + {hist.added.map((id) => allMeasures.find((m) => m.id === id)?.name || id).join(', ')}
                  </div>
                )}
                {hist.removed && hist.removed.length > 0 && (
                  <div className="text-[11px] text-rose-700">
                    − {hist.removed.map((id) => allMeasures.find((m) => m.id === id)?.name || id).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No changes yet.</p>
        )}
      </div>

      {/* Recent feedback */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Recent feedback</h2>
          <button
            onClick={onViewAllActivity}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5"
          >
            <span>View all activity</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {endpointSessions.length > 0 ? (
          <div className="space-y-2">
            {endpointSessions.slice(0, 3).map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
              >
                <div className="text-[11px] text-slate-500">{s.timestamp}</div>
                {s.optionalComment && (
                  <p className="text-slate-800 font-medium italic">"{s.optionalComment}"</p>
                )}
                <div className="text-[11px] text-slate-500">
                  {s.answers.length} {s.answers.length === 1 ? 'answer' : 'answers'} recorded
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <QrCode className="w-9 h-9 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-900">No feedback yet</div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Share the QR code or customer link to start hearing from customers.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link copied' : 'Copy link'}</span>
              </button>
              <button
                onClick={handleDownloadQr}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download QR</span>
              </button>
              <button
                onClick={() => onOpenCustomerViewForEndpoint(endpoint.id)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Test as customer</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
