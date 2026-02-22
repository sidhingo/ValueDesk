import React, { useState } from 'react';

const ValueCreationSimulator = () => {
  const [draft, setDraft] = useState({
    entryRevenue: '',
    growthRate: '',
    entryMargin: '',
    targetMargin: '',
    holdPeriod: '',
    entryMultiple: '',
    exitMultiple: '',
    exitNetDebt: ''
  });

  const [display, setDisplay] = useState(null);

  const handleInputChange = (field, value) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    if (draft.entryRevenue && draft.entryMargin && draft.entryMultiple) {
      setDisplay({ ...draft });
    }
  };

  // --- MATH ENGINE ---
  let calculatedExitRevenue = 0;
  let exitEnterpriseValue = 0;
  let totalValueCreated = 0;
  let performanceUpside = 0;

  if (display) {
    const numEntryRev = Number(display.entryRevenue);
    const numGrowth = Number(display.growthRate);
    const numHold = Number(display.holdPeriod);
    const numEntryMargin = Number(display.entryMargin);
    const numTargetMargin = Number(display.targetMargin);
    const numEntryMult = Number(display.entryMultiple);
    const numExitMult = Number(display.exitMultiple);

    calculatedExitRevenue = numEntryRev * Math.pow(1 + (numGrowth / 100), numHold);
    const entryEBITDA = numEntryRev * (numEntryMargin / 100);
    const exitEBITDA = calculatedExitRevenue * (numTargetMargin / 100);
    
    const entryEV = entryEBITDA * numEntryMult;
    exitEnterpriseValue = exitEBITDA * numExitMult;
    totalValueCreated = exitEnterpriseValue - entryEV;

    performanceUpside = entryEV !== 0 ? (totalValueCreated / entryEV) * 100 : 0;
  }

  const formatCurrency = (val) => Math.round(val).toLocaleString();

  // Updated labelStyle for mobile: removed fixed height h-[42px] for auto height on small screens
  const labelStyle = "block text-[10px] font-bold text-[#64748B] uppercase tracking-[0.1em] mb-2 h-auto md:h-[42px] flex items-end overflow-hidden";
  const inputStyle = "w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-none px-3 py-3 text-[14px] text-[#1E293B] focus:outline-none focus:border-[#475569] transition-all placeholder-[#94A3B8]";
  const headerStyle = "text-[#1E293B] text-[11px] font-black uppercase tracking-[0.2em] mb-6 border-b border-[#E2E8F0] pb-2";

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-10 pb-10 md:pb-20 font-sans bg-white text-left">
      
      <div className="w-full">
        <p className="text-[14px] md:text-[16px] text-[#64748B] leading-relaxed">
          Use this tool to see how different factors drive a company's value over time. 
          By entering your current numbers and future targets, you can see exactly how much value 
          comes from growing sales, improving profits, or selling the business at a better price.
        </p>
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
                  <input type="number" placeholder="1000" value={draft.entryRevenue} onChange={(e)=>handleInputChange('entryRevenue', e.target.value)} className={inputStyle}/>
                </div>
                <div>
                  <label className={labelStyle}>Growth Rate (%)</label>
                  <input type="number" placeholder="5" value={draft.growthRate} onChange={(e)=>handleInputChange('growthRate', e.target.value)} className={inputStyle}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Entry Margin %</label>
                  <input type="number" placeholder="10" value={draft.entryMargin} onChange={(e)=>handleInputChange('entryMargin', e.target.value)} className={inputStyle}/>
                </div>
                <div>
                  <label className={labelStyle}>Target Margin %</label>
                  <input type="number" placeholder="15" value={draft.targetMargin} onChange={(e)=>handleInputChange('targetMargin', e.target.value)} className={inputStyle}/>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className={headerStyle}>Exit Parameters</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Hold Period (Yrs)</label>
                  <input type="number" placeholder="5" value={draft.holdPeriod} onChange={(e)=>handleInputChange('holdPeriod', e.target.value)} className={inputStyle}/>
                </div>
                <div>
                  <label className={labelStyle}>Entry Multiple (x)</label>
                  <input type="number" placeholder="10.0" value={draft.entryMultiple} onChange={(e)=>handleInputChange('entryMultiple', e.target.value)} className={inputStyle}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Exit Multiple (x)</label>
                  <input type="number" placeholder="12.0" value={draft.exitMultiple} onChange={(e)=>handleInputChange('exitMultiple', e.target.value)} className={inputStyle}/>
                </div>
                <div>
                  <label className={labelStyle}>Exit Net Debt ($M)</label>
                  <input type="number" placeholder="200" value={draft.exitNetDebt} onChange={(e)=>handleInputChange('exitNetDebt', e.target.value)} className={inputStyle}/>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-10 border-t border-[#E2E8F0] pt-8">
            <button 
              onClick={handleCalculate}
              className="w-full bg-[#1E293B] hover:bg-[#334155] text-white font-bold uppercase tracking-[0.3em] text-[11px] py-4 transition-all"
            >
              Calculate Returns
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
              <div className="text-center space-y-4">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.4em] block">Total Value Created</span>
                {/* Responsive text size: 4xl on phone, 6xl on desktop */}
                <div className="text-4xl md:text-6xl font-light tracking-tighter text-[#1E293B]">
                  ${formatCurrency(totalValueCreated)}M
                </div>
                <div className={`text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] px-4 py-2 inline-block border-2 ${performanceUpside > 0 ? 'border-emerald-500/20 text-emerald-700 bg-white' : 'border-red-500/20 text-red-700 bg-white'}`}>
                  {performanceUpside > 0 ? '▲' : '▼'} {performanceUpside.toFixed(1)}% Performance Upside
                </div>
              </div>
              
              <div className="mt-8 md:mt-10 pt-8 border-t border-[#E2E8F0] space-y-4">
                 <div className="flex flex-col sm:flex-row justify-between text-[9px] md:text-[10px] uppercase tracking-widest text-[#64748B] gap-1">
                   <span>Projected Exit Revenue:</span>
                   <span className="font-bold text-[#1E293B]">${formatCurrency(calculatedExitRevenue)}M</span>
                 </div>
                 <div className="flex flex-col sm:flex-row justify-between text-[9px] md:text-[10px] uppercase tracking-widest text-[#64748B] gap-1">
                   <span>Implied Exit EV:</span>
                   <span className="font-bold text-[#1E293B]">${formatCurrency(exitEnterpriseValue)}M</span>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
};

export default ValueCreationSimulator;