import React, { useState } from 'react';

type ScenarioDraft = {
  entryRevenue: string;
  growthRate: string;
  entryMargin: string;
  targetMargin: string;
  holdPeriod: string;
  entryMultiple: string;
  exitMultiple: string;
  exitNetDebt: string;
};

type ScenarioDisplay = ScenarioDraft & {
  exitRevenue: number;
  entryEV: number;
  exitEV: number;
  opValueAdd: number;
  reRating: number;
  totalValueCreated: number;
  performanceUpside: number;
  exitEquityValue: number;
};

const emptyDraft: ScenarioDraft = {
  entryRevenue: '',
  growthRate: '',
  entryMargin: '',
  targetMargin: '',
  holdPeriod: '',
  entryMultiple: '',
  exitMultiple: '',
  exitNetDebt: ''
};

const computeScenario = (draft: ScenarioDraft): ScenarioDisplay => {
  const numEntryRev = Number(draft.entryRevenue);
  const numGrowth = Number(draft.growthRate);
  const numHold = Number(draft.holdPeriod);
  const numEntryMargin = Number(draft.entryMargin);
  const numTargetMargin = Number(draft.targetMargin);
  const numEntryMult = Number(draft.entryMultiple);
  const numExitMult = Number(draft.exitMultiple);
  const numExitNetDebt = Number(draft.exitNetDebt) || 0;

  const exitRevenue = numEntryRev * Math.pow(1 + numGrowth / 100, numHold);
  const entryEBITDA = numEntryRev * (numEntryMargin / 100);
  const exitEBITDA = exitRevenue * (numTargetMargin / 100);
  const entryEV = entryEBITDA * numEntryMult;
  const exitEV = exitEBITDA * numExitMult;
  const opValueAdd = (exitEBITDA - entryEBITDA) * numEntryMult;
  const reRating = exitEBITDA * (numExitMult - numEntryMult);
  const totalValueCreated = exitEV - entryEV;
  const performanceUpside = entryEV !== 0 ? (totalValueCreated / entryEV) * 100 : 0;
  const exitEquityValue = exitEV - numExitNetDebt;

  return {
    ...draft,
    exitRevenue,
    entryEV,
    exitEV,
    opValueAdd,
    reRating,
    totalValueCreated,
    performanceUpside,
    exitEquityValue
  };
};

const ValueCreationSimulator = () => {
  const [activeScenario, setActiveScenario] = useState<'base' | 'upside'>('base');
  const [baseDraft, setBaseDraft] = useState<ScenarioDraft>({ ...emptyDraft });
  const [upsideDraft, setUpsideDraft] = useState<ScenarioDraft>({ ...emptyDraft });
  const [baseDisplay, setBaseDisplay] = useState<ScenarioDisplay | null>(null);
  const [upsideDisplay, setUpsideDisplay] = useState<ScenarioDisplay | null>(null);
  const [upsideEverActivated, setUpsideEverActivated] = useState(false);
  const [waterfallScenario, setWaterfallScenario] = useState<'base' | 'upside'>('base');

  const draft = activeScenario === 'base' ? baseDraft : upsideDraft;
  const setDraft = activeScenario === 'base' ? setBaseDraft : setUpsideDraft;

  const handleInputChange = (field: keyof ScenarioDraft, value: string) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleSwitchScenario = (scenario: 'base' | 'upside') => {
    if (scenario === 'upside' && !upsideEverActivated) {
      setUpsideDraft({ ...baseDraft });
      setUpsideEverActivated(true);
    }
    setActiveScenario(scenario);
  };

  const isCalculable = (d: ScenarioDraft) =>
    !!(d.entryRevenue && d.growthRate && d.entryMargin && d.targetMargin &&
       d.holdPeriod && d.entryMultiple && d.exitMultiple);

  const handleCalculate = () => {
    if (!isCalculable(draft)) return;
    const result = computeScenario(draft);
    if (activeScenario === 'base') {
      setBaseDisplay(result);
    } else {
      setUpsideDisplay(result);
    }
  };

  const handleReset = () => {
    setBaseDraft({ ...emptyDraft });
    setUpsideDraft({ ...emptyDraft });
    setBaseDisplay(null);
    setUpsideDisplay(null);
    setActiveScenario('base');
    setUpsideEverActivated(false);
    setWaterfallScenario('base');
  };

  const display = activeScenario === 'base' ? baseDisplay : upsideDisplay;

  const formatCurrency = (val: number) => {
    const abs = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}B`;
    return `${sign}$${Math.round(abs).toLocaleString()}M`;
  };

  const labelStyle = "block text-[10px] font-bold text-[#64748B] uppercase tracking-[0.1em] mb-2 h-auto md:h-[42px] flex items-end overflow-hidden";
  const inputStyle = "w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-none px-3 py-3 text-[14px] text-[#1E293B] focus:outline-none focus:border-[#475569] transition-all placeholder-[#94A3B8]";
  const headerStyle = "text-[#1E293B] text-[11px] font-black uppercase tracking-[0.2em] mb-6 border-b border-[#E2E8F0] pb-2";

  // Waterfall bars for one or two scenarios
  const buildBars = (sc: ScenarioDisplay, hasDebt: boolean) => [
    { label: 'Entry EV', value: sc.entryEV, type: 'base' as const },
    { label: 'Operational Value Add', value: sc.opValueAdd, type: sc.opValueAdd >= 0 ? 'positive' as const : 'negative' as const },
    { label: 'Valuation Re-Rating', value: sc.reRating, type: sc.reRating >= 0 ? 'positive' as const : 'negative' as const },
    { label: 'Exit EV', value: sc.exitEV, type: 'base' as const },
    ...(hasDebt ? [{ label: 'Exit Net Debt', value: -Number(sc.exitNetDebt), type: 'negative' as const }] : []),
    ...(hasDebt ? [{ label: 'Exit Equity Value', value: sc.exitEquityValue, type: 'base' as const }] : []),
  ];

  const getBarBg = (type: string, isUpside = false) => {
    if (type === 'base') return isUpside ? 'bg-[#475569]' : 'bg-[#1E293B]';
    if (type === 'positive') return isUpside ? 'bg-emerald-400' : 'bg-emerald-500';
    return isUpside ? 'bg-red-300' : 'bg-red-400';
  };

  const getLabelColor = (type: string) => {
    if (type === 'base') return 'text-[#1E293B]';
    if (type === 'positive') return 'text-emerald-600';
    return 'text-red-500';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-10 pb-10 md:pb-20 font-sans bg-white text-left">

      <div className="w-full">
        <p className="text-[14px] md:text-[16px] text-[#64748B] leading-relaxed">
          Use this tool to see how different factors drive a company's value over time.
          By entering your current numbers and future targets, you can see exactly how much value
          comes from growing sales, improving profits, or selling the business at a better price.
        </p>
      </div>

      {/* SCENARIO TOGGLE PILLS */}
      <div className="flex gap-2">
        <button
          onClick={() => handleSwitchScenario('base')}
          className={`px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
            activeScenario === 'base'
              ? 'bg-[#1E293B] text-white border-[#1E293B]'
              : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#475569] hover:text-[#475569]'
          }`}
        >
          Base Case
        </button>
        <button
          onClick={() => handleSwitchScenario('upside')}
          className={`px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
            activeScenario === 'upside'
              ? 'bg-[#475569] text-white border-[#475569]'
              : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#475569] hover:text-[#475569]'
          }`}
        >
          Upside Case
        </button>
        {upsideEverActivated && (
          <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest self-center ml-2">
            {baseDisplay && upsideDisplay
              ? '● Both scenarios calculated'
              : baseDisplay
              ? '◐ Base Case calculated — run Upside Case to compare'
              : '○ Calculate Base Case first'}
          </span>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* INPUT WORKSPACE */}
        <div className="w-full lg:w-2/3 bg-white p-6 md:p-8 border border-[#E2E8F0] shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 text-left">

            <div className="space-y-6">
              <h3 className={headerStyle}>Operational Drivers</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Entry Revenue ($M)</label>
                  <input type="number" placeholder="1000" value={draft.entryRevenue} onChange={(e) => handleInputChange('entryRevenue', e.target.value)} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>Growth Rate (%)</label>
                  <input type="number" placeholder="5" value={draft.growthRate} onChange={(e) => handleInputChange('growthRate', e.target.value)} className={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Entry Margin %</label>
                  <input type="number" placeholder="10" value={draft.entryMargin} onChange={(e) => handleInputChange('entryMargin', e.target.value)} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>Target Margin %</label>
                  <input type="number" placeholder="15" value={draft.targetMargin} onChange={(e) => handleInputChange('targetMargin', e.target.value)} className={inputStyle} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className={headerStyle}>Exit Parameters</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Hold Period (Yrs)</label>
                  <input type="number" placeholder="5" value={draft.holdPeriod} onChange={(e) => handleInputChange('holdPeriod', e.target.value)} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>Entry Multiple (x)</label>
                  <input type="number" placeholder="10.0" value={draft.entryMultiple} onChange={(e) => handleInputChange('entryMultiple', e.target.value)} className={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Exit Multiple (x)</label>
                  <input type="number" placeholder="12.0" value={draft.exitMultiple} onChange={(e) => handleInputChange('exitMultiple', e.target.value)} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>Exit Net Debt ($M)</label>
                  <input type="number" placeholder="200" value={draft.exitNetDebt} onChange={(e) => handleInputChange('exitNetDebt', e.target.value)} className={inputStyle} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-[#E2E8F0] pt-8 flex gap-3">
            <button
              onClick={handleCalculate}
              disabled={!isCalculable(draft)}
              className="flex-1 bg-[#1E293B] hover:bg-[#334155] disabled:bg-[#94A3B8] disabled:cursor-not-allowed text-white font-bold uppercase tracking-[0.3em] text-[11px] py-4 transition-all"
            >
              {activeScenario === 'base' ? 'Calculate Base Case' : 'Calculate Upside Case'}
            </button>
            <button
              onClick={handleReset}
              type="button"
              className="w-32 border border-[#E2E8F0] text-[#64748B] hover:border-[#475569] hover:text-[#475569] font-bold uppercase tracking-[0.3em] text-[11px] py-4 transition-all"
            >
              Reset
            </button>
          </div>
        </div>

        {/* RESULTS PANEL */}
        <div className="w-full lg:w-1/3 bg-[#F8FAFC] border border-[#E2E8F0] p-6 md:p-10 flex flex-col justify-center shadow-inner min-h-[320px] md:min-h-[420px]">
          {!display ? (
            <div className="text-center text-[#94A3B8] italic text-sm">
              Enter details and click calculate to see results.
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              <div className="text-center space-y-2 mb-4">
                <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 inline-block ${
                  activeScenario === 'base' ? 'bg-[#1E293B] text-white' : 'bg-[#475569] text-white'
                }`}>
                  {activeScenario === 'base' ? 'Base Case' : 'Upside Case'}
                </span>
              </div>
              <div className="text-center space-y-4">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.4em] block">Total Value Created</span>
                <div className="text-4xl md:text-6xl font-light tracking-tighter text-[#1E293B]">
                  {formatCurrency(display.totalValueCreated)}
                </div>
                <div className={`text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] px-4 py-2 inline-block border-2 ${
                  display.performanceUpside > 0
                    ? 'border-emerald-500/20 text-emerald-700 bg-white'
                    : 'border-red-500/20 text-red-700 bg-white'
                }`}>
                  {display.performanceUpside > 0 ? '▲' : '▼'} {display.performanceUpside.toFixed(1)}% Performance Upside
                </div>
              </div>
              <div className="mt-8 md:mt-10 pt-8 border-t border-[#E2E8F0] space-y-4">
                <div className="flex flex-col sm:flex-row justify-between text-[9px] md:text-[10px] uppercase tracking-widest text-[#64748B] gap-1">
                  <span>Projected Exit Revenue:</span>
                  <span className="font-bold text-[#1E293B]">{formatCurrency(display.exitRevenue)}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between text-[9px] md:text-[10px] uppercase tracking-widest text-[#64748B] gap-1">
                  <span>Implied Exit EV:</span>
                  <span className="font-bold text-[#1E293B]">{formatCurrency(display.exitEV)}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between text-[9px] md:text-[10px] uppercase tracking-widest text-[#64748B] gap-1">
                  <span>Implied Exit Equity Value:</span>
                  <span className="font-bold text-[#1E293B]">{formatCurrency(display.exitEquityValue)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SCENARIO COMPARISON STRIP */}
      {baseDisplay && upsideDisplay && (
        <div className="border border-[#E2E8F0] p-6 md:p-8 space-y-5">
          <div className="border-b border-[#E2E8F0] pb-4">
            <h3 className="text-[#1E293B] text-[11px] font-black uppercase tracking-[0.2em]">
              Scenario Comparison
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest pb-3 pr-6 whitespace-nowrap">Metric</th>
                  <th className="text-[9px] font-black uppercase tracking-widest pb-3 pr-6 whitespace-nowrap text-[#1E293B]">
                    <span className="inline-block w-2 h-2 bg-[#1E293B] mr-1" />
                    Base Case
                  </th>
                  <th className="text-[9px] font-black uppercase tracking-widest pb-3 pr-6 whitespace-nowrap text-[#475569]">
                    <span className="inline-block w-2 h-2 bg-[#475569] mr-1" />
                    Upside Case
                  </th>
                  <th className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest pb-3 whitespace-nowrap">Delta</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: 'Total Value Created',
                    base: formatCurrency(baseDisplay.totalValueCreated),
                    upside: formatCurrency(upsideDisplay.totalValueCreated),
                    delta: upsideDisplay.totalValueCreated - baseDisplay.totalValueCreated,
                    isPercent: false
                  },
                  {
                    label: 'Performance Upside',
                    base: `${baseDisplay.performanceUpside.toFixed(1)}%`,
                    upside: `${upsideDisplay.performanceUpside.toFixed(1)}%`,
                    delta: upsideDisplay.performanceUpside - baseDisplay.performanceUpside,
                    isPercent: true
                  },
                  {
                    label: 'Projected Exit Revenue',
                    base: formatCurrency(baseDisplay.exitRevenue),
                    upside: formatCurrency(upsideDisplay.exitRevenue),
                    delta: upsideDisplay.exitRevenue - baseDisplay.exitRevenue,
                    isPercent: false
                  },
                  {
                    label: 'Implied Exit EV',
                    base: formatCurrency(baseDisplay.exitEV),
                    upside: formatCurrency(upsideDisplay.exitEV),
                    delta: upsideDisplay.exitEV - baseDisplay.exitEV,
                    isPercent: false
                  },
                  {
                    label: 'Implied Exit Equity Value',
                    base: formatCurrency(baseDisplay.exitEquityValue),
                    upside: formatCurrency(upsideDisplay.exitEquityValue),
                    delta: upsideDisplay.exitEquityValue - baseDisplay.exitEquityValue,
                    isPercent: false
                  },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[#F1F5F9] last:border-0">
                    <td className="py-3 pr-6 text-[11px] font-bold text-[#475569] uppercase tracking-wide whitespace-nowrap">{row.label}</td>
                    <td className="py-3 pr-6 text-[12px] font-bold text-[#1E293B]">{row.base}</td>
                    <td className="py-3 pr-6 text-[12px] font-bold text-[#475569]">{row.upside}</td>
                    <td className={`py-3 text-[11px] font-bold ${row.delta > 0 ? 'text-emerald-600' : row.delta < 0 ? 'text-red-500' : 'text-[#94A3B8]'}`}>
                      {row.delta > 0 ? '+' : ''}{row.isPercent ? `${row.delta.toFixed(1)}%` : formatCurrency(row.delta)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VALUE CREATION WATERFALL */}
      {(baseDisplay || upsideDisplay) && (
        <div className="border border-[#E2E8F0] p-6 md:p-8 space-y-5">
          <div className="flex items-baseline justify-between border-b border-[#E2E8F0] pb-4">
            <div className="flex items-baseline gap-3">
              <h3 className="text-[#1E293B] text-[11px] font-black uppercase tracking-[0.2em]">
                Value Creation Bridge
              </h3>
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
                Enterprise value waterfall from entry to exit
              </span>
            </div>
            {/* WATERFALL SCENARIO TOGGLE — only shows when both calculated */}
            {baseDisplay && upsideDisplay && (
              <div className="flex gap-1">
                <button
                  onClick={() => setWaterfallScenario('base')}
                  className={`px-3 py-1 text-[9px] font-black uppercase tracking-[0.15em] transition-all border ${
                    waterfallScenario === 'base'
                      ? 'bg-[#1E293B] text-white border-[#1E293B]'
                      : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#475569] hover:text-[#475569]'
                  }`}
                >
                  Base
                </button>
                <button
                  onClick={() => setWaterfallScenario('upside')}
                  className={`px-3 py-1 text-[9px] font-black uppercase tracking-[0.15em] transition-all border ${
                    waterfallScenario === 'upside'
                      ? 'bg-[#475569] text-white border-[#475569]'
                      : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#475569] hover:text-[#475569]'
                  }`}
                >
                  Upside
                </button>
              </div>
            )}
          </div>

          {(() => {
            const activeWaterfall = (baseDisplay && upsideDisplay)
              ? (waterfallScenario === 'base' ? baseDisplay : upsideDisplay)
              : (baseDisplay || upsideDisplay!);

            const hasDebt = Number(activeWaterfall.exitNetDebt) > 0;
            const bars = buildBars(activeWaterfall, hasDebt);
            const maxVal = Math.max(...bars.map(b => Math.abs(b.value)));
            const maxBarHeight = 120;

            return (
              <div className="overflow-x-auto">
                <div className="flex items-end gap-3 md:gap-6 min-w-[480px] pt-4" style={{ height: `${maxBarHeight + 80}px` }}>
                  {bars.map((bar, i) => {
                    const barHeight = Math.max(4, (Math.abs(bar.value) / maxVal) * maxBarHeight);
                    return (
                      <div key={i} className="flex flex-col items-center flex-1 min-w-[60px]">
                        <span className={`text-[9px] md:text-[10px] font-bold mb-2 text-center whitespace-nowrap ${getLabelColor(bar.type)}`}>
                          {bar.value < 0 ? '-' : ''}{formatCurrency(Math.abs(bar.value))}
                        </span>
                        <div
                          className={`w-full ${getBarBg(bar.type, waterfallScenario === 'upside' && !!(baseDisplay && upsideDisplay))} transition-all`}
                          style={{ height: `${barHeight}px` }}
                        />
                        <span className="text-[8px] md:text-[9px] font-bold text-[#94A3B8] uppercase tracking-wide mt-2 text-center leading-tight">
                          {bar.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-6 mt-4 pt-4 border-t border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${waterfallScenario === 'upside' && baseDisplay && upsideDisplay ? 'bg-[#475569]' : 'bg-[#1E293B]'}`} />
                    <span className="text-[9px] text-[#94A3B8] uppercase tracking-widest font-bold">EV Reference</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500" />
                    <span className="text-[9px] text-[#94A3B8] uppercase tracking-widest font-bold">Value Created</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400" />
                    <span className="text-[9px] text-[#94A3B8] uppercase tracking-widest font-bold">Value Reduction</span>
                  </div>
                </div>
              </div>
            );
          })()}

          <p className="text-[10px] text-[#94A3B8] italic">
            Operational Value Add and Valuation Re-Rating sum to Total Value Created. Exit Net Debt bar appears only when a debt figure is entered.
          </p>
        </div>
      )}

      {/* CALCULATION LOGIC & STRATEGY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 border-t border-[#E2E8F0] pt-12">
        <div className="space-y-8">
          <h3 className="text-[#1E293B] text-[11px] font-black uppercase tracking-[0.25em] italic opacity-50">Calculation Logic</h3>
          <div className="space-y-6 text-left">
            <div className="border-b border-[#F1F5F9] pb-4">
              <span className="text-[11px] font-bold text-[#475569] uppercase block mb-1">Operational Value Add</span>
              <p className="text-[12px] text-[#64748B] mb-2 leading-relaxed">Measures value created purely through earnings growth, holding the entry multiple constant.</p>
              <div className="overflow-x-auto">
                <p className="text-[11px] md:text-[12px] font-mono text-[#1E293B] bg-[#F8FAFC] p-3 border border-[#E2E8F0] whitespace-nowrap">
                  (Exit EBITDA - Entry EBITDA) × Entry Multiple
                </p>
              </div>
            </div>
            <div className="border-b border-[#F1F5F9] pb-4">
              <span className="text-[11px] font-bold text-[#475569] uppercase block mb-1">Valuation Re-Rating</span>
              <p className="text-[12px] text-[#64748B] mb-2 leading-relaxed">Isolates value generated by selling the company at a higher multiple than it was purchased.</p>
              <div className="overflow-x-auto">
                <p className="text-[11px] md:text-[12px] font-mono text-[#1E293B] bg-[#F8FAFC] p-3 border border-[#E2E8F0] whitespace-nowrap">
                  Exit EBITDA × (Exit Multiple - Entry Multiple)
                </p>
              </div>
            </div>
            <div className="border-b border-[#F1F5F9] pb-4">
              <span className="text-[11px] font-bold text-[#475569] uppercase block mb-1">Performance Upside</span>
              <p className="text-[12px] text-[#64748B] mb-2 leading-relaxed">Total value created as a percentage increase over the initial entry enterprise value.</p>
              <div className="overflow-x-auto">
                <p className="text-[11px] md:text-[12px] font-mono text-[#1E293B] bg-[#F8FAFC] p-3 border border-[#E2E8F0] whitespace-nowrap">
                  (Total Value Created / Entry Enterprise Value) × 100
                </p>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#475569] uppercase block mb-1">Implied Exit Equity Value</span>
              <p className="text-[12px] text-[#64748B] mb-2 leading-relaxed">Exit-only reference showing equity proceeds after net debt is repaid at exit.</p>
              <div className="overflow-x-auto">
                <p className="text-[11px] md:text-[12px] font-mono text-[#1E293B] bg-[#F8FAFC] p-3 border border-[#E2E8F0] whitespace-nowrap">
                  Exit Enterprise Value - Exit Net Debt
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 text-left">
          <h3 className="text-[#1E293B] text-[11px] font-black uppercase tracking-[0.25em] italic opacity-50">The Strategy</h3>
          <div className="space-y-6">
            <div className="border-l-4 border-[#1E293B] pl-4">
              <strong className="text-[12px] text-[#1E293B] uppercase tracking-wider block mb-1">Better Operations</strong>
              <p className="text-[13px] text-[#64748B] leading-relaxed">Increasing profits through structural efficiency and streamlined management.</p>
            </div>
            <div className="border-l-4 border-[#1E293B] pl-4">
              <strong className="text-[12px] text-[#1E293B] uppercase tracking-wider block mb-1">Better Business Quality</strong>
              <p className="text-[13px] text-[#64748B] leading-relaxed">Enhancing market position and technology to justify a higher exit price.</p>
            </div>
            <div className="border-l-4 border-[#1E293B] pl-4">
              <strong className="text-[12px] text-[#1E293B] uppercase tracking-wider block mb-1">Margin Expansion</strong>
              <p className="text-[13px] text-[#64748B] leading-relaxed">Optimizing product mix and pricing power to drive profitability.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] pt-6 mt-4">
        <p className="text-[10px] text-[#94A3B8] leading-relaxed">
          Disclaimer: This model uses simplified assumptions. Entry EV is EBITDA-derived, revenue growth compounds annually at a constant rate, and target margin is assumed fully achieved by the exit year with no transition path modeled. Exit multiple is user-defined. Total Value Created and Performance Upside are unlevered and reflect enterprise value throughout; Implied Exit Equity Value is a separate exit-only reference that nets out debt at exit only.
        </p>
      </div>
    </div>
  );
};

export default ValueCreationSimulator;