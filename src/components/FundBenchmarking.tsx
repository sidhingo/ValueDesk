import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const FundBenchmarking = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [draft, setDraft] = useState({
    fundName: '', firmName: '', vintageYear: '', strategy: '',
    geography: '', fundSize: '', status: '', sector: '',
    tvpi: '', dpi: '', irr: ''
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

  const normalizeGeography = (geo: string): string => {
    if (!geo || geo.toLowerCase() === 'n/a') return 'N/A';
    const g = geo.trim();
    const lower = g.toLowerCase();
  
    // Regional consolidations only
    if (lower === 'north america') return 'North America';
    if (lower === 'south america') return 'Latin America';
    if (lower === 'latin america') return 'Latin America';
    if (lower === 'southeast asia') return 'Southeast Asia';
    if (lower === 'east asia') return 'East Asia';
    if (lower === 'middle east') return 'Middle East';
    if (lower === 'mena') return 'Middle East';
    if (lower === 'gulf') return 'Middle East';
    if (lower === 'sub-saharan africa') return 'Africa';
    if (lower === 'africa') return 'Africa';
    if (lower === 'global' || lower === 'worldwide' || lower === 'international') return 'Global';
    if (lower === 'australasia') return 'Australia';
  
    // US regional terms → US
    if (['midwest', 'northeast', 'southeast', 'southwest', 'northwest'].includes(lower)) return 'US';
  
    // Offshore territories
    if (lower === 'british virgin islands') return 'US';
    if (lower === 'cayman islands' || lower === 'cayman') return 'UK';
  
    // Everything else — country or named region — use as-is
    return g;
  };

  const normalizeStatus = (status: string): string => {
    if (!status || status.trim() === '') return 'N/A';
    const trimmed = status.trim();
    // Exact match only — no includes() to avoid false positives
    if (trimmed === 'Closed') return 'Closed';
    if (trimmed === 'Liquidated') return 'Liquidated';
    // Everything else — First Close, Second Close, Open, etc — is Raising
    return 'Raising';
  };

  const normalizeSector = (industry: string): string => {
    if (!industry || industry.toLowerCase() === 'n/a' || industry.trim() === '') return 'Not Specified';
    const first = industry.split(',')[0].trim().toLowerCase();
    if (first.includes('business services')) return 'Business Services';
    if (first.includes('consumer')) return 'Consumer';
    if (first.includes('energy') || first.includes('utilities')) return 'Energy & Utilities';
    if (first.includes('financial') || first.includes('insurance')) return 'Financial Services';
    if (first.includes('healthcare') || first.includes('life sciences') || first.includes('medical')) return 'Healthcare';
    if (first.includes('industrial')) return 'Industrials';
    if (first.includes('information technology') || first.includes('software') || first.includes('technology')) return 'Technology';
    if (first.includes('real estate')) return 'Real Estate';
    if (first.includes('raw materials') || first.includes('natural resources')) return 'Natural Resources';
    if (first.includes('telecoms') || first.includes('media') || first.includes('communications')) return 'Media & Telecom';
    if (first.includes('diversified')) return 'Diversified';
    return industry.split(',')[0].trim();
  };

  const normalizeFundSize = (size: string): string => {
    if (!size || size.toLowerCase() === 'n/a' || size.trim() === '' || size === 'NULL') return 'N/A';
    const num = parseFloat(size.replace(/,/g, ''));
    if (isNaN(num)) return 'N/A';
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}B`;
    return `$${Math.round(num)}M`;
  };

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
      geography: normalizeGeography(fund["GEOGRAPHIC FOCUS"] || ''),
      fundSize: normalizeFundSize(fund["FINAL CLOSE SIZE (USD MN)"] || ''),
      status: normalizeStatus(fund.STATUS || ''),
      sector: normalizeSector(fund["CORE INDUSTRIES"] || ''),
      tvpi: formatPerf(fund["NET MULTIPLE (X)"]),
      dpi: formatPerf(fund["DPI (%)"]),
      irr: formatPerf(fund["NET IRR (%)"])
    });
    setSearchTerm(fund.NAME);
    setShowDropdown(false);
  };

  const handleAnalyze = async () => {
    if (!draft.vintageYear || draft.vintageYear === 'N/A') return;
    setLoading(true);
    
    const year = parseInt(draft.vintageYear);
    
    const newResults: any = { 
      status: 'success', 
      values: { ...draft },
      estimatedMetrics: [] as string[],
      metrics: { tvpi: null, dpi: null, irr: null }, 
      lpStrategy: '',
      peerAlpha: '',
      dataQuality: 'complete'
    };

    const { data: benchmarkData } = await supabase
      .from('fund_benchmarks')
      .select('*')
      .eq('vintage_year', year);
      
    const metrics = ['TVPI', 'DPI', 'IRR'];
    let allNA = true;

    metrics.forEach(mType => {
      const key = mType.toLowerCase();
      const bench = benchmarkData?.find(b => b.metric_type === mType);
      
      if (newResults.values[key] === 'N/A' && bench) {
        newResults.values[key] = bench.q2_threshold.toFixed(2);
        newResults.estimatedMetrics.push(mType);
      }

      if (newResults.values[key] !== 'N/A' && bench) {
        allNA = false;
        const val = parseFloat(newResults.values[key]);
        let q = '4th Quartile';
        if (val >= bench.q1_threshold) q = '1st Quartile';
        else if (val > bench.q2_threshold) q = '2nd Quartile';
        else if (val === bench.q2_threshold) q = 'At Median';
        else if (val >= bench.q3_threshold) q = '3rd Quartile';
        newResults.metrics[key] = { 
          quartile: q, 
          spread: (val - bench.q2_threshold).toFixed(2),
          isEstimated: newResults.estimatedMetrics.includes(mType)
        };
      }
    });

    if (newResults.estimatedMetrics.length === 0) {
      newResults.dataQuality = 'complete';
    } else if (newResults.estimatedMetrics.length >= 3 || allNA) {
      newResults.dataQuality = 'insufficient';
    } else {
      newResults.dataQuality = 'partial';
    }

    const tvpiQuartile = newResults.metrics.tvpi?.quartile;

    if (newResults.dataQuality === 'insufficient') {
      newResults.lpStrategy = "Insufficient data for strategy recommendation. Fund has limited performance reporting.";
    } else if (tvpiQuartile === '1st Quartile') {
      newResults.lpStrategy = "High Conviction: Fund is outperforming peers. Recommend priority re-up for successor vehicles.";
    } else if (tvpiQuartile === '2nd Quartile') {
      newResults.lpStrategy = "Maintain Exposure: Performance is above median. Monitor realization pace for DPI confirmation.";
    } else if (tvpiQuartile === 'At Median') {
      newResults.lpStrategy = "Monitor Closely: Fund is performing exactly at the vintage year median. Watch DPI trajectory before committing to successor.";
    } else if (tvpiQuartile === '3rd Quartile') {
      newResults.lpStrategy = "Selective Hold: Underperforming median. Assess asset-level plans before re-up.";
    } else if (tvpiQuartile === '4th Quartile') {
      newResults.lpStrategy = "Review Allocation: Bottom quartile performance. Evaluate GP's ability to execute exits.";
    } else {
      newResults.lpStrategy = "Insufficient benchmark data for this vintage year.";
    }

    const vintageCategory = year <= 2015 ? 'mature' : year <= 2019 ? 'mid-cycle' : 'early-stage';
    const dpiVal = parseFloat(newResults.values.dpi);
    const tvpiVal = parseFloat(newResults.values.tvpi);
    const realizationPct = (!isNaN(dpiVal) && !isNaN(tvpiVal) && tvpiVal > 0) ? (dpiVal / tvpiVal) * 100 : 0;
    const strategy = draft.strategy || 'fund';

    if (newResults.dataQuality === 'insufficient') {
      newResults.peerAlpha = `Limited performance data available for this ${strategy} fund. Quartile analysis requires at least one reported metric.`;
    } else if (vintageCategory === 'mature') {
      if (tvpiQuartile === '1st Quartile') {
        newResults.peerAlpha = `${year} vintage funds are fully mature. A top quartile TVPI at this stage reflects genuine manager alpha — most value creation and exits should be complete.`;
      } else if (tvpiQuartile === '3rd Quartile' || tvpiQuartile === '4th Quartile') {
        newResults.peerAlpha = `${year} vintage funds are fully mature. A sub-median TVPI at this stage is largely locked in — limited runway remains for performance recovery.`;
      } else {
        newResults.peerAlpha = `${year} vintage funds are fully mature. Performance at or near median with ${realizationPct.toFixed(0)}% realized suggests a typical outcome for this cycle.`;
      }
    } else if (vintageCategory === 'mid-cycle') {
      if (realizationPct < 30) {
        newResults.peerAlpha = `${year} vintage funds are mid-cycle with low realization (${realizationPct.toFixed(0)}% distributed). TVPI is largely unrealized — quartile rankings may shift materially as exits occur.`;
      } else {
        newResults.peerAlpha = `${year} vintage funds are mid-cycle. With ${realizationPct.toFixed(0)}% realized, this fund's DPI trajectory is a stronger signal of ultimate performance than current TVPI.`;
      }
    } else {
      newResults.peerAlpha = `${year} vintage funds are early-stage — benchmarking at this point is indicative only. Most value remains unrealized and quartile rankings will shift significantly over the next 3-5 years.`;
    }

    setDisplayResults(newResults);
    setLoading(false);
  };

  const labelStyle = "block text-[10px] font-bold text-[#64748B] uppercase tracking-[0.1em] mb-2 h-auto md:h-[42px] flex items-end";
  const inputStyle = "w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-none px-3 py-3 text-[14px] text-[#1E293B] focus:outline-none focus:border-[#475569] transition-all placeholder-[#94A3B8]";
  const headerStyle = "text-[#1E293B] text-[11px] font-black uppercase tracking-[0.2em] mb-6 border-b border-[#E2E8F0] pb-2";

  const formatDisplayValue = (key: string, val: string) => {
    if (val === 'N/A') return 'N/A';
    if (key === 'irr') return `${val}%`;
    return `${val}x`;
  };

  const formatSpread = (key: string, spread: string) => {
    const num = parseFloat(spread);
    const suffix = key === 'irr' ? '%' : 'x';
    if (Math.abs(num) < 0.005) {
      return { text: `— at Median`, isPositive: null };
    }
    const isPositive = num > 0;
    const arrow = isPositive ? '▲' : '▼';
    const sign = isPositive ? '+' : '';
    return { text: `${arrow} ${sign}${spread}${suffix} vs Median`, isPositive };
  };

  const getDataQualityLabel = () => {
    if (!displayResults) return null;
    if (displayResults.dataQuality === 'complete') {
      return <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">● Data Complete</span>;
    } else if (displayResults.dataQuality === 'partial') {
      const estimated = displayResults.estimatedMetrics.join(', ');
      return <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">◐ Partial — {estimated} estimated from median</span>;
    } else {
      return <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">○ Insufficient Data</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 pb-10 md:pb-20 font-sans bg-white text-left">
      <div className="max-w-full">
        <p className="text-[14px] md:text-[16px] text-[#64748B] leading-[1.7] font-normal">
          Evaluate private equity fund performance relative to institutional peer groups. This tool factors in 
          vintage year, strategy, and geography to provide a realistic view of quartile rankings 
          and time-weighted performance benchmarks.
        </p>
      </div>

      <div className="relative">
        <label className={labelStyle}>Search Fund Universe</label>
        <input
          type="text"
          placeholder="ENTER FUND NAME..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
          className={inputStyle}
        />
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-50 w-full bg-white border border-[#E2E8F0] shadow-xl mt-1 max-h-60 overflow-y-auto text-left">
            {searchResults.map((fund) => (
              <div
                key={fund.id}
                className="px-4 py-3 hover:bg-[#F8FAFC] cursor-pointer text-[12px] border-b border-[#F1F5F9]"
                onClick={() => handleSelectFund(fund)}
              >
                <span className="font-bold text-[#1E293B] uppercase tracking-wider">{fund.NAME}</span>
                <span className="text-[#64748B] ml-2 font-light">[{fund["FUND MANAGER"]}]</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-stretch">

        {/* LEFT CARD: Fund Context + Performance */}
        <div className="w-full lg:w-2/3 bg-white p-6 md:p-8 border border-[#E2E8F0] shadow-sm">
          
          {/* 3-column grid: Fund Context gets 2 cols, Performance gets 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">

            {/* FUND CONTEXT — spans 2 of 3 columns */}
            <div className="md:col-span-2 space-y-5 text-left">
              <h3 className={headerStyle}>Fund Context</h3>

              <div>
                <label className={labelStyle}>Firm Name</label>
                <input type="text" value={draft.firmName} className={inputStyle} readOnly />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Vintage Year</label>
                  <input type="text" value={draft.vintageYear} className={inputStyle} readOnly />
                </div>
                <div>
                  <label className={labelStyle}>Strategy</label>
                  <div
                    title={draft.strategy}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-3 text-[14px] text-[#1E293B] truncate overflow-hidden whitespace-nowrap cursor-default min-h-[46px] flex items-center"
                  >
                    {draft.strategy}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Fund Size</label>
                  <input type="text" value={draft.fundSize} className={inputStyle} readOnly />
                </div>
                <div>
                  <label className={labelStyle}>Geographic Focus</label>
                  <input type="text" value={draft.geography} className={inputStyle} readOnly />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Status</label>
                  <input type="text" value={draft.status} className={inputStyle} readOnly />
                </div>
                <div>
                  <label className={labelStyle}>Sector</label>
                  <input type="text" value={draft.sector} className={inputStyle} readOnly />
                </div>
              </div>
            </div>

            {/* PERFORMANCE — spans 1 of 3 columns */}
            <div className="md:col-span-1 space-y-5 text-left">
              <h3 className={headerStyle}>Performance</h3>
              <div>
                <label className={labelStyle}>TVPI (X)</label>
                <input type="text" value={draft.tvpi} className={inputStyle} readOnly />
              </div>
              <div>
                <label className={labelStyle}>DPI (X)</label>
                <input type="text" value={draft.dpi} className={inputStyle} readOnly />
              </div>
              <div>
                <label className={labelStyle}>NET IRR (%)</label>
                <input type="text" value={draft.irr} className={inputStyle} readOnly />
              </div>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            className="mt-10 md:mt-12 w-full bg-[#1E293B] text-white font-bold uppercase tracking-[0.3em] text-[11px] py-4 hover:bg-[#334155] transition-all"
          >
            Benchmark Performance
          </button>
        </div>

        {/* RIGHT CARD: Analysis Output */}
        <div className="w-full lg:w-1/3 bg-[#F8FAFC] border border-[#E2E8F0] p-6 md:p-10 flex flex-col shadow-inner min-h-[420px]">
          <h3 className="text-center text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.4em] mb-2">Analysis Output</h3>

          {displayResults && (
            <div className="text-center mb-5">{getDataQualityLabel()}</div>
          )}

          {!displayResults ? (
            <div className="h-full flex items-center justify-center text-[#94A3B8] italic text-[13px] text-center font-normal">
              Select a fund to generate metrics.
            </div>
          ) : displayResults.dataQuality === 'insufficient' ? (
            <div className="h-full flex items-center justify-center text-center flex-col space-y-2">
              <span className="text-[#94A3B8] text-[12px] font-bold uppercase tracking-wider">Insufficient Data</span>
              <p className="text-[#94A3B8] italic text-[12px]">This fund has limited performance reporting. Quartile analysis is not available.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500 text-left">
              <div className="pb-5 border-b border-[#E2E8F0]">
                <span className="text-[9px] font-bold text-[#64748B] uppercase block mb-3 tracking-widest">Realization Mix (DPI vs TVPI)</span>
                <div className="w-full h-2 bg-[#E2E8F0]">
                  <div
                    className="h-full bg-[#1E293B]"
                    style={{ width: `${Math.min((parseFloat(displayResults.values.dpi) / parseFloat(displayResults.values.tvpi)) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[9px] font-bold text-[#64748B] uppercase block mt-2 text-right tracking-widest">
                  {Math.min((parseFloat(displayResults.values.dpi) / parseFloat(displayResults.values.tvpi)) * 100, 100).toFixed(0)}% Realized
                </span>
              </div>

              {['tvpi', 'dpi', 'irr'].map((key) => {
                const spreadData = displayResults.metrics[key] ? formatSpread(key, displayResults.metrics[key].spread) : null;
                const isEstimated = displayResults.metrics[key]?.isEstimated;
                const metricLabel = key === 'irr' ? 'NET IRR' : key.toUpperCase();
                return (
                  <div key={key} className="flex justify-between items-end border-b border-[#E2E8F0] pb-4 last:border-0">
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase block mb-1">
                        {metricLabel}{isEstimated ? ' *' : ''}
                      </span>
                      <span className="text-xl font-light text-[#1E293B]">
                        {formatDisplayValue(key, displayResults.values[key])}
                      </span>
                    </div>
                    <div className="text-right">
                      {displayResults.metrics[key] && spreadData && (
                        <>
                          <span className="text-[13px] font-black uppercase text-[#1E293B] block tracking-wide">
                            {displayResults.metrics[key].quartile}
                          </span>
                          <span className={`text-[12px] font-bold ${
                            spreadData.isPositive === null
                              ? 'text-[#475569]'
                              : spreadData.isPositive
                                ? 'text-emerald-600'
                                : 'text-red-500'
                          }`}>
                            {spreadData.text}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {displayResults.estimatedMetrics.length > 0 && (
                <p className="text-[9px] text-[#94A3B8] italic">* Estimated from vintage year median due to limited fund reporting.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CALCULATION LOGIC & STRATEGY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 border-t border-[#E2E8F0] pt-12 text-left">
        <div className="space-y-8">
          <h3 className="text-[#1E293B] text-[11px] font-black uppercase tracking-[0.3em] italic opacity-40">Calculation Logic</h3>
          <div className="space-y-6">
            <p className="text-[13px] text-[#64748B] leading-[1.7]">
              The tool benchmarks performance by comparing fund-level multiples against institutional peer groups. This methodology isolates the <strong>Peer Alpha</strong> generated above the vintage year median.
            </p>
            <div className="bg-[#F8FAFC] p-6 md:p-8 border border-[#E2E8F0] flex flex-col space-y-4">
              <div className="flex flex-col items-center border-b border-[#E2E8F0] pb-4">
                <span className="text-[9px] font-bold text-[#94A3B8] uppercase mb-2">Step 1: Metric Normalization</span>
                <div className="text-[12px] md:text-[14px] text-[#1E293B] font-mono text-center italic">
                  TVPI = (Distributions + Remaining Value) / Paid-In Capital
                </div>
              </div>
              <div className="flex flex-col items-center pt-2">
                <span className="text-[9px] font-bold text-[#94A3B8] uppercase mb-2">Step 2: Realization Analysis</span>
                <div className="text-[12px] md:text-[14px] text-[#1E293B] font-mono text-center italic">
                  Realization Ratio = DPI / TVPI
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <h3 className="text-[#1E293B] text-[11px] font-black uppercase tracking-[0.3em] italic opacity-40">The Strategy</h3>
          <div className="space-y-6 md:space-y-8">
            <div className="border-l border-[#1E293B] pl-5 text-left">
              <strong className="text-[12px] uppercase block mb-2 font-black text-[#1E293B]">Peer Group Alpha</strong>
              <p className="text-[13px] text-[#64748B]">
                {displayResults ? displayResults.peerAlpha : "Performance is relative. A 1.5x TVPI in a 2010 vintage might be bottom quartile, while a 1.5x in 2021 is significantly outperforming the median."}
              </p>
            </div>
            <div className="border-l border-[#1E293B] pl-5 text-left">
              <strong className="text-[12px] uppercase block mb-2 font-black text-[#1E293B]">LP Strategy Recommendation</strong>
              <p className="text-[13px] text-[#64748B] italic">
                {displayResults ? displayResults.lpStrategy : "Select a fund to generate strategic insights."}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* DATA ATTRIBUTION */}
      <div className="border-t border-[#E2E8F0] pt-6 mt-4">
        <p className="text-[10px] text-[#94A3B8] leading-relaxed">
          Disclaimer: This tool is for informational purposes only. Fund universe and performance data sourced from Preqin, February 2026. Benchmark quartile thresholds are illustrative and based on published industry averages.
        </p>
      </div>
    </div>
  );
};

export default FundBenchmarking;