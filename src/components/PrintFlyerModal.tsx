import React from 'react';
import { X, Printer, Download, QrCode, CheckCircle2 } from 'lucide-react';
import { Endpoint, Location, Organisation } from '../types';

interface PrintFlyerModalProps {
  endpoint: Endpoint;
  location?: Location;
  organisation: Organisation;
  onClose: () => void;
}

export const PrintFlyerModal: React.FC<PrintFlyerModalProps> = ({
  endpoint,
  location,
  organisation,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Printable Venue Flyer & Table Card
            </h2>
            <p className="text-xs text-slate-500">
              Ready-to-print acrylic stand insert for {endpoint.humanName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Flyer Mockup Canvas */}
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-amber-50/20 text-center space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
              {organisation.name}
            </span>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              How was your experience today?
            </h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Scan with your phone camera to share a quick 30-second rating with our team.
            </p>
          </div>

          {/* QR Box */}
          <div className="w-44 h-44 bg-white p-3 rounded-2xl shadow-md border border-slate-200 mx-auto flex flex-col items-center justify-center relative">
            <QrCode className="w-36 h-36 text-slate-900" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-7 h-7 rounded-md bg-emerald-700 text-white font-black text-xs flex items-center justify-center shadow-md">
                F
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-800">
              {location?.name || organisation.name}
            </div>
            <div className="text-[10px] text-slate-400">
              No app download required • Private & direct to management
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Flyer (A5 / Tent Card)</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
