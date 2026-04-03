import { useState } from 'react';
import { Briefcase } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import FundBenchmarking from './components/FundBenchmarking';
import MOICCalculator from './components/MOICCalculator';
import ValueCreationSimulator from './components/ValueCreationSimulator';
import HundredDayPlan from './components/HundredDayPlan';

type Tab = 'benchmarking' | 'moic' | 'simulator' | 'hundredday';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('benchmarking');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] antialiased font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
        
        <div className="mb-8 md:mb-12 border-l-2 border-[#475569] pl-6">
          <div className="flex items-center gap-4 mb-2">
            <Briefcase className="w-8 h-8 text-[#475569] stroke-[1.5]" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1E293B] uppercase">Value Desk</h1>
          </div>
          <p className="text-[#64748B] text-[10px] md:text-sm tracking-[0.2em] uppercase font-semibold">
            PE Value Creation Intelligence Platform
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-none shadow-xl overflow-visible">
          
          {/* TAB BAR — horizontally scrollable on mobile */}
          <div className="bg-[#F1F5F9] border-b border-[#E2E8F0]">
            <div className="flex overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab('benchmarking')}
                className={`flex-none px-5 md:px-10 py-5 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] transition-all border-r border-[#E2E8F0] whitespace-nowrap ${
                  activeTab === 'benchmarking'
                    ? 'bg-white text-[#0F172A] border-t-2 border-t-[#475569]'
                    : 'text-[#94A3B8] hover:text-[#475569] hover:bg-white/50'
                }`}
              >
                Fund Benchmarking
              </button>
              <button
                onClick={() => setActiveTab('moic')}
                className={`flex-none px-5 md:px-10 py-5 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] transition-all border-r border-[#E2E8F0] whitespace-nowrap ${
                  activeTab === 'moic'
                    ? 'bg-white text-[#0F172A] border-t-2 border-t-[#475569]'
                    : 'text-[#94A3B8] hover:text-[#475569] hover:bg-white/50'
                }`}
              >
                Deal Returns
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`flex-none px-5 md:px-10 py-5 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] transition-all border-r border-[#E2E8F0] whitespace-nowrap ${
                  activeTab === 'simulator'
                    ? 'bg-white text-[#0F172A] border-t-2 border-t-[#475569]'
                    : 'text-[#94A3B8] hover:text-[#475569] hover:bg-white/50'
                }`}
              >
                Value Creation
              </button>
              <button
                onClick={() => setActiveTab('hundredday')}
                className={`flex-none px-5 md:px-10 py-5 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] transition-all whitespace-nowrap ${
                  activeTab === 'hundredday'
                    ? 'bg-white text-[#0F172A] border-t-2 border-t-[#475569]'
                    : 'text-[#94A3B8] hover:text-[#475569] hover:bg-white/50'
                }`}
              >
                100-Day Plan
              </button>
            </div>
          </div>

          <div className="p-4 md:p-12 text-[#334155] overflow-x-auto">
            <div className={activeTab === 'benchmarking' ? 'block' : 'hidden'}>
              <FundBenchmarking />
            </div>
            <div className={activeTab === 'moic' ? 'block' : 'hidden'}>
              <MOICCalculator />
            </div>
            <div className={activeTab === 'simulator' ? 'block' : 'hidden'}>
              <ValueCreationSimulator />
            </div>
            <div className={activeTab === 'hundredday' ? 'block' : 'hidden'}>
              <HundredDayPlan />
            </div>
          </div>
        </div>

        {/* MOBILE NOTICE */}
        <div className="block md:hidden mt-6 text-center text-[10px] text-[#94A3B8] uppercase tracking-[0.2em] font-bold border border-[#E2E8F0] py-3 px-4 bg-[#F8FAFC]">
          ⓘ Best experienced on desktop
        </div>

        <div className="mt-8 md:mt-12 flex justify-between items-center text-[#94A3B8] text-[9px] md:text-[10px] tracking-[0.3em] font-bold uppercase">
          <span>Value Desk // Proprietary Analytics by sidhingo</span>
        </div>
      </div>
      <Analytics />
    </div>
  );
}

export default App;