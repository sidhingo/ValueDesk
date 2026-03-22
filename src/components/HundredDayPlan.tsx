import { useState } from 'react';

const HundredDayPlan = () => {
  const [inputs, setInputs] = useState({
    companySize: '',
    sector: '',
    thesis: '',
    entrySituation: '',
    priority: ''
  });

  const [plan, setPlan] = useState<any>(null);

  const handleChange = (field: string, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const generatePlan = () => {
    if (!inputs.companySize || !inputs.sector || !inputs.thesis || !inputs.entrySituation) return;

    const size = inputs.companySize;
    const sector = inputs.sector;
    const thesis = inputs.thesis;
    const entry = inputs.entrySituation;
    const priority = inputs.priority;

    const sizeContext: Record<string, string> = {
      'Under $50M': 'lean, founder-dependent business with limited management bench',
      '$50M – $200M': 'growing business entering institutional management for the first time',
      '$200M – $1B': 'established platform requiring enterprise-grade process and governance',
      'Over $1B': 'large-scale business requiring transformation office and dedicated workstream leads'
    };

    const sectorWorkstreams: Record<string, any> = {
      'Healthcare': {
        phase1: { name: 'Regulatory & Compliance Audit', description: 'Review all licenses, certifications, and compliance obligations across jurisdictions.', owner: 'General Counsel / CCO' },
        phase2: { name: 'Clinical Quality Metrics', description: 'Establish KPI framework for patient outcomes, safety incidents, and quality benchmarks.', owner: 'Chief Medical Officer' },
        phase3: { name: 'Reimbursement Optimization', description: 'Analyze payer mix and billing practices to improve revenue cycle performance.', owner: 'CFO / Revenue Cycle Lead' }
      },
      'Technology': {
        phase1: { name: 'Product Roadmap Alignment', description: 'Assess current roadmap against market positioning and customer retention priorities.', owner: 'CPO / CTO' },
        phase2: { name: 'Engineering Team Assessment', description: 'Evaluate team structure, technical debt, and velocity against growth targets.', owner: 'CTO / VP Engineering' },
        phase3: { name: 'ARR & Churn Dashboard', description: 'Implement real-time metrics on ARR growth, NRR, and churn by cohort.', owner: 'CFO / Head of Sales' }
      },
      'Industrials': {
        phase1: { name: 'Plant & Operations Audit', description: 'Benchmark utilization rates, throughput, and downtime across all facilities.', owner: 'COO / Plant Manager' },
        phase2: { name: 'Supply Chain Mapping', description: 'Identify single-source dependencies, lead time risks, and procurement savings.', owner: 'Head of Procurement' },
        phase3: { name: 'Lean Manufacturing Initiative', description: 'Launch structured continuous improvement program targeting OEE improvement.', owner: 'COO / Operations Director' }
      },
      'Financial Services': {
        phase1: { name: 'Regulatory Capital Review', description: 'Assess capital adequacy, liquidity ratios, and regulatory reporting obligations.', owner: 'CFO / CRO' },
        phase2: { name: 'Risk Framework Assessment', description: 'Evaluate credit, market, and operational risk frameworks against best practice.', owner: 'CRO / Head of Compliance' },
        phase3: { name: 'Product Profitability Analysis', description: 'Identify highest and lowest margin products and reprice or rationalize accordingly.', owner: 'CFO / Head of Product' }
      },
      'Consumer': {
        phase1: { name: 'Brand & Channel Audit', description: 'Assess brand positioning, channel mix, and customer acquisition costs by channel.', owner: 'CMO / Head of Trade' },
        phase2: { name: 'SKU Rationalization', description: 'Identify low-velocity SKUs for discontinuation to improve margin and working capital.', owner: 'COO / Head of Category' },
        phase3: { name: 'DTC & Retail Expansion', description: 'Launch or accelerate direct-to-consumer channel alongside retail distribution strategy.', owner: 'CMO / Head of E-Commerce' }
      },
      'Business Services': {
        phase1: { name: 'Client Concentration Analysis', description: 'Identify top-10 client revenue concentration and assess renewal and churn risk.', owner: 'CCO / Head of Client Success' },
        phase2: { name: 'Delivery Model Review', description: 'Assess onshore vs offshore mix, utilization rates, and billable hour efficiency.', owner: 'COO / Delivery Director' },
        phase3: { name: 'Cross-Sell Program', description: 'Launch structured cross-sell initiative targeting existing clients with adjacent services.', owner: 'CCO / Head of Sales' }
      },
      'Real Estate': {
        phase1: { name: 'Asset & Portfolio Audit', description: 'Review occupancy rates, lease expiry profile, and capex requirements across portfolio.', owner: 'Asset Manager / COO' },
        phase2: { name: 'Lease Optimization', description: 'Renegotiate key leases, address vacancies, and review rent review mechanisms.', owner: 'Asset Manager / CFO' },
        phase3: { name: 'Value-Add Capex Program', description: 'Execute targeted capital improvements to drive valuation uplift and rental growth.', owner: 'Asset Manager / Development Lead' }
      },
      'Energy & Utilities': {
        phase1: { name: 'Regulatory & Permits Review', description: 'Audit all operating licenses, environmental permits, and compliance status.', owner: 'General Counsel / Head of Regulatory' },
        phase2: { name: 'Asset Reliability Assessment', description: 'Evaluate equipment condition, maintenance schedules, and unplanned downtime.', owner: 'COO / Head of Engineering' },
        phase3: { name: 'Energy Transition Roadmap', description: 'Define decarbonization targets and investment priorities aligned with regulatory trajectory.', owner: 'CEO / Head of Strategy' }
      }
    };

    const entryPhase1: Record<string, any[]> = {
      'Carve-Out': [
        { name: 'Standalone Infrastructure Setup', description: 'Establish independent IT, HR, finance, and legal infrastructure separate from parent entity.', owner: 'CFO / CTO' },
        { name: 'TSA Management', description: 'Map all Transition Service Agreements, set exit timelines, and assign internal owners.', owner: 'CFO / COO' },
        { name: 'Entity & Brand Separation', description: 'Complete legal entity setup, bank account migration, and brand transition plan.', owner: 'General Counsel / CMO' },
        { name: 'Day 1 Readiness Checklist', description: 'Confirm all critical systems, payroll, and customer-facing operations are fully standalone.', owner: 'COO / Program Director' }
      ],
      'Founder-Led Transition': [
        { name: 'Founder Knowledge Transfer', description: 'Document all informal processes, key relationships, and institutional knowledge held by founders.', owner: 'CEO / COO' },
        { name: 'Key Person Retention', description: 'Identify top talent at risk of departure and implement retention packages and engagement plans.', owner: 'CHRO / CEO' },
        { name: 'Cultural Assessment', description: 'Understand existing culture, informal power structures, and potential friction points with PE ownership.', owner: 'CHRO / CEO' },
        { name: 'Management Team Gap Analysis', description: 'Identify gaps in professional management capability and define hiring or promotion priorities.', owner: 'CEO / CHRO' }
      ],
      'Platform / PE-Backed': [
        { name: 'Integration Playbook Review', description: 'Assess existing integration frameworks and align on add-on integration approach and timelines.', owner: 'COO / Program Director' },
        { name: 'Synergy Mapping', description: 'Quantify cost and revenue synergy opportunities across the combined platform.', owner: 'CFO / Head of Strategy' },
        { name: 'Combined Org Design', description: 'Define target operating model for the combined entity and identify consolidation opportunities.', owner: 'CHRO / COO' },
        { name: 'Reporting & KPI Alignment', description: 'Standardize reporting frameworks and KPI definitions across all platform entities.', owner: 'CFO / Head of FP&A' }
      ],
      'Turnaround': [
        { name: 'Cash Runway Assessment', description: 'Immediately quantify cash position, burn rate, and minimum liquidity requirements.', owner: 'CFO' },
        { name: 'Creditor & Stakeholder Management', description: 'Engage key creditors, suppliers, and lenders to stabilize relationships and avoid enforcement.', owner: 'CFO / General Counsel' },
        { name: 'Immediate Cost Actions', description: 'Identify and execute quick-win cost reductions within first 30 days to stem cash burn.', owner: 'CFO / COO' },
        { name: 'Revenue Triage', description: 'Identify and protect highest-margin revenue streams while deprioritizing loss-making activities.', owner: 'CCO / CFO' }
      ]
    };

    const thesisPhase2: Record<string, any[]> = {
      'Cost Optimization': [
        { name: 'Procurement Renegotiation', description: 'Leverage combined buying power to renegotiate top vendor contracts and reduce input costs.', owner: 'Head of Procurement / CFO' },
        { name: 'Headcount & Structure Review', description: 'Assess spans and layers, eliminate duplication, and right-size the organization for efficiency.', owner: 'CHRO / COO' },
        { name: 'Shared Services Design', description: 'Define shared services model for finance, HR, and IT to reduce duplication across business units.', owner: 'CFO / COO' },
        { name: 'Zero-Based Budgeting Pilot', description: 'Run ZBB exercise on top cost categories to challenge baseline assumptions and eliminate waste.', owner: 'CFO / Head of FP&A' }
      ],
      'Revenue Growth': [
        { name: 'Sales Pipeline Audit', description: 'Review pipeline quality, conversion rates, and deal velocity to identify revenue acceleration opportunities.', owner: 'CCO / Head of Sales' },
        { name: 'Pricing Analysis', description: 'Assess current pricing architecture against market and identify uplift opportunities by segment.', owner: 'CFO / Head of Commercial' },
        { name: 'Sales Compensation Redesign', description: 'Align incentive structures with growth priorities and ensure top performers are retained and motivated.', owner: 'CHRO / CCO' },
        { name: 'Customer Segmentation', description: 'Identify highest-value customer segments and redirect commercial resources toward them.', owner: 'CMO / Head of Sales' }
      ],
      'Buy-and-Build': [
        { name: 'Target Pipeline Review', description: 'Assess current M&A pipeline against platform strategy and prioritize top acquisition targets.', owner: 'CEO / Head of Strategy' },
        { name: 'Integration Playbook Development', description: 'Build repeatable 100-day integration framework for add-on acquisitions.', owner: 'COO / Program Director' },
        { name: 'Platform Capability Assessment', description: 'Identify platform gaps — technology, geography, talent — that acquisitions should fill.', owner: 'CEO / CFO' },
        { name: 'Due Diligence Process Standardization', description: 'Streamline DD process to enable faster deal execution as deal flow accelerates.', owner: 'CFO / General Counsel' }
      ],
      'Digital Transformation': [
        { name: 'Tech Stack Audit', description: 'Map current technology landscape, identify redundancies, and define target architecture.', owner: 'CTO / CIO' },
        { name: 'Data & Analytics Foundation', description: 'Establish data governance framework and build core reporting infrastructure.', owner: 'CTO / Head of Data' },
        { name: 'Digital Roadmap Prioritization', description: 'Define 12-month digital initiative roadmap ranked by business impact and implementation complexity.', owner: 'CTO / COO' },
        { name: 'Change Management Planning', description: 'Design change management and training program to drive technology adoption across the organization.', owner: 'CHRO / CTO' }
      ]
    };

    const thesisPhase3: Record<string, any[]> = {
      'Cost Optimization': [
        { name: 'Shared Services Launch', description: 'Go live with shared services model and track efficiency gains against baseline.', owner: 'CFO / COO' },
        { name: 'First Margin Improvement in P&L', description: 'Ensure cost actions are visible in management accounts and report to board.', owner: 'CFO / Head of FP&A' },
        { name: 'Continuous Improvement Program', description: 'Launch structured CI program to embed cost discipline as an ongoing capability.', owner: 'COO / Operations Director' },
        { name: 'Cost KPI Dashboard', description: 'Implement real-time cost tracking dashboard visible to all budget holders.', owner: 'CFO / Head of FP&A' }
      ],
      'Revenue Growth': [
        { name: 'New Logo Acquisition Ramp', description: 'Execute first commercial campaigns targeting new customer segments identified in phase 2.', owner: 'CCO / Head of Sales' },
        { name: 'Account Expansion Program', description: 'Launch structured upsell and cross-sell motions with top 20% of existing customers.', owner: 'Head of Account Management' },
        { name: 'Revenue KPI Cadence', description: 'Implement weekly revenue reporting cadence covering pipeline, bookings, and churn.', owner: 'CCO / CFO' },
        { name: 'First Revenue Milestone', description: 'Track and report first measurable revenue uplift attributable to commercial initiatives.', owner: 'CCO / CEO' }
      ],
      'Buy-and-Build': [
        { name: 'First Add-On LOI or SPA', description: 'Target signing first add-on letter of intent or purchase agreement within 100 days.', owner: 'CEO / CFO' },
        { name: 'Platform Branding & Positioning', description: 'Launch unified platform brand and value proposition to support deal origination.', owner: 'CMO / CEO' },
        { name: 'Integration Team Mobilization', description: 'Stand up dedicated integration team ready to execute first add-on post-close.', owner: 'COO / Program Director' },
        { name: 'Deal Flow Reporting', description: 'Establish monthly deal flow review covering pipeline, NDAs signed, and LOIs outstanding.', owner: 'CEO / Head of Strategy' }
      ],
      'Digital Transformation': [
        { name: 'First Digital Initiative Live', description: 'Launch first priority digital initiative and measure adoption and business impact.', owner: 'CTO / COO' },
        { name: 'Data Dashboard Deployment', description: 'Deploy core management reporting dashboard replacing manual spreadsheet processes.', owner: 'CTO / Head of Data' },
        { name: 'Technology Adoption Tracking', description: 'Measure system usage rates and identify adoption barriers for intervention.', owner: 'CTO / CHRO' },
        { name: 'Digital ROI Reporting', description: 'Report first quantifiable return on digital investment to board and management team.', owner: 'CTO / CFO' }
      ]
    };

    const milestones: Record<string, string> = {
      'Cost Optimization': 'First measurable cost reduction visible in management P&L, with annualized savings run-rate quantified and reported to board.',
      'Revenue Growth': 'Measurable uplift in pipeline velocity or closed revenue attributable to commercial initiatives launched in the first 100 days.',
      'Buy-and-Build': 'First add-on acquisition LOI signed or advanced DD process underway, with integration playbook ready for deployment.',
      'Digital Transformation': 'First priority digital initiative live in production, with adoption metrics and business impact tracked and reported.'
    };

    const risks: Record<string, string> = {
      'Cost Optimization': 'Over-cutting creates capability gaps that impair revenue delivery. Ensure cost actions are balanced against growth investment priorities.',
      'Revenue Growth': 'Commercial initiatives take time to convert to revenue. Manage board expectations on lag between investment and measurable return.',
      'Buy-and-Build': 'Integration complexity compounds with each add-on. Ensure platform infrastructure can absorb acquisitions before deal pace accelerates.',
      'Digital Transformation': 'Change fatigue and low adoption rates undermine technology ROI. Invest in change management in parallel with technology deployment.'
    };

    const sizeModifier: Record<string, string> = {
      'Under $50M': 'Given the lean structure of this business, prioritize quick wins and avoid over-engineering. Management bandwidth is limited — sequence initiatives carefully.',
      '$50M – $200M': 'Focus on professionalizing key functions while maintaining the agility that drove growth to this point. Avoid imposing excessive process too early.',
      '$200M – $1B': 'Establish enterprise-grade governance and reporting without slowing operational decision-making. PMO discipline is critical at this scale.',
      'Over $1B': 'Transformation office setup is essential. Workstream leads must operate with autonomy and clear accountability. Steering committee cadence is non-negotiable.'
    };

    // Map thesis input to key (handle both spellings)
    const thesisKey = thesis === 'Cost Optimisation' ? 'Cost Optimization' : thesis;

    const phase1Works = entryPhase1[entry] || [];
    const sectorW = sectorWorkstreams[sector];
    const phase2Works = thesisPhase2[thesisKey] || [];
    const phase3Works = thesisPhase3[thesisKey] || [];

    const finalPhase1 = sectorW ? [...phase1Works, sectorW.phase1] : phase1Works;
    const finalPhase2 = sectorW ? [...phase2Works, sectorW.phase2] : phase2Works;
    const finalPhase3 = sectorW ? [...phase3Works, sectorW.phase3] : phase3Works;

    setPlan({
      priority,
      sizeContext: sizeContext[size],
      sizeModifier: sizeModifier[size],
      phase1: finalPhase1,
      phase2: finalPhase2,
      phase3: finalPhase3,
      milestone: milestones[thesisKey],
      risk: risks[thesisKey],
      inputs: { ...inputs }
    });
  };

  const labelStyle = "block text-[10px] font-bold text-[#64748B] uppercase tracking-[0.1em] mb-2 h-auto md:h-[42px] flex items-end";
  const inputStyle = "w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-none px-3 py-3 text-[14px] text-[#1E293B] focus:outline-none focus:border-[#475569] transition-all placeholder-[#94A3B8]";
  const selectStyle = "w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-none px-3 py-3 text-[14px] text-[#1E293B] focus:outline-none focus:border-[#475569] transition-all appearance-none cursor-pointer";
  const headerStyle = "text-[#1E293B] text-[11px] font-black uppercase tracking-[0.2em] mb-6 border-b border-[#E2E8F0] pb-2";
  const phaseHeaderStyle = "text-[#1E293B] text-[11px] font-black uppercase tracking-[0.2em] pb-2 border-b border-[#E2E8F0] mb-4";

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 pb-10 md:pb-20 font-sans bg-white text-left">

      <div className="w-full">
        <p className="text-[14px] md:text-[16px] text-[#64748B] leading-relaxed">
          Generate a structured 100-day operational framework based on deal context and value creation thesis.
          Each plan is assembled from thesis, entry situation, sector, and company size to reflect
          the specific priorities of the investment.
        </p>
      </div>

      {/* INPUT CARD */}
      <div className="bg-white border border-[#E2E8F0] shadow-sm p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">

          <div className="space-y-6">
            <h3 className={headerStyle}>Company Context</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>Company Size</label>
                <select value={inputs.companySize} onChange={e => handleChange('companySize', e.target.value)} className={selectStyle}>
                  <option value="">Select...</option>
                  <option>Under $50M</option>
                  <option>$50M – $200M</option>
                  <option>$200M – $1B</option>
                  <option>Over $1B</option>
                </select>
              </div>
              <div>
                <label className={labelStyle}>Sector</label>
                <select value={inputs.sector} onChange={e => handleChange('sector', e.target.value)} className={selectStyle}>
                  <option value="">Select...</option>
                  <option>Business Services</option>
                  <option>Consumer</option>
                  <option>Energy & Utilities</option>
                  <option>Financial Services</option>
                  <option>Healthcare</option>
                  <option>Industrials</option>
                  <option>Real Estate</option>
                  <option>Technology</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelStyle}>Primary Priority</label>
              <input
                type="text"
                placeholder="e.g. Reduce SG&A by 15% within 6 months"
                value={inputs.priority}
                onChange={e => handleChange('priority', e.target.value)}
                className={inputStyle}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className={headerStyle}>Deal Parameters</h3>
            <div>
              <label className={labelStyle}>Value Creation Thesis</label>
              <select value={inputs.thesis} onChange={e => handleChange('thesis', e.target.value)} className={selectStyle}>
                <option value="">Select...</option>
                <option>Cost Optimization</option>
                <option>Revenue Growth</option>
                <option>Buy-and-Build</option>
                <option>Digital Transformation</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>Entry Situation</label>
              <select value={inputs.entrySituation} onChange={e => handleChange('entrySituation', e.target.value)} className={selectStyle}>
                <option value="">Select...</option>
                <option>Carve-Out</option>
                <option>Founder-Led Transition</option>
                <option>Platform / PE-Backed</option>
                <option>Turnaround</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[#E2E8F0] pt-8">
          <button
            onClick={generatePlan}
            disabled={!inputs.companySize || !inputs.sector || !inputs.thesis || !inputs.entrySituation}
            className="w-full bg-[#1E293B] hover:bg-[#334155] disabled:bg-[#94A3B8] disabled:cursor-not-allowed text-white font-bold uppercase tracking-[0.3em] text-[11px] py-4 transition-all"
          >
            Generate Plan
          </button>
        </div>
      </div>

      {/* OUTPUT */}
      {plan && (
        <div className="space-y-8 animate-in fade-in duration-500">

          {/* Priority banner */}
          {plan.priority && (
            <div className="border-l-2 border-[#475569] pl-6 py-2">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] block mb-1">Primary Focus</span>
              <p className="text-[15px] text-[#1E293B] font-medium">{plan.priority}</p>
            </div>
          )}

          {/* Size context */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] px-6 py-4">
            <p className="text-[13px] text-[#64748B] leading-relaxed">
              <span className="font-bold text-[#475569] uppercase tracking-wider text-[10px]">Context — </span>
              {plan.sizeModifier}
            </p>
          </div>

          {/* THREE PHASE COLUMNS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {[
              { label: 'Phase 1', title: 'Days 1–30: Diagnose & Stabilize', objective: 'Establish facts, secure the business, and build internal credibility.', works: plan.phase1 },
              { label: 'Phase 2', title: 'Days 31–60: Prioritize & Plan', objective: 'Design the value creation roadmap and build execution capability.', works: plan.phase2 },
              { label: 'Phase 3', title: 'Days 61–100: Execute & Deliver', objective: 'Launch initiatives, track progress, and demonstrate early value creation.', works: plan.phase3 }
            ].map((phase, idx) => (
              <div key={idx} className="border border-[#E2E8F0] p-6 space-y-4">
                <div>
                  <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-[0.3em] block mb-1">{phase.label}</span>
                  <h3 className={phaseHeaderStyle}>{phase.title}</h3>
                  <p className="text-[12px] text-[#64748B] italic mb-4">{phase.objective}</p>
                </div>
                <div className="space-y-4">
                  {phase.works.map((w: any, i: number) => (
                    <div key={i} className="border-b border-[#F1F5F9] pb-4 last:border-0 last:pb-0">
                      <span className="text-[13px] font-bold text-[#1E293B] block mb-1">{w.name}</span>
                      <p className="text-[12px] text-[#64748B] leading-relaxed mb-2">{w.description}</p>
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Owner: {w.owner}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Milestone + Risk */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-[#E2E8F0] p-6">
              <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] block mb-3">Key Milestone by Day 100</span>
              <p className="text-[14px] text-[#1E293B] leading-relaxed">{plan.milestone}</p>
            </div>
            <div className="border border-[#E2E8F0] border-l-2 border-l-red-200 p-6">
              <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] block mb-3">Top Risk to Watch</span>
              <p className="text-[14px] text-[#64748B] leading-relaxed">{plan.risk}</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="border-t border-[#E2E8F0] pt-6">
            <p className="text-[10px] text-[#94A3B8] leading-relaxed">
              This framework is generated based on the parameters provided and reflects common operational patterns across PE-backed companies. It is intended as a starting point for discussion and should be validated against company-specific diligence findings, management assessments, and fund strategy. It does not constitute professional advisory services.
            </p>
          </div>

        </div>
      )}
    </div>
  );
};

export default HundredDayPlan;