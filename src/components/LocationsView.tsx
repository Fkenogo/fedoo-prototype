import React from 'react';
import { 
  MapPin, 
  ChevronRight, 
  QrCode, 
  Clock, 
  Building2, 
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Location, Endpoint } from '../types';

interface LocationsViewProps {
  locations: Location[];
  endpoints: Endpoint[];
  onSelectLocation: (locId: string) => void;
}

export const LocationsView: React.FC<LocationsViewProps> = ({
  locations,
  endpoints,
  onSelectLocation,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Locations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Physical venues and branches where your service is delivered
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {locations.map((loc) => {
          const locEndpoints = endpoints.filter((e) => e.locationId === loc.id);

          return (
            <div
              key={loc.id}
              onClick={() => onSelectLocation(loc.id)}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-600/50 hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                  <MapPin className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {loc.name}
                    </h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      loc.status === 'active'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {loc.status === 'active' ? 'Active' : 'Limited responses'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    {loc.addressOrDetail}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                    {loc.managerName && (
                      <span className="text-slate-700 font-medium">
                        Manager: {loc.managerName}
                      </span>
                    )}
                    {loc.managerName && <span>•</span>}
                    <span>{locEndpoints.length} feedback points</span>
                    <span>•</span>
                    <span>Last feedback {loc.lastFeedbackAt || 'none yet'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <div className="text-right">
                  <div className="text-xl font-black text-slate-900 leading-tight">
                    {loc.totalResponses}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    responses
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
