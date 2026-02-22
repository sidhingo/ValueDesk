import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const FundBenchmarking = () => {
  const [draft, setDraft] = useState({
    vintageYear: '',
    tvpi: '',
    dpi: '',
    irr: '',
    strategy: '' 
  });

  const [displayResults, setDisplayResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // INSTITUTIONAL FALLBACKS
  const fallbackBenchmarks: any = {
    TVPI: { q1_threshold: 2.5, q2_threshold: 1.9, q3_threshold: 1.4 },
    DPI: { q1_threshold: 1.2, q2_threshold: 0.8, q3_threshold: 0.3 },
    IRR: { q1_threshold: 25.0, q2_threshold: 15.0, q3_threshold: 8.0 }
  };

  const calculateQuartile = (value: number, benchmarks: any) => {
    if (value >= benchmarks.q1_threshold) return { quartile: '1st Quartile', rank: 'Top 25%' };
    if (value >= benchmarks.q2_threshold) return { quartile: '2nd Quartile', rank: 'Top 50%' };
    if (value >= benchmarks.q3_threshold) return { quartile: '3rd Quartile', rank: 'Top 75%' };
    return { quartile: '4th Quartile', rank: 'Bottom 25%' };
  };

  const handleAnalyze = async () => {
    if (!draft.vintageYear) return;
    const year = parseInt(draft.vintageYear);

    if (year >= 2024) {
      setDisplayResults({ 
        status: 'notice', 
        message: 'Vintages from 2024+ are in the early "Investment Period." Data is developing and not yet significant for ranking.' 
      });
      return;
    }

    setLoading(true);
    let finalBenchmarks: any[] = [];

    try {
      const { data, error } = await supabase.from('fund_benchmarks').select('*').eq('vintage_year', year);
      if (!error && data && data.length > 0) finalBenchmarks = data;
    } catch (err) {
      console.warn("Using Fallback Benchmarks.");
    }

    const newResults: any = { status: 'success', values: { ...draft }, metrics: {} };

    ['TVPI', 'DPI', 'IRR'].forEach(mType => {
      const inputKey = mType.toLowerCase();
      const inputValue = parseFloat(draft[inputKey as keyof typeof draft]);
      if (isNaN(inputValue)) return;

      let bData;
      if (finalBenchmarks.length > 0) {
        const matches = draft.strategy 
          ? finalBenchmarks.filter(m => m.strategy_type === draft.strategy && m.metric_type === mType)
          : finalBenchmarks.filter(m => m.metric_type === mType);
        
        if (matches.length > 0) {
          bData = {
            q1_threshold: matches.reduce((a, b) => a + b.q1_threshold, 0) / matches.length,
            q2_threshold: matches.reduce((a, b) => a + b.q2_threshold, 0) / matches.length,
            q3_threshold: matches.reduce((a, b) => a + b.q3_threshold, 0) / matches.length,
          };
        }
      }
      const finalB = bData || fallbackBenchmarks[mType];
      newResults.metrics[inputKey] = calculateQuartile(inputValue, finalB);
    });

    setDisplayResults(newResults);
    setLoading(false);
  };

  // RESPONSIVE STYLES
  const labelStyle = "block text-[10px] font-bold text-[#64748B] uppercase tracking-[0.1em] mb-2 h-auto md:h-[42px] flex items-end";
  const inputStyle = "w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-none px-3 py-3 text-[14px] text-[#1E293B] focus:outline-none focus:border-[#475569] transition-all placeholder-[#94A3B8]";
  const headerStyle = "text-[#1E293B] text-[11px] font-black uppercase tracking-[0.2em] mb-6 border-b border-[#E2E8F0] pb-2";

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 pb-10 md:pb-20 font-sans bg-white text-left">
      
      {/* 1. DESCRIPTOR */}
      <div className="max-w-full">
        <p className="text-[14px] md:text-[16px] text-[#64748B] leading-[1.7] font-normal">
          Evaluate private equity fund performance relative to institutional peer groups. 
          By isolating returns within specific vintage years and strategies, this tool 
          identifies true manager alpha and market positioning across TVPI, DPI, and IRR.
        </p>
      </div>

      {/* 2. DUAL PANEL GRID */}
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        
        {/* INPUT WORKSPACE */}
        <div className="w-full lg:w-2/3 bg-white p-6 md:p-8 border border-[#E2E8F0] shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-6">
              <h3 className={headerStyle}>Fund Context</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Vintage Year</label>
                  <input type="number" placeholder="2018" value={draft.vintageYear} onChange={(e)=>setDraft({...draft, vintageYear: e.target.value})} className={inputStyle}/>
                </div>
                <div>
                  <label className={labelStyle}>Fund Strategy</label>
                  <select value={draft.strategy} onChange={(e)=>setDraft({...draft, strategy: e.target.value})} className={inputStyle}>
                    <option value=""></option>
                    <option value="Buyout">Buyout</option>
                    <option value="Growth Equity">Growth Equity</option>
                    <option value="Venture Capital">Venture Capital</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Private Credit">Private Credit / Debt</option>
                    <option value="Real Estate">Real Estate</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className={headerStyle}>Performance</h3>
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <div>
                  <label className={labelStyle}>TVPI (X)</label>
                  <input type="number" step="0.1" placeholder="2.5" value={draft.tvpi} onChange={(e)=>setDraft({...draft, tvpi: e.target.value})} className={inputStyle}/>
                </div>
                <div>
                  <label className={labelStyle}>DPI (X)</label>
                  <input type="number" step="0.1" placeholder="1.2" value={draft.dpi} onChange={(e)=>setDraft({...draft, dpi: e.target.value})} className={inputStyle}/>
                </div>
                <div>
                  <label className={labelStyle}>IRR (%)</label>
                  <input type="number" step="0.1" placeholder="15" value={draft.irr} onChange={(e)=>setDraft({...draft, irr: e.target.value})} className={inputStyle}/>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-[#E2E8F0] pt-8">
            <button onClick={handleAnalyze} disabled={loading} className="w-full bg-[#1E293B] text-white font-bold uppercase tracking-[0.3em] text-[11px] py-4 hover:bg-[#334155] transition-all">
              {loading ? 'Processing...' : 'Benchmark Performance'}
            </button>
          </div>
        </div>

        {/* RESULTS PANEL */}
        <div className="w-full lg:w-1/3 bg-[#F8FAFC] border border-[#E2E8F0] p-6 md:p-10 flex flex-col justify-center shadow-inner min-h-[300px] md:min-h-[420px]">
          {!displayResults ? (
            <div className="text-center text-[#94A3B8] italic text-[13px] font-normal leading-relaxed">
              Enter fund metrics to see<br/>quartile rankings.
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
              <h3 className="text-center text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.4em]">Quartile Rankings</h3>
              {displayResults.status === 'success' ? (
                ['tvpi', 'dpi', 'irr'].map((key) => (
                  displayResults.metrics[key] && (
                    <div key={key} className="border-b border-[#E2E8F0] last:border-0 pb-5 flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-bold text-[#64748B] uppercase block mb-1 tracking-wider">{key}</span>
                        <span className="text-2xl md:text-3xl font-light text-[#1E293B]">
                          {displayResults.values[key]}{key === 'irr' ? '%' : 'x'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] md:text-[11px] font-black uppercase text-[#1E293B] block tracking-tight">{displayResults.metrics[key].quartile}</span>
                        <span className="text-[9px] md:text-[10px] text-emerald-600 font-bold uppercase tracking-tighter italic">{displayResults.metrics[key].rank}</span>
                      </div>
                    </div>
                  )
                ))
              ) : (
                <p className="text-[13px] text-[#64748B] leading-relaxed italic text-center">{displayResults.message}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER LOGIC & STRATEGY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 border-t border-[#E2E8F0] pt-12">
        <div className="space-y-6 md:space-y-8">
          <h3 className="text-[#1E293B] text-[11px] font-black uppercase tracking-[0.3em] italic opacity-40">Calculation Logic</h3>
          <p className="text-[13px] text-[#64748B] leading-[1.7] font-normal">
            Performance is benchmarked against a specific peer group defined by vintage year and asset strategy. Analysis follows institutional quartile thresholds where the 1st Quartile represents the top 25% of the peer universe.
          </p>
        </div>

        <div className="space-y-6 md:space-y-8 text-left">
          <h3 className="text-[#1E293B] text-[11px] font-black uppercase tracking-[0.3em] italic opacity-40">LP Strategy</h3>
          <div className="space-y-6 md:space-y-8">
            <div className="border-l border-[#1E293B] pl-5">
              <strong className="text-[12px] text-[#1E293B] uppercase tracking-[0.15em] block mb-2 font-black">DPI vs TVPI</strong>
              <p className="text-[13px] text-[#64748B] leading-[1.7]">LPs prioritize realized returns (DPI) over paper gains (TVPI) in maturing funds to de-risk portfolios.</p>
            </div>
            <div className="border-l border-[#1E293B] pl-5">
              <strong className="text-[12px] text-[#1E293B] uppercase tracking-[0.15em] block mb-2 font-black">Performance Persistence</strong>
              <p className="text-[13px] text-[#64748B] leading-[1.7]">Top-quartile ranking is a key metric for re-up decisions, indicating manager skill across cycles.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundBenchmarking;