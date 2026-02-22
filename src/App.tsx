import { useState } from 'react';
import { Briefcase } from 'lucide-react';
import FundBenchmarking from './components/FundBenchmarking';
import MOICCalculator from './components/MOICCalculator';
import ValueCreationSimulator from './components/ValueCreationSimulator';

type Tab = 'benchmarking' | 'moic' | 'simulator';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('benchmarking');

  return (
    // Background: Warm Slate-Grey (Matches your PPT section dividers)
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] antialiased font-sans">
      <div className="max-w-6xl mx-auto px-6 py-16">
        
        {/* HEADER: High-Contrast Graphite Typography */}
        <div className="mb-12 border-l-2 border-[#475569] pl-6">
          <div className="flex items-center gap-4 mb-2">
            <Briefcase className="w-8 h-8 text-[#475569] stroke-[1.5]" />
            <h1 className="text-3xl font-bold tracking-tight text-[#1E293B] uppercase">Value Desk</h1>
          </div>
          <p className="text-[#64748B] text-sm tracking-[0.2em] uppercase font-semibold">
            PE Value Creation Intelligence Platform
          </p>
        </div>

        {/* INTERFACE: Clean White Paper with Graphite Accents */}
        <div className="bg-white border border-[#E2E8F0] rounded-none shadow-xl overflow-hidden">
          
          {/* TAB BAR: Institutional Grey with Sharp Geometric Indicators */}
          <div className="bg-[#F1F5F9] border-b border-[#E2E8F0]">
            <div className="flex">
              <button
                onClick={() => setActiveTab('benchmarking')}
                className={`px-10 py-5 text-[11px] font-bold uppercase tracking-[0.15em] transition-all border-r border-[#E2E8F0] ${
                  activeTab === 'benchmarking'
                    ? 'bg-white text-[#0F172A] border-t-2 border-t-[#475569]' 
                    : 'text-[#94A3B8] hover:text-[#475569] hover:bg-white/50'
                }`}
              >
                Fund Benchmarking
              </button>
              <button
                onClick={() => setActiveTab('moic')}
                className={`px-10 py-5 text-[11px] font-bold uppercase tracking-[0.15em] transition-all border-r border-[#E2E8F0] ${
                  activeTab === 'moic'
                    ? 'bg-white text-[#0F172A] border-t-2 border-t-[#475569]'
                    : 'text-[#94A3B8] hover:text-[#475569] hover:bg-white/50'
                }`}
              >
                MOIC / IRR Calculator
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`px-10 py-5 text-[11px] font-bold uppercase tracking-[0.15em] transition-all ${
                  activeTab === 'simulator'
                    ? 'bg-white text-[#0F172A] border-t-2 border-t-[#475569]'
                    : 'text-[#94A3B8] hover:text-[#475569] hover:bg-white/50'
                }`}
              >
                Value Creation Simulator
              </button>
            </div>
          </div>

          {/* CONTENT AREA: Professional padding and graphite text */}
          <div className="p-12 text-[#334155]">
            {activeTab === 'benchmarking' && <FundBenchmarking />}
            {activeTab === 'moic' && <MOICCalculator />}
            {activeTab === 'simulator' && <ValueCreationSimulator />}
          </div>
        </div>

        {/* FOOTER: Serialized Style from your Deck */}
        <div className="mt-12 flex justify-between items-center text-[#94A3B8] text-[10px] tracking-[0.3em] font-bold uppercase">
          <span>Value Desk // Proprietary Analytics by sidhingo</span>
          </div>
      </div>
    </div>
  );
}

export default App;