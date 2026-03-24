import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Lead } from '../types';
import {
  Loader2, ArrowRight, PhoneCall, Star, CheckCircle2, Zap,
  ShieldCheck, Flame, Rocket, Crown,
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
  { slug: 'basico', name: 'Kit Básico Presença Digital', cash: 'R$ 597', installment: '58,56', icon: <Zap size={16} className="text-blue-400" />, tag: null, highlight: false, features: ['Site Institucional ou Landing Page', 'Google Maps + SEO', 'Consultoria Redes Sociais', 'Entrega em 2 dias úteis'] },
  { slug: 'basico-pro', name: 'Plano Básico PRO', cash: 'R$ 997', installment: '97,80', icon: <Star size={16} className="text-amber-400" />, tag: 'Mais Popular', highlight: true, features: ['Tudo do Kit Básico', 'Google Analytics + Meta Pixel', 'Rastreadores de Conversão', 'Suporte prioritário'] },
  { slug: 'premium-start', name: 'Premium Start', cash: 'R$ 1.500', installment: '147,14', icon: <Rocket size={16} className="text-purple-400" />, tag: 'Gestão Ativa', highlight: false, features: ['Tudo do Básico PRO', 'Gestão Anúncios Mensal', 'R$300 em mídia bônus', 'Relatórios mensais'] },
  { slug: 'premium-pro', name: 'Premium PRO', cash: 'R$ 2.000', installment: '196,19', icon: <Crown size={16} className="text-yellow-400" />, tag: 'Full Service', highlight: false, features: ['Google + Meta Ads', 'Gestão Redes Sociais', 'Automação WhatsApp', 'Funil Avançado'] },
];

const AVATAR_COLORS = ['#864df9', '#f97316', '#06b6d4', '#10b981', '#f43f5e', '#8b5cf6', '#ec4899'];
const AVATAR_INITIALS = ['AN', 'MR', 'JP', 'CS', 'RL', 'FM', 'TK'];

const NAV_SECTIONS = [
  { id: 'dimensoes', label: 'ICP Consolidado', phase: 'Fase 1: Diagnóstico', icon: <UserCheck size={16} /> },
  { id: 'psicografico', label: 'Análise Psicográfica', phase: null, icon: <Brain size={16} /> },
  { id: 'real-vs-aspiracional', label: 'Real vs. Aspiracional', phase: null, icon: <Target size={16} /> },
  { id: 'modelos-mentais', label: 'Modelos Mentais', phase: 'Fase 2: Estratégia', icon: <Lightbulb size={16} /> },
  { id: 'canais', label: 'Canais de Aquisição', phase: null, icon: <TrendingUp size={16} /> },
  { id: 'pitch', label: 'Planos & Proposta', phase: 'Fase 3: Conversão', icon: <CreditCard size={16} /> },
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
    const el = document.getElementById(id);
    if (el && contentRef.current) {
      contentRef.current.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    }
  };

  // Track scroll to update active nav item
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const onScroll = () => {
      for (const section of NAV_SECTIONS) {
        const el = document.getElementById(section.id);
        if (el && el.offsetTop - 120 <= container.scrollTop) {
          setActiveSection(section.id);
        }
      }
    };
    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, [lead]);

  /* ── Loading / Error States ── */
  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={40} className="animate-spin text-[#3b82f6] mx-auto mb-4" />
        <p className="text-slate-400 font-medium">Carregando seu diagnóstico...</p>
      </div>
    </div>
  );

  if (error || !lead?.icp_data) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-black text-white mb-2">Diagnóstico não encontrado</h1>
        <p className="text-slate-400">O link pode ter expirado ou o ICP ainda não foi gerado para este lead.</p>
      </div>
    </div>
  );

  const icp = lead.icp_data!;
  const score = lead.raiox_data?.result?.overallScore ?? 0;
  const highlightPlan = plans.find(p => p.highlight)!;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", display: 'flex', height: '100vh', overflow: 'hidden', background: '#0f172a', color: '#f8fafc' }}>

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside style={{
        width: 260, minWidth: 260, background: '#1e293b',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', padding: '24px 20px',
        zIndex: 100, overflowY: 'auto'
      }}>
        {/* Logo */}
        <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 32, background: 'linear-gradient(135deg, #864df9, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🚀 AgenciAR Pipeline
        </div>

        {/* Menu */}
        {NAV_SECTIONS.map((s, i) => (
          <React.Fragment key={s.id}>
            {s.phase && (
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginTop: i === 0 ? 0 : 20, marginBottom: 10 }}>
                {s.phase}
              </div>
            )}
            <button
              onClick={() => scrollToSection(s.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: 8, border: 'none', cursor: 'pointer',
                width: '100%', textAlign: 'left', marginBottom: 4,
                background: activeSection === s.id ? '#864df9' : 'transparent',
                color: activeSection === s.id ? '#ffffff' : '#94a3b8',
                fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.15s'
              }}
              onMouseEnter={e => { if (activeSection !== s.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (activeSection !== s.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {s.icon} {s.label}
            </button>
          </React.Fragment>
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Status Card */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
            Status do Projeto
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(16,185,129,0.05)', padding: 12, borderRadius: 8, border: '1px solid rgba(16,185,129,0.15)', lineHeight: 1.6 }}>
            <p><strong style={{ color: '#f8fafc' }}>Score:</strong> {score}/100</p>
            <p><strong style={{ color: '#f8fafc' }}>Status:</strong> {score >= 70 ? '🟢 Lead Quente' : score >= 40 ? '🟡 Lead Morno' : '🔴 Lead Frio'}</p>
            <p><strong style={{ color: '#f8fafc' }}>ICP:</strong> ✅ Gerado</p>
          </div>
        </div>
      </aside>

      {/* ══════════════ MAIN ══════════════ */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top Header */}
        <header style={{
          height: 64, padding: '0 32px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(10px)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>
              ICP — {lead.company_url || lead.name}
            </h2>
            <span style={{ background: 'rgba(134,77,249,0.15)', border: '1px solid rgba(134,77,249,0.3)', color: '#c39dff', padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 }}>
              Score {score}/100
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Countdown />
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)', padding: '7px 14px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.15s' }}>
              <PhoneCall size={13} /> Consultor
            </a>
            <a href={CHECKOUT_URLS[highlightPlan.slug]} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#864df9', color: '#fff', padding: '8px 18px', borderRadius: 99, fontSize: '0.82rem', fontWeight: 800, textDecoration: 'none', boxShadow: '0 0 20px rgba(134,77,249,0.5)', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
              <Zap size={13} fill="white" /> Comprar Plano e Iniciar Projeto <ArrowRight size={13} />
            </a>
          </div>
        </header>

        {/* ══ SCROLLABLE CONTENT ══ */}
        <div ref={contentRef} style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', color: '#1a1a1a' }}>

          {/* ── HERO ── */}
          <div style={{ background: '#fff', borderBottom: '2px solid #864df9', textAlign: 'center', padding: '56px 24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0eaff', color: '#864df9', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 14px', borderRadius: 99, border: '1px solid rgba(134,77,249,0.2)', marginBottom: 20 }}>
              <Star size={12} fill="#864df9" /> Diagnóstico Raio-X Concluído
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: 10, fontFamily: "'Inter Tight', sans-serif" }}>
              ICP — {lead.company_url || lead.name}
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: 32 }}>Perfil Estratégico de Cliente · Mapa de Prospecção com IA</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
              {[
                { label: 'Score Digital', value: `${score}/100`, color: score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626' },
                { label: 'Dores Mapeadas', value: String(icp.dimensions?.dores?.length || 0), color: '#864df9' },
                { label: 'Canais Estratégicos', value: String(icp.psychographic?.canaisAquisicao?.length || 0), color: '#864df9' },
              ].map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div style={{ width: 1, height: 48, background: '#e2e8f0' }} />}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: s.color, fontFamily: "'Inter Tight', sans-serif" }}>{s.value}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>{s.label}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>

            {/* ── Banner ── */}
            <div style={{ background: '#864df9', borderRadius: 16, padding: '32px 40px', textAlign: 'center', marginBottom: 48, color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #864df9, #4b2a9c)', zIndex: 0 }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 10, fontFamily: "'Inter Tight', sans-serif" }}>🎯 Performance & Presença Veloz</h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
                  Diagnóstico real dos gargalos de <strong style={{ color: '#fff' }}>{lead.company_url || lead.name}</strong> — gerado por IA especialista em campanha de performance com base nas respostas do Raio-X.
                </p>
              </div>
            </div>

            {/* ══ SEÇÃO 1: 9 DIMENSÕES ══ */}
            <section id="dimensoes" style={{ marginBottom: 56 }}>
              <h2 style={sectionTitle}>📊 9 Dimensões do ICP</h2>
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
                  <div style={{ background: '#f0eaff', border: '1px solid rgba(134,77,249,0.3)', borderRadius: 10, padding: 12 }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#864df9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>⚡ Gatilho de Transição</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4c1d95' }}>{icp.psychographic?.conscienciaProblema?.gatilho}</p>
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
                      <span style={{ background: '#f0eaff', color: '#864df9', fontWeight: 800, fontSize: '0.8rem', padding: '4px 10px', borderRadius: 99, whiteSpace: 'nowrap', flexShrink: 0 }}>{c.budget}</span>
                    </div>
                  ))}
                </div>

              </div>
            </section>

            {/* ══ SEÇÃO 3: REAL vs ASPIRACIONAL ══ */}
            <section id="real-vs-aspiracional" style={{ marginBottom: 56 }}>
              <h2 style={sectionTitle}>🎯 ICP Real vs. ICP Aspiracional</h2>
              <div style={tableWrap}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={{ ...thStyle, borderRadius: '12px 0 0 0' }}>Critério</th>
                      <th style={thStyle}>✅ ICP Real</th>
                      <th style={{ ...thStyle, borderRadius: '0 12px 0 0' }}>❌ ICP Aspiracional</th>
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
                  <div key={i} style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 4px 20px rgba(134,77,249,0.08)', border: '1px solid #f3f0ff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f0eaff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#864df9', fontWeight: 900, fontSize: '0.8rem', flexShrink: 0 }}>M{i + 1}</div>
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

            {/* ══ SEÇÃO 5: PITCH + PLANOS ══ */}
            <section id="pitch" style={{ borderRadius: 24, overflow: 'hidden', background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 50%, rgba(134,77,249,0.15), transparent 60%)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', zIndex: 1, padding: '48px 40px' }}>

                {/* Prova Social + Countdown */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingBottom: 28, marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
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
                  <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 900, color: '#fff', lineHeight: 1.25, marginBottom: 12, fontFamily: "'Inter Tight', sans-serif" }}>
                    A IA mapeou onde <span style={{ color: '#864df9' }}>{lead.company_url || lead.name}</span> perde dinheiro. Hora de corrigir.
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
                    Os {icp.dimensions?.dores?.length || 3} gargalos identificados custam leads todos os dias. Escolha o plano abaixo e o nosso time inicia no próximo dia útil.
                  </p>
                </div>

                {/* Cards de Planos */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
                  {plans.map(plan => (
                    <div key={plan.slug} style={{
                      position: 'relative', display: 'flex', flexDirection: 'column',
                      borderRadius: 16, padding: '20px 18px',
                      background: plan.highlight ? '#fff' : 'rgba(255,255,255,0.05)',
                      border: plan.highlight ? '2px solid #864df9' : '1px solid rgba(255,255,255,0.1)',
                      boxShadow: plan.highlight ? '0 0 30px rgba(134,77,249,0.35)' : 'none',
                      transition: 'transform 0.15s'
                    }}>
                      {plan.tag && (
                        <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#864df9', color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '3px 12px', borderRadius: 99, whiteSpace: 'nowrap' }}>{plan.tag}</div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: plan.highlight ? '#f0eaff' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{plan.icon}</div>
                        <span style={{ fontWeight: 800, fontSize: '0.8rem', color: plan.highlight ? '#1a1a1a' : '#fff', lineHeight: 1.2 }}>{plan.name}</span>
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: plan.highlight ? '#94a3b8' : 'rgba(255,255,255,0.35)', marginBottom: 2 }}>12x de</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: plan.highlight ? '#864df9' : '#fff', fontFamily: "'Inter Tight', sans-serif" }}>R$ {plan.installment}</div>
                        <div style={{ fontSize: '0.72rem', color: plan.highlight ? '#94a3b8' : 'rgba(255,255,255,0.3)', marginTop: 2 }}>ou {plan.cash} à vista</div>
                      </div>
                      <ul style={{ flex: 1, marginBottom: 16, paddingLeft: 0, listStyle: 'none' }}>
                        {plan.features.map((f, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.78rem', color: plan.highlight ? '#475569' : 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
                            <CheckCircle2 size={12} style={{ color: plan.highlight ? '#864df9' : '#10b981', flexShrink: 0, marginTop: 2 }} />{f}
                          </li>
                        ))}
                      </ul>
                      <a href={CHECKOUT_URLS[plan.slug]} target="_blank" rel="noreferrer"
                        style={{ display: 'block', textAlign: 'center', padding: '11px', borderRadius: 12, fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none', background: plan.highlight ? '#864df9' : 'rgba(255,255,255,0.1)', color: '#fff', border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.15)', transition: 'all 0.15s' }}>
                        {plan.highlight ? '⚡ Escolher PRO' : 'Selecionar'}
                      </a>
                    </div>
                  ))}
                </div>

                {/* CTA Final */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
                  <a href={CHECKOUT_URLS[highlightPlan.slug]} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#864df9', color: '#fff', fontWeight: 900, fontSize: '1.05rem', padding: '15px 32px', borderRadius: 99, textDecoration: 'none', boxShadow: '0 0 40px rgba(134,77,249,0.5)', transition: 'all 0.15s' }}>
                    <Zap size={18} fill="white" /> Comprar Plano e Iniciar Projeto <ArrowRight size={18} />
                  </a>
                  <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.2)', padding: '15px 28px', borderRadius: 99, fontWeight: 600, fontSize: '1rem', textDecoration: 'none', transition: 'all 0.15s' }}>
                    <PhoneCall size={18} /> Prefiro Falar com um Consultor
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
                    Você recebe o ICP completo + estratégia de canais + modelos mentais + roteiro de ação — entregue em PDF. Pode iniciar os anúncios por conta própria ou com qualquer agência.
                  </p>
                </div>
              </div>
            </section>

            <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '0.78rem' }}>
              Gerado via <strong>AgenciAR ICP Intelligence Engine</strong> · {new Date().getFullYear()}
            </div>
          </div>
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
  boxShadow: '0 4px 20px rgba(134,77,249,0.1)', border: '1px solid #f0eaff'
};
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const thStyle: React.CSSProperties = {
  background: '#864df9', color: '#fff', padding: '14px 18px',
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
  borderTop: '4px solid #864df9'
};
const cardTitle: React.CSSProperties = {
  fontWeight: 900, fontSize: '1rem', marginBottom: 16, color: '#1a1a1a',
  fontFamily: "'Inter Tight', sans-serif"
};
