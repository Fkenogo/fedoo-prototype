import React, { useMemo, useState } from 'react';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  MapPin,
  Sparkles,
  QrCode,
  Link2,
  MessageCircle,
  MessageSquare,
  Smartphone,
  Copy,
  Download,
  Info,
  ChevronDown,
  ChevronUp,
  Plus,
  Languages,
  Eye,
} from 'lucide-react';
import {
  Organisation,
  Location,
  Measure,
  Endpoint,
  BurdenLevel,
} from '../types';
import { SCALE_DEFINITIONS } from '../data/mockData';
import { resolveRecommendationProfile } from '../data/recommendationProfiles';
import { ParticipantFeedbackView } from './ParticipantFeedbackView';

type Channel = 'qr' | 'link' | 'whatsapp' | 'sms';

interface FirstFeedbackPointWizardProps {
  organisation: Organisation;
  locations: Location[];
  measures: Measure[];
  defaultLocationId: string;
  onCancel: () => void;
  onActivate: (endpoint: Endpoint) => void;
  onGoToFeedbackPoints: () => void;
  onAddAnotherLocation: () => void;
}

const STEP_LABELS = [
  'Where',
  'What to understand',
  'Starting set',
  'Preview',
  'How customers access it',
  'Review & activate',
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function firstWordSlug(value: string): string {
  return slugify(value.split(/\s+/)[0] || 'fedoo');
}

function burdenFor(count: number): { level: BurdenLevel; label: string; detail: string } {
  if (count <= 3) return { level: 'quick', label: 'Quick', detail: 'About 3–4 questions' };
  if (count <= 5) return { level: 'standard', label: 'Standard', detail: 'About 4–6 questions' };
  return { level: 'extended', label: 'Extended', detail: 'About 6–8 questions' };
}

export const FirstFeedbackPointWizard: React.FC<FirstFeedbackPointWizardProps> = ({
  organisation,
  locations,
  measures,
  defaultLocationId,
  onCancel,
  onActivate,
  onGoToFeedbackPoints,
  onAddAnotherLocation,
}) => {
  const profile = useMemo(() => resolveRecommendationProfile(organisation), [organisation]);
  const measureById = useMemo(() => {
    const map = new Map<string, Measure>();
    measures.forEach((m) => map.set(m.id, m));
    return map;
  }, [measures]);

  const [step, setStep] = useState<number>(1);
  const [isReady, setIsReady] = useState(false);

  const resolvedDefaultLocation =
    locations.find((l) => l.id === defaultLocationId) || locations[0];

  const [locationId, setLocationId] = useState<string>(resolvedDefaultLocation?.id || '');
  const [pointName, setPointName] = useState<string>('');
  const [contextNote, setContextNote] = useState<string>('');

  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>(() =>
    profile.recommended
      .map((a) => a.measureId)
      .filter((id) => measureById.has(id))
  );
  const [showBrowseMore, setShowBrowseMore] = useState(false);
  const [channels, setChannels] = useState<Channel[]>(['qr', 'link']);
  const [previewLanguage, setPreviewLanguage] = useState<'en' | 'fr'>(
    organisation.primaryLanguage
  );

  const [activatedEndpoint, setActivatedEndpoint] = useState<Endpoint | null>(null);
  const [isTestingAsCustomer, setIsTestingAsCustomer] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedAreas = selectedAreaIds
    .map((id) => measureById.get(id))
    .filter((m): m is Measure => Boolean(m));

  const burden = burdenFor(selectedAreaIds.length);

  const selectedLocation =
    locations.find((l) => l.id === locationId) || resolvedDefaultLocation;

  // Non-blocking multi-location awareness: true when more Locations already
  // exist OR onboarding recorded that the Organisation has more Locations.
  const hasMoreLocations =
    locations.length > 1 || organisation.onboardingData?.hasMoreLocations === 'yes';

  // The Organisation's recorded customer-feedback language preference.
  // This is configuration context, not the preview toggle: it is derived from
  // onboarding and is never changed by the Step 4 preview selector.
  const configuredFeedbackLanguages = useMemo(() => {
    const recorded = organisation.onboardingData?.feedbackLanguages;
    if (recorded && recorded.length > 0) return recorded;
    return [organisation.primaryLanguage === 'fr' ? 'French' : 'English'];
  }, [organisation]);

  const friendlyLink = `fedoo.me/${firstWordSlug(organisation.name)}-${
    slugify(pointName) || 'feedback-point'
  }`;

  const toggleArea = (measureId: string) => {
    setSelectedAreaIds((prev) => {
      if (prev.includes(measureId)) {
        if (prev.length <= 1) return prev;
        return prev.filter((id) => id !== measureId);
      }
      return [...prev, measureId];
    });
  };

  const toggleChannel = (ch: Channel) => {
    setChannels((prev) => {
      if (prev.includes(ch)) {
        if (prev.length <= 1) return prev;
        return prev.filter((c) => c !== ch);
      }
      return [...prev, ch];
    });
  };

  const canContinue =
    step === 1
      ? Boolean(locationId) && pointName.trim().length > 0
      : step === 2
      ? selectedAreaIds.length >= 1
      : step === 3
      ? selectedAreaIds.length >= 1
      : step === 5
      ? channels.length >= 1
      : true;

  const handleActivate = () => {
    const newEndpoint: Endpoint = {
      id: `ep-${slugify(pointName) || 'feedback-point'}-${Date.now().toString().slice(-4)}`,
      humanName: pointName.trim(),
      locationId,
      status: 'active',
      activeMeasureIds: selectedAreaIds,
      supportedChannels: channels,
      createdAt: 'Just now',
      lastResponseAt: null,
      totalResponses: 0,
      burdenLevel: burden.level,
      contextNote: contextNote.trim() || undefined,
      friendlyLink,
      channelNotes:
        contextNote.trim() ||
        `Customers reach this Feedback Point at ${selectedLocation?.name || 'this Location'}.`,
      configHistory: [
        {
          id: `hist-${Date.now().toString().slice(-4)}`,
          timestamp: 'Just now',
          description: `Activated with ${selectedAreaIds.length} visibility areas`,
          activeMeasureIds: selectedAreaIds,
        },
      ],
    };

    setActivatedEndpoint(newEndpoint);
    setIsReady(true);
    onActivate(newEndpoint);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = () => {
    const url = `https://${friendlyLink}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Temporary endpoint used to drive the existing participant experience in
  // preview. Constructed locally so no prototype data is mutated.
  const previewEndpoint: Endpoint = activatedEndpoint || {
    id: 'ep-preview',
    humanName: pointName || 'Feedback Point',
    locationId: locationId || resolvedDefaultLocation?.id || 'loc-1',
    status: 'active',
    activeMeasureIds: selectedAreaIds,
    supportedChannels: channels,
    createdAt: 'Just now',
    lastResponseAt: null,
    totalResponses: 0,
    burdenLevel: burden.level,
    friendlyLink,
    configHistory: [],
  };

  const stepCount = 6;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 text-white sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 font-bold flex items-center justify-center text-sm shrink-0">
              F
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold tracking-tight truncate">
                {isReady ? 'Feedback Point ready' : 'Set up a Feedback Point'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {organisation.name} • {selectedLocation?.name || 'Location'}
              </div>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Exit setup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stepper (flow only) */}
      {!isReady && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2">
              <span>
                Step {step} of {stepCount}
              </span>
              <span className="text-emerald-800 font-bold">{STEP_LABELS[step - 1]}</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: stepCount }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < step ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32">
        {/* ============================ STEP 1 ============================ */}
        {!isReady && step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Feedback Point explanation */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-sm font-bold text-emerald-950">
                    What is a Feedback Point?
                  </h2>
                  <p className="text-xs text-emerald-900/90 leading-relaxed">
                    A Feedback Point is a place or channel where customers can start giving
                    feedback — for example a reception desk, salon counter, dining table,
                    checkout, service desk, delivery message, WhatsApp link or website link.
                  </p>
                  <p className="text-xs font-semibold text-emerald-900">
                    Set it up once. You can change what you track later without replacing the
                    customer access point.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Where will customers give feedback?
              </h1>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">Location</label>
              {locations.length <= 1 ? (
                <div className="flex items-center gap-3 p-4 bg-white border border-emerald-300 rounded-2xl">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {resolvedDefaultLocation?.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {resolvedDefaultLocation?.addressOrDetail}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {locations.map((loc) => {
                    const isSelected = loc.id === locationId;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => setLocationId(loc.id)}
                        className={`w-full text-left p-4 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-400'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <MapPin
                            className={`w-4 h-4 shrink-0 ${
                              isSelected ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-900 truncate">
                              {loc.name}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {loc.addressOrDetail}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-emerald-700 text-white'
                              : 'border border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Name */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block">
                  Where at this Location? What should we call this Feedback Point?
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  A short, human-readable name customers or staff would recognise.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.nameSuggestions.map((suggestion) => {
                  const isSelected = pointName === suggestion;
                  return (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setPointName(suggestion)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                        isSelected
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      {suggestion}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={pointName}
                onChange={(e) => setPointName(e.target.value)}
                placeholder="Or type a custom name"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            {/* Optional context */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Where will it be used? <span className="text-slate-400 font-medium">Optional</span>
              </label>
              <input
                type="text"
                value={contextNote}
                onChange={(e) => setContextNote(e.target.value)}
                placeholder="e.g. At the reception desk after customers finish their visit."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>
          </div>
        )}

        {/* ============================ STEP 2 ============================ */}
        {!isReady && step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                What would you like to understand here?
              </h1>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Fedoo uses what you told us about your business to suggest relevant areas to
                track. You can change these anytime.
              </p>
            </div>

            {/* Recommended */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <h2 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Recommended for this Feedback Point
                </h2>
              </div>
              <div className="space-y-2">
                {profile.recommended
                  .filter((a) => measureById.has(a.measureId))
                  .map((area) => (
                    <AreaCard
                      key={area.measureId}
                      measure={measureById.get(area.measureId)!}
                      reason={area.reason}
                      selected={selectedAreaIds.includes(area.measureId)}
                      onToggle={() => toggleArea(area.measureId)}
                      recommended
                    />
                  ))}
              </div>
            </section>

            {/* Also relevant */}
            {profile.alsoRelevant.filter((a) => measureById.has(a.measureId)).length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Also relevant
                </h2>
                <div className="space-y-2">
                  {profile.alsoRelevant
                    .filter((a) => measureById.has(a.measureId))
                    .map((area) => (
                      <AreaCard
                        key={area.measureId}
                        measure={measureById.get(area.measureId)!}
                        reason={area.reason}
                        selected={selectedAreaIds.includes(area.measureId)}
                        onToggle={() => toggleArea(area.measureId)}
                      />
                    ))}
                </div>
              </section>
            )}

            {/* Browse more */}
            <section className="space-y-3">
              <button
                type="button"
                onClick={() => setShowBrowseMore((v) => !v)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:border-emerald-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add another area to track</span>
                {showBrowseMore ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showBrowseMore && (
                <div className="space-y-4 pt-2 animate-in fade-in duration-200">
                  <p className="text-[11px] text-slate-500">
                    Browse by area to discover what else you can track. Fedoo still decides how
                    each area is asked.
                  </p>
                  {profile.browseGroups.map((group) => {
                    const groupMeasures = group.measureIds
                      .map((id) => measureById.get(id))
                      .filter((m): m is Measure => Boolean(m) && m!.availability !== 'not_relevant');
                    if (groupMeasures.length === 0) return null;
                    return (
                      <div key={group.id} className="space-y-2">
                        <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                          {group.label}
                        </h3>
                        <div className="space-y-2">
                          {groupMeasures.map((m) => (
                            <AreaCard
                              key={m.id}
                              measure={m}
                              selected={selectedAreaIds.includes(m.id)}
                              onToggle={() => toggleArea(m.id)}
                              compact
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Selected summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-900">
                  {selectedAreaIds.length}{' '}
                  {selectedAreaIds.length === 1 ? 'area' : 'areas'} to track
                </span>
                <span className="mx-1.5">•</span>
                <span>
                  {burden.label} — {burden.detail}
                </span>
              </div>
              {selectedAreaIds.length >= 5 && (
                <span className="text-[11px] text-slate-500">
                  Adding more areas makes customer feedback a little longer.
                </span>
              )}
            </div>
          </div>
        )}

        {/* ============================ STEP 3 ============================ */}
        {!isReady && step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Your starting set
              </h1>
              <p className="text-sm text-slate-600 mt-2">
                Here is what you have chosen to understand from customers.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
              <div>
                <div className="text-sm font-black text-slate-900">{pointName}</div>
                <div className="text-[11px] text-slate-500">
                  {selectedLocation?.name}
                  {selectedLocation?.addressOrDetail ? ` · ${selectedLocation.addressOrDetail}` : ''}
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Tracking
                </div>
                {selectedAreas.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-sm text-slate-800">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="font-medium">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed text-slate-200">
                Fedoo will use the appropriate customer questions for these areas. You do not
                need to write questions, wording or answer scales — Fedoo handles that.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4">
              <div className="text-xs">
                <div className="font-bold text-slate-900">
                  Customer experience: {burden.label}
                </div>
                <div className="text-slate-500">{burden.detail}</div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-900"
              >
                Edit areas to track
              </button>
            </div>
          </div>
        )}

        {/* ============================ STEP 4 ============================ */}
        {!isReady && step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Preview what customers will experience
              </h1>
              <p className="text-sm text-slate-600 mt-2">
                A representative example of the short mobile feedback customers will see.
              </p>
            </div>

            <CompactCustomerPreview
              organisationName={organisation.name}
              locationName={selectedLocation?.name || 'Location'}
              pointName={pointName || 'Feedback Point'}
              measures={selectedAreas}
              language={previewLanguage}
            />

            {/* Preview language (does not change configured feedback languages) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-800">Preview language</span>
              </div>
              <div className="flex gap-2">
                {(['en', 'fr'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setPreviewLanguage(lang)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      previewLanguage === lang
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
                    }`}
                  >
                    {lang === 'en' ? 'English' : 'French'}
                  </button>
                ))}
              </div>
              <div className="pt-1 border-t border-slate-100">
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Customer feedback languages recorded at setup:{' '}
                  <span className="font-semibold text-slate-700">
                    {configuredFeedbackLanguages.join(', ')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                  Changing the preview language does not change what customers are offered.
                </p>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Available languages will follow Fedoo-supported question translations.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-600 leading-relaxed">
                This preview shows the structure of the customer experience. Actual questions
                and wording are governed by Fedoo and may differ.
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900"
            >
              Edit areas to track
            </button>
          </div>
        )}

        {/* ============================ STEP 5 ============================ */}
        {!isReady && step === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                How will customers open this Feedback Point?
              </h1>
              <p className="text-sm text-slate-600 mt-2">
                You can choose more than one access method. All of them lead to the same
                Feedback Point.
              </p>
            </div>

            <div className="space-y-2">
              {channelDefinitions.map((channel) => {
                const isSelected = channels.includes(channel.id);
                const Icon = channel.icon;
                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => toggleChannel(channel.id)}
                    className={`w-full text-left p-4 rounded-2xl border flex items-start justify-between gap-3 transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900">{channel.label}</div>
                        <div className="text-[11px] text-slate-500 leading-relaxed">
                          {channel.description}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-emerald-700 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-1.5">
              <p className="text-xs font-bold text-emerald-950">
                Customers reach the same Feedback Point whichever access method you use.
              </p>
              <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                Keep using the same customer link. You can update what you track later.
              </p>
            </div>
          </div>
        )}

        {/* ============================ STEP 6 ============================ */}
        {!isReady && step === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Ready to start collecting feedback?
              </h1>
              <p className="text-sm text-slate-600 mt-2">
                Review your Feedback Point before you activate it.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
              <ReviewRow
                label="Feedback Point"
                value={pointName}
                onEdit={() => setStep(1)}
              />
              <ReviewRow
                label="Location"
                value={`${selectedLocation?.name || 'Location'}${
                  selectedLocation?.addressOrDetail
                    ? ` · ${selectedLocation.addressOrDetail}`
                    : ''
                }`}
                onEdit={() => setStep(1)}
              />
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Tracking
                  </span>
                  <button
                    onClick={() => setStep(2)}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
                  >
                    Edit
                  </button>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {selectedAreaIds.length} areas
                </div>
                <div className="space-y-1.5">
                  {selectedAreas.map((m) => (
                    <div key={m.id} className="flex items-center gap-2 text-xs text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      {m.name}
                    </div>
                  ))}
                </div>
              </div>
              <ReviewRow
                label="Customer experience"
                value={`${burden.label} · ${burden.detail.toLowerCase()}`}
              />
              <ReviewRow
                label="Languages"
                value={configuredFeedbackLanguages.join(' + ')}
              />
              <ReviewRow
                label="Customer access"
                value={channels
                  .map((c) => channelDefinitions.find((d) => d.id === c)?.label || c)
                  .join(' + ')}
                onEdit={() => setStep(5)}
              />
            </div>

            <button
              onClick={handleActivate}
              className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Activate Feedback Point</span>
            </button>
          </div>
        )}

        {/* ============================ READY ============================ */}
        {isReady && activatedEndpoint && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {activatedEndpoint.humanName} is ready
              </h1>
              <p className="text-sm text-slate-600">Customers can now share feedback here.</p>
            </div>

            {/* QR + link */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="w-36 h-36 bg-slate-900 rounded-xl p-3 flex items-center justify-center">
                  <QrCode className="w-28 h-28 text-white" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Customer link
                </div>
                <div className="text-sm font-bold text-emerald-800 break-all">
                  {activatedEndpoint.friendlyLink}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Prototype visual only. No production QR or domain infrastructure is implied.
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleCopyLink()}
                className="py-3 rounded-2xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:border-emerald-500 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copied ? 'Link copied' : 'Copy link'}</span>
              </button>
              <button
                onClick={() => {
                  setCopied(false);
                }}
                className="py-3 rounded-2xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:border-emerald-500 transition-colors flex items-center justify-center gap-2"
                title="Prototype: no file is generated"
              >
                <Download className="w-4 h-4" />
                <span>Download QR</span>
              </button>
              <button
                onClick={() => setIsTestingAsCustomer(true)}
                className="py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Test as customer</span>
              </button>
              <button
                onClick={onGoToFeedbackPoints}
                className="py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Go to Feedback Points</span>
              </button>
            </div>

            {/* Multi-location awareness — non-blocking */}
            {hasMoreLocations && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-slate-600">
                  You said you have more Locations. You can add them whenever you're ready.
                </p>
                <button
                  onClick={onAddAnotherLocation}
                  className="shrink-0 px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:border-emerald-500 transition-colors"
                >
                  Add another Location
                </button>
              </div>
            )}

            <div className="flex items-start gap-2 text-[11px] text-slate-400">
              <Eye className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <p>
                This Feedback Point starts with zero responses. The link stays the same even
                when you later change what it tracks.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky footer nav (flow only) */}
      {!isReady && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <button
              onClick={() => (step === 1 ? onCancel() : setStep((s) => s - 1))}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{step === 1 ? 'Cancel' : 'Back'}</span>
            </button>

            <div className="text-[11px] text-slate-400 hidden sm:block">
              {step === 2 ? `${selectedAreaIds.length} selected` : `Step ${step} of ${stepCount}`}
            </div>

            {step < 6 ? (
              <button
                disabled={!canContinue}
                onClick={() => {
                  setStep((s) => s + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                  canContinue
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleActivate}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs flex items-center gap-2"
              >
                <span>Activate</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Test as customer overlay — existing participant experience, preview mode */}
      {isTestingAsCustomer && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 overflow-y-auto">
          <div className="py-6">
            <ParticipantFeedbackView
              endpoint={previewEndpoint}
              locationName={selectedLocation?.name}
              organisationName={organisation.name}
              measures={measures}
              primaryLanguage={previewLanguage}
              viewMode="phone"
              previewMode
              onClose={() => setIsTestingAsCustomer(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Area selection card
// ---------------------------------------------------------------------------
interface AreaCardProps {
  measure: Measure;
  reason?: string;
  selected: boolean;
  onToggle: () => void;
  recommended?: boolean;
  compact?: boolean;
}

const AreaCard: React.FC<AreaCardProps> = ({
  measure,
  reason,
  selected,
  onToggle,
  recommended,
  compact,
}) => {
  const comingSoon = measure.availability === 'coming_soon';
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={comingSoon}
      className={`w-full text-left p-4 rounded-2xl border flex items-start justify-between gap-3 transition-colors ${
        selected
          ? 'bg-emerald-50/70 border-emerald-400'
          : 'bg-white border-slate-200 hover:border-slate-300'
      } ${comingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-slate-900">{measure.name}</span>
          {recommended && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Recommended
            </span>
          )}
          {comingSoon && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
              Coming soon
            </span>
          )}
        </div>
        {!compact && (
          <p className="text-[11px] text-slate-500 leading-relaxed">{measure.shortDescription}</p>
        )}
        {reason && (
          <p className="text-[11px] text-emerald-800 leading-relaxed">{reason}</p>
        )}
      </div>
      <div
        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
          selected ? 'bg-emerald-700 text-white' : 'border border-slate-300'
        }`}
      >
        {selected && <Check className="w-3.5 h-3.5" />}
      </div>
    </button>
  );
};

// ---------------------------------------------------------------------------
// Review row
// ---------------------------------------------------------------------------
const ReviewRow: React.FC<{ label: string; value: string; onEdit?: () => void }> = ({
  label,
  value,
  onEdit,
}) => (
  <div className="p-4 flex items-start justify-between gap-3">
    <div className="min-w-0">
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-sm font-medium text-slate-900 break-words">{value}</div>
    </div>
    {onEdit && (
      <button
        onClick={onEdit}
        className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 shrink-0"
      >
        Edit
      </button>
    )}
  </div>
);

// ---------------------------------------------------------------------------
// Channel definitions
// ---------------------------------------------------------------------------
const channelDefinitions: {
  id: Channel;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'qr',
    label: 'QR code',
    description: 'For posters, counters, tables, receipts or displays.',
    icon: QrCode,
  },
  {
    id: 'link',
    label: 'Shareable web link',
    description: 'For messages, websites or digital communication.',
    icon: Link2,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'For sharing through WhatsApp customer communication.',
    icon: MessageCircle,
  },
  {
    id: 'sms',
    label: 'SMS',
    description: 'For sending the feedback link by text.',
    icon: MessageSquare,
  },
];

// ---------------------------------------------------------------------------
// Compact customer preview (step 4) — structure only, not canonical wording
// ---------------------------------------------------------------------------
interface CompactCustomerPreviewProps {
  organisationName: string;
  locationName: string;
  pointName: string;
  measures: Measure[];
  language: 'en' | 'fr';
}

const CompactCustomerPreview: React.FC<CompactCustomerPreviewProps> = ({
  organisationName,
  locationName,
  pointName,
  measures: previewMeasures,
  language,
}) => {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (previewMeasures.length === 0) {
    return (
      <div className="text-center text-xs text-slate-500 py-8">
        Select at least one area to preview.
      </div>
    );
  }

  const current = previewMeasures[Math.min(index, previewMeasures.length - 1)];
  const scaleOptions = SCALE_DEFINITIONS[current.scaleFamily] || SCALE_DEFINITIONS.quality;
  const questionText =
    language === 'fr' && current.standardQuestionFr
      ? current.standardQuestionFr
      : current.standardQuestion;
  const progress = Math.round(((index + 1) / previewMeasures.length) * 100);

  return (
    <div className="flex justify-center">
      <div className="w-[320px] max-w-full p-2.5 bg-slate-900 rounded-[40px] shadow-xl border-4 border-slate-800">
        <div className="w-24 h-3.5 bg-slate-900 mx-auto rounded-b-xl mb-1" />
        <div className="rounded-[30px] overflow-hidden bg-white">
          {/* header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-black text-xs flex items-center justify-center">
              {organisationName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-[11px] truncate">
                {organisationName}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {locationName} • {pointName}
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4 min-h-[340px] flex flex-col">
            {submitted ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="text-sm font-bold text-slate-900">Thank you</div>
                <div className="text-[11px] text-slate-500">
                  Your feedback has been shared with the team.
                </div>
                <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                  Preview only — not recorded
                </div>
              </div>
            ) : (
              <>
                {/* progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                    <span>
                      Question {index + 1} of {previewMeasures.length}
                    </span>
                    <span className="text-emerald-700 font-bold">{current.name}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 leading-snug">
                    {questionText}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Please tap the choice that best matches your experience.
                  </p>
                </div>

                <div className="space-y-2">
                  {scaleOptions.map((opt) => {
                    const isSelected = answers[current.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [current.id]: opt.value }))
                        }
                        className={`w-full p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between min-h-[44px] ${
                          isSelected
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-500'
                        }`}
                      >
                        <span>{opt.value}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <button
                    disabled={index === 0}
                    onClick={() => setIndex((i) => Math.max(0, i - 1))}
                    className={`text-[11px] font-semibold ${
                      index === 0 ? 'text-slate-300' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Previous
                  </button>
                  {index < previewMeasures.length - 1 ? (
                    <button
                      onClick={() => setIndex((i) => Math.min(previewMeasures.length - 1, i + 1))}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[11px] font-bold"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={() => setSubmitted(true)}
                      className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-[11px] font-bold"
                    >
                      Submit
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 text-center text-[9px] text-slate-400">
            Powered by Fedoo
          </div>
        </div>
      </div>
    </div>
  );
};
