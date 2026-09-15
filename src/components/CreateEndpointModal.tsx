import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  MapPin, 
  Check, 
  Clock 
} from 'lucide-react';
import { Location, Measure, Endpoint } from '../types';

interface CreateEndpointModalProps {
  locations: Location[];
  measures: Measure[];
  defaultLocationId: string;
  onClose: () => void;
  onCreateEndpoint: (newEndpoint: Endpoint) => void;
}

export const CreateEndpointModal: React.FC<CreateEndpointModalProps> = ({
  locations,
  measures,
  defaultLocationId,
  onClose,
  onCreateEndpoint,
}) => {
  const [humanName, setHumanName] = useState('');
  const [locationId, setLocationId] = useState(
    defaultLocationId === 'all' ? locations[0]?.id || '' : defaultLocationId
  );
  const [selectedMeasureIds, setSelectedMeasureIds] = useState<string[]>(
    measures.filter((m) => m.isRecommended).map((m) => m.id)
  );
  const [channels, setChannels] = useState<('qr' | 'link' | 'whatsapp' | 'sms')[]>(['qr', 'link']);
  const [channelNotes, setChannelNotes] = useState('');

  const toggleChannel = (ch: 'qr' | 'link' | 'whatsapp' | 'sms') => {
    if (channels.includes(ch)) {
      if (channels.length <= 1) return;
      setChannels(channels.filter((c) => c !== ch));
    } else {
      setChannels([...channels, ch]);
    }
  };

  const toggleMeasure = (mId: string) => {
    if (selectedMeasureIds.includes(mId)) {
      if (selectedMeasureIds.length <= 1) return;
      setSelectedMeasureIds(selectedMeasureIds.filter((id) => id !== mId));
    } else {
      setSelectedMeasureIds([...selectedMeasureIds, mId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!humanName.trim()) return;

    const cleanSlug = humanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20);
    const newEp: Endpoint = {
      id: `ep-${cleanSlug}-${Date.now().toString().slice(-4)}`,
      humanName: humanName.trim(),
      locationId,
      status: 'active',
      activeMeasureIds: selectedMeasureIds,
      supportedChannels: channels,
      createdAt: 'Just now',
      lastResponseAt: null,
      totalResponses: 0,
      burdenLevel: selectedMeasureIds.length <= 3 ? 'quick' : selectedMeasureIds.length <= 5 ? 'standard' : 'extended',
      channelNotes: channelNotes.trim() || 'Physical tabletop or counter feedback point.',
      configHistory: [
        {
          id: `hist-${Date.now().toString().slice(-4)}`,
          timestamp: 'Just now',
          description: `Created feedback point with ${selectedMeasureIds.length} initial questions`,
          activeMeasureIds: selectedMeasureIds,
        },
      ],
    };

    onCreateEndpoint(newEp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Create Feedback Point
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Set up a QR stand, counter display, or digital link for customers to share ratings.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Location Assignment */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Location
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.addressOrDetail})
                </option>
              ))}
            </select>
          </div>

          {/* Human Feedback Point Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Feedback Point Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Table QR Stands, Takeaway Counter, Barista Bar"
              value={humanName}
              onChange={(e) => setHumanName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            />
          </div>

          {/* Notes or physical placement */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Placement Notes (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Acrylic table tents on terrace dining tables"
              value={channelNotes}
              onChange={(e) => setChannelNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </div>

          {/* Measures to Track */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Questions to Ask Customers ({selectedMeasureIds.length})
              </label>
              <span className="text-[11px] text-slate-500">
                Recommended 3 to 5 questions
              </span>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {measures.slice(0, 6).map((m) => {
                const selected = selectedMeasureIds.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => toggleMeasure(m.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer text-xs flex items-center justify-between transition-colors ${
                      selected ? 'bg-emerald-50/70 border-emerald-300' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{m.name}</span>
                      <span className="text-[11px] text-slate-500 ml-2 italic">"{m.standardQuestion}"</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ml-2 ${
                        selected ? 'bg-emerald-700 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Create Feedback Point
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
