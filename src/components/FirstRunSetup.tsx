import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  QrCode, 
  Building2, 
  MapPin, 
  Clock, 
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { Measure } from '../types';

interface FirstRunSetupProps {
  onCompleteSetup: () => void;
  onOpenCustomerView: () => void;
}

export const FirstRunSetup: React.FC<FirstRunSetupProps> = ({
  onCompleteSetup,
  onOpenCustomerView,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [orgName, setOrgName] = useState('Bubbles Café');
  const [sector, setSector] = useState('Hospitality (Café, Dining & Bar)');
  const [firstLocation, setFirstLocation] = useState('Main Branch (Kilimani)');
  const [feedbackPointName, setFeedbackPointName] = useState('Table QR Stands — Dining Room');
  const [selectedMeasureIds, setSelectedMeasureIds] = useState<string[]>([
    'overall_experience',
    'speed_of_service',
    'staff_courtesy',
    'food_beverage_quality',
    'likelihood_to_return',
  ]);

  const recommendedMeasures = [
    { id: 'overall_experience', name: 'Overall Experience', desc: 'Holistic impression of the visit', scale: 'Quality' },
    { id: 'speed_of_service', name: 'Speed of Service', desc: 'Wait and preparation pacing', scale: 'Satisfaction' },
    { id: 'staff_courtesy', name: 'Staff Courtesy', desc: 'Frontline warmth and attentiveness', scale: 'Satisfaction' },
    { id: 'food_beverage_quality', name: 'Food & Beverage Quality', desc: 'Freshness, taste, and presentation', scale: 'Quality' },
    { id: 'likelihood_to_return', name: 'Likelihood to Return', desc: 'Customer retention and repeat visits', scale: 'Likelihood' },
  ];

  const toggleMeasure = (id: string) => {
    if (selectedMeasureIds.includes(id)) {
      if (selectedMeasureIds.length <= 1) return;
      setSelectedMeasureIds(selectedMeasureIds.filter((m) => m !== id));
    } else {
      setSelectedMeasureIds([...selectedMeasureIds, id]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      {/* Onboarding Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Step Indicator Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 font-bold flex items-center justify-center text-sm">
              F
            </div>
            <div>
              <span className="text-xs font-bold tracking-tight">Fedoo Setup</span>
              <div className="text-[10px] text-slate-400">Get Started in 2 Minutes</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Step {currentStep} of 4</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-4 h-1.5 rounded-full ${
                    s <= currentStep ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Step Contents */}
        <div className="p-6 sm:p-10">
          {/* STEP 1: Outcome Framing */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Survey Crafting Required</span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  Understand how customers experience your service.
                </h1>
                <p className="text-slate-600 text-sm mt-2 max-w-xl leading-relaxed">
                  Fedoo replaces complex survey forms with standardized service questions and permanent table QR codes. You stay in control of what you measure.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-3">
                    1
                  </div>
                  <h2 className="font-bold text-slate-900">Choose What to Understand</h2>
                  <p className="text-slate-500 mt-1">Select key service drivers like Speed or Staff Courtesy.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-3">
                    2
                  </div>
                  <h2 className="font-bold text-slate-900">Get Permanent QR Codes</h2>
                  <p className="text-slate-500 mt-1">Display on tables or counters. Codes never need reprinting.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-3">
                    3
                  </div>
                  <h2 className="font-bold text-slate-900">See Live Service Results</h2>
                  <p className="text-slate-500 mt-1">Receive ratings, detect bottlenecks, and celebrate staff.</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                >
                  <span>Begin Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Organisation & First Location */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Your Business Context
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  Tell us about your business
                </h2>
                <p className="text-slate-600 text-xs mt-1">
                  We suggest relevant questions tailored to your service type.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Business / Brand Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Service Sector</label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900"
                  >
                    <option value="Hospitality (Café, Dining & Bar)">Hospitality (Café, Dining & Bar)</option>
                    <option value="Retail & Storefront">Retail & Storefront</option>
                    <option value="Healthcare & Clinic">Healthcare & Clinic</option>
                    <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                    <option value="Financial & Branch Services">Financial & Branch Services</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">First Location Name</label>
                  <input
                    type="text"
                    value={firstLocation}
                    onChange={(e) => setFirstLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    You can add additional locations or branches at any time.
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Recommended Questions */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Recommended Questions
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  What do you want to understand?
                </h2>
                <p className="text-slate-600 text-xs mt-1">
                  Here is the recommended question set for hospitality. You can adjust this anytime:
                </p>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2">
                {recommendedMeasures.map((m) => {
                  const isSelected = selectedMeasureIds.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleMeasure(m.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900">{m.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{m.desc}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {m.scale}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-emerald-700 text-white' : 'border border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span className="font-semibold text-slate-800">
                  Customer Time to Complete:
                </span>
                <span>
                  {selectedMeasureIds.length} questions • ~{selectedMeasureIds.length * 6} seconds
                </span>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  <span>Create First Feedback Point</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: First Feedback Point Ready */}
          {currentStep === 4 && (
            <div className="space-y-6 text-center animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Your feedback point is ready!
                </h2>
                <p className="text-slate-600 text-xs mt-1 max-w-md mx-auto">
                  QR code created for <strong>{firstLocation}</strong>. Place on tables or counters to begin hearing from customers.
                </p>
              </div>

              {/* QR Stand Preview */}
              <div className="inline-block p-5 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs text-xs">
                <div className="font-bold text-slate-800">{orgName}</div>
                <div className="text-[11px] text-slate-500">{firstLocation}</div>
                <div className="my-3 p-3 bg-white border border-slate-200 rounded-xl inline-block">
                  <div className="w-32 h-32 bg-slate-900 rounded-lg p-2 flex flex-col justify-center items-center text-white relative">
                    <QrCode className="w-24 h-24 text-white" />
                  </div>
                </div>
                <div className="font-semibold text-slate-700">Scan to rate your service</div>
                <div className="text-[10px] text-slate-400">fedoo.me/ep-bubbles-main</div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={onOpenCustomerView}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Test as Customer</span>
                </button>

                <button
                  onClick={onCompleteSetup}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Open Live Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
