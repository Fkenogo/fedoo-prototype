import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { Location } from '../types';

interface AddLocationModalProps {
  onClose: () => void;
  onCreateLocation: (location: Location) => void;
}

// Bounded Add Location form. A Location can exist before collection begins —
// no Feedback Point is required, and there is no approval workflow.
export const AddLocationModal: React.FC<AddLocationModalProps> = ({
  onClose,
  onCreateLocation,
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [manager, setManager] = useState('');

  const canSubmit = name.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onCreateLocation({
      id: `loc-${Date.now()}`,
      name: name.trim(),
      type: 'physical',
      addressOrDetail: address.trim() || 'Address not set',
      managerName: manager.trim() || undefined,
      totalResponses: 0,
      lastFeedbackAt: null,
      endpointsCount: 0,
      activeMeasuresCount: 0,
      status: 'inactive',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-5 sm:p-7 animate-in fade-in slide-in-from-bottom-3 sm:zoom-in-95">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Add Location</h2>
            <p className="text-xs text-slate-500 mt-1">
              A place where your Organisation delivers service.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Location name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Airport Concourse"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Address / detail</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Terminal 1A, Bujumbura"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Manager / contact <span className="text-slate-400 font-medium">Optional</span>
            </label>
            <input
              type="text"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="e.g. Sarah Kamau"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
            />
          </div>

          <p className="text-[11px] text-slate-400 flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            You can add Feedback Points at this Location whenever you're ready.
          </p>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                canSubmit
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Add Location
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
