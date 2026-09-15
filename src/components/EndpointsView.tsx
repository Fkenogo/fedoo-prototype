import React, { useState } from 'react';
import { 
  QrCode, 
  Plus, 
  ExternalLink, 
  Copy, 
  Check, 
  Sliders, 
  PauseCircle, 
  PlayCircle, 
  Share2, 
  Printer, 
  MessageSquare, 
  Smartphone, 
  Info,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar
} from 'lucide-react';
import { Endpoint, Location, Measure, EndpointStatus } from '../types';

interface EndpointsViewProps {
  endpoints: Endpoint[];
  locations: Location[];
  measures: Measure[];
  currentScope: string;
  onUpdateEndpointStatus: (endpointId: string, newStatus: EndpointStatus) => void;
  onUpdateEndpointMeasures: (endpointId: string, measureIds: string[]) => void;
  onCreateEndpointClick: () => void;
  onOpenSimulatorForEndpoint: (endpointId: string) => void;
}

export const EndpointsView: React.FC<EndpointsViewProps> = ({
  endpoints,
  locations,
  measures,
  currentScope,
  onUpdateEndpointStatus,
  onUpdateEndpointMeasures,
  onCreateEndpointClick,
  onOpenSimulatorForEndpoint,
}) => {
  const [selectedEndpointForEdit, setSelectedEndpointForEdit] = useState<Endpoint | null>(null);
  const [editingMeasureIds, setEditingMeasureIds] = useState<string[]>([]);
  const [flyerModalEndpoint, setFlyerModalEndpoint] = useState<Endpoint | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const scopedEndpoints = currentScope === 'all' 
    ? endpoints 
    : endpoints.filter((ep) => ep.locationId === currentScope);

  const handleStartEditMeasures = (ep: Endpoint) => {
    setSelectedEndpointForEdit(ep);
    setEditingMeasureIds([...ep.activeMeasureIds]);
  };

  const handleToggleMeasureInEdit = (measureId: string) => {
    if (editingMeasureIds.includes(measureId)) {
      if (editingMeasureIds.length <= 1) {
        alert('An endpoint must measure at least one service dimension.');
        return;
      }
      setEditingMeasureIds(editingMeasureIds.filter((id) => id !== measureId));
    } else {
      setEditingMeasureIds([...editingMeasureIds, measureId]);
    }
  };

  const handleSaveMeasureConfig = () => {
    if (!selectedEndpointForEdit) return;
    onUpdateEndpointMeasures(selectedEndpointForEdit.id, editingMeasureIds);
    setSelectedEndpointForEdit(null);
  };

  const handleCopyLink = (ep: Endpoint) => {
    navigator.clipboard?.writeText?.(`https://fedoo.me/${ep.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
              <QrCode className="w-3.5 h-3.5 text-emerald-700" />
              Persistent Feedback Doorways
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Customer Feedback Endpoints
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl leading-relaxed">
              Endpoints are persistent doorways placed in physical spaces or digital receipts. 
              You can evolve what is measured at any time without replacing physical QR cards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCreateEndpointClick}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Doorway</span>
            </button>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {scopedEndpoints.filter((e) => e.status === 'active').length} Active Doorways
          </span>
          <span>•</span>
          <span>
            {scopedEndpoints.reduce((acc, e) => acc + e.totalResponses, 0)} total responses captured
          </span>
          <span>•</span>
          <span className="text-slate-600 italic">
            Physical QR codes never expire when modifying question sets
          </span>
        </div>
      </div>

      {/* Endpoints Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {scopedEndpoints.map((ep) => {
          const loc = locations.find((l) => l.id === ep.locationId);
          const activeMeasures = measures.filter((m) => ep.activeMeasureIds.includes(m.id));
          const isPaused = ep.status === 'paused';

          return (
            <div
              key={ep.id}
              className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between ${
                isPaused ? 'border-slate-200 opacity-85' : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Status & Location Pill */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ep.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          ep.status === 'active' ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                      {ep.status}
                    </span>

                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {loc?.name}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Created {ep.createdAt}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2.5">{ep.humanName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{ep.channelNotes}</p>

                {/* Evidence Metrics */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500">Collected Evidence:</span>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      {ep.totalResponses} <span className="text-xs font-normal text-slate-500">submissions</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500">Last Customer Feedback:</span>
                    <div className="text-xs font-semibold text-slate-800 mt-1">
                      {ep.lastResponseAt || 'No responses yet'}
                    </div>
                  </div>
                </div>

                {/* What this endpoint is measuring */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">
                      Measured Dimensions ({activeMeasures.length}):
                    </span>
                    <button
                      onClick={() => handleStartEditMeasures(ep)}
                      className="text-emerald-700 hover:text-emerald-800 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Evolve configuration</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {activeMeasures.map((m) => (
                      <span
                        key={m.id}
                        className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Supported Channels */}
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium text-slate-600">Active Channels:</span>
                  <div className="flex items-center gap-1">
                    {ep.supportedChannels.map((ch) => (
                      <span
                        key={ch}
                        className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFlyerModalEndpoint(ep)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>Print Table Stand</span>
                  </button>

                  <button
                    onClick={() => handleCopyLink(ep)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Copy direct feedback URL"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Link'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onUpdateEndpointStatus(ep.id, ep.status === 'active' ? 'paused' : 'active')
                    }
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                    title={ep.status === 'active' ? 'Pause Doorway' : 'Resume Doorway'}
                  >
                    {ep.status === 'active' ? (
                      <PauseCircle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <PlayCircle className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>

                  <button
                    onClick={() => onOpenSimulatorForEndpoint(ep.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold transition-all shadow-xs"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Test Scan</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Evolve Endpoint Measurement Configuration (without changing QR code) */}
      {selectedEndpointForEdit && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Persistent Doorway Architecture
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  Update Measurement Configuration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Doorway: <strong>{selectedEndpointForEdit.humanName}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedEndpointForEdit(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            {/* Persistent QR guarantee notice */}
            <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Your QR code and link will remain identical.</strong>
                <p className="text-emerald-900/80 mt-0.5">
                  Printed stickers, acrylic stands, and receipt links will immediately serve the newly selected governed questions to arriving customers.
                </p>
              </div>
            </div>

            {/* Measures toggles */}
            <div className="mt-5">
              <label className="text-xs font-bold text-slate-800 block mb-2">
                Select Dimensions to Collect Through This Doorway:
              </label>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {measures.map((m) => {
                  const isChecked = editingMeasureIds.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleToggleMeasureInEdit(m.id)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                        isChecked
                          ? 'bg-slate-50 border-emerald-500/70 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{m.name}</div>
                        <div className="text-[11px] text-slate-500 italic">"{m.standardQuestion}"</div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ml-3 ${
                          isChecked ? 'bg-emerald-700 text-white' : 'border border-slate-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Participant Burden Forecast */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Customer Burden Forecast:</span>
              <span className="font-semibold text-slate-900">
                {editingMeasureIds.length} questions • ~{editingMeasureIds.length * 7} seconds
              </span>
            </div>

            {/* Action buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSelectedEndpointForEdit(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMeasureConfig}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Publish New Question Set
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Printable Display Flyer Preview */}
      {flyerModalEndpoint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 text-center animate-in fade-in zoom-in-95">
            <div className="flex justify-end">
              <button
                onClick={() => setFlyerModalEndpoint(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            {/* Printable Table Stand Graphic Card */}
            <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl my-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-bold text-xl flex items-center justify-center mx-auto mb-2 shadow-xs">
                F
              </div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Bubbles Café
              </h4>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                How was your service today?
              </p>

              {/* Simulated QR Code */}
              <div className="my-5 p-4 bg-white rounded-xl shadow-xs border border-slate-200 inline-block">
                <div className="w-36 h-36 bg-slate-900 rounded-lg p-2 flex flex-col justify-between items-center text-white">
                  <div className="grid grid-cols-6 gap-1 w-full h-full p-1">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`${
                          (i % 2 === 0 || i % 5 === 0) && i !== 14 ? 'bg-white' : 'bg-transparent'
                        } rounded-xs`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 font-semibold">
                Scan with your phone camera
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Takes ~30 seconds • No app or signup required
              </div>
              <div className="mt-3 text-[10px] font-mono text-slate-400">
                fedoo.me/{flyerModalEndpoint.id}
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-3">
              Suitable for 4x6" acrylic table stands or counter stickers.
            </p>

            <div className="mt-5 flex gap-2 justify-center">
              <button
                onClick={() => alert('Print command sent to browser.')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Stand Flyer</span>
              </button>
              <button
                onClick={() => setFlyerModalEndpoint(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
