import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Check, 
  Building2, 
  MapPin, 
  Clock, 
  Globe, 
  Smartphone, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  Edit3, 
  Plus, 
  X, 
  Store, 
  HeartHandshake, 
  Coffee, 
  Stethoscope, 
  Briefcase, 
  Hotel, 
  ShoppingBag, 
  Landmark, 
  Radio, 
  Truck, 
  HelpCircle,
  Search
} from 'lucide-react';
import { OnboardingData } from '../types';
import { 
  ONBOARDING_SECTORS, 
  SERVICE_MODELS, 
  COUNTRIES, 
  COMMON_TIMEZONES, 
  FOUNDER_PRESETS 
} from '../data/onboardingData';

interface FirstRunSetupProps {
  onCompleteSetup: (data: OnboardingData, destination: 'feedback_point' | 'overview') => void;
  onCancel?: () => void;
}

export const FirstRunSetup: React.FC<FirstRunSetupProps> = ({
  onCompleteSetup,
}) => {
  // Active step: 1 (Welcome), 2 (Business), 3 (What you do), 4 (Service experience), 
  // 5 (Where you operate), 6 (Fedoo setup), 7 (Review), 8 (Completion ready)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Initialize with the primary founder-review scenario: Vera Beauty
  const [formData, setFormData] = useState<OnboardingData>(FOUNDER_PRESETS['vera-beauty']);

  // Custom service input state for Step 3
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [showAddCustomService, setShowAddCustomService] = useState(false);

  // Timezone selector state for Step 5
  const [showTzPicker, setShowTzPicker] = useState(false);
  const [tzSearchQuery, setTzSearchQuery] = useState('');

  // Find active sector config
  const currentSectorConfig = ONBOARDING_SECTORS.find(
    (s) => s.name === formData.sector
  ) || ONBOARDING_SECTORS[0];

  // Auto-sync country defaults when country changes
  const handleCountryChange = (countryName: string) => {
    const matchedCountry = COUNTRIES.find((c) => c.name === countryName);
    setFormData((prev) => ({
      ...prev,
      country: countryName,
      city: prev.city || (matchedCountry ? matchedCountry.defaultCity : ''),
      firstLocationCity: prev.firstLocationCity || (matchedCountry ? matchedCountry.defaultCity : ''),
      timezone: matchedCountry ? matchedCountry.tzOffset : prev.timezone,
      timezoneLabel: matchedCountry ? matchedCountry.timezone : prev.timezoneLabel,
    }));
  };

  // Auto-adapt when sector changes
  const handleSectorChange = (sectorName: string) => {
    const nextSectorConfig = ONBOARDING_SECTORS.find((s) => s.name === sectorName) || ONBOARDING_SECTORS[0];
    const defaultCategory = nextSectorConfig.categories[0] || '';
    const initialServices = nextSectorConfig.serviceExamples.slice(0, 3);
    const defaultPlaceholder = nextSectorConfig.defaultLocationPlaceholder;

    // Reset contextual answers to defaults for the new sector
    const newContextAnswers: Record<string, string> = {};
    nextSectorConfig.contextQuestions.forEach((q) => {
      newContextAnswers[q.id] = q.options[0] || '';
    });

    setFormData((prev) => ({
      ...prev,
      sector: sectorName,
      category: defaultCategory,
      services: initialServices,
      firstLocationName: prev.firstLocationName === '' || prev.firstLocationName === currentSectorConfig.defaultLocationPlaceholder
        ? defaultPlaceholder
        : prev.firstLocationName,
      contextualAnswers: newContextAnswers,
    }));
  };

  // Toggle service selection
  const toggleService = (serviceName: string) => {
    setFormData((prev) => {
      const exists = prev.services.includes(serviceName);
      if (exists) {
        return { ...prev, services: prev.services.filter((s) => s !== serviceName) };
      } else {
        return { ...prev, services: [...prev.services, serviceName] };
      }
    });
  };

  // Add custom service
  const handleAddCustomService = () => {
    const trimmed = customServiceInput.trim();
    if (trimmed && !formData.services.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, trimmed],
      }));
      setCustomServiceInput('');
      setShowAddCustomService(false);
    }
  };

  // Toggle service delivery model
  const toggleServiceModel = (modelLabel: string) => {
    setFormData((prev) => {
      const exists = prev.serviceModels.includes(modelLabel);
      if (exists) {
        if (prev.serviceModels.length <= 1) return prev; // Keep at least one
        return { ...prev, serviceModels: prev.serviceModels.filter((m) => m !== modelLabel) };
      } else {
        return { ...prev, serviceModels: [...prev.serviceModels, modelLabel] };
      }
    });
  };

  // Toggle customer feedback language
  const toggleCustomerLanguage = (lang: string) => {
    setFormData((prev) => {
      const exists = prev.feedbackLanguages.includes(lang);
      if (exists) {
        if (prev.feedbackLanguages.length <= 1) return prev; // Keep at least one
        return { ...prev, feedbackLanguages: prev.feedbackLanguages.filter((l) => l !== lang) };
      } else {
        return { ...prev, feedbackLanguages: [...prev.feedbackLanguages, lang] };
      }
    });
  };

  // Load a founder review preset
  const loadPreset = (presetKey: string) => {
    const preset = FOUNDER_PRESETS[presetKey];
    if (preset) {
      setFormData(preset);
      setShowTzPicker(false);
    }
  };

  // Filtered timezones for picker
  const filteredTimezones = COMMON_TIMEZONES.filter((tz) =>
    tz.label.toLowerCase().includes(tzSearchQuery.toLowerCase()) ||
    tz.offset.toLowerCase().includes(tzSearchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-3xl mx-auto py-4 sm:py-8 px-3 sm:px-6">
      {/* 0. FOUNDER REVIEW SCENARIO SWITCHER (PROTOTYPE CONTROLS) */}
      <aside 
        aria-label="Founder Review Presets"
        className="mb-4 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md text-white"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800 text-[11px]">
          <div className="flex items-center gap-1.5 font-medium text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold">Founder Review Presets:</span>
            <span className="text-slate-400 hidden md:inline">Instantly test sector adaptations</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => loadPreset('vera-beauty')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                formData.organisationName === 'Vera Beauty'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Vera Beauty (Burundi)
            </button>
            <button
              onClick={() => loadPreset('bubbles-cafe')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                formData.organisationName === 'Bubbles Café'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Bubbles Café (Kenya)
            </button>
            <button
              onClick={() => loadPreset('city-clinic')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                formData.organisationName === 'City Health Clinic'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              City Clinic (Rwanda)
            </button>
            <button
              onClick={() => loadPreset('apex-advisory')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                formData.organisationName === 'Apex Advisory Partners'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Apex Advisory (UK)
            </button>
            <button
              onClick={() => loadPreset('blank')}
              className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                formData.organisationName === ''
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
              title="Clear all fields for fresh input testing"
            >
              Clear Form
            </button>
          </div>
        </div>

        {/* Quick step navigation bar */}
        <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400 overflow-x-auto gap-1">
          <span className="font-semibold text-slate-300 shrink-0 mr-1">Jump to Step:</span>
          {[
            { num: 1, label: '1. Welcome' },
            { num: 2, label: '2. Business' },
            { num: 3, label: '3. What you do' },
            { num: 4, label: '4. Service model' },
            { num: 5, label: '5. Location' },
            { num: 6, label: '6. Fedoo setup' },
            { num: 7, label: '7. Review' },
            { num: 8, label: 'Ready' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`px-2 py-0.5 rounded transition-colors shrink-0 ${
                currentStep === s.num
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'hover:text-white hover:bg-slate-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </aside>

      {/* MAIN PROGRESSIVE ONBOARDING CARD */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden transition-all">
        {/* Onboarding Shell Header */}
        <div className="bg-slate-950 px-5 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center shadow-xs">
              F
            </div>
            <div>
              <div className="text-xs font-bold tracking-tight text-slate-100 flex items-center gap-1.5">
                <span>Fedoo Organisation Onboarding</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  SME Flow
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {currentStep === 1 && 'Welcome & Service Context'}
                {currentStep === 2 && 'Step 2 of 7 — Your business identity'}
                {currentStep === 3 && 'Step 3 of 7 — What you do'}
                {currentStep === 4 && 'Step 4 of 7 — How customers experience your service'}
                {currentStep === 5 && 'Step 5 of 7 — Where you operate'}
                {currentStep === 6 && 'Step 6 of 7 — Your Fedoo setup'}
                {currentStep === 7 && 'Step 7 of 7 — Review & confirm'}
                {currentStep === 8 && 'Organisation ready'}
              </div>
            </div>
          </div>

          {/* Progress Pill */}
          {currentStep >= 1 && currentStep <= 7 && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="hidden sm:inline text-[11px]">Step {currentStep} of 7</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                  <div
                    key={s}
                    className={`w-2.5 sm:w-3.5 h-1.5 rounded-full transition-all ${
                      s === currentStep
                        ? 'bg-emerald-400 w-5 sm:w-6'
                        : s < currentStep
                        ? 'bg-emerald-600'
                        : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* STEP CONTENTS */}
        <div className="p-5 sm:p-8 lg:p-10">
          {/* ================================================================ */}
          {/* STEP 1 — WELCOME                                                 */}
          {/* ================================================================ */}
          {currentStep === 1 && (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200/80">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Survey Crafting Required</span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight leading-tight">
                  Welcome to Fedoo
                </h1>
                <p className="text-base sm:text-lg font-medium text-slate-900 mt-2">
                  Understand what customers are experiencing — without building surveys.
                </p>
                <p className="text-slate-600 text-sm mt-2 max-w-xl leading-relaxed">
                  Tell us a little about your business. Fedoo uses that context to recommend what is worth measuring and the right questions to ask.
                </p>
              </div>

              {/* 3 Short Benefit Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 text-xs flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold mb-3.5">
                      <Store className="w-4 h-4 text-emerald-700" />
                    </div>
                    <h2 className="font-bold text-slate-900 text-sm">Understand your business</h2>
                    <p className="text-slate-600 mt-1.5 leading-relaxed text-[12px]">
                      Fedoo learns what you do and how customers experience your service.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 text-xs flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold mb-3.5">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                    </div>
                    <h2 className="font-bold text-slate-900 text-sm">Measure what matters</h2>
                    <p className="text-slate-600 mt-1.5 leading-relaxed text-[12px]">
                      Fedoo recommends relevant service-experience Measures instead of giving you a blank survey.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 text-xs flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold mb-3.5">
                      <Radio className="w-4 h-4 text-emerald-700" />
                    </div>
                    <h2 className="font-bold text-slate-900 text-sm">Keep listening</h2>
                    <p className="text-slate-600 mt-1.5 leading-relaxed text-[12px]">
                      Your Feedback Points stay available while the measurement behind them can evolve over time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Takes less than 3 minutes to set up
                </span>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="min-h-[44px] flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-sm transition-all active:scale-98"
                >
                  <span>Set up my Organisation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 2 — YOUR BUSINESS                                           */}
          {/* ================================================================ */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Step 2 of 7
                </span>
                <h2 className="text-2xl font-bold text-slate-950 mt-1">
                  Tell us about your business
                </h2>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                  This helps Fedoo understand the kind of service experience your customers have.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Business Name */}
                <div>
                  <label className="font-bold text-slate-900 block mb-1 text-xs">
                    Business / Organisation name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vera Beauty"
                    value={formData.organisationName}
                    onChange={(e) => setFormData({ ...formData, organisationName: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                  />
                </div>

                {/* Country and City Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-900 block mb-1 text-xs">
                      Country <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-900 block mb-1 text-xs">
                      City / town <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bujumbura"
                      value={formData.city}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          city: val,
                          firstLocationCity: formData.firstLocationCity || val,
                        });
                      }}
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Website or Social Page */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-900 text-xs">
                      Website or social page
                    </label>
                    <span className="text-slate-400 text-[11px]">Optional</span>
                  </div>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. instagram.com/verabeauty or verabeauty.bi"
                      value={formData.websiteOrSocial || ''}
                      onChange={(e) => setFormData({ ...formData, websiteOrSocial: e.target.value })}
                      className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Helps Fedoo identify public hours or service menus where helpful.
                  </span>
                </div>
              </div>

              {/* Back / Continue */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="min-h-[44px] px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={!formData.organisationName.trim() || !formData.city.trim()}
                  onClick={() => setCurrentStep(3)}
                  className="min-h-[44px] flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 3 — WHAT YOU DO                                             */}
          {/* ================================================================ */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Step 3 of 7
                </span>
                <h2 className="text-2xl font-bold text-slate-950 mt-1">
                  What kind of business are you?
                </h2>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                  Fedoo adapts its measurement library to the exact services you deliver.
                </p>
              </div>

              <div className="space-y-5 text-xs">
                {/* Sector Selector */}
                <div>
                  <label className="font-bold text-slate-900 block mb-1.5 text-xs">
                    Service Sector <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) => handleSectorChange(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  >
                    {ONBOARDING_SECTORS.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Business Category (adapts by sector) */}
                <div>
                  <label className="font-bold text-slate-900 block mb-1.5 text-xs">
                    Business category for <span className="text-emerald-800 font-semibold">{formData.sector}</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {currentSectorConfig.categories.map((cat) => {
                      const isSelected = formData.category === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat })}
                          className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{cat}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 ml-1" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* What services do you provide? (multi-select + custom add) */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-900 text-xs">
                      What services do you provide?
                    </label>
                    <span className="text-slate-500 text-[11px]">
                      Select all that apply
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {currentSectorConfig.serviceExamples.map((service) => {
                      const isSelected = formData.services.includes(service);
                      return (
                        <button
                          key={service}
                          type="button"
                          onClick={() => toggleService(service)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>{service}</span>
                        </button>
                      );
                    })}

                    {/* Any custom added services */}
                    {formData.services
                      .filter((s) => !currentSectorConfig.serviceExamples.includes(s))
                      .map((custom) => (
                        <span
                          key={custom}
                          className="px-3 py-2 rounded-xl text-xs font-medium bg-emerald-800 text-white flex items-center gap-1.5 shadow-xs"
                        >
                          <Check className="w-3 h-3" />
                          <span>{custom}</span>
                          <button
                            type="button"
                            onClick={() => toggleService(custom)}
                            className="text-emerald-200 hover:text-white ml-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                  </div>

                  {/* Add another service input */}
                  {showAddCustomService ? (
                    <div className="flex items-center gap-2 max-w-sm mt-2">
                      <input
                        type="text"
                        placeholder="e.g. Bridal Packages or Custom Consulting"
                        value={customServiceInput}
                        onChange={(e) => setCustomServiceInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomService();
                          }
                        }}
                        className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomService}
                        className="px-3 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddCustomService(false);
                          setCustomServiceInput('');
                        }}
                        className="p-2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddCustomService(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 p-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add another service</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Back / Continue */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="min-h-[44px] px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={formData.services.length === 0}
                  onClick={() => setCurrentStep(4)}
                  className="min-h-[44px] flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 4 — HOW CUSTOMERS EXPERIENCE YOUR SERVICE                   */}
          {/* ================================================================ */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Step 4 of 7
                </span>
                <h2 className="text-2xl font-bold text-slate-950 mt-1">
                  How do customers usually receive your service?
                </h2>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                  Choose everything that applies. Fedoo uses this to understand which parts of the customer experience are relevant.
                </p>
              </div>

              {/* Large selectable cards for Service Models */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SERVICE_MODELS.map((model) => {
                  const isSelected = formData.serviceModels.includes(model.label);
                  return (
                    <div
                      key={model.id}
                      onClick={() => toggleServiceModel(model.label)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/40'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{model.label}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 leading-snug">
                          {model.desc}
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-emerald-700 text-white' : 'border border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Contextual follow-up questions tailored to sector */}
              {currentSectorConfig.contextQuestions.length > 0 && (
                <div className="pt-4 border-t border-slate-200/70 space-y-4">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Sector Experience Details ({formData.sector})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentSectorConfig.contextQuestions.map((q) => (
                      <div key={q.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                        <label className="font-bold text-slate-800 text-xs block mb-2 leading-snug">
                          {q.question}
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {q.options.map((opt) => {
                            const isSelected = formData.contextualAnswers[q.id] === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    contextualAnswers: {
                                      ...formData.contextualAnswers,
                                      [q.id]: opt,
                                    },
                                  })
                                }
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  isSelected
                                    ? 'bg-emerald-700 text-white shadow-xs font-bold'
                                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Back / Continue */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="min-h-[44px] px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={formData.serviceModels.length === 0}
                  onClick={() => setCurrentStep(5)}
                  className="min-h-[44px] flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 5 — WHERE YOU OPERATE                                       */}
          {/* ================================================================ */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Step 5 of 7
                </span>
                <h2 className="text-2xl font-bold text-slate-950 mt-1">
                  Where do you serve customers first?
                </h2>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                  A Location is a branch, shop, office or other place where customers receive your service. You can add more later.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Location Name */}
                <div>
                  <label className="font-bold text-slate-900 block mb-1 text-xs">
                    Location name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. ${currentSectorConfig.defaultLocationPlaceholder}`}
                    value={formData.firstLocationName}
                    onChange={(e) => setFormData({ ...formData, firstLocationName: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    What customers or team members call this physical branch or service location.
                  </span>
                </div>

                {/* City and Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-900 block mb-1 text-xs">
                      City / area <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bujumbura"
                      value={formData.firstLocationCity}
                      onChange={(e) => setFormData({ ...formData, firstLocationCity: e.target.value })}
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-900 text-xs">
                        Physical address
                      </label>
                      <span className="text-slate-400 text-[11px]">Optional</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Avenue du Large, Rohero I"
                      value={formData.firstLocationAddress || ''}
                      onChange={(e) => setFormData({ ...formData, firstLocationAddress: e.target.value })}
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Multi-location question */}
                <div className="pt-2">
                  <label className="font-bold text-slate-900 block mb-2 text-xs">
                    Does your business have more than one Location?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, hasMoreLocations: 'no' })}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        formData.hasMoreLocations === 'no'
                          ? 'bg-emerald-50/80 border-emerald-500 font-bold text-emerald-950 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="text-xs">No, just this one</div>
                        <div className="text-[11px] text-slate-500 font-normal">Single physical premises or unit</div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.hasMoreLocations === 'no' ? 'border-emerald-700 bg-emerald-700' : 'border-slate-300'}`}>
                        {formData.hasMoreLocations === 'no' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, hasMoreLocations: 'yes' })}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        formData.hasMoreLocations === 'yes'
                          ? 'bg-emerald-50/80 border-emerald-500 font-bold text-emerald-950 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="text-xs">Yes, I’ll add the others later</div>
                        <div className="text-[11px] text-slate-500 font-normal">Branches, kiosks, or regional hubs</div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.hasMoreLocations === 'yes' ? 'border-emerald-700 bg-emerald-700' : 'border-slate-300'}`}>
                        {formData.hasMoreLocations === 'yes' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Timezone (Automatic friendly detection + Change button) */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">Time zone</div>
                        <div className="text-sm font-semibold text-emerald-950 mt-0.5">
                          {formData.timezoneLabel}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          We detected this from your device and business location ({formData.country}).
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowTzPicker(!showTzPicker)}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-950 px-2.5 py-1 rounded-lg hover:bg-emerald-100/50 transition-colors shrink-0"
                    >
                      {showTzPicker ? 'Done' : 'Change'}
                    </button>
                  </div>

                  {/* Searchable Timezone Picker */}
                  {showTzPicker && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          placeholder="Search timezones..."
                          value={tzSearchQuery}
                          onChange={(e) => setTzSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {filteredTimezones.map((tz) => (
                          <button
                            key={tz.label}
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                timezone: tz.offset,
                                timezoneLabel: tz.label,
                              });
                              setShowTzPicker(false);
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                              formData.timezoneLabel === tz.label
                                ? 'bg-emerald-700 text-white font-bold'
                                : 'hover:bg-slate-200/60 text-slate-700'
                            }`}
                          >
                            <span>{tz.label}</span>
                            <span className="text-[11px] font-mono opacity-80">{tz.offset}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Back / Continue */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="min-h-[44px] px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={!formData.firstLocationName.trim() || !formData.firstLocationCity.trim()}
                  onClick={() => setCurrentStep(6)}
                  className="min-h-[44px] flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 6 — YOUR FEDOO SETUP                                        */}
          {/* ================================================================ */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Step 6 of 7
                </span>
                <h2 className="text-2xl font-bold text-slate-950 mt-1">
                  Who will manage Fedoo?
                </h2>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                  This is the Organisation’s administrative contact, not customer data.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Admin Name */}
                <div>
                  <label className="font-bold text-slate-900 block mb-1 text-xs">
                    Your name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. Fredrick Mulema"
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                      className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Work Email and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-900 block mb-1 text-xs">
                      Work email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        placeholder="e.g. fred@verabeauty.bi"
                        value={formData.adminEmail}
                        onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                        className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-900 text-xs">
                        Phone / WhatsApp
                      </label>
                      <span className="text-slate-400 text-[11px]">Optional</span>
                    </div>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        placeholder="e.g. +257 79 123 456"
                        value={formData.adminPhone || ''}
                        onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                        className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      For account and operational contact only.
                    </span>
                  </div>
                </div>

                {/* Admin Language Preference */}
                <div className="pt-2">
                  <label className="font-bold text-slate-900 block mb-1.5 text-xs">
                    Which language would you like to use in Fedoo?
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, adminLanguage: 'en' })}
                      className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                        formData.adminLanguage === 'en'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, adminLanguage: 'fr' })}
                      className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                        formData.adminLanguage === 'fr'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Français
                    </button>
                  </div>
                </div>

                {/* Customer Languages */}
                <div className="pt-2">
                  <label className="font-bold text-slate-900 block mb-1.5 text-xs">
                    Which languages do your customers commonly use?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['English', 'French', 'Other / later'].map((lang) => {
                      const isSelected = formData.feedbackLanguages.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => toggleCustomerLanguage(lang)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-700 text-white shadow-xs font-bold'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          <span>{lang}</span>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2">
                    Feedback language availability depends on the translations supported by Fedoo.
                  </p>
                </div>
              </div>

              {/* Back / Continue */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="min-h-[44px] px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={!formData.adminName.trim() || !formData.adminEmail.trim()}
                  onClick={() => setCurrentStep(7)}
                  className="min-h-[44px] flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98"
                >
                  <span>Review setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 7 — REVIEW                                                  */}
          {/* ================================================================ */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Step 7 of 7
                </span>
                <h2 className="text-2xl font-bold text-slate-950 mt-1">
                  Does this look right?
                </h2>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                  Review your business details. You can edit any section before finalizing.
                </p>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Section 1: Your Business */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      Your Business
                    </span>
                    <div className="text-sm font-extrabold text-slate-900">
                      {formData.organisationName || 'Untitled Business'}
                    </div>
                    <div className="text-slate-600 text-[11px] font-medium">
                      {formData.sector} → <span className="text-slate-900 font-semibold">{formData.category}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {formData.city}, {formData.country}
                      {formData.websiteOrSocial && ` • ${formData.websiteOrSocial}`}
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold text-xs p-1 rounded-lg hover:bg-emerald-100/50"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* Section 2: Services */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      Services Provided
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {formData.services.map((svc) => (
                        <span
                          key={svc}
                          className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 text-[11px] font-medium"
                        >
                          {svc}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold text-xs p-1 rounded-lg hover:bg-emerald-100/50"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* Section 3: How Customers Are Served */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      How Customers Are Served
                    </span>
                    <div className="text-slate-900 font-semibold text-xs">
                      {formData.serviceModels.join(' + ')}
                    </div>
                    {Object.entries(formData.contextualAnswers).map(([k, v]) => (
                      <div key={k} className="text-slate-500 text-[11px]">
                        • {v}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold text-xs p-1 rounded-lg hover:bg-emerald-100/50"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* Section 4: First Location */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      First Location
                    </span>
                    <div className="text-sm font-extrabold text-slate-900">
                      {formData.firstLocationName}
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      {formData.firstLocationCity}
                      {formData.firstLocationAddress ? ` • ${formData.firstLocationAddress}` : ''}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {formData.hasMoreLocations === 'yes' ? 'Multiple locations planned' : 'Single location business'}
                      {' • '}{formData.timezoneLabel}
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold text-xs p-1 rounded-lg hover:bg-emerald-100/50"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* Section 5: Fedoo Setup */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      Fedoo Setup & Administration
                    </span>
                    <div className="text-slate-900 font-semibold text-xs">
                      {formData.adminName} ({formData.adminEmail})
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      Admin Language: {formData.adminLanguage === 'en' ? 'English' : 'Français'}
                      {' • '}Customer Feedback: {formData.feedbackLanguages.join(' + ')}
                    </div>
                    {formData.adminPhone && (
                      <div className="text-slate-500 text-[11px]">
                        Phone: {formData.adminPhone}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setCurrentStep(6)}
                    className="flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold text-xs p-1 rounded-lg hover:bg-emerald-100/50"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(6)}
                  className="min-h-[44px] px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setCurrentStep(8)}
                  className="min-h-[44px] flex items-center gap-2 px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-98"
                >
                  <span>Finish setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* COMPLETION — ORGANISATION READY                                  */}
          {/* ================================================================ */}
          {currentStep === 8 && (
            <div className="space-y-6 sm:space-y-8 text-center animate-in fade-in duration-200 py-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  {formData.organisationName || 'Your business'} is ready in Fedoo
                </h2>
                <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto leading-relaxed">
                  We now understand your business, services and first Location. Next, set up where customers will give feedback.
                </p>
              </div>

              {/* Compact Summary Card */}
              <div className="max-w-md mx-auto p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-3 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="font-extrabold text-slate-900 text-sm">
                    {formData.organisationName}
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Organisation Created
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Sector & Type</span>
                    <span className="font-semibold text-slate-800">{formData.sector}</span>
                    <span className="text-slate-500 block">{formData.category}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">First Location</span>
                    <span className="font-semibold text-slate-800">{formData.firstLocationName}</span>
                    <span className="text-slate-500 block">{formData.firstLocationCity}, {formData.country}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Services Covered</span>
                  <div className="flex flex-wrap gap-1">
                    {formData.services.slice(0, 4).map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 text-[10px]">
                        {s}
                      </span>
                    ))}
                    {formData.services.length > 4 && (
                      <span className="px-1.5 py-0.5 text-slate-400 text-[10px]">
                        +{formData.services.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Next Journey */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <button
                  onClick={() => onCompleteSetup(formData, 'feedback_point')}
                  className="min-h-[44px] px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Store className="w-4 h-4" />
                  <span>Set up my first Feedback Point</span>
                </button>

                <button
                  onClick={() => onCompleteSetup(formData, 'overview')}
                  className="min-h-[44px] px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all active:scale-98"
                >
                  Go to Overview
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
