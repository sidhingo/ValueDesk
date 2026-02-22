import React, { useState } from 'react';

const MOIC_IRRCalculator = () => {
  const [inputs, setInputs] = useState({
    investment: '',
    entryFees: '',
    exitValue: '',
    exitFees: '',
    holdPeriod: '',
    dividends: ''
  });

  const [result, setResult] = useState<any>(null);

  const calculatePerformance = () => {
    const inv = parseFloat(inputs.investment) || 0;
    const enFees = parseFloat(inputs.entryFees) || 0;
    const exValue = parseFloat(inputs.exitValue) || 0;
    const exFees = parseFloat(inputs.exitFees) || 0;
    const hold = parseFloat(inputs.holdPeriod) || 0;
    const divs = parseFloat(inputs.dividends) || 0;

    if (inv <= 0 || hold <= 0 || exValue <= 0) {
      setResult(null);
      return;
    }

    const totalBasis = inv + enFees;
    const netProceeds = (exValue - exFees) + divs;
    const moic = netProceeds / totalBasis;
    const irr = (Math.pow(moic, 1 / hold) - 1) * 100;
    const totalProfit = netProceeds - totalBasis;

    setResult({
      moic: moic.toFixed(2),
      irr: irr.toFixed(1),
      profit: totalProfit.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 }),
      netExit: netProceeds.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })
    });
  };

  const labelStyle = "block text-[10px] font-bold text-[#64748B] uppercase tracking-[0.1em] mb-2 h-[42px] flex items-end";
  const inputStyle = "w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-none px-3 py-3 text-[14px] text-[#1E293B] focus:outline-none focus:border-[#475569] transition-all placeholder-[#94A3B8]";
  const headerStyle = "text-[#1E293B] text-[11px] font-black uppercase tracking-[0.2em] mb-6 border-b border-[#E2E8F0] pb-2";

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 font-sans bg-white text-left">
      <div className="max-w-full">
        <p className="text-[16px] text-[#64748B] leading-[1.7] font-normal">
          Evaluate the total return profile of a deal by modeling capital flows from entry to exit. This tool 
          factors in transaction costs and interim dividends to provide a realistic view of cash-on-cash multiples 
          and time-weighted performance.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        <div className="lg:w-2/3 bg-white p-8 border border-[#E2E8F0] shadow-sm">
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              <div className="space-y-6">
                <h3 className={headerStyle}>Entry</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>Investment ($M)</label>
                    <input type="number" placeholder="10" value={inputs.investment} onChange={(e) => setInputs({...inputs, investment: e.target.value})} className={inputStyle}/>
                  </div>
                  <div>
                    <label className={labelStyle}>Entry Fees ($M)</label>
                    <input type="number" placeholder="0.5" value={inputs.entryFees} onChange={(e) => setInputs({...inputs, entryFees: e.target.value})} className={inputStyle}/>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h3 className={headerStyle}>Exit</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>Exit Value ($M)</label>
                    <input type="number" placeholder="30" value={inputs.exitValue} onChange={(e) => setInputs({...inputs, exitValue: e.target.value})} className={inputStyle}/>
                  </div>
                  <div>
                    <label className={labelStyle}>Exit Fees ($M)</label>
                    <input type="number" placeholder="1.0" value={inputs.exitFees} onChange={(e) => setInputs({...inputs, exitFees: e.target.value})} className={inputStyle}/>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              <div className="space-y-6">
                <h3 className={headerStyle}>Time Horizon</h3>
                <input type="number" step="0.5" placeholder="5.0" value={inputs.holdPeriod} onChange={(e) => setInputs({...inputs, holdPeriod: e.target.value})} className={inputStyle}/>
              </div>
              <div className="space-y-6">
                <h3 className={headerStyle}>Interim Flows</h3>
                <input type="number" placeholder="2.0" value={inputs.dividends} onChange={(e) => setInputs({...inputs, dividends: e.target.value})} className={inputStyle}/>
              </div>
            </div>
          </div>
          <button onClick={calculatePerformance} className="mt-12 w-full bg-[#1E293B] text-white font-bold uppercase tracking-[0.3em] text-[11px] py-4 hover:bg-[#334155] transition-all">
            Run Deal Analysis
          </button>
        </div>

        <div className="lg:w-1/3 bg-[#F8FAFC] border border-[#E2E8F0] p-10 flex flex-col justify-center shadow-inner min-h-[480px]">
          {!result ? (
            <div className="text-center text-[#94A3B8] italic text-[13px] font-normal">Enter data to generate metrics.</div>
          ) : (
            <div className="space-y-10 animate-in fade-in duration-500">
              <h3 className="text-center text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.4em]">Performance Summary</h3>
              <div className="space-y-8">
                <div className="border-b border-[#E2E8F0] pb-6 flex justify-between items-end">
                  <div><span className="text-[10px] font-bold text-[#64748B] block mb-1">IRR</span><span className="text-4xl font-light text-[#1E293B]">{result.irr}%</span></div>
                  <div className="text-right"><span className="text-[10px] font-bold text-[#64748B] block mb-1">MOIC</span><span className="text-2xl font-normal text-[#1E293B]">{result.moic}x</span></div>
                </div>
                <div className="text-center"><span className="text-[10px] font-bold text-[#64748B] block mb-1">Total Net Gain</span><span className="text-3xl font-normal text-emerald-600">${result.profit}M</span></div>
              </div>
              <div className="text-center pt-4 border-t border-[#E2E8F0]"><p className="text-[10px] text-[#94A3B8] font-bold tracking-widest uppercase">Net Proceeds: ${result.netExit}M</p></div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 border-t border-[#E2E8F0] pt-12">
        <div className="space-y-8">
          <h3 className="text-[#1E293B] text-[11px] font-black uppercase tracking-[0.3em] italic opacity-40">Calculation Logic</h3>
          <div className="space-y-6">
            <p className="text-[13px] text-[#64748B] leading-[1.7]">The tool calculates the <strong>Total Basis</strong> (all cash out) and <strong>Net Proceeds</strong> (all cash in, including dividends). The relationship between these values over time determines the annualized return profile.</p>
            <div className="bg-[#F8FAFC] p-8 border border-[#E2E8F0] flex flex-col space-y-4">
              <div className="flex flex-col items-center border-b border-[#E2E8F0] pb-4">
                <span className="text-[9px] font-bold text-[#94A3B8] uppercase mb-2">Step 1: Multiple on Capital</span>
                <div className="text-[14px] text-[#1E293B] font-mono text-center italic">MOIC = (Net Exit Value + Dividends) / (Equity Investment + Fees)</div>
              </div>
              <div className="flex flex-col items-center pt-2">
                <span className="text-[9px] font-bold text-[#94A3B8] uppercase mb-2">Step 2: Annualized Growth</span>
                <div className="text-[18px] text-[#1E293B] font-serif tracking-widest italic">IRR = ( MOIC <sup>1 / t</sup> ) - 1</div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <h3 className="text-[#1E293B] text-[11px] font-black uppercase tracking-[0.3em] italic opacity-40">The Strategy</h3>
          <div className="space-y-8">
            <div className="border-l border-[#1E293B] pl-5"><strong className="text-[12px] uppercase block mb-2 font-black">Transaction Friction</strong><p className="text-[13px] text-[#64748B]">Fees at entry and exit can significantly compress MOIC, creating a performance drag on the net basis.</p></div>
            <div className="border-l border-[#1E293B] pl-5"><strong className="text-[12px] uppercase block mb-2 font-black">Dividend Recaps</strong><p className="text-[13px] text-[#64748B]">Early distributions disproportionately boost IRR because they reduce the "at-risk" hold period for that portion of capital.</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MOIC_IRRCalculator;