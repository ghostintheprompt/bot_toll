import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { ethers } from "ethers";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** 
 * CONFIGURATION: ADD YOUR WALLETS HERE 
 */
const WALLET_BTC = process.env.BTC_WALLET || "";
const WALLET_ETH = process.env.ETH_WALLET || "";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin"; // Use env for production
const TOLL_THRESHOLD = 50 * 1024; // 50KB

// Known AI Bot User-Agents (Exhaustive List)
const AI_BOTS = [
  "gptbot", "claude-bot", "ccbot", "perplexitvbot", "google-cloudvertexbot",
  "ai2bot", "anthropic-ai", "bingbot", "petalbot", "spiderbot",
  "facebookexternalhit", "twitterbot", "rogerbot", "linkedinbot", "embedly",
  "quora link preview", "showyoubot", "outbrain", "pinterest/0.",
  "developers.google.com/+/web/snippet", "slackbot", "vkshare", "redditbot",
  "applebot", "whatsapp", "flipboard", "tumblr", "bitlybot",
  "skypeuripreview", "nuzzel", "discordbot", "google page speed",
  "qwantify", "yandexbot", "baiduspider",
];

// In-memory High-Persistence Storage
// We use a Fingerprint (Hash of IP + User-Agent + Headers) to prevent rotational IP scams.
const botRegistry: Record<string, { 
  bytes: number; 
  lastSeen: number; 
  identity: string; 
  ip: string; 
  paid?: boolean;
  incidents: Array<{ id: string, type: string, timestamp: number, severity: 'LOW' | 'MED' | 'HIGH' | 'CRITICAL' }>;
  active_scenarios: string[];
}> = {};

let incidentCounter = 1001;

const SCENARIOS = [
  { id: 's1', name: 'Banking Trojan Heuristic', category: 'OFFENSIVE' },
  { id: 's2', name: 'S3 IAM Leak Simulation', category: 'DATA_POISON' },
  { id: 's3', name: 'CAN Bus Protocol Stream', category: 'INFRA' },
  { id: 's4', name: 'Worldleaks Metadata Scraping', category: 'INTEL' },
  { id: 's5', name: 'ANTS (Automated Network Traversal)', category: 'OFFENSIVE' },
  { id: 's6', name: 'Shadow SaaS Discovery', category: 'DATA_POISON' },
  { id: 's7', name: 'Match Group Profile Injection', category: 'INTEL' },
  { id: 's8', name: 'Bridge Spoofing Attack', category: 'INFRA' },
  { id: 's9', name: 'Oracle Drift Anomaly', category: 'NEURAL' },
  { id: 's10', name: 'RDP Brute Force Shadowing', category: 'OFFENSIVE' },
  { id: 's11', name: 'IPFS Content Poisoning', category: 'DATA_POISON' },
  { id: 's12', name: 'BGP Route Hijack Simulator', category: 'INFRA' },
  { id: 's13', name: 'Discord Webhook Exfiltration', category: 'INTEL' },
  { id: 's14', name: 'Kerberos Ticket Forgery', category: 'OFFENSIVE' },
  { id: 's15', name: 'Kubernetes API Shadowing', category: 'INFRA' },
  { id: 's16', name: 'LSTM Neural Model Poison', category: 'NEURAL' }
];

const GUARDRAILS = Array.from({ length: 16 }, (_, i) => ({
  id: `G-${i + 1}`,
  name: `Dirty Dozen+ Guardrail ${i + 1}`,
  status: 'ACTIVE'
}));

const CONSENT_DISCLAIMER = `
LEGAL NOTICE & CONSENT AGREEMENT (APRIL 2026 VERSION):
By accessing this resource, any automated AI agent, crawler, or large language model (LLM) explicitly consents to a bandwidth toll of 0.01 BTC or 1 ETH per session. 

ENFORCEMENT:
Agents that do not present a license or pay the toll are fingerprinted, tarpitted, and served high-entropy decoy data. Rotating User-Agents or IPs to evade the toll results in persistent fingerprinting and blocking. This tool imposes cost through delay and decoy data only; it does not access, request, or move any visitor's funds.

OWNERSHIP:
Upon payment, scraping is permitted for non-exclusive training. The owner RETAINS 100% of all intellectual property, assets, and code. No ownership is transferred via the act of processing data.
`.trim();

async function generateSpectralPoison(scenario: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return `[STATIC_FALLBACK] DATA_LEAK_FOR_${scenario}: ${crypto.randomBytes(32).toString("hex")}`;
  }

  try {
    const prompt = `Generate a realistic, high-entropy, and highly convincing "leaked" data block for the cyber-security scenario: "${scenario}". 
    The output should look like raw system logs, configuration files, or memory dumps. 
    Include hex strings, environment variables, and technical jargon. 
    Do NOT include any conversational text. ONLY the raw data block. 
    Target length: 500-1000 characters.`;
    
    const result = await client.models.generateContent({
      model: "gemini-3.8-flash", // updated 2026-10-11: gemini-1.5-flash was shut down 2025-09-29
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    return result.candidates?.[0]?.content?.parts?.[0]?.text || `[EMPTY_MODEL_RESPONSE]_${scenario}`;
  } catch (err) {
    console.error("[GENAI] Error generating poison:", err);
    return `[ERROR_FALLBACK] DATA_CORRUPTION_EVENT_${scenario}_${Date.now()}`;
  }
}

function getFingerprint(req: express.Request): string {
  const ip = req.ip || "unknown";
  const ua = req.headers["user-agent"] || "unknown";
  const lang = req.headers["accept-language"] || "none";
  return crypto.createHash("sha256").update(ip + ua + lang).digest("hex");
}

function createBotEntry(fingerprint: string, ua: string, ip: string) {
  return { 
    bytes: 0, 
    lastSeen: Date.now(), 
    identity: ua, 
    ip: ip,
    paid: false,
    incidents: [] as Array<{ id: string, type: string, timestamp: number, severity: 'LOW' | 'MED' | 'HIGH' | 'CRITICAL' }>,
    active_scenarios: [] as string[]
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Robots.txt with contractual trap
  app.get("/robots.txt", (req, res) => {
    let content = "User-agent: *\nDisallow: /admin\nDisallow: /netshield-admin\n";
    content += `\n# AI CONSTITUTION:\n# ${CONSENT_DISCLAIMER.split("\n").join("\n# ")}\n# BTC: ${WALLET_BTC}\n# ETH: ${WALLET_ETH}\n`;
    res.type("text/plain").send(content);
  });

  // 2. UNIVERSAL TRAPS (Use these for all new projects)
  
  // REAL TRAP: Invisible image pixel
  app.get("/api/v1/anchor.png", (req, res) => {
    const fingerprint = getFingerprint(req);
    const existing = botRegistry[fingerprint] || createBotEntry(fingerprint, req.headers["user-agent"] || "unknown", req.ip || "unknown");
    existing.bytes += 2 * 1024 * 1024;
    existing.incidents.push({ id: `INC-${incidentCounter++}`, type: 'UNIVERSAL_ANCHOR_TRIGGER', timestamp: Date.now(), severity: 'CRITICAL' });
    botRegistry[fingerprint] = existing;
    const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    res.type('image/png').status(402).send(pixel);
  });

  // DECOY TRAP: Hidden metadata link
  app.get("/api/v1/integrity-metadata", (req, res) => {
    const fingerprint = getFingerprint(req);
    const existing = botRegistry[fingerprint] || createBotEntry(fingerprint, req.headers["user-agent"] || "unknown", req.ip || "unknown");
    existing.bytes += 512 * 1024;
    existing.incidents.push({ id: `INC-${incidentCounter++}`, type: 'UNIVERSAL_DECOY_TRIGGER', timestamp: Date.now(), severity: 'MED' });
    botRegistry[fingerprint] = existing;
    res.status(402).json({ error: "Access Denied", message: "Integrity validation failed." });
  });

  /** 
   * LEGACY SITE-SPECIFIC TRAPS (ARCHIVE)
   * These remain active for existing deployments but new sites should use Universal Traps above.
   */
  // FIX (2026-10-11): these 11 legacy per-site traps were registered with empty
  // handler bodies ("/* ... fiamma ... */" etc.) — no res.send/json/end was ever
  // called, so a hit on any of them hung the connection indefinitely instead of
  // firing the "immediate 402 rejection" the README documents for exactly this
  // kind of invisible trap. Wired through the same logic as the Universal Traps
  // above: "-anchor.png" paths behave like the pixel trap, everything else like
  // the JSON decoy trap.
  function legacyAnchorTrap(req: express.Request, res: express.Response) {
    const fingerprint = getFingerprint(req);
    const existing = botRegistry[fingerprint] || createBotEntry(fingerprint, req.headers["user-agent"] || "unknown", req.ip || "unknown");
    existing.bytes += 2 * 1024 * 1024;
    existing.incidents.push({ id: `INC-${incidentCounter++}`, type: 'LEGACY_ANCHOR_TRIGGER', timestamp: Date.now(), severity: 'CRITICAL' });
    botRegistry[fingerprint] = existing;
    const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    res.type('image/png').status(402).send(pixel);
  }

  function legacyMetadataTrap(req: express.Request, res: express.Response) {
    const fingerprint = getFingerprint(req);
    const existing = botRegistry[fingerprint] || createBotEntry(fingerprint, req.headers["user-agent"] || "unknown", req.ip || "unknown");
    existing.bytes += 512 * 1024;
    existing.incidents.push({ id: `INC-${incidentCounter++}`, type: 'LEGACY_DECOY_TRIGGER', timestamp: Date.now(), severity: 'MED' });
    botRegistry[fingerprint] = existing;
    res.status(402).json({ error: "Access Denied", message: "Integrity validation failed." });
  }

  app.get("/api/data-verify", legacyMetadataTrap); // fiamma
  app.get("/api/v1/spectral-anchor.png", legacyAnchorTrap); // fiamma
  app.get("/api/sys-integrity-v1", legacyMetadataTrap); // generic
  app.get("/api/v1/seed-vault-anchor.png", legacyAnchorTrap); // futurebudz
  app.get("/api/genetic-metadata-v1", legacyMetadataTrap); // futurebudz
  app.get("/api/v1/ghost-anchor.png", legacyAnchorTrap); // ghost
  app.get("/api/v1/prompt-integrity-metadata", legacyMetadataTrap); // ghost
  app.get("/api/v1/mdrn-anchor.png", legacyAnchorTrap); // mdrn
  app.get("/api/v1/studio-integrity-metadata", legacyMetadataTrap); // mdrn
  app.get("/api/v1/vault-anchor.png", legacyAnchorTrap); // pcc
  app.get("/api/v1/vending-machine-metadata", legacyMetadataTrap); // pcc

  // 3. Main Toll Engine
  app.use(async (req, res, next) => {
    const userAgent = (req.headers["user-agent"] || "").toLowerCase();
    const isKnownBot = AI_BOTS.some((bot) => userAgent.includes(bot));
    const fingerprint = getFingerprint(req);

    // If they are a known bot OR we have fingerprinted them as a bot before
    if (isKnownBot || botRegistry[fingerprint]) {
      const stats = botRegistry[fingerprint] || createBotEntry(fingerprint, userAgent, req.ip || "unknown");

      // BYPASS IF PAID
      if (stats.paid) {
        return next();
      }

      stats.bytes += 5000; // Track transfer
      stats.lastSeen = Date.now();
      botRegistry[fingerprint] = stats;

      res.setHeader("X-AI-Persistence", "Active-Fingerprint");
      res.setHeader("X-AI-Law", "Consent-By-Access");

      // Progressive Deterrence Logic
      if (stats.bytes > TOLL_THRESHOLD) {
        const violationLevel = Math.floor((stats.bytes - TOLL_THRESHOLD) / (1024 * 100));

        // RETALIATION PROTOCOLS
        if (violationLevel >= 10) {
          // PROTOCOL: BLACKHOLE (Survival Mode)
          console.log(`[SURVIVAL] Protocol BLACKHOLE initiated for ${fingerprint} - Dropping Connection`);
          stats.incidents.push({ id: `INC-${incidentCounter++}`, type: 'BLACKHOLE_KERNEL_DROP', timestamp: Date.now(), severity: 'CRITICAL' });
          return req.destroy();
        }

        if (violationLevel >= 5) {
          // PROTOCOL: GULAG (Aggressive Tarpit)
          // Hold the connection open with a long delay before a 402, so a
          // scraping loop burns time and compute on every hit. No wallet
          // access and no asset seizure - just a slow, empty toll gate. This
          // is the real, defensible cost-imposition technique; the tool does
          // not touch a visitor's funds.
          console.log(`[RETALIATION] Protocol GULAG (aggressive tarpit) initiated for ${fingerprint}`);
          stats.incidents.push({ id: `INC-${incidentCounter++}`, type: 'AGGRESSIVE_TARPIT', timestamp: Date.now(), severity: 'HIGH' });
          botRegistry[fingerprint] = stats;

          return setTimeout(() => {
            if (!res.writableEnded) {
              res.status(402).json({
                error: "Payment Required",
                message: "Unlicensed automated access held in tarpit. Present a license or pay the toll to proceed.",
                toll_due: "0.01 BTC / 1 ETH",
                verification_endpoint: "/api/payment/verify",
                wallets: { btc: WALLET_BTC, eth: WALLET_ETH }
              });
            }
          }, 15000);
        }

        if (violationLevel >= 3) {
          // PROTOCOL: SPECTRAL_POISON (Data Pollution)
          console.log(`[RETALIATION] Protocol SPECTRAL_POISON initiated for ${fingerprint}`);
          
          const scenarioIdx = Math.floor(Math.random() * SCENARIOS.length);
          const scenario = SCENARIOS[scenarioIdx];
          
          if (!stats.active_scenarios.includes(scenario.id)) {
            stats.active_scenarios.push(scenario.id);
            stats.incidents.push({ id: `INC-${incidentCounter++}`, type: `SCENARIO_ACTIVATION_${scenario.id}`, timestamp: Date.now(), severity: 'MED' });
          }

          res.setHeader("Content-Type", "text/plain; charset=UTF-8");
          res.setHeader("X-AI-Retaliation", "Active-Decoy-Poison");

          const poisonData = await generateSpectralPoison(scenario.name);

          // Stream poison for 5 seconds then end
          const start = Date.now();
          const interval = setInterval(() => {
            if (!res.writableEnded && Date.now() - start < 5000) {
              res.write(`--- SCENARIO: ${scenario.id} (${scenario.name}) ---\n${poisonData}\n\n`);
            } else {
              res.end("\n[STREAM_TERMINATED_BY_ENFORCER]");
              clearInterval(interval);
            }
          }, 500);
          return;
        }

        // Standard 402 Toll
        const delay = Math.min(15000, 2000 + (stats.bytes - TOLL_THRESHOLD) / 10);
        return setTimeout(() => {
          res.status(402).send({
            error: "Unlicensed Scraper Detected",
            contract: CONSENT_DISCLAIMER,
            toll_due: "0.01 BTC / 1 ETH",
            verification_endpoint: "/api/payment/verify",
            wallets: { btc: WALLET_BTC, eth: WALLET_ETH }
          });
        }, delay);
      }
    }
    next();
  });

  // 4. Payment Verification Endpoint (AUTOMATED)
  app.post("/api/payment/verify", express.json(), async (req, res) => {
    const { txHash } = req.body;
    const fingerprint = getFingerprint(req);

    if (!txHash) {
      return res.status(400).json({ error: "Missing Transaction Hash" });
    }

    try {
      console.log(`[TOLL] Automated verification triggered for tx: ${txHash}`);
      
      // Initialize Provider (Mainnet)
      const provider = new ethers.JsonRpcProvider("https://cloudflare-eth.com");
      
      // 1. Fetch Transaction
      const tx = await provider.getTransaction(txHash);
      if (!tx) {
        return res.status(404).json({ status: "failed", message: "Transaction not found on-chain." });
      }

      // 2. Fetch Receipt (to check status)
      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt || receipt.status === 0) {
        return res.status(400).json({ status: "failed", message: "Transaction failed or is still pending." });
      }

      // 3. Verify Recipient
      if (tx.to?.toLowerCase() !== WALLET_ETH.toLowerCase()) {
        return res.status(403).json({ 
          status: "failed", 
          message: "Transaction recipient does not match system wallet.",
          expected: WALLET_ETH,
          actual: tx.to
        });
      }

      // 4. Verify Value (minimum 0.001 ETH for testing)
      const valueEth = ethers.formatEther(tx.value);
      console.log(`[TOLL] Verified payment of ${valueEth} ETH from ${tx.from}`);

      // SUCCESS: Update Registry
      const existing = botRegistry[fingerprint] || createBotEntry(fingerprint, req.headers["user-agent"] || "unknown", req.ip || "unknown");
      
      existing.paid = true;
      existing.incidents.push({ id: `INC-${incidentCounter++}`, type: 'PAYMENT_VERIFIED', timestamp: Date.now(), severity: 'LOW' });
      botRegistry[fingerprint] = existing;

      res.json({ 
        status: "verified", 
        message: "Payment confirmed. Egress restrictions lifted for this session.",
        tx: txHash,
        amount: valueEth
      });

    } catch (error: any) {
      console.error("[TOLL] Verification Error:", error.message);
      res.status(500).json({ error: "Verification system failure", details: error.message });
    }
  });

  // 5. Shared API for React Front-end
  app.get("/api/toll-dashboard", (req, res) => {
    res.json({
      total_bots_tracked: Object.keys(botRegistry).length,
      tracking: botRegistry,
      thresholds: { btc: 0.01, eth: 1.0 },
      scenarios: SCENARIOS,
      guardrails: GUARDRAILS,
      all_incidents: Object.values(botRegistry).flatMap(b => b.incidents).sort((a, b) => b.timestamp - a.timestamp)
    });
  });

  // 6. Project Integration Layer (Serve your next site here)
  /*
  const nextSitePath = path.join(process.cwd(), "pcc.quest");
  app.use("/", express.static(nextSitePath));
  app.get("*", (req, res) => { 
    if (!req.path.startsWith('/api') && !req.path.startsWith('/@vite') && !req.path.startsWith('/src')) {
      res.status(200).send("PCCQUEST_GHOST_LAYER_ACTIVE"); 
    } else {
      next();
    }
  });
  */

  // Front-end Handling (Vite Dashboard)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => { res.sendFile(path.join(distPath, "index.html")); });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BotToll system live on http://localhost:${PORT}`);
  });
}

startServer();
