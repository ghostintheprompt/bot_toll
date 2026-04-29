import React from 'react';
import { Server, Globe, Zap, BarChart3 } from 'lucide-react';

export default function InfrastructureManager() {
  return (
    <div className="space-y-6">
      <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-800 pb-2">Global Infrastructure</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-white">Edge Node: SFO-1</span>
              </div>
              <span className="text-[10px] text-emerald-500 font-bold uppercase">Online</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-500">CPU LOAD</span>
                <span className="text-white">12.4%</span>
              </div>
              <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[12.4%]" />
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand-primary" />
                <span className="text-xs font-bold text-white">Deterrence Layer</span>
              </div>
              <span className="text-[10px] text-brand-primary font-bold uppercase">Active</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-zinc-900 p-2 rounded text-[9px]">
                <div className="text-zinc-500">TARPIT</div>
                <div className="text-white font-bold">15s LATENCY</div>
              </div>
              <div className="bg-zinc-900 p-2 rounded text-[9px]">
                <div className="text-zinc-500">POISON</div>
                <div className="text-white font-bold">GENAI_V1.5</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-col justify-center items-center text-center">
          <BarChart3 className="w-12 h-12 text-zinc-800 mb-4" />
          <div className="text-xs font-bold text-zinc-500 mb-1 uppercase tracking-tighter">Traffic Spectral Analysis</div>
          <div className="text-[10px] text-zinc-600 max-w-[200px]">Real-time entropy mapping of incoming agent headers and IP rotation patterns.</div>
        </div>
      </div>
    </div>
  );
}
