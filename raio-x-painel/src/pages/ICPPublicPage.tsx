import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Lead } from '../types';
import {
  Loader2, ArrowRight, PhoneCall, Star, CheckCircle2, Zap,
  ShieldCheck, Flame, Rocket, Crown, Lock,
  UserCheck, Brain, Target, TrendingUp,
  Lightbulb, CreditCard
} from 'lucide-react';

/* ──────────────────────── CONSTANTES ────────────────────────── */
const CHECKOUT_URLS: Record<string, string> = {
  basico: 'https://agenciarmktdigital.com.br/planos/basico',
  'basico-pro': 'https://agenciarmktdigital.com.br/planos/basico-pro',
  'premium-start': 'https://agenciarmktdigital.com.br/planos/premium-start',
  'premium-pro': 'https://agenciarmktdigital.com.br/planos/premium-pro',
};
const DOWNSELL_URL = 'https://agenciarmktdigital.com.br/planos/planejamento-mkt'; // substitua pelo link real de R$99
const WHATSAPP_URL = 'https://wa.me/5521990000000?text=Vi+meu+diagnóstico+Raio-X+e+quero+iniciar+a+parceria';

const plans = [
  { slug: 'basico', name: 'Kit Básico Presença Digital', cash: 'R$ 597', installment: '58,56', icon: <Zap size={16} className="text-violet-400" />, tag: null, highlight: false, features: ['Site Institucional ou Landing Page', 'Google Maps + SEO', 'Consultoria Redes Sociais', 'Entrega em 2 dias úteis'] },
  { slug: 'basico-pro', name: 'Plano Básico PRO', cash: 'R$ 997', installment: '97,80', icon: <Star size={16} className="text-amber-400" />, tag: 'Mais Popular', highlight: true, features: ['Tudo do Kit Básico', 'Google Analytics + Meta Pixel', 'Rastreadores de Conversão', 'Suporte prioritário'] },
  { slug: 'premium-start', name: 'Premium Start', cash: 'R$ 1.500', installment: '147,14', icon: <Rocket size={16} className="text-purple-400" />, tag: 'Gestão Ativa', highlight: false, features: ['Tudo do Básico PRO', 'Gestão Anúncios Mensal', 'R$300 em mídia bônus', 'Relatórios mensais'] },
  { slug: 'premium-pro', name: 'Premium PRO', cash: 'R$ 2.000', installment: '196,19', icon: <Crown size={16} className="text-yellow-400" />, tag: 'Full Service', highlight: false, features: ['Google + Meta Ads', 'Gestão Redes Sociais', 'Automação WhatsApp', 'Funil Avançado'] },
];

const AVATAR_COLORS = ['#864df9', '#f97316', '#06b6d4', '#10b981', '#7c3aed', '#8b5cf6', '#ec4899'];
const AVATAR_INITIALS = ['AN', 'MR', 'JP', 'CS', 'RL', 'FM', 'TK'];

const NAV_SECTIONS = [
  // ETAPA 1: ICP
  { id: 'dimensoes', label: 'Mapa do Cliente', phase: 'Etapa 1: Audiência', icon: <UserCheck size={16} />, locked: false },
  { id: 'psicografico', label: 'Psicologia de Compra', phase: null, icon: <Brain size={16} />, locked: false },

  // ETAPA 2: Google Ads
  { id: 'google-ads', label: 'Campanha Google Ads', phase: 'Etapa 2: Captação', icon: <TrendingUp size={16} />, locked: true },

  // ETAPA 3: Wireframe
  { id: 'wireframe', label: 'Wireframe Estrutural', phase: 'Etapa 3: Arquitetura', icon: <CheckCircle2 size={16} />, locked: true },

  // ETAPA 4: Landing Page
  { id: 'lp-premium', label: 'Landing Page Premium', phase: 'Etapa 4: Conversão', icon: <Rocket size={16} />, locked: true },

  // ETAPA 5: Meta Ads
  { id: 'meta-ads', label: 'Conceitos Meta Ads', phase: 'Etapa 5: Meta Ads', icon: <Target size={16} />, locked: true },

  // ETAPA 6: Criativos
  { id: 'criativos', label: 'Criativos Multicanais', phase: 'Etapa 6: Criativos', icon: <Star size={16} />, locked: true },

  // Vendas
  { id: 'pitch', label: 'Planos & Checkout', phase: 'Início do Projeto', icon: <CreditCard size={16} />, locked: false },
];

/* ──────────────── COUNTDOWN ──────────────── */
function Countdown() {
  const [t, setT] = useState({ h: 3, m: 47, s: 22 });
  useEffect(() => {
    const iv = setInterval(() => setT(p => {
      let { h, m, s } = p; s--;
      if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = m = s = 0; }
      return { h, m, s };
    }), 1000);
    return () => clearInterval(iv);
  }, []);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div className="flex items-center gap-2">
      <Flame size={14} className="text-orange-400" />
      <span className="text-white/50 text-xs">Oferta expira em:</span>
      <span className="font-black text-white text-sm tabular-nums">{pad(t.h)}:{pad(t.m)}:{pad(t.s)}</span>
    </div>
  );
}

/* ═══════════════════ PÁGINA PÚBLICA DO CLIENTE ════════════════════ */
export default function ICPPublicPage() {
  const { leadId } = useParams<{ leadId: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('dimensoes');

  // URL Params definition for Teaser vs VIP mode
  const searchParams = new URLSearchParams(window.location.search);
  const isSecureMode = searchParams.get('secure') === 'true';
  const isAdminView = searchParams.get('admin') === 'true';
  const [isUnlocked, setIsUnlocked] = useState(!isSecureMode || isAdminView);

  const [passwordInput, setPasswordInput] = useState('');
  const [passError, setPassError] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!leadId) return;
    supabase.from('leads').select('*').eq('id', leadId).single().then(({ data, error }) => {
      if (error || !data) setError('Diagnóstico não encontrado.');
      else setLead(data as Lead);
      setLoading(false);
    });
  }, [leadId]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  const handleNavClick = (id: string, locked?: boolean) => {
    if (locked && !isSecureMode) {
      scrollToSection('pitch');
    } else {
      scrollToSection(id);
    }
  };

  /* ── Loading / Error States ── */
  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={40} className="animate-spin text-[#7c3aed] mx-auto mb-4" />
        <p className="text-slate-400 font-medium">Carregando seu diagnóstico...</p>
      </div>
    </div>
  );

  if (error || !lead?.icp_data) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-black text-white mb-2">Plano não encontrado</h1>
        <p className="text-slate-400">O link pode ter expirado ou o Plano de Marketing ainda não foi gerado para este negócio.</p>
      </div>
    </div>
  );

  const icp = lead.icp_data!;

  // MOCK DATA FALLBACKS para leads antigos não processados com a IA atualizada
  const displayGoogleAds = icp.googleAds || {
    estrategia: "Estratégia simulada de fundo de funil focada em palavras transacionais de alta conversão.",
    keywordsPositivas: ["agência de performance", "gestão de tráfego pago", "consultoria de marketing bh"],
    keywordsNegativas: ["grátis", "vaga", "curso", "o que é", "aprender"],
    anunciosRSA: [
      { headline: "Agência de Tráfego de Alta Conversão", description: "Pare de perder dinheiro com agências focadas em likes. Nós focamos no seu lucro." },
      { headline: "Atraia 10x Mais Clientes Qualificados", description: "Estruturamos engrenagens de vendas reais integrando Google Ads e CRM Automatizado." }
    ]
  };

  const displayLandingPage = icp.landingPage || {
    framework: "Framework de Alta Conversão AIDA",
    hero: {
      headline: "Headline Direta e Persuasiva",
      subheadline: "Sub headline focada no principal benefício do negócio",
      cta: "Quero agendar agora"
    },
    secoes: [
      { titulo: "Seção de Dor", foco: "Agitar o problema que o lead já sabe que tem" },
      { titulo: "A Solução", foco: "Mostrar como o seu serviço é a cura exata" }
    ]
  };

  const displayMetaAds = icp.metaAds || {
    insight: "Conceito visual para interromper o scroll focando na identificação da dor",
    conceitos: [
      { nome: "Criativo 1 - Quebra de Padrão", visual: "Imagem com alto contraste e elemento surpresa", copyCurta: "Pare de perder tempo com..." },
      { nome: "Criativo 2 - Prova Social", visual: "Formato de avaliação de cliente em destaque", copyCurta: "Veja o que falam sobre nós." }
    ]
  };
  const score = lead.raiox_data?.result?.overallScore ?? 0;
  const highlightPlan = plans.find(p => p.highlight)!;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = lead.phone?.replace(/\D/g, '').slice(-4);
    const validPasswords = ['agenciar', 'raiox', 'admin', '2025'];
    if (phoneDigits) validPasswords.push(phoneDigits);

    if (validPasswords.includes(passwordInput.toLowerCase().trim())) {
      setIsUnlocked(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-900 overflow-hidden font-['Inter',sans-serif]">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-violet-600/20 blur-[120px] mix-blend-screen animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-fuchsia-600/20 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-[100] w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 lg:p-12 text-center shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-500/30 rotate-3">
            <ShieldCheck size={40} className="text-white" />
          </div>

          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Acesso Confidencial</h2>
          <p className="text-slate-400 mb-8 text-sm">Insira a chave de acesso para visualizar o Dossiê de Inteligência e Plano de Ação de <strong>{lead.company_url || lead.name}</strong>.</p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Senha de Acesso"
                value={passwordInput}
                onChange={e => { setPasswordInput(e.target.value); setPassError(false); }}
                className={`w-full bg-slate-950/50 border ${passError ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:ring-violet-500'} rounded-xl py-3.5 px-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 transition-all tracking-widest font-medium text-center`}
              />
              {passError && <p className="text-red-400 text-xs mt-2 font-medium">Senha incorreta. Tente novamente.</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-violet-500/25 flex items-center justify-center gap-2"
            >
              Desbloquear Dossiê Estratégico <ArrowRight size={18} />
            </button>
          </form>

          <p className="text-slate-600 text-[10px] uppercase tracking-widest font-bold mt-8">Protegido por AgenciAR Intelligence</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", display: 'flex', height: '100vh', overflow: 'hidden', background: '#0f172a', color: '#f8fafc' }}>

      {/* ══════════════ SIDEBAR (DESKTOP) ══════════════ */}
      <aside
        className="hidden lg:flex flex-col shrink-0 overflow-y-auto"
        style={{
          width: 260,
          position: 'sticky',
          top: 0,
          height: '100dvh',
          background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
          borderRight: '1px solid rgba(139,92,246,0.15)',
          padding: '24px 20px',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center' }}>
          <img src="https://i.ibb.co/pBdZsd0r/Agenciar-Logo.png" alt="AgenciAR Pipeline" style={{ height: 32, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        </div>

        {/* Menu */}
        {NAV_SECTIONS.map((s, i) => {
          const isItemLocked = s.locked && !isSecureMode;
          return (
            <React.Fragment key={s.id}>
              {s.phase && (
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: i === 0 ? 0 : 20, marginBottom: 10 }}>
                  {s.phase}
                </div>
              )}
              <button
                onClick={() => handleNavClick(s.id, s.locked)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  borderRadius: 8, cursor: isItemLocked ? 'pointer' : 'pointer',
                  width: '100%', textAlign: 'left', marginBottom: 4,
                  background: activeSection === s.id && !isItemLocked ? 'rgba(139,92,246,0.2)' : 'transparent',
                  color: activeSection === s.id && !isItemLocked ? '#ffffff' : (isItemLocked ? 'rgba(255,255,255,0.3)' : '#ffffff'),
                  border: activeSection === s.id && !isItemLocked ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
                  fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.15s',
                  position: 'relative', overflow: 'hidden'
                }}
                onMouseEnter={e => { if (activeSection !== s.id && !isItemLocked) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (activeSection !== s.id && !isItemLocked) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  {s.icon}
                  <span style={{
                    textDecoration: isItemLocked ? 'line-through' : 'none',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    display: 'block'
                  }}>
                    {s.label}
                  </span>
                </div>
                {isItemLocked && <div style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4, color: '#ffffff' }}>PRO</div>}
              </button>
            </React.Fragment>
          )
        })}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Status Card */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
            Status do Projeto
          </div>
          <div style={{ fontSize: '0.8rem', color: '#ffffff', background: 'rgba(16,185,129,0.05)', padding: 12, borderRadius: 8, border: '1px solid rgba(16,185,129,0.15)', lineHeight: 1.6 }}>
            <p><strong style={{ color: '#ffffff' }}>Score Digital:</strong> {score}/100</p>
            <p><strong style={{ color: '#ffffff' }}>Status:</strong> {score >= 70 ? '🟢 Lead Quente' : score >= 40 ? '🟡 Lead Morno' : '🔴 Lead Frio'}</p>
            <p><strong style={{ color: '#ffffff' }}>Plano:</strong> ✅ Gerado</p>
          </div>
        </div>
      </aside>

      {/* ══════════════ MOBILE BOTTOM NAV ══════════════ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden items-center px-2 py-2 border-t border-violet-500/20 overflow-x-auto scrollbar-hide" style={{ background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(16px)', paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        {NAV_SECTIONS.map(tab => {
          const isActive = activeSection === tab.id;
          const isItemLocked = tab.locked && !isSecureMode;
          return (
            <button
              key={tab.id}
              onClick={() => handleNavClick(tab.id, tab.locked)}
              className="flex flex-col items-center justify-center gap-1 shrink-0 px-3 py-1 touch-manipulation transition-all duration-150 rounded-xl"
              style={{
                color: isActive ? '#fff' : isItemLocked ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.45)',
                minHeight: 44,
                minWidth: 70,
                background: isActive ? 'linear-gradient(to bottom, #6366f1, #d946ef)' : 'transparent',
                boxShadow: isActive ? '0 2px 12px rgba(217,70,239,0.4)' : 'none',
              }}
            >
              {isItemLocked ? <Lock size={18} /> : tab.icon}
              <span style={{ fontSize: '0.6rem', fontWeight: isActive ? 800 : 500, lineHeight: 1.2 }}>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ══════════════ MAIN ══════════════ */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top Header */}
        <header className="flex flex-row items-center justify-between gap-3 px-4 lg:px-8 h-16 border-b border-violet-500/20 shrink-0 z-40" style={{ background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(12px)' }}>
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Logo on mobile only */}
            <img src="https://i.ibb.co/pBdZsd0r/Agenciar-Logo.png" alt="AgenciAR" className="lg:hidden h-7 object-contain shrink-0" style={{ filter: 'brightness(0) invert(1)' }} />
            <h2 className="hidden sm:block text-sm font-bold leading-tight truncate">
              Plano de Marketing — {lead.company_url || lead.name}
            </h2>
            <span className="bg-violet-500/15 border border-violet-500/30 text-purple-300 py-0.5 px-2.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0">
              Score {score}/100
            </span>
          </div>

          {/* Right CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            <Countdown />
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 text-white/60 border border-white/15 h-9 px-3 rounded-full text-xs font-semibold no-underline transition-all cursor-pointer hover:border-white/30 hover:text-white/90">
              <PhoneCall size={13} /> Consultor
            </a>
            <a href={CHECKOUT_URLS[highlightPlan.slug]} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white h-9 px-4 rounded-full text-xs font-black shadow-[0_0_16px_rgba(217,70,239,0.5)] transition-all whitespace-nowrap no-underline cursor-pointer">
              <Zap size={13} fill="white" /> <span className="hidden sm:inline">Iniciar Projeto</span><span className="sm:hidden">PRO</span> <ArrowRight size={13} />
            </a>
          </div>
        </header>

        {/* ══ SCROLLABLE CONTENT / ACTIVE SECTIONS ══ */}
        <div ref={contentRef} style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', color: '#1a1a1a', display: 'flex', flexDirection: 'column' }} className="pb-[72px] lg:pb-0 h-full">

          {activeSection === 'dimensoes' && (
            <>
              {/* ── HERO ── */}
              <div style={{ background: '#fff', borderBottom: '2px solid #864df9', textAlign: 'center', padding: '56px 24px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f3ff', color: '#864df9', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 14px', borderRadius: 99, border: '1px solid rgba(134,77,249,0.2)', marginBottom: 20 }}>
                  <Star size={12} fill="#864df9" /> Escopo Raio-X Concluído
                </div>
                <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: 10, fontFamily: "'Inter Tight', sans-serif" }}>
                  Plano de Marketing Integrado — {lead.company_url || lead.name}
                </h1>
                <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1.1rem', marginBottom: 32 }}>Pipeline Completo de Conversão · Estrutura ESC</p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-8 lg:gap-10">
                  {[
                    { label: 'Score Digital', value: `${score}/100`, color: score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626' },
                    { label: 'Dores Mapeadas', value: String(icp.dimensions?.dores?.length || 0), color: '#864df9' },
                    { label: 'Canais Estratégicos', value: String(icp.psychographic?.canaisAquisicao?.length || 0), color: '#864df9' },
                  ].map((s, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <div className="hidden sm:block w-px h-12 bg-slate-200" />}
                      <div className="text-center w-full sm:w-auto">
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: s.color, fontFamily: "'Inter Tight', sans-serif" }}>{s.value}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>{s.label}</div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px', width: '100%' }}>
                {/* ── Banner ── */}
                <div style={{ borderRadius: 16, padding: '38px 48px', textAlign: 'center', marginBottom: 48, color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(139,92,246,0.2)' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)', zIndex: 0 }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 10, fontFamily: "'Inter Tight', sans-serif" }}>🎯 Performance & Presença Veloz</h2>
                    <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
                      Diagnóstico real dos gargalos de <strong style={{ color: '#fff' }}>{lead.company_url || lead.name}</strong> — gerado por IA especialista em campanha de performance com base nas respostas do Raio-X.
                    </p>
                  </div>
                </div>

                {/* ══ SEÇÃO 1: 9 DIMENSÕES ══ */}
                <section id="dimensoes" style={{ marginBottom: 56 }}>
                  <h2 style={sectionTitle}>📊 9 Dimensões do Cliente Perfeito</h2>
                  <div style={tableWrap}>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={{ ...thStyle, borderRadius: '12px 0 0 0', width: 200 }}>Dimensão</th>
                          <th style={{ ...thStyle, borderRadius: '0 12px 0 0' }}>Perfil Analisado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['🎂 Faixa Etária', icp.dimensions?.faixaEtaria],
                          ['💼 Profissão', icp.dimensions?.profissao],
                          ['🏢 Cargo (Decisor)', icp.dimensions?.cargo?.join(' · ')],
                          ['🏭 Setor', icp.dimensions?.setor?.join(' · ')],
                          ['🎓 Formação', icp.dimensions?.formacao],
                          ['🎯 Objetivos', icp.dimensions?.objetivos?.join(' | ')],
                          ['💡 Tópicos de Interesse', icp.dimensions?.topicosInteresse?.join(', ')],
                        ].map(([label, value], i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={tdLabel}>{label}</td>
                            <td style={tdValue}>{value || '—'}</td>
                          </tr>
                        ))}
                        <tr style={{ borderBottom: '1px solid #eee' }}>
                          <td style={tdLabel}>❌ Dores</td>
                          <td style={tdValue}>
                            <ul style={{ paddingLeft: 18, margin: 0 }}>
                              {icp.dimensions?.dores?.map((d, i) => <li key={i} style={{ color: '#dc2626', marginBottom: 4 }}>{d}</li>)}
                            </ul>
                          </td>
                        </tr>
                        <tr>
                          <td style={tdLabel}>✅ Necessidades</td>
                          <td style={tdValue}>
                            <ul style={{ paddingLeft: 18, margin: 0 }}>
                              {icp.dimensions?.necessidades?.map((n, i) => <li key={i} style={{ color: '#16a34a', marginBottom: 4 }}>{n}</li>)}
                            </ul>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </>
          )}

          {/* ════════════ BLOCO CONFIDENCIAL TEASER ════════════ */}
          {activeSection !== 'dimensoes' && activeSection !== 'psicografico' && activeSection !== 'pitch' && !isSecureMode && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-100 relative">
              <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-md"></div>
              <div className="relative z-10 bg-slate-900 text-white p-8 lg:p-10 rounded-3xl shadow-2xl max-w-md border-t-4 border-t-violet-500">
                <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Lock size={32} className="text-violet-400" />
                </div>
                <h3 className="text-xl font-black mb-3">O Cofre de Conversão</h3>
                <p className="text-sm text-slate-400 mb-8 font-medium">Você concluiu a Etapa 1. Para desbloquear as Estratégias de Google, Landing Page e Criativos do seu pipeline, ative um Plano ou insira sua senha de administrador.</p>

                <button
                  onClick={() => window.open(window.location.pathname + '?secure=true', '_self')}
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mb-4"
                >
                  <ShieldCheck size={18} /> Tenho Chave VIP
                </button>

                <div className="pt-5 border-t border-white/10">
                  <button onClick={() => scrollToSection('pitch')} className="text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 w-full bg-transparent">
                    <Zap size={14} fill="currentColor" /> Ver Planos de Escala Estrutural
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'psicografico' && (
            <div className="w-full px-6 md:px-12 py-12 lg:py-16">

              {/* ══ SEÇÃO 2: PSICOGRÁFICO 4 CARDS ══ */}
              <section id="psicografico" style={{ marginBottom: 56 }}>
                <h2 style={sectionTitle}>🧠 Análise Psicográfica</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

                  {/* Card 1 — Critérios de Decisão */}
                  <div style={psyCard}>
                    <h3 style={cardTitle}>⚖️ Critérios de Decisão de Compra</h3>
                    {icp.psychographic?.criteriosDecisao?.map((c, i) => (
                      <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 }}>{c.criterio}</p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Modelo: {c.modeloMental}</p>
                      </div>
                    ))}
                  </div>

                  {/* Card 2 — Consciência do Problema */}
                  <div style={psyCard}>
                    <h3 style={cardTitle}>👁️ Consciência do Problema</h3>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Nível Real</p>
                      <p style={{ fontSize: '0.875rem' }}>{icp.psychographic?.conscienciaProblema?.real}</p>
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Nível Aspiracional</p>
                      <p style={{ fontSize: '0.875rem' }}>{icp.psychographic?.conscienciaProblema?.aspiracional}</p>
                    </div>
                    <div style={{ background: '#f5f3ff', border: '1px solid rgba(134,77,249,0.3)', borderRadius: 10, padding: 12 }}>
                      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#864df9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>⚡ Gatilho de Transição</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2e1065' }}>{icp.psychographic?.conscienciaProblema?.gatilho}</p>
                    </div>
                  </div>

                  {/* Card 3 — Objeções */}
                  <div style={psyCard}>
                    <h3 style={cardTitle}>🛡️ Objeções + Resposta Estratégica</h3>
                    {icp.psychographic?.objecoesComuns?.map((o, i) => (
                      <div key={i} style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                        <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#9a3412', marginBottom: 6 }}>❝ {o.objecao}</p>
                        <p style={{ fontSize: '0.825rem', color: '#7c2d12' }}>✓ {o.resposta}</p>
                      </div>
                    ))}
                  </div>

                  {/* Card 4 — Canais */}
                  <div id="canais" style={psyCard}>
                    <h3 style={cardTitle}>📡 Canais de Aquisição</h3>
                    {icp.psychographic?.canaisAquisicao?.map((c, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, marginBottom: 10, gap: 12 }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 3 }}>{c.canal}</p>
                          <p style={{ fontSize: '0.78rem', color: '#64748b' }}>{c.estrategia}</p>
                        </div>
                        <span style={{ background: '#f5f3ff', color: '#864df9', fontWeight: 800, fontSize: '0.8rem', padding: '4px 10px', borderRadius: 99, whiteSpace: 'nowrap', flexShrink: 0 }}>{c.budget}</span>
                      </div>
                    ))}
                  </div>

                </div>
              </section>

              {/* ══ SEÇÃO 3: REAL vs ASPIRACIONAL ══ */}
              <section id="real-vs-aspiracional" style={{ marginBottom: 56 }}>
                <h2 style={sectionTitle}>🎯 Público Real vs. Perfil de Alto Ticket</h2>
                <div style={tableWrap}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={{ ...thStyle, borderRadius: '12px 0 0 0' }}>Critério</th>
                        <th style={thStyle}>✅ Quem Compra Hoje</th>
                        <th style={{ ...thStyle, borderRadius: '0 12px 0 0' }}>🚀 Cliente Ideal (Alto Ticket)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {icp.realVsAspiracional?.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={tdLabel}>{row.criterio}</td>
                          <td style={{ ...tdValue, color: '#16a34a', background: 'rgba(22,163,74,0.04)' }}>{row.real}</td>
                          <td style={{ ...tdValue, color: '#dc2626', background: 'rgba(220,38,38,0.04)' }}>{row.aspiracional}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ══ SEÇÃO 4: MODELOS MENTAIS ══ */}
              <section id="modelos-mentais" style={{ marginBottom: 56 }}>
                <h2 style={sectionTitle}>🧪 Modelos Mentais Aplicados</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                  {icp.modelosMentais?.map((m, i) => (
                    <div key={i} style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 4px 20px rgba(134,77,249,0.08)', border: '1px solid #ede9fe' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#864df9', fontWeight: 900, fontSize: '0.8rem', flexShrink: 0 }}>M{i + 1}</div>
                        <div>
                          <p style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1a1a1a' }}>{m.modelo}</p>
                          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{m.descricao}</p>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 12 }}>{m.aplicacao}</p>
                      <div style={{ background: '#f7f3ed', padding: '10px 14px', borderRadius: 10, borderLeft: '4px solid #864df9' }}>
                        <p style={{ fontSize: '0.825rem', color: '#475569', fontStyle: 'italic', fontWeight: 500 }}>💡 "{m.exemploCopy}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ══ MÓDULOS ETAPAS 2 a 6 (REAIS OU PLACEHOLDERS) ══ */}

          {/* ETAPA 2: GOOGLE ADS */}
          {activeSection === 'google-ads' && isSecureMode && (
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px', width: '100%' }}>
              <section id="google-ads" style={{ height: '100%' }}>
                <h2 style={sectionTitle}>🔍 Etapa 2: Campanha de Aquisição (Google Ads)</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                  {/* RSA e Estratégia */}
                  <div style={psyCard}>
                    <h3 style={cardTitle}>🎯 Anúncios Escritos & Abordagem</h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: 16 }}>{displayGoogleAds.estrategia}</p>
                    {displayGoogleAds.anunciosRSA?.map((ad, i) => (
                      <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 10 }}>
                        <p style={{ fontWeight: 800, fontSize: '1rem', color: '#1e3a8a', marginBottom: 6 }}>{ad.headline}</p>
                        <p style={{ fontSize: '0.85rem', color: '#334155' }}>{ad.description}</p>
                        <div style={{ marginTop: 12, display: 'inline-block', background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700 }}>Google Ad Preview</div>
                      </div>
                    ))}
                  </div>

                  {/* Keywords */}
                  <div style={psyCard}>
                    <h3 style={cardTitle}>🔑 Keywords Positivas</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                      {displayGoogleAds.keywordsPositivas?.map((kw, i) => (
                        <span key={i} style={{ background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600 }}>{kw}</span>
                      ))}
                    </div>

                    <h3 style={cardTitle}>🚫 Keywords Negativas</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {displayGoogleAds.keywordsNegativas?.map((kw, i) => (
                        <span key={i} style={{ background: '#fee2e2', color: '#991b1b', padding: '6px 12px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'line-through' }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ETAPA 3 & 4: WIREFRAME & LANDING PAGE */}
          {(activeSection === 'wireframe' || activeSection === 'lp-premium') && isSecureMode && (
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px', width: '100%' }}>
              <section id="landing-page" style={{ height: '100%' }}>
                <h2 style={sectionTitle}>
                  {activeSection === 'wireframe' ? '📐 Etapa 3: Wireframe Estrutural' : '🚀 Etapa 4: Landing Page Premium'}
                </h2>
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(134,77,249,0.1)', padding: 32, marginBottom: 24, border: '1px solid #f5f3ff' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f3ff', color: '#864df9', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', padding: '6px 14px', borderRadius: 99, marginBottom: 20 }}>
                     Framework Base: {displayLandingPage.framework}
                  </div>
                  
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>Hero Section (Dobra 1)</h3>
                  <div style={{ background: '#0f172a', padding: '40px 32px', borderRadius: 12, color: '#fff', textAlign: 'center', marginBottom: 32 }}>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>{displayLandingPage.hero.headline}</h1>
                    <p style={{ fontSize: '1.1rem', color: '#cbd5e1', maxWidth: 600, margin: '0 auto 24px' }}>{displayLandingPage.hero.subheadline}</p>
                    <button style={{ background: 'linear-gradient(to right, #6366f1, #d946ef)', color: '#fff', padding: '14px 28px', borderRadius: 99, fontWeight: 800, border: 'none' }}>{displayLandingPage.hero.cta}</button>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>Estrutura de Seções</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                    {displayLandingPage.secoes.map((secao, i) => (
                      <div key={i} style={{ background: '#f8fafc', padding: 20, borderRadius: 10, borderLeft: '4px solid #864df9' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>📌 Seção {i + 1}</div>
                        <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b', marginBottom: 6 }}>{secao.titulo}</h4>
                        <p style={{ fontSize: '0.85rem', color: '#475569' }}>{secao.foco}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ETAPA 5 & 6: META ADS & CRIATIVOS */}
          {(activeSection === 'meta-ads' || activeSection === 'criativos') && isSecureMode && (
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px', width: '100%' }}>
              <section id="meta-ads" style={{ height: '100%' }}>
                <h2 style={sectionTitle}>
                  {activeSection === 'meta-ads' ? '🎯 Etapa 5: Meta Ads (Tráfego de Interrupção)' : '⭐ Etapa 6: Criativos Multicanais'}
                </h2>
                
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: 20, marginBottom: 32 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#9a3412', marginBottom: 6 }}>💡 Insight Criativo Principal</h3>
                  <p style={{ fontSize: '0.9rem', color: '#7c2d12' }}>{displayMetaAds.insight}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                  {displayMetaAds.conceitos.map((conceito, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(134,77,249,0.1)', border: '1px solid #f5f3ff', overflow: 'hidden' }}>
                      <div style={{ background: '#1e293b', padding: '40px 20px', textAlign: 'center', position: 'relative' }}>
                         <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700 }}>Conceito {i + 1}</div>
                         <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic', maxWidth: 220, margin: '0 auto' }}>"{conceito.visual}"</p>
                      </div>
                      <div style={{ padding: 24 }}>
                        <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b', marginBottom: 8 }}>{conceito.nome}</h4>
                        <div style={{ background: '#f1f5f9', padding: 12, borderRadius: 8 }}>
                          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>🗣️ Copy / Hook</p>
                          <p style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>"{conceito.copyCurta}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ══ SEÇÃO 7: PITCH + PLANOS ══ */}
          {activeSection === 'pitch' && (
            <div className="w-full px-6 md:px-12 py-12 lg:py-16">
              <section id="pitch" className="my-10" style={{ borderRadius: 24, overflow: 'hidden', background: 'radial-gradient(120% 100% at 50% 0%, #2563EB 0%, #1E3A8A 50%, #0F172A 100%)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 80px rgba(37,99,235,0.4)', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08), transparent 70%)', pointerEvents: 'none' }} />

                <div className="relative z-10 px-6 py-12 lg:px-12 lg:py-16">

                  {/* Prova Social + Countdown */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 mb-10 border-b border-white/10">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ display: 'flex' }}>
                        {AVATAR_COLORS.map((color, i) => (
                          <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #1a1a1a', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 900, marginLeft: i > 0 ? -10 : 0 }}>
                            {AVATAR_INITIALS[i]}
                          </div>
                        ))}
                        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #1a1a1a', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.65rem', fontWeight: 900, marginLeft: -10 }}>+93k</div>
                      </div>
                      <div>
                        <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem', marginBottom: 3 }}>Junte-se a mais de <span style={{ color: '#F7E397' }}>93.812</span> clientes</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="#F7E397" style={{ color: '#F7E397' }} />)}
                          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', marginLeft: 4 }}>4.9 · 2.341 avaliações</span>
                        </div>
                      </div>
                    </div>
                    <Countdown />
                  </div>

                  {/* Headline */}
                  <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(247,227,151,0.1)', color: '#F7E397', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '5px 14px', borderRadius: 99, border: '1px solid rgba(247,227,151,0.2)', marginBottom: 16 }}>
                      <ShieldCheck size={12} /> Diagnóstico Concluído — Hora de Agir
                    </span>
                    <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 16, fontFamily: "'Inter Tight', sans-serif", letterSpacing: '-0.02em' }}>
                      A IA mapeou onde <span style={{ color: '#d946ef' }}>{lead.company_url || lead.name}</span> perde dinheiro.<br className="hidden md:block" /> Desbloqueie as próximas fases agora.
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', maxWidth: 760, margin: '0 auto', lineHeight: 1.6 }}>
                      Criativos de Ads + Wireframes e Landing Page de alta conversão. Contratando agora, nosso time cria <strong className="text-white">todas</strong> as etapas bloqueadas do seu painel e coloca as campanhas no ar.
                    </p>
                  </div>

                  {/* Cards de Planos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 mb-12 mt-10 w-full">
                    {plans.map(plan => (
                      <div key={plan.slug} style={{
                        position: 'relative', display: 'flex', flexDirection: 'column',
                        borderRadius: 20, padding: '28px 24px',
                        background: plan.highlight ? '#fff' : 'rgba(255,255,255,0.05)',
                        border: plan.highlight ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                        boxShadow: plan.highlight ? '0 0 40px rgba(168,85,247,0.4)' : 'none',
                        transition: 'transform 0.15s'
                      }}>
                        {plan.tag && (
                          <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(to right, #6366f1, #d946ef)', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '4px 16px', borderRadius: 99, whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(217,70,239,0.4)' }}>{plan.tag}</div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: plan.highlight ? '#f5f3ff' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{plan.icon}</div>
                          <span style={{ fontWeight: 800, fontSize: '0.8rem', color: plan.highlight ? '#5b21b6' : '#fff', lineHeight: 1.2 }}>{plan.name}</span>
                        </div>
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: plan.highlight ? '#94a3b8' : 'rgba(255,255,255,0.35)', marginBottom: 2 }}>12x de</div>
                          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: plan.highlight ? '#5b21b6' : '#fff', fontFamily: "'Inter Tight', sans-serif" }}>R$ {plan.installment}</div>
                          <div style={{ fontSize: '0.72rem', color: plan.highlight ? '#94a3b8' : 'rgba(255,255,255,0.3)', marginTop: 2 }}>ou {plan.cash} à vista</div>
                        </div>
                        <ul style={{ flex: 1, marginBottom: 16, paddingLeft: 0, listStyle: 'none' }}>
                          {plan.features.map((f, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.78rem', color: plan.highlight ? '#334155' : 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
                              <CheckCircle2 size={12} style={{ color: plan.highlight ? '#7c3aed' : '#10b981', flexShrink: 0, marginTop: 2 }} />{f}
                            </li>
                          ))}
                        </ul>
                        <a href={CHECKOUT_URLS[plan.slug]} target="_blank" rel="noreferrer"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 44, padding: '10px', borderRadius: 12, fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none', background: plan.highlight ? 'linear-gradient(to right, #6366f1, #d946ef)' : 'rgba(255,255,255,0.1)', color: '#fff', border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.15)', transition: 'all 0.15s' }}>
                          {plan.highlight ? '⚡ Escolher PRO' : 'Selecionar'}
                        </a>
                      </div>
                    ))}
                  </div>

                  {/* CTA Final */}
                  <div className="flex flex-col sm:flex-row justify-center gap-4 w-full px-4 sm:px-0">
                    <a href={CHECKOUT_URLS[highlightPlan.slug]} target="_blank" rel="noreferrer"
                      className="flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-black text-sm lg:text-[1.05rem] py-4 px-8 rounded-full shadow-[0_0_40px_rgba(217,70,239,0.5)] transition-all w-full sm:w-auto h-[54px] lg:h-auto">
                      <Zap size={18} fill="white" /> Iniciar Projeto <ArrowRight size={18} />
                    </a>
                    <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"
                      className="flex justify-center items-center gap-2 text-white/80 border border-white/20 py-4 px-6 rounded-full font-bold text-sm lg:text-base transition-all w-full sm:w-auto h-[54px] lg:h-auto">
                      <PhoneCall size={18} /> Falar com Consultor
                    </a>
                  </div>
                  <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', marginTop: 14 }}>
                    Sem fidelidade mínima no 1º mês. Resultado ou devolvemos.
                  </p>

                  {/* ── DOWNSELL — Planejamento Low Ticket ── */}
                  <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', marginBottom: 16 }}>
                      Ainda não está pronto para contratar? Sem problema.
                    </p>
                    <a href={DOWNSELL_URL} target="_blank" rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(247,227,151,0.08)', border: '1px solid rgba(247,227,151,0.25)', color: '#F7E397', padding: '14px 28px', borderRadius: 99, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', transition: 'all 0.15s' }}>
                      📄 Quero só o Planejamento de Marketing do meu Negócio
                      <span style={{ background: '#F7E397', color: '#1a1a1a', fontWeight: 900, fontSize: '0.9rem', padding: '3px 12px', borderRadius: 99 }}>R$ 99</span>
                    </a>
                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', marginTop: 12, maxWidth: 480, margin: '12px auto 0' }}>
                      Você recebe o Mapa do Cliente Perfeito + roteiro de ação — entregue em PDF. Pode iniciar os anúncios por conta própria ou com qualquer agência.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Style Helpers ── */
const sectionTitle: React.CSSProperties = {
  fontSize: '1.35rem', fontWeight: 900, color: '#1a1a1a',
  marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
  fontFamily: "'Inter Tight', sans-serif"
};
const tableWrap: React.CSSProperties = {
  overflowX: 'auto', background: '#fff', borderRadius: 16,
  boxShadow: '0 4px 20px rgba(134,77,249,0.1)', border: '1px solid #f5f3ff'
};
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const thStyle: React.CSSProperties = {
  background: 'linear-gradient(to right, #6366f1, #a855f7)', color: '#fff', padding: '14px 18px',
  textAlign: 'left', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700
};
const tdLabel: React.CSSProperties = {
  padding: '14px 18px', fontWeight: 700, color: '#864df9', verticalAlign: 'top', fontSize: '0.875rem', width: 200
};
const tdValue: React.CSSProperties = {
  padding: '14px 18px', color: '#475569', verticalAlign: 'top', fontSize: '0.875rem'
};
const psyCard: React.CSSProperties = {
  background: '#fff', padding: 28, borderRadius: 16,
  boxShadow: '0 4px 20px rgba(134,77,249,0.08)',
  borderTop: '4px solid #864df9',
  display: 'flex', flexDirection: 'column', height: '100%'
};
const cardTitle: React.CSSProperties = {
  fontWeight: 900, fontSize: '1rem', marginBottom: 16, color: '#1a1a1a',
  fontFamily: "'Inter Tight', sans-serif"
};
