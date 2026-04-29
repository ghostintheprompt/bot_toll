import React from 'react';
import { Shield, AlertTriangle, Activity, Lock } from 'lucide-react';

export default function CyberSOC({ incidents, guardrails }: { incidents: any[], guardrails: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-800 pb-2 flex-1 mr-4">CyberSOC Operations</h3>
        <div className="flex gap-2">
          <div className="bg-red-500/10 text-red-500 text-[10px] px-2 py-1 rounded border border-red-500/20 font-bold">DEFCON 2</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {guardrails.map((g) => (
          <div key={g.id} className="bg-zinc-900/30 border border-zinc-800 p-3 rounded flex items-center gap-3">
            <Lock className={`w-3 h-3 ${g.status === 'ACTIVE' ? 'text-emerald-500' : 'text-red-500'}`} />
            <div className="text-[10px]">
              <div className="text-zinc-500 font-bold">{g.id}</div>
              <div className="text-white truncate">{g.name}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h4 className="text-[10px] text-zinc-600 font-bold uppercase mb-2">Recent Incidents</h4>
        {incidents.length === 0 ? (
          <div className="text-zinc-700 text-xs py-4 italic">No active incidents recorded.</div>
        ) : (
          incidents.slice(0, 10).map((inc) => (
            <div key={inc.id} className="bg-black border-l-2 border-l-red-500 border border-zinc-800 p-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AlertTriangle className={`w-4 h-4 ${inc.severity === 'CRITICAL' ? 'text-red-500' : 'text-orange-500'}`} />
                <div>
                  <div className="text-white text-xs font-bold">{inc.id}: {inc.type}</div>
                  <div className="text-[9px] text-zinc-500">{new Date(inc.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
              <div className={`text-[10px] font-bold ${inc.severity === 'CRITICAL' ? 'text-red-500' : 'text-orange-500'}`}>
                {inc.severity}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
