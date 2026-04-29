import React from 'react';
import { Zap, Target, Cpu, ShieldAlert } from 'lucide-react';

export default function ThreatSimulator({ scenarios, bots }: { scenarios: any[], bots: any }) {
  const activeScenariosCount = Object.values(bots).reduce((acc: number, b: any) => acc + (b.active_scenarios?.length || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-800 pb-2 flex-1 mr-4">Threat Simulator s1-s16</h3>
        <div className="text-brand-primary text-[10px] font-bold">ACTIVE DEPLOYMENTS: {activeScenariosCount}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {scenarios.map((s) => (
          <div key={s.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div className="text-[10px] text-zinc-500 font-bold mb-1">{s.id} // {s.category}</div>
            <div className="text-white text-xs font-bold leading-tight">{s.name}</div>
            <div className="mt-3 flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-[9px] text-zinc-600">READY</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-brand-primary/5 border border-brand-primary/20 p-4 rounded-lg">
        <div className="flex gap-3">
          <Cpu className="w-5 h-5 text-brand-primary shrink-0" />
          <div className="text-[11px] text-zinc-400 leading-relaxed">
            <span className="text-brand-primary font-bold">NEURAL_DETERRENCE_ACTIVE:</span> Scenarios are dynamically selected based on bot fingerprint complexity. High-entropy bots (LLMs) are prioritized for s9, s16, and s4.
          </div>
        </div>
      </div>
    </div>
  );
}
