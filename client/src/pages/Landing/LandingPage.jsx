import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Bot, 
  Zap, 
  Shield, 
  BarChart3, 
  Layers, 
  Users, 
  CheckCircle2,
  ChevronRight,
  Play,
  Check
} from 'lucide-react';

export const LandingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden">
      {/* Top Header Navigation */}
      <header className="h-20 border-b border-gray-800/80 px-8 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            Nexus<span className="text-indigo-400">AI</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-300">
          <a href="#features" className="hover:text-indigo-400 transition">Features</a>
          <a href="#demo" className="hover:text-indigo-400 transition">Live Demo</a>
          <a href="#pricing" className="hover:text-indigo-400 transition">Pricing</a>
          <a href="#faq" className="hover:text-indigo-400 transition">FAQ</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-xs font-semibold text-gray-300 hover:text-white px-4 py-2 transition"
          >
            Sign In
          </Link>
          <Link
            to="/login"
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition hover:scale-105 transform"
          >
            <span>Start Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative pt-20 pb-24 px-6 text-center max-w-5xl mx-auto space-y-8"
      >
        <motion.div variants={childVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>Next-Generation Enterprise AI Operating System</span>
        </motion.div>

        <motion.h1 variants={childVariants} className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          One AI Brain. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            Every Department. Every Decision.
          </span>
        </motion.h1>

        <motion.p variants={childVariants} className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Transform enterprise operations using intelligent automation, document understanding, meeting synthesis, workflow orchestration, and AI-powered business insights.
        </motion.p>

        <motion.div variants={childVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition hover:scale-105 transform"
          >
            <span>Launch AI Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => alert('Launching Enterprise Interactive Demo Video...')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel hover:bg-gray-800/80 text-gray-200 font-semibold text-sm border border-gray-800 flex items-center justify-center gap-2 transition hover:scale-105 transform"
          >
            <Play className="w-4 h-4 text-indigo-400 fill-indigo-400" />
            <span>Watch 2-Min Demo</span>
          </button>
        </motion.div>

        {/* Floating AI Nodes Hero Visual */}
        <motion.div variants={childVariants} className="pt-12">
          <div className="glass-panel p-4 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80"
              alt="NexusAI Enterprise Dashboard Mockup"
              className="rounded-2xl border border-gray-800/80 w-full object-cover max-h-[500px]"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Enterprise Statistics Bar */}
      <section className="border-y border-gray-800/80 bg-gray-950/40 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <motion.div whileHover={{ scale: 1.05 }}>
            <h3 className="text-3xl font-extrabold text-white">10x</h3>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Faster Search</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <h3 className="text-3xl font-extrabold text-indigo-400">94%</h3>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">AI Accuracy</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <h3 className="text-3xl font-extrabold text-emerald-400">85%</h3>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Less Manual Reports</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <h3 className="text-3xl font-extrabold text-violet-400">SOC2</h3>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Type II Certified</p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto space-y-12 text-center">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-white">Simple, Transparent Enterprise Pricing</h2>
          <p className="text-sm text-gray-400">Scalable AI workspaces designed for companies of all sizes.</p>

          <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-gray-900 border border-gray-800 mt-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${billingCycle === 'monthly' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${billingCycle === 'yearly' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="glass-panel p-8 rounded-3xl border border-gray-800 space-y-6">
            <div>
              <h3 className="font-bold text-lg text-white">Starter Team</h3>
              <p className="text-xs text-gray-400 mt-1">For small departments and agile squads.</p>
              <div className="mt-4">
                <span className="text-3xl font-black text-white">${billingCycle === 'monthly' ? '29' : '23'}</span>
                <span className="text-xs text-gray-400"> / user / month</span>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> AI Command Center Assistant</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Up to 5 Active Projects</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Document & Meeting Intelligence</li>
            </ul>
            <Link to="/login" className="block w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-center font-bold text-xs transition">Get Started</Link>
          </div>

          <div className="glass-panel p-8 rounded-3xl border-2 border-indigo-500 space-y-6 relative">
            <span className="absolute -top-3 right-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] uppercase font-extrabold px-3 py-1 rounded-full shadow">Most Popular</span>
            <div>
              <h3 className="font-bold text-lg text-white">Enterprise OS</h3>
              <p className="text-xs text-gray-400 mt-1">Full AI capabilities for entire organizations.</p>
              <div className="mt-4">
                <span className="text-3xl font-black text-white">${billingCycle === 'monthly' ? '79' : '63'}</span>
                <span className="text-xs text-gray-400"> / user / month</span>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited Projects & Workflows</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Knowledge Hub Vector Search</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Executive BI & Export Reports</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Dedicated Gemini 1.5 Pro Model</li>
            </ul>
            <Link to="/login" className="block w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-center font-bold text-xs transition shadow-lg shadow-indigo-600/30">Start Enterprise Trial</Link>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-gray-800 space-y-6">
            <div>
              <h3 className="font-bold text-lg text-white">Custom Corporate</h3>
              <p className="text-xs text-gray-400 mt-1">Tailored AI models for regulated enterprises.</p>
              <div className="mt-4">
                <span className="text-3xl font-black text-white">Custom</span>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Custom On-Premise / VPC Deploy</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> SOC2 Audit Log Exports</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 24/7 Dedicated Solutions Engineer</li>
            </ul>
            <button onClick={() => alert('Contacting Enterprise Sales Team...')} className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-center font-bold text-xs transition">Contact Sales</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 py-12 px-8 text-center text-xs text-gray-500">
        <p>© 2026 NexusAI SaaS Platform Inc. All rights reserved. Built for Enterprise Scale.</p>
      </footer>
    </div>
  );
};
