import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Truck, ArrowRight, Shield, Zap, MapPin, Droplet, 
  CheckCircle2, Compass, Activity, Play, Download,
  ChevronDown, ChevronUp, Clock, Navigation, AlertCircle,
  FileSpreadsheet, Sparkles, Building2, UserCheck, ShieldCheck
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  // Widget State
  const [activeTab, setActiveTab] = useState('dispatch');
  const [vehicleType, setVehicleType] = useState('heavy-freight');
  const [targetRoute, setTargetRoute] = useState('mumbai-delhi');
  const [optimizationMode, setOptimizationMode] = useState('fuel-saving');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSimulate = () => {
    setIsSimulating(true);
    setSimulationResult(null);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationResult({
        tripId: 'TRP-' + Math.floor(100000 + Math.random() * 900000),
        route: targetRoute === 'mumbai-delhi' ? 'Mumbai NH48 ➔ Delhi Hub' : 'Bengaluru ➔ Hyderabad Express',
        distance: targetRoute === 'mumbai-delhi' ? '1,422 km' : '574 km',
        estimatedTime: targetRoute === 'mumbai-delhi' ? '21h 45m' : '8h 30m',
        fuelSavings: '₹8,450 (18.6%)',
        co2Reduction: '142 kg CO₂',
        safetyScore: '98 / 100',
        assignedDriver: 'Rajesh Kumar (Grade A)',
        assignedVehicle: 'MH-04-AB-8821 (Tata Prima 35T)',
        status: 'DISPATCH_OPTIMIZED'
      });
    }, 900);
  };

  const faqs = [
    {
      q: "What is FleetSphere AI Dispatch?",
      a: "FleetSphere uses machine learning models and real-time telematics to compute optimal route trajectories, forecast fuel consumption, detect unauthorized fuel siphon events, and dispatch the most qualified resting driver automatically."
    },
    {
      q: "Does FleetSphere require proprietary GPS hardware?",
      a: "No. FleetSphere integrates universally with standard AIS-140 GPS trackers, OBD-II dongles, CAN-bus telemetry, and also functions seamlessly via our lightweight Driver Mobile Companion App."
    },
    {
      q: "How does the automated fuel theft and leak detection work?",
      a: "Our models compare real-time fuel sensor data against expected engine fuel consumption based on throttle position, route topography, vehicle payload weight, and idle periods. Uncharacteristic drops trigger instant SMS/email alarms."
    },
    {
      q: "Which user roles are supported out of the box?",
      a: "FleetSphere includes dedicated dashboards and permission controls for Super Admins, Fleet Managers, Branch Managers, Finance Officers, and On-Road Drivers."
    },
    {
      q: "Can I export audit and compliance reports for taxation and ESG?",
      a: "Yes. All operational expenses, driver trip sheets, fuel invoices, and carbon offset calculations can be exported immediately in CSV, Excel, or PDF formats."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fffdf9] text-[#3d3a37] flex flex-col font-sans selection:bg-[#ff6b4a]/20 selection:text-[#c24127]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#fffdf9]/90 border-b border-[#e7e4e0] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#ff6b4a] shadow-[0_6px_18px_rgba(255,107,74,0.32)] flex items-center justify-center text-white transition-transform group-hover:scale-105">
              <Truck className="w-5 h-5" />
            </div>
            <span className="font-heading font-bold text-xl text-[#3d3a37] tracking-tight">
              FleetSphere<span className="text-[#ff6b4a]">.ai</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7 text-[0.92rem] font-medium text-[#78716c]">
            <a href="#demo-widget" className="hover:text-[#ff6b4a] transition-colors">Live Dispatch Tool</a>
            <a href="#features" className="hover:text-[#ff6b4a] transition-colors">Fleet Matrix</a>
            <a href="#workflow" className="hover:text-[#ff6b4a] transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-[#ff6b4a] transition-colors">Plans</a>
            <a href="#faq" className="hover:text-[#ff6b4a] transition-colors">FAQ</a>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
              Telematics Active
            </div>
            <Link
              to="/login"
              className="btn-coral text-sm py-2 px-4 shadow-[0_4px_14px_rgba(255,107,74,0.3)]"
            >
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-wash pt-16 pb-12 sm:pt-24 sm:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fff5f3] border border-[#ff6b4a]/25 text-[#b93f25] text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#ff6b4a]" />
            Next-Gen Autonomous Fleet Operations
          </div>

          {/* Heading */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#3d3a37] tracking-tight leading-[1.12] mb-6">
            Unify Your Fleet with <br className="hidden sm:block" />
            <span className="text-[#ff6b4a]">Real-Time AI Telematics</span> & Dispatch
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[#78716c] font-normal leading-relaxed mb-8">
            Eliminate fuel leakage, optimize multi-leg route dispatches, automate driver compliance,
            and monitor fleet profitability from a single unified control room.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
            <a href="#demo-widget" className="btn-coral text-base py-3 px-6">
              <Zap className="w-4 h-4" />
              Try Live Dispatch Simulator
            </a>
            <Link to="/login" className="btn-soft text-base py-3 px-6">
              <span>Sign In with Demo Roles</span>
              <ArrowRight className="w-4 h-4 text-[#78716c]" />
            </Link>
          </div>

          {/* KPI Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="card-clean p-4 text-center">
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#3d3a37]">99.8%</div>
              <div className="text-xs font-medium text-[#78716c] mt-0.5">On-Time Delivery Rate</div>
            </div>
            <div className="card-clean p-4 text-center">
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#ff6b4a]">24.2%</div>
              <div className="text-xs font-medium text-[#78716c] mt-0.5">Average Fuel Savings</div>
            </div>
            <div className="card-clean p-4 text-center">
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#3d3a37]">3.4M+</div>
              <div className="text-xs font-medium text-[#78716c] mt-0.5">Tracked Kilometers</div>
            </div>
            <div className="card-clean p-4 text-center">
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#047857]">₹1.8 Cr</div>
              <div className="text-xs font-medium text-[#78716c] mt-0.5">Fuel Fraud Prevented</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tool / Widget Section (Mirroring ai-dubbing.app generation tool) */}
      <section id="demo-widget" className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="eyebrow-chip mb-2">⚡ Interactive Dispatch Console</div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#3d3a37]">
              Simulate Live Fleet Routing & Optimization
            </h2>
            <p className="text-sm text-[#78716c] mt-1.5">
              Experience the algorithmic engine that powers enterprise haulage and city logistics.
            </p>
          </div>

          {/* Widget Shell */}
          <div className="card-clean p-6 sm:p-8 bg-white border border-[#e7e4e0] shadow-[0_8px_30px_rgba(61,58,55,0.06)] rounded-2xl">
            {/* Widget Mode Tabs */}
            <div className="flex flex-wrap gap-2 pb-5 border-b border-[#e7e4e0]">
              {[
                { id: 'dispatch', label: '⚡ Smart Route Dispatch', icon: Navigation },
                { id: 'telematics', label: '🛰️ Live Telematics', icon: Activity },
                { id: 'fuel', label: '⛽ Fuel & Theft Audit', icon: Droplet },
                { id: 'safety', label: '🛡️ Driver Safety AI', icon: Shield },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#fff5f3] text-[#b93f25] border border-[#ff6b4a]/30 shadow-xs'
                      : 'bg-[#fafaf9] text-[#78716c] hover:bg-[#f4f3f0] hover:text-[#3d3a37] border border-transparent'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Interactive Drop / Simulation Zone */}
            <div className="mt-6">
              <div 
                onClick={handleSimulate}
                className="upload-zone-warm p-8 group relative overflow-hidden"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#ff6b4a] text-white flex items-center justify-center text-xl shadow-[0_4px_16px_rgba(255,107,74,0.3)] mb-3 group-hover:scale-110 transition-transform">
                    <Compass className="w-6 h-6 animate-spin-slow" />
                  </div>
                  <h3 className="font-heading font-bold text-base sm:text-lg text-[#3d3a37]">
                    Click to Run Instant AI Dispatch Simulation
                  </h3>
                  <p className="text-xs text-[#78716c] mt-1 max-w-md">
                    Or drop fleet manifests, GPS route breadcrumbs (.csv, .gpx, .json) to test real-time pathfinding.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#b93f25]">
                    <span>Instant algorithmic response</span>
                    <span>•</span>
                    <span>No installation needed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Config Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div>
                <label className="block text-xs font-semibold text-[#3d3a37] mb-1.5">Vehicle Fleet Category</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full bg-[#fafaf9] border border-[#e7e4e0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#3d3a37] focus:border-[#ff6b4a] focus:outline-hidden"
                >
                  <option value="heavy-freight">Heavy Haul 35-Ton Multi-Axle</option>
                  <option value="cold-chain">Refrigerated Reefer 18-Ton</option>
                  <option value="ev-van">Electric Last-Mile 3.5-Ton</option>
                  <option value="tanker">Chemical & Fuel Tanker 24KL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3d3a37] mb-1.5">Route Corridor</label>
                <select
                  value={targetRoute}
                  onChange={(e) => setTargetRoute(e.target.value)}
                  className="w-full bg-[#fafaf9] border border-[#e7e4e0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#3d3a37] focus:border-[#ff6b4a] focus:outline-hidden"
                >
                  <option value="mumbai-delhi">Mumbai ➔ Delhi (Golden Corridor)</option>
                  <option value="bengaluru-hyderabad">Bengaluru ➔ Hyderabad Express</option>
                  <option value="chennai-pune">Chennai ➔ Pune Manufacturing Link</option>
                  <option value="kolkata-patna">Kolkata ➔ Patna Logistics Spoke</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3d3a37] mb-1.5">Optimization Policy</label>
                <select
                  value={optimizationMode}
                  onChange={(e) => setOptimizationMode(e.target.value)}
                  className="w-full bg-[#fafaf9] border border-[#e7e4e0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#3d3a37] focus:border-[#ff6b4a] focus:outline-hidden"
                >
                  <option value="fuel-saving">Max Fuel Conservation (-18%)</option>
                  <option value="fastest-eta">Speed Priority & Dynamic Bypass</option>
                  <option value="cold-chain-secure">Zero-Deviation Temp Guard</option>
                  <option value="toll-optimized">Toll & FASTag Cost Balancing</option>
                </select>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#e7e4e0]">
              <div className="flex items-center gap-2 text-xs text-[#78716c]">
                <Clock className="w-4 h-4 text-[#ff6b4a]" />
                <span>Simulating at 60 FPS real-time engine telemetry</span>
              </div>
              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="btn-coral w-full sm:w-auto min-w-[210px]"
              >
                {isSimulating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Processing Route Matrix...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Generate AI Route Solution</span>
                  </>
                )}
              </button>
            </div>

            {/* Simulation Result Display */}
            {simulationResult && (
              <div className="mt-6 p-5 rounded-xl bg-[#fafaf9] border border-[#e7e4e0] animate-fadeIn">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e7e4e0]">
                  <div className="flex items-center gap-2">
                    <span className="badge-mint">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Optimized Solution Ready
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#78716c]">
                      {simulationResult.tripId}
                    </span>
                  </div>
                  <button 
                    onClick={() => navigate('/login')}
                    className="text-xs font-bold text-[#b93f25] hover:underline flex items-center gap-1"
                  >
                    <span>View in Dashboard</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-xs text-[#78716c]">Corridor Distance</span>
                    <div className="font-heading font-bold text-sm text-[#3d3a37] mt-0.5">{simulationResult.distance}</div>
                  </div>
                  <div>
                    <span className="text-xs text-[#78716c]">Estimated Transit</span>
                    <div className="font-heading font-bold text-sm text-[#3d3a37] mt-0.5">{simulationResult.estimatedTime}</div>
                  </div>
                  <div>
                    <span className="text-xs text-[#78716c]">Projected Fuel Gain</span>
                    <div className="font-heading font-bold text-sm text-[#047857] mt-0.5">{simulationResult.fuelSavings}</div>
                  </div>
                  <div>
                    <span className="text-xs text-[#78716c]">Safety Rating</span>
                    <div className="font-heading font-bold text-sm text-[#ff6b4a] mt-0.5">{simulationResult.safetyScore}</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#e7e4e0] flex flex-wrap items-center justify-between text-xs text-[#78716c]">
                  <span>Allocated Truck: <strong className="text-[#3d3a37]">{simulationResult.assignedVehicle}</strong></span>
                  <span>Driver: <strong className="text-[#3d3a37]">{simulationResult.assignedDriver}</strong></span>
                </div>
              </div>
            )}

            {/* Recent Live Activity (Mirroring Generations History in ai-dubbing.app) */}
            <div className="mt-8 pt-6 border-t border-[#e7e4e0]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#78716c]">
                  Recent Autonomous Dispatches & Alerts
                </h4>
                <span className="text-[11px] text-[#ff6b4a] font-semibold">Live System Stream</span>
              </div>
              <div className="space-y-2">
                {[
                  { id: 'TRP-8921', desc: 'Freight Express (MH-12-DE-9941)', route: 'Pune ➔ Bengaluru', status: 'In Transit', gain: '+14% Fuel Efficiency' },
                  { id: 'TRP-7612', desc: 'Cold Chain Pharma (DL-01-AX-3312)', route: 'Ahmedabad ➔ Delhi', status: 'Temp Verified', gain: '0 Deviation' },
                  { id: 'TRP-6504', desc: 'Urban Last-Mile (KA-03-MM-1029)', route: 'Electronic City Hub', status: 'Completed', gain: '99.8% On-Time' },
                ].map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#fafaf9] hover:bg-[#fff5f3] transition-colors text-xs border border-transparent hover:border-[#ff6b4a]/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#fff5f3] text-[#b93f25] flex items-center justify-center font-bold">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-[#3d3a37]">{item.desc}</div>
                        <div className="text-[11px] text-[#78716c]">{item.route} • {item.id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline font-mono font-medium text-[#047857]">{item.gain}</span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-[#e7e4e0] text-[#3d3a37] font-semibold text-[10px]">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Capabilities Matrix (Mirroring Voice Showcase Grid) */}
      <section id="features" className="py-14 bg-[#fafaf9] border-y border-[#e7e4e0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="eyebrow-chip mb-2">Fleet Matrix</div>
            <h2 className="font-heading text-3xl font-bold text-[#3d3a37]">
              Specialized Operations for Every Asset Class
            </h2>
            <p className="text-base text-[#78716c] mt-2">
              Tailored algorithms, sensory integrations, and compliance guardrails designed for specific transport domains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: "Heavy Haul Freight",
                subtitle: "Multi-axle & Container Trailers",
                stat: "18.4% Fuel Trim",
                desc: "Grade-sensing engine load optimization, toll highway routing, and weighbridge automation.",
                badge: "35T - 55T Capacity"
              },
              {
                title: "Cold-Chain Reefer",
                subtitle: "Pharma & Perishables Transport",
                stat: "±0.2°C Temperature Guard",
                desc: "Continuous BLE temperature logging, door opening alerts, and automated compressor throttling.",
                badge: "IoT Monitored"
              },
              {
                title: "Urban EV Logistics",
                subtitle: "Hyperlocal & Mid-Mile Delivery",
                stat: "99.2% Range Accuracy",
                desc: "Battery State-of-Charge (SoC) destination mapping, charging depot reservation, and multi-drop routes.",
                badge: "Zero-Emission"
              },
              {
                title: "Hazmat & Liquid Cargo",
                subtitle: "Chemical, Fuel & Gas Tankers",
                stat: "Zero Incident Protocol",
                desc: "Geo-fenced speed limiters, driver fatigue and eye-blink tracking, and emergency response broadcast.",
                badge: "Safety Grade A+"
              }
            ].map((f, i) => (
              <div key={i} className="card-clean card-lift p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#fff5f3] text-[#b93f25] flex items-center justify-center font-heading font-bold text-sm">
                      0{i + 1}
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#f4f3f0] text-[#78716c]">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#3d3a37] mb-1">{f.title}</h3>
                  <div className="text-xs text-[#ff6b4a] font-semibold mb-3">{f.subtitle}</div>
                  <p className="text-xs text-[#78716c] leading-relaxed mb-4">{f.desc}</p>
                </div>
                <div className="pt-3 border-t border-[#e7e4e0] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#047857]">{f.stat}</span>
                  <Link to="/login" className="text-xs font-semibold text-[#3d3a37] hover:text-[#ff6b4a] flex items-center gap-1">
                    Deploy
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Steps Workflow */}
      <section id="workflow" className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <div className="eyebrow-chip mb-2">Workflow</div>
            <h2 className="font-heading text-3xl font-bold text-[#3d3a37]">
              Three Steps to Autonomous Fleet Control
            </h2>
            <p className="text-sm text-[#78716c] mt-2">
              From telemetry ingest to verified expense settlements, everything runs in sync.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-clean p-6 relative">
              <div className="font-heading font-extrabold text-4xl text-[#ff6b4a] mb-4">01</div>
              <h3 className="font-heading font-bold text-lg text-[#3d3a37] mb-2">Connect Vehicles & Crew</h3>
              <p className="text-xs text-[#78716c] leading-relaxed">
                Plug in AIS-140 GPS or invite drivers via the mobile app. Instant vehicle health diagnostics, fuel calibration, and digital license verification.
              </p>
            </div>

            <div className="card-clean p-6 relative">
              <div className="font-heading font-extrabold text-4xl text-[#ff6b4a] mb-4">02</div>
              <h3 className="font-heading font-bold text-lg text-[#3d3a37] mb-2">Algorithmic Route AI</h3>
              <p className="text-xs text-[#78716c] leading-relaxed">
                Generate high-efficiency routes based on live traffic, gradient topology, FASTag toll costs, and statutory driver rest-break mandates.
              </p>
            </div>

            <div className="card-clean p-6 relative">
              <div className="font-heading font-extrabold text-4xl text-[#ff6b4a] mb-4">03</div>
              <h3 className="font-heading font-bold text-lg text-[#3d3a37] mb-2">Automate Governance</h3>
              <p className="text-xs text-[#78716c] leading-relaxed">
                Instant fuel theft flags, automated driver expense invoice parsing with OCR, and one-click financial audit sign-offs for branches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Plan Section (Mirroring ai-dubbing.app Pricing Grid) */}
      <section id="pricing" className="py-16 bg-[#fafaf9] border-y border-[#e7e4e0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="eyebrow-chip mb-2">Transparent Subscriptions</div>
            <h2 className="font-heading text-3xl font-bold text-[#3d3a37]">
              Simple Fleet Tier Pricing
            </h2>
            <p className="text-sm text-[#78716c] mt-2">
              Predictable monthly pricing with unlimited driver companion accounts and sensor streams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="card-clean p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-bold text-xl text-[#3d3a37]">Regional Fleet</h3>
                <p className="text-xs text-[#78716c] mt-1 mb-6">Ideal for city delivery & localized branches</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-heading font-extrabold text-4xl text-[#3d3a37]">₹3,999</span>
                  <span className="text-xs text-[#78716c]">/ month</span>
                </div>
                <div className="p-3 rounded-xl bg-[#fff5f3] text-[#b93f25] text-xs font-bold mb-6">
                  Up to 15 Active Vehicles
                </div>
                <ul className="space-y-3 text-xs text-[#78716c] mb-8">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />
                    <span>Real-time GPS telematics (10s updates)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />
                    <span>Basic route calculation & ETA tracking</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />
                    <span>Mobile driver logs & fuel claims</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />
                    <span>Standard CSV data export</span>
                  </li>
                </ul>
              </div>
              <Link to="/login" className="btn-soft w-full justify-center text-sm">
                Get Started
              </Link>
            </div>

            {/* Professional (Highlighted) */}
            <div className="card-clean p-8 flex flex-col justify-between border-2 border-[#ff6b4a] shadow-[0_12px_40px_rgba(255,107,74,0.14)] relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#ff6b4a] text-white text-[11px] font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl text-[#3d3a37]">Enterprise Growth</h3>
                <p className="text-xs text-[#78716c] mt-1 mb-6">For interstate transport operators & 3PLs</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-heading font-extrabold text-4xl text-[#3d3a37]">₹9,999</span>
                  <span className="text-xs text-[#78716c]">/ month</span>
                </div>
                <div className="p-3 rounded-xl bg-[#fff5f3] text-[#b93f25] text-xs font-bold mb-6">
                  Up to 60 Active Vehicles
                </div>
                <ul className="space-y-3 text-xs text-[#78716c] mb-8">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />
                    <span>AI Route Optimization & fuel bypass</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />
                    <span>Automated fuel theft & siphoning alarms</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />
                    <span>Branch Manager & Finance Officer roles</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />
                    <span>Trip expense receipt scanning (OCR)</span>
                  </li>
                </ul>
              </div>
              <Link to="/login" className="btn-coral w-full justify-center text-sm shadow-[0_8px_20px_rgba(255,107,74,0.3)]">
                Launch Console
              </Link>
            </div>

            {/* Custom Enterprise */}
            <div className="card-clean p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-bold text-xl text-[#3d3a37]">Corporate Unlimited</h3>
                <p className="text-xs text-[#78716c] mt-1 mb-6">Multi-depot nationwide national freight</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-heading font-extrabold text-4xl text-[#3d3a37]">₹24,999</span>
                  <span className="text-xs text-[#78716c]">/ month</span>
                </div>
                <div className="p-3 rounded-xl bg-[#fff5f3] text-[#b93f25] text-xs font-bold mb-6">
                  Unlimited Vehicles & Multi-Branch
                </div>
                <ul className="space-y-3 text-xs text-[#78716c] mb-8">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />
                    <span>Full ERP & SAP telemetry webhooks</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />
                    <span>Custom Cold-Chain IoT protocols</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />
                    <span>Dedicated SLA & 24/7 Dispatch Desk</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />
                    <span>Custom domain & white-label portals</span>
                  </li>
                </ul>
              </div>
              <Link to="/login" className="btn-soft w-full justify-center text-sm">
                Contact Enterprise
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section id="faq" className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="eyebrow-chip mb-2">Got Questions?</div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#3d3a37]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="card-clean overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-heading font-semibold text-sm sm:text-base text-[#3d3a37] hover:text-[#ff6b4a] transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-[#ff6b4a] text-lg font-bold">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#78716c] leading-relaxed border-t border-[#e7e4e0]/60">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band (Matching ai-dubbing.app CTA Band) */}
      <section className="py-14 bg-[#fff5f3] border-t border-[#e7e4e0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#3d3a37] mb-3">
            Ready to Supercharge Your Fleet Logistics?
          </h2>
          <p className="text-sm sm:text-base text-[#78716c] max-w-xl mx-auto mb-6">
            Join hundreds of fleet operators cutting fuel waste and dispatching thousands of trips effortlessly every day.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/login" className="btn-coral text-base py-3 px-8 shadow-[0_8px_24px_rgba(255,107,74,0.32)]">
              <span>Sign In to Fleet Control Room</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/driver/register" className="btn-soft text-base py-3 px-6">
              Driver Onboarding Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer (Matching ai-dubbing.app 5-column footer) */}
      <footer className="bg-[#fafaf9] border-t border-[#e7e4e0] pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#ff6b4a] text-white flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="font-heading font-bold text-lg text-[#3d3a37]">FleetSphere</span>
              </div>
              <p className="text-xs text-[#78716c] max-w-sm leading-relaxed mb-4">
                Enterprise cloud platform for AI dispatch, dynamic multi-stop routing, live telematics tracking, and automated fuel audit compliance.
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#047857]">
                <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                All Systems Operational (99.98% SLA)
              </div>
            </div>

            <div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#3d3a37] mb-3">Platform</h4>
              <ul className="space-y-2 text-xs text-[#78716c]">
                <li><a href="#demo-widget" className="hover:text-[#ff6b4a]">Dispatch Simulator</a></li>
                <li><Link to="/vehicles" className="hover:text-[#ff6b4a]">Asset Tracking</Link></li>
                <li><Link to="/routes" className="hover:text-[#ff6b4a]">AI Route Optimizer</Link></li>
                <li><Link to="/fuel" className="hover:text-[#ff6b4a]">Fuel Theft Alarms</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#3d3a37] mb-3">Operations</h4>
              <ul className="space-y-2 text-xs text-[#78716c]">
                <li><Link to="/drivers" className="hover:text-[#ff6b4a]">Driver Management</Link></li>
                <li><Link to="/expenses" className="hover:text-[#ff6b4a]">Expense Audits</Link></li>
                <li><Link to="/maintenance" className="hover:text-[#ff6b4a]">Vehicle Maintenance</Link></li>
                <li><Link to="/driver/register" className="hover:text-[#ff6b4a]">Driver Registration</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#3d3a37] mb-3">Security & Legal</h4>
              <ul className="space-y-2 text-xs text-[#78716c]">
                <li><span className="hover:text-[#ff6b4a] cursor-pointer">AIS-140 Certified</span></li>
                <li><span className="hover:text-[#ff6b4a] cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-[#ff6b4a] cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-[#ff6b4a] cursor-pointer">Audit Logs & SOC-2</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[#e7e4e0] flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716c] gap-2">
            <span>© {new Date().getFullYear()} FleetSphere Technologies Inc. All rights reserved.</span>
            <span>Crafted with AI & Telematics precision.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
