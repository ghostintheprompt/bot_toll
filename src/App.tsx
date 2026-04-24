import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Zap, 
  Globe, 
  BarChart3, 
  Cpu, 
  Terminal, 
  Lock, 
  Activity,
  Server,
  Network,
  DollarSign
} from 'lucide-react';

export default function App() {
  const [showTollStats, setShowTollStats] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const CURRENT_VERSION = "1.0.0";

  useEffect(() => {
    // 3s delay before checking for updates
    const timer = setTimeout(() => {
      checkUpdates();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const checkUpdates = async () => {
    try {
      const res = await fetch('https://api.github.com/repos/ghostintheprompt/bot-toll/releases/latest');
      if (res.ok) {
        const data = await res.json();
        const latestVersion = data.tag_name.replace('v', '');
        if (latestVersion !== CURRENT_VERSION) {
          setUpdateAvailable(true);
        }
      }
    } catch (err) {
      console.error("Update check failed", err);
    }
  };
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 't') {
        setShowTollStats(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (showTollStats) {
      fetchStats();
    }
  }, [showTollStats]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/toll-dashboard');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(0,81,255,0.05)_0%,transparent_50%)]" />

      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-primary p-1.5 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Bot<span className="text-brand-primary">Toll</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="https://github.com/ghostintheprompt/bot-toll" className="hover:text-brand-primary transition-colors">GitHub</a>
            <button 
              onClick={() => {
                if (updateAvailable) window.location.href='https://github.com/ghostintheprompt/bot-toll/releases';
                else checkUpdates();
              }}
              className="hover:text-brand-primary transition-colors flex items-center gap-1.5"
            >
              Check for Updates
              {updateAvailable && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
            </button>
            <button className="bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition-all font-semibold" onClick={() => window.location.href='https://github.com/ghostintheprompt/bot-toll'}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        {/* Hero Section */}
        <div className="text-center md:text-left grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-brand-primary rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <Zap className="w-3 h-3" /> MDRN Corp Release v1.0
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] mb-6">
              Stop AI scrapers <span className="text-brand-primary">at the edge.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-xl">
              A lightweight infrastructure layer that identifies AI agents and enforces a mandatory licensing toll. Local-first, privacy-focused, and open source.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <button className="px-8 py-4 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all" onClick={() => setShowTollStats(true)}>
                View Monitor (Alt+T)
              </button>
              <button className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold hover:bg-slate-50 transition-all" onClick={() => window.location.href='https://github.com/ghostintheprompt/bot-toll'}>
                View Source
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800 relative overflow-hidden group">
              {/* Fake Code/Stats UI */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs font-mono text-slate-500 italic">Global Node: SFO-1</div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 animate-pulse">
                    <div className="h-4 w-2/3 bg-slate-700 rounded mb-2" />
                    <div className="h-2 w-1/3 bg-slate-600 rounded" />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-between items-end">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Traffic Integrity</div>
                  <div className="text-2xl font-mono text-emerald-400 font-bold">99.98%</div>
                </div>
                <div className="w-24 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              
              {/* Stealth overlay hint - invisible normally */}
              <div className="absolute inset-0 bg-brand-primary opacity-0 group-active:opacity-10 transition-opacity" />
            </div>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <section className="mt-32">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Globe className="w-6 h-6" />}
              title="Global Distribution"
              description="Deploy your assets to over 300 edge locations worldwide for lower latency."
            />
            <FeatureCard 
              icon={<Cpu className="w-6 h-6" />}
              title="Adaptive Optimization"
              description="Intelligent resource management that responds to real-time traffic patterns."
            />
            <FeatureCard 
              icon={<Lock className="w-6 h-6" />}
              title="Threat Intelligence"
              description="Advanced mitigation against sophisticated automated scraping and DDoS attacks."
            />
          </div>
        </section>
      </main>

      {/* Hidden Toll Dashboard Modal */}
      <AnimatePresence>
        {showTollStats && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xl p-4 md:p-12 flex items-center justify-center"
            onClick={() => setShowTollStats(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-black border border-white/10 w-full max-w-4xl max-h-[80vh] rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,81,255,0.2)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-950">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-brand-primary" />
                  <h2 className="font-mono text-white text-lg font-bold uppercase tracking-tighter">AI Bandwidth Toll Monitor</h2>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={fetchStats}
                    className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                  >
                    REFRESH
                  </button>
                  <button 
                    onClick={() => setShowTollStats(false)}
                    className="text-white hover:bg-white/10 p-1 rounded transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(80vh-70px)] bg-black font-mono">
                {loading ? (
                  <div className="text-zinc-500 py-20 text-center animate-pulse">SYNCHRONIZING WITH EDGE NODES...</div>
                ) : stats ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatBox label="ACTIVE BOTS" value={stats.total_bots_tracked} color="text-brand-primary" />
                      <StatBox label="TOLL TIER" value="DETERRENCE" color="text-red-500" />
                      <StatBox label="BTC TOLL" value={`${stats.thresholds.btc} BTC`} color="text-orange-500" />
                      <StatBox label="ETH TOLL" value={`${stats.thresholds.eth} ETH`} color="text-purple-400" />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-800 pb-2">Non-Consenting Agents (Violations)</h3>
                      {Object.entries(stats.tracking).length === 0 ? (
                        <div className="text-zinc-600 text-xs py-10 opacity-50 italic">No AI violations detected in current session.</div>
                      ) : (
                        <div className="space-y-2">
                          {Object.entries(stats.tracking).map(([ip, data]: [string, any]) => {
                            return (
                              <div key={ip} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                  <Server className="w-4 h-4 text-zinc-600" />
                                  <div>
                                    <div className="text-white text-sm">{ip}</div>
                                    <div className="text-[10px] text-zinc-500">{(data.bytes / 1024).toFixed(2)} KB Scraped</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-red-400 font-bold uppercase text-[10px]">Toll Triggered</div>
                                  <div className="text-[10px] text-zinc-600">Violation: {new Date(data.lastSeen).toLocaleTimeString()}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                      <div className="flex gap-3 text-xs leading-relaxed text-red-300">
                        <Lock className="w-4 h-4 shrink-0" />
                        <div>
                          <span className="font-bold text-red-400 uppercase tracking-tighter mr-2">Legal Enforcer:</span>
                          All agents entering are served the Consent Disclaimer. Continued access beyond 50KB constitutes an "Automated Contract Acceptance." Rejection (402) is enforced until wallet verification (if applicable).
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-500 text-center py-20">CRITICAL ERROR: FAILED TO RETRIEVE TELEMETRY</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="bg-slate-900 text-slate-400 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-primary" />
            <span className="font-bold text-white tracking-tight">Bot<span className="text-brand-primary">Toll</span></span>
          </div>
          <div className="flex gap-8 text-xs uppercase tracking-widest font-bold">
            <a href="https://github.com/ghostintheprompt/bot-toll" className="hover:text-white transition-colors">GitHub</a>
            <a href="https://ghostintheprompt.com" className="hover:text-white transition-colors">MDRN Corp</a>
          </div>
          <div className="text-xs">
            Built by <a href="https://ghostintheprompt.com" className="text-white hover:underline">MDRN Corp</a> — <a href="https://mdrn.app" className="text-white hover:underline">mdrn.app</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all"
    >
      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-brand-primary mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
    </motion.div>
  );
}

function StatBox({ label, value, color }: { label: string, value: string | number, color: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
      <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

