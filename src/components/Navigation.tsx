import React from 'react';
import { 
  BarChart3, 
  Target, 
  QrCode, 
  MapPin, 
  Activity, 
  Settings,
  Flame
} from 'lucide-react';

export type TabKey = 'overview' | 'measures' | 'endpoints' | 'locations' | 'activity' | 'settings';

interface NavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  attentionCount?: number;
  newFeedbackCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  attentionCount = 0,
  newFeedbackCount = 0,
}) => {
  const navItems: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string | number; badgeColor?: string }[] = [
    {
      key: 'overview',
      label: 'Service Signals',
      icon: BarChart3,
      badge: attentionCount > 0 ? `${attentionCount} to review` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      key: 'measures',
      label: 'What We Track',
      icon: Target,
    },
    {
      key: 'endpoints',
      label: 'Feedback Doorways',
      icon: QrCode,
    },
    {
      key: 'locations',
      label: 'Locations',
      icon: MapPin,
    },
    {
      key: 'activity',
      label: 'Evidence Stream',
      icon: Activity,
      badge: newFeedbackCount > 0 ? `+${newFeedbackCount}` : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      key: 'settings',
      label: 'Organisation & Access',
      icon: Settings,
    },
  ];

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-1 text-[10px] font-semibold px-1.5 py-0.2 rounded-full border ${
                      isActive ? 'bg-slate-800 text-slate-200 border-slate-700' : item.badgeColor
                    }`}
                  >
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
