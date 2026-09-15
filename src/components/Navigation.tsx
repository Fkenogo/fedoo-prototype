import React from 'react';
import { 
  LayoutDashboard, 
  QrCode, 
  Activity, 
  MapPin, 
  SlidersHorizontal,
  AlertCircle
} from 'lucide-react';
import { AppTab } from '../types';

interface NavigationProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  needsReviewCount: number;
  newActivityCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  needsReviewCount,
}) => {
  const navItems: { id: AppTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: needsReviewCount > 0 ? needsReviewCount : undefined,
    },
    {
      id: 'feedback-points',
      label: 'Feedback Points',
      icon: QrCode,
    },
    {
      id: 'what-we-track',
      label: 'What We Track',
      icon: SlidersHorizontal,
    },
    {
      id: 'locations',
      label: 'Locations',
      icon: MapPin,
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: Activity,
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
