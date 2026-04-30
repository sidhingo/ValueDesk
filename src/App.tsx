import { useState } from 'react';
import { Briefcase } from 'lucide-react';
import FundBenchmarking from './components/FundBenchmarking';
import MOICCalculator from './components/MOICCalculator';
import ValueCreationSimulator from './components/ValueCreationSimulator';
import HundredDayPlan from './components/HundredDayPlan';

type Tab = 'benchmarking' | 'moic' | 'simulator' | 'hundredday';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('benchmarking');
  const [contactSent, setContactSent] = useState(false);

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

{/* CONTACT FORM */}
<div className="mt-8 md:mt-12 border-t border-[#E2E8F0] pt-8">
  <p className="text-[11px] text-[#64748B] mb-5">
    Have feedback, a question, or want to collaborate? Drop a note below.
  </p>
  <form
    onSubmit={async (e) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const data = new FormData(form);
      data.append('access_key', 'e654107b-6293-409c-a1bb-b5a4dead8447');
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data
      });
      if (response.ok) {
        setContactSent(true);
        form.reset();
      }
    }}
    className="space-y-3"
  >
    <div className="flex flex-col md:flex-row gap-3">
      <input
        type="email"
        name="email"
        required
        placeholder="Your email"
        className="w-full md:w-1/3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-none px-3 py-3 text-[13px] text-[#1E293B] focus:outline-none focus:border-[#475569] transition-all placeholder-[#94A3B8]"
      />
      <input
        type="text"
        name="message"
        required
        placeholder="Your message"
        className="w-full md:flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-none px-3 py-3 text-[13px] text-[#1E293B] focus:outline-none focus:border-[#475569] transition-all placeholder-[#94A3B8]"
      />
      <button
        type="submit"
        className="w-full md:w-auto bg-[#1E293B] hover:bg-[#334155] text-white font-bold uppercase tracking-[0.2em] text-[10px] px-6 py-3 transition-all whitespace-nowrap"
      >
        Send
      </button>
    </div>
    {contactSent && (
      <p className="text-[11px] text-emerald-600 font-medium">
        Message received! I'll be in touch if relevant. Thank you.
      </p>
    )}
  </form>
</div>

{/* FOOTER */}
<div className="mt-8 flex justify-between items-center text-[#94A3B8] text-[9px] md:text-[10px] tracking-[0.3em] font-bold uppercase">
  <span>Value Desk // Proprietary Analytics by sidhingo</span>
</div>
      </div>
    </div>
  );
}

export default App;