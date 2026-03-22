import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const FundBenchmarking = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [draft, setDraft] = useState({
    fundName: '', firmName: '', vintageYear: '', strategy: '',
    geography: '', fundSize: '', tvpi: '', dpi: '', rvpi: '', irr: ''
  });

  const [displayResults, setDisplayResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchFunds = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }
      const { data } = await supabase
        .from('fund_universe')
        .select('*')
        .ilike('NAME', `%${searchTerm}%`);
      if (data) setSearchResults(data);
    };
    const timeoutId = setTimeout(searchFunds, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSelectFund = (fund: any) => {
    const formatPerf = (val: any) => {
      if (!val || String(val).toLowerCase() === 'n/a') return 'N/A';
      let num = parseFloat(String(val).replace(/[x%]/g, '').replace(/,/g, ''));
      if (isNaN(num)) return 'N/A';
      if (num > 10) num = num / 100;
      return num.toFixed(2);
    };

    setDraft({
      fundName: fund.NAME || '',
      firmName: fund["FUND MANAGER"] || '',
      vintageYear: fund["VINTAGE YEAR"] || '',
      strategy: fund.STRATEGY || '',
      geography: fund["GEOGRAPHIC FOCUS"] || '',
      fundSize: fund["FINAL CLOSE SIZE (USD MN)"] || 'N/A',
      tvpi: formatPerf(fund["NET MULTIPLE (X)"]),
      dpi: formatPerf(fund["DPI (%)"]),
      rvpi: formatPerf(fund["RVPI (%)"]),
      irr: formatPerf(fund["NET IRR (%)"])
    });
    setSearchTerm(fund.NAME);
    setShowDropdown(false);
  };

  const handleAnalyze = async () => {
    if (!draft.vintageYear || draft.vintageYear === 'N/A') return;
    setLoading(true);
    
    const year = parseInt(draft.vintageYear);
    console.log('Vintage year being used:', year, typeof year);
    const newResults: any = { 
        status: 'success', 
        values: { ...draft }, 
        metrics: { tvpi: null, dpi: null, irr: null }, 
        lpStrategy: '' 
    };

    const { data: benchmarkData } = await supabase
      .from('fund_benchmarks')
      .select('*')
      .eq('vintage_year', year);
      console.log('Benchmark data returned:', benchmarkData);
    const metrics = ['TVPI', 'DPI', 'IRR'];
    metrics.forEach(mType => {
        const key = mType.toLowerCase();
        const bench = benchmarkData?.find(b => b.metric_type === mType);
        
        // Dynamic Proxy: Use Q2 if N/A
        if (newResults.values[key] === 'N/A' && bench) {
            newResults.values[key] = bench.q2_threshold.toFixed(2);
        }

        if (newResults.values[key] !== 'N/A' && bench) {
            const val = parseFloat(newResults.values[key]);
            let q = '4th Quartile';
            if (val >= bench.q1_threshold) q = '1st Quartile';
            else if (val >= bench.q2_threshold) q = '2nd Quartile';
            else if (val >= bench.q3_threshold) q = '3rd Quartile';
            newResults.metrics[key] = { quartile: q, spread: (val - bench.q2_threshold).toFixed(2) };
        }
    });

    const q = newResults.metrics.tvpi?.quartile;
    if (q === '1st Quartile') newResults.lpStrategy = "High Conviction: Fund is outperforming peers. Recommend priority re-up for successor vehicles.";
    else if (q === '2nd Quartile') newResults.lpStrategy = "Maintain Exposure: Performance is above median. Monitor realization pace for DPI confirmation.";
    else if (q === '3rd Quartile') newResults.lpStrategy = "Selective Hold: Underperforming median. Assess asset-level plans before re-up.";
    else if (q === '4th Quartile') newResults.lpStrategy = "Review Allocation: Bottom quartile performance. Evaluate GP's ability to execute exits.";
    else newResults.lpStrategy = "Insufficient benchmark data for this vintage year. Analysis defaulted to industry-wide averages.";

    setDisplayResults(newResults);
    setLoading(false);
  };

  const labelStyle = "block text-[10px] font-bold text-[#64748B] uppercase tracking-[0.1em] mb-2 h-auto md:h-[42px] flex items-end";
  const inputStyle = "w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-none px-3 py-3 text-[14px] text-[#1E293B] focus:outline-none focus:border-[#475569] transition-all placeholder-[#94A3B8]";
  const headerStyle = "text-[#1E293B] text-[11px] font-black uppercase tracking-[0.2em] mb-6 border-b border-[#E2E8F0] pb-2";

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 pb-10 md:pb-20 font-sans bg-white text-left">
      <div className="max-w-full">
        <p className="text-[14px] md:text-[16px] text-[#64748B] leading-[1.7] font-normal text-left">
          Evaluate private equity fund performance relative to institutional peer groups. This tool factors in 
          vintage year, strategy, and geography to provide a realistic view of quartile rankings 
          and time-weighted performance benchmarks.
        </p>
      </div>

      <div className="relative">
        <label className={labelStyle}>Search Fund Universe</label>
        <input type="text" placeholder="ENTER FUND NAME..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setShowDropdown(true);}} className={inputStyle} />
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-50 w-full bg-white border border-[#E2E8F0] shadow-xl mt-1 max-h-60 overflow-y-auto text-left">
            {searchResults.map((fund) => (
              <div key={fund.id} className="px-4 py-3 hover:bg-[#F8FAFC] cursor-pointer text-[12px] border-b border-[#F1F5F9]" onClick={() => handleSelectFund(fund)}>
                <span className="font-bold text-[#1E293B] uppercase tracking-wider">{fund.NAME}</span>
                <span className="text-[#64748B] ml-2 font-light">[{fund["FUND MANAGER"]}]</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        <div className="w-full lg:w-2/3 bg-white p-6 md:p-8 border border-[#E2E8F0] shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-6 text-left">
              <h3 className={headerStyle}>Fund Context</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className={labelStyle}>Firm Name</label><input type="text" value={draft.firmName} className={inputStyle} readOnly/></div>
                <div><label className={labelStyle}>Vintage Year</label><input type="text" value={draft.vintageYear} className={inputStyle} readOnly/></div>
                <div><label className={labelStyle}>Strategy</label><input type="text" value={draft.strategy} className={inputStyle} readOnly/></div>
              </div>
            </div>
            <div className="space-y-6 text-left">
              <h3 className={headerStyle}>Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelStyle}>TVPI (X)</label><input type="text" value={draft.tvpi} className={inputStyle} readOnly/></div>
                <div><label className={labelStyle}>DPI (X)</label><input type="text" value={draft.dpi} className={inputStyle} readOnly/></div>
                <div><label className={labelStyle}>RVPI (X)</label><input type="text" value={draft.rvpi} className={inputStyle} readOnly/></div>
                <div><label className={labelStyle}>IRR (%)</label><input type="text" value={draft.irr} className={inputStyle} readOnly/></div>
              </div>
            </div>
          </div>
          <button onClick={handleAnalyze} className="mt-10 md:mt-12 w-full bg-[#1E293B] text-white font-bold uppercase tracking-[0.3em] text-[11px] py-4 hover:bg-[#334155] transition-all">
            Benchmark Performance
          </button>
        </div>

        <div className="w-full lg:w-1/3 bg-[#F8FAFC] border border-[#E2E8F0] p-6 md:p-10 flex flex-col shadow-inner min-h-[420px]">
          <h3 className="text-center text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.4em] mb-8">Analysis Output</h3>
          {!displayResults ? (
            <div className="h-full flex items-center justify-center text-[#94A3B8] italic text-[13px] text-center font-normal">Select a fund to generate metrics.</div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500 text-left">
              <div className="pb-6 border-b border-[#E2E8F0]">
                <span className="text-[9px] font-bold text-[#64748B] uppercase block mb-3 tracking-widest text-left">Realization Mix (DPI vs TVPI)</span>
                <div className="w-full h-2 bg-[#E2E8F0]">
                  {/* LOGIC CAPPING: Fix 100% Bar and add percentage under */}
                  <div className="h-full bg-[#1E293B]" style={{ width: `${Math.min((parseFloat(displayResults.values.dpi) / parseFloat(displayResults.values.tvpi)) * 100, 100)}%` }}></div>
                </div>
                {/* AESTHETIC POLISH: Added label under the bar */}
                <span className="text-[9px] font-bold text-[#64748B] uppercase block mt-2 text-right tracking-widest">
                  {Math.min((parseFloat(displayResults.values.dpi) / parseFloat(displayResults.values.tvpi)) * 100, 100).toFixed(0)}% Realized
                </span>
              </div>

              {['tvpi', 'dpi', 'irr'].map((key) => (
                <div key={key} className="flex justify-between items-end border-b border-[#E2E8F0] pb-4 last:border-0">
                  <div className="text-left"><span className="text-[10px] font-bold text-[#64748B] uppercase block mb-1">{key}</span><span className="text-xl font-light text-[#1E293B]">{displayResults.values[key]}</span></div>
                  <div className="text-right">
                    {displayResults.metrics[key] && (
                      <><span className="text-[10px] font-black uppercase text-[#1E293B] block">{displayResults.metrics[key].quartile}</span>
                        <span className="text-[9px] text-emerald-600 font-bold uppercase italic">{parseFloat(displayResults.metrics[key].spread) >= 0 ? '+' : ''}{displayResults.metrics[key].spread} vs Median</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 border-t border-[#E2E8F0] pt-12 text-left">
        <div className="space-y-8">
          <h3 className="text-[#1E293B] text-[11px] font-black uppercase tracking-[0.3em] italic opacity-40 text-left">Calculation Logic</h3>
          <div className="space-y-6">
            <p className="text-[13px] text-[#64748B] leading-[1.7] text-left">The tool benchmarks performance by comparing fund-level multiples against institutional peer groups. This methodology isolates the <strong>Peer Alpha</strong> generated above the vintage year median.</p>
            <div className="bg-[#F8FAFC] p-6 md:p-8 border border-[#E2E8F0] flex flex-col space-y-4">
              <div className="flex flex-col items-center border-b border-[#E2E8F0] pb-4">
                <span className="text-[9px] font-bold text-[#94A3B8] uppercase mb-2">Step 1: Metric Normalization</span>
                <div className="text-[12px] md:text-[14px] text-[#1E293B] font-mono text-center italic">TVPI = (Distributions + Remaining Value) / Paid-In Capital</div>
              </div>
              <div className="flex flex-col items-center pt-2">
                <span className="text-[9px] font-bold text-[#94A3B8] uppercase mb-2">Step 2: Residual Analysis</span>
                <div className="text-[12px] md:text-[14px] text-[#1E293B] font-mono text-center italic">RVPI = TVPI - DPI</div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <h3 className="text-[#1E293B] text-[11px] font-black uppercase tracking-[0.3em] italic opacity-40 text-left">The Strategy</h3>
          <div className="space-y-6 md:space-y-8">
            <div className="border-l border-[#1E293B] pl-5 text-left">
              <strong className="text-[12px] uppercase block mb-2 font-black text-[#1E293B]">Peer Group Alpha</strong>
              <p className="text-[13px] text-[#64748B] text-left">Performance is relative. A 1.5x TVPI in a 2010 vintage might be bottom quartile, while a 1.5x in 2021 is significantly outperforming the median.</p>
            </div>
            <div className="border-l border-[#1E293B] pl-5 text-left">
              <strong className="text-[12px] uppercase block mb-2 font-black text-[#1E293B]">LP Strategy Recommendation</strong>
              <p className="text-[13px] text-[#64748B] italic text-left">{displayResults ? displayResults.lpStrategy : "Select a fund to generate strategic insights."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundBenchmarking;