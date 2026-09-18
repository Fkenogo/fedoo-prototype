import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Globe, 
  ShieldCheck, 
  Plus, 
  Lock, 
  Mail, 
  MapPin, 
  Check,
  AlertCircle
} from 'lucide-react';
import { Organisation, TeamMember, Location } from '../types';

interface SettingsViewProps {
  organisation: Organisation;
  teamMembers: TeamMember[];
  locations: Location[];
  onUpdateOrganisation: (org: Partial<Organisation>) => void;
  onAddTeamMember: (member: TeamMember) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  organisation,
  teamMembers,
  locations,
  onUpdateOrganisation,
  onAddTeamMember,
}) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState<'profile' | 'team' | 'language'>('profile');
  const [orgName, setOrgName] = useState(organisation.name);
  const [businessType, setBusinessType] = useState(organisation.businessType);
  const [country, setCountry] = useState(organisation.operatingCountry);
  const [primaryLang, setPrimaryLang] = useState<'en' | 'fr'>(organisation.primaryLanguage);

  // Invite member state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Organisation Admin' | 'Location Manager' | 'Service Observer'>('Location Manager');
  const [inviteScope, setInviteScope] = useState(locations[0]?.name || 'All Locations');
  const [saveToast, setSaveToast] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateOrganisation({
      name: orgName,
      businessType,
      operatingCountry: country,
      primaryLanguage: primaryLang,
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    onAddTeamMember({
      id: `usr-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      locationScope: inviteScope,
    });

    setInviteName('');
    setInviteEmail('');
    setShowInviteModal(false);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
          <Building2 className="w-3.5 h-3.5 text-emerald-700" />
          Governance & Account Structure
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Organisation & Access
        </h1>
        <p className="text-slate-600 text-sm mt-1 max-w-2xl">
          Manage organisation profiles, multi-location manager permissions, and default language settings.
        </p>

        {/* Tab Sub-nav */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveSettingsTab('profile')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeSettingsTab === 'profile'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Organisation Profile
          </button>
          <button
            onClick={() => setActiveSettingsTab('team')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeSettingsTab === 'team'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            People & Team Access ({teamMembers.length})
          </button>
          <button
            onClick={() => setActiveSettingsTab('language')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeSettingsTab === 'language'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Language & Multilingual
          </button>
        </div>
      </div>

      {saveToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>Organisation profile changes saved successfully.</span>
        </div>
      )}

      {/* Tab 1: Profile */}
      {activeSettingsTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl">
          <h2 className="text-base font-bold text-slate-900 mb-4">Business Identity</h2>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Organisation Legal / Brand Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-emerald-700/20"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Service Type & Operating Context</label>
              <input
                type="text"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-emerald-700/20"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Context guides Fedoo’s recommended Measures and comparability groups.
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Primary Operating Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-emerald-700/20"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-xs"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Team Access */}
      {activeSettingsTab === 'team' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">People & Access Roles</h2>
              <p className="text-xs text-slate-500">
                Grant branch managers or service supervisors visibility into their specific location's signals.
              </p>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Invite Team Member</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {teamMembers.map((member) => (
              <div key={member.id} className="py-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{member.name}</div>
                    <div className="text-slate-500 text-[11px]">{member.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-semibold text-slate-800 block">{member.role}</span>
                    <span className="text-[11px] text-slate-500">Scope: {member.locationScope}</span>
                  </div>

                  <span className="text-[11px] text-slate-400">Active</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong>Experience Placeholder:</strong> Roles in this prototype model common access expectations (Admins with full visibility, Location Managers scoped to their branch). Actual authoritative permissions will bind into this structure seamlessly.
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Language */}
      {activeSettingsTab === 'language' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl space-y-4">
          <h2 className="text-base font-bold text-slate-900">Language</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            This shell demonstrates English/French presentation as an experience pattern. Governed measurement languages are separate Instruments: only English v1 is approved in current Product Truth — French measurement equivalence is deferred and not approved.
          </p>

          <div className="space-y-3 pt-2 text-xs">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="radio"
                name="lang"
                checked={primaryLang === 'en'}
                onChange={() => setPrimaryLang('en')}
                className="text-emerald-700 focus:ring-emerald-700"
              />
              <div>
                <span className="font-bold text-slate-900">English (shell default)</span>
                <p className="text-slate-500 text-[11px]">Organisation-facing presentation language (experience pattern)</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="radio"
                name="lang"
                checked={primaryLang === 'fr'}
                onChange={() => setPrimaryLang('fr')}
                className="text-emerald-700 focus:ring-emerald-700"
              />
              <div>
                <span className="font-bold text-slate-900">Français (shell pattern)</span>
                <p className="text-slate-500 text-[11px]">Presentation pattern only — French measurement Instruments deferred, no equivalence approved</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Modal: Invite Team Member */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Invite Team Member</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add a branch supervisor or organisation collaborator.
            </p>

            <form onSubmit={handleInviteSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amani Mwangi"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. amani@bubblescafe.ke"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Role Authority</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Location Manager">Location Manager (Access scoped to specific branch)</option>
                  <option value="Organisation Admin">Organisation Admin (Full organisation visibility)</option>
                  <option value="Service Observer">Service Observer (Read-only visibility)</option>
                </select>
              </div>

              {inviteRole === 'Location Manager' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assigned Location Scope</label>
                  <select
                    value={inviteScope}
                    onChange={(e) => setInviteScope(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
