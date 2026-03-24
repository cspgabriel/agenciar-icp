import React, { useEffect, useState } from 'react';
import type { ICPData, Lead } from '../types';
import {
  ArrowRight, PhoneCall, Star, TrendingUp, CheckCircle2, Zap,
  ShieldCheck, Target, RefreshCw, Users, Brain, Timer, Flame,
  Rocket, Crown
} from 'lucide-react';

interface ICPViewProps {
  lead: Lead;
  icp: ICPData;
  onRegenerate: () => void;
  isGenerating: boolean;
}

const CHECKOUT_URLS: Record<string, string> = {
  basico: 'https://agenciarmktdigital.com.br/planos/basico',
  'basico-pro': 'https://agenciarmktdigital.com.br/planos/basico-pro',
  'premium-start': 'https://agenciarmktdigital.com.br/planos/premium-start',
  'premium-pro': 'https://agenciarmktdigital.com.br/planos/premium-pro',
};
const WHATSAPP_URL = 'https://wa.me/5521990000000?text=Ol%C3%A1%2C+vi+meu+diagn%C3%B3stico+Raio-X+e+quero+iniciar+a+parceria+com+a+AgenciAR';

/* ── Planos Reais AgenciAR ───────────────────────────── */
const plans = [
  {
    slug: 'basico',
    name: 'Kit Básico Presença Digital',
    cashValue: 'R$ 597',
    installment: '58,56',
    parcelas: '12x',
    icon: <Zap size={20} className="text-blue-400" />,
    features: ['Site Institucional ou Landing Page', 'Google Maps + SEO', 'Consultoria Redes Sociais', 'Entrega em 2 dias úteis'],
    highlight: false,
    tag: null,
  },
  {
    slug: 'basico-pro',
    name: 'Plano Básico PRO',
    cashValue: 'R$ 997',
    installment: '97,80',
    parcelas: '12x',
    icon: <Star size={20} className="text-amber-400" />,
    features: ['Tudo do Kit Básico', 'Google Analytics + Meta Pixel', 'Rastreadores de Conversão', 'Suporte prioritário'],
    highlight: true,
    tag: '⭐ Mais Popular',
  },
  {
    slug: 'premium-start',
    name: 'Premium Start',
    cashValue: 'R$ 1.500',
    installment: '147,14',
    parcelas: '12x',
    icon: <Rocket size={20} className="text-purple-400" />,
    features: ['Tudo do Básico PRO', 'Gestão de Anúncios Mensal', 'R$300 em anúncios bônus', 'Relatórios de Performance'],
    highlight: false,
    tag: '🚀 Gestão Completa',
  },
  {
    slug: 'premium-pro',
    name: 'Premium PRO',
    cashValue: 'R$ 2.000',
    installment: '196,19',
    parcelas: '12x',
    icon: <Crown size={20} className="text-yellow-400" />,
    features: ['Google + Meta Ads', 'Gestão de Redes Sociais', 'Automação de WhatsApp', 'Funil Avançado de Vendas'],
    highlight: false,
    tag: '👑 Dominação Total',
  },
];

/* ── Avatares de Prova Social ────────────────────────── */
const AVATAR_COLORS = ['#864df9', '#f97316', '#06b6d4', '#10b981', '#f43f5e', '#8b5cf6', '#ec4899'];
const AVATAR_INITIALS = ['AN', 'MR', 'JP', 'CS', 'RL', 'FM', 'TK'];

function SocialProofAvatars() {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex -space-x-2">
        {AVATAR_COLORS.map((color, i) => (
          <div
            key={i}
            className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-[11px] font-black shadow-md"
            style={{ backgroundColor: color }}
          >
            {AVATAR_INITIALS[i]}
          </div>
        ))}
        <div className="w-9 h-9 rounded-full border-2 border-white bg-slate-700 flex items-center justify-center text-white text-[10px] font-black shadow-md">
          +93k
        </div>
      </div>
      <div>
        <p className="text-white font-bold text-sm leading-tight">Junte-se a mais de <span className="text-[#F7E397]">93.812</span> clientes satisfeitos</p>
        <div className="flex items-center gap-0.5 mt-0.5">
          {[...Array(5)].map((_, i) => <Star key={i} size={11} className="text-[#F7E397]" fill="#F7E397" />)}
          <span className="text-white/50 text-[11px] ml-1">4.9/5 — 2.341 avaliações</span>
        </div>
      </div>
    </div>
  );
}

/* ── Cronômetro de Urgência ──────────────────────────── */
function CountdownTimer() {
  const [time, setTime] = useState({ h: 3, m: 47, s: 22 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 0; m = 0; s = 0; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <Timer size={16} className="text-[#F7E397]" />
        <span className="text-white/70 text-sm font-medium">Oferta expira em:</span>
      </div>
      <div className="flex items-center gap-1 font-black text-white text-lg tabular-nums">
        <span className="bg-white/10 border border-white/20 px-2 py-0.5 rounded-lg">{pad(time.h)}</span>
        <span className="text-[#F7E397]">:</span>
        <span className="bg-white/10 border border-white/20 px-2 py-0.5 rounded-lg">{pad(time.m)}</span>
        <span className="text-[#F7E397]">:</span>
        <span className="bg-white/10 border border-white/20 px-2 py-0.5 rounded-lg">{pad(time.s)}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════ */
export const ICPView: React.FC<ICPViewProps> = ({ lead, icp, onRegenerate, isGenerating }) => {
  const score = lead.raiox_data?.result?.overallScore ?? 0;
  const highlightPlan = plans.find(p => p.highlight) || plans[1];

  return (
    <div className="min-h-screen bg-[#f7f3ed] animate-fade-in" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ─── STICKY TOP BAR ─────────────────────────── */}
      <div className="sticky top-0 z-50 w-full bg-[#0f0f0f] border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-3">

          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#864df9] to-indigo-500 flex items-center justify-center">
              <Target size={16} className="text-white" />
            </div>
            <span className="text-white font-black text-sm tracking-tight hidden sm:block">AgenciAR Pipeline</span>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-sm">
            <span className="text-white/40 font-medium">Diagnóstico de</span>
            <span className="text-white font-bold truncate max-w-[160px]">{lead.company_url || lead.name}</span>
            <span className="bg-[#864df9]/20 text-[#c39dff] text-xs px-2 py-0.5 rounded-full font-bold border border-[#864df9]/30">Score {score}/100</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onRegenerate} disabled={isGenerating} title="Refazer" className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
              <RefreshCw size={15} className={isGenerating ? 'animate-spin' : ''} />
            </button>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-white/70 hover:text-white border border-white/20 hover:border-white/40 px-3 py-2 rounded-full text-sm font-medium transition-all">
              <PhoneCall size={13} /> Consultor
            </a>
            <a href={CHECKOUT_URLS[highlightPlan.slug]} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-[#864df9] hover:bg-[#6c39d3] text-white font-black px-4 sm:px-6 py-2.5 rounded-full text-sm transition-all shadow-[0_0_20px_rgba(134,77,249,0.5)] hover:scale-105 active:scale-95 whitespace-nowrap">
              <Zap size={14} fill="white" />
              <span className="hidden sm:inline">Comprar Plano e Iniciar Projeto</span>
              <span className="sm:hidden">Comprar</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* ─── HERO HEADER ─────────────────────────────── */}
      <div className="w-full bg-white border-b-2 border-[#864df9] py-14 text-center px-6">
        <div className="inline-flex items-center gap-2 bg-[#f0eaff] text-[#864df9] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5 border border-[#864df9]/20">
          <Star size={13} fill="#864df9" /> Diagnóstico Raio-X Concluído
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-[#1a1a1a] tracking-tight mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
          ICP — {lead.company_url || lead.name}
        </h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">Perfil Estratégico de Cliente · Mapa de Prospecção com IA</p>

        <div className="flex items-center justify-center gap-8 mt-8 flex-wrap">
          <div className="text-center">
            <div className="text-5xl font-black" style={{
              color: score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626',
              fontFamily: "'Inter Tight', sans-serif"
            }}>
              {score}<span className="text-2xl text-slate-300">/100</span>
            </div>
            <div className="text-sm text-slate-400 font-medium mt-1">Score Digital</div>
          </div>
          <div className="w-px h-12 bg-slate-200" />
          <div className="text-center">
            <div className="text-3xl font-black text-[#1a1a1a]">{icp.dimensions.dores?.length || 0}</div>
            <div className="text-sm text-slate-400 font-medium mt-1">Dores Mapeadas</div>
          </div>
          <div className="w-px h-12 bg-slate-200" />
          <div className="text-center">
            <div className="text-3xl font-black text-[#864df9]">{icp.psychographic.canaisAquisicao?.length || 0}</div>
            <div className="text-sm text-slate-400 font-medium mt-1">Canais Estratégicos</div>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-14 space-y-14">

        {/* Banner diagnóstico */}
        <div className="bg-[#864df9] text-white rounded-2xl p-8 text-center shadow-[0_4px_40px_rgba(134,77,249,0.25)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#864df9] via-[#6d3fd4] to-[#4b2a9c]" />
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>🎯 Mapa de Prospecção Ativa</h2>
            <p className="text-purple-100 max-w-3xl mx-auto leading-relaxed">
              Diagnóstico real dos gargalos de <strong className="text-white">{lead.company_url || lead.name}</strong> — gerado com base nas respostas do Raio-X e inteligência artificial treinada em R$15M+ de resultados.
            </p>
          </div>
        </div>

        {/* 9 Dimensões */}
        <div>
          <h2 className="text-2xl font-black text-[#1a1a1a] mb-5 flex items-center gap-2" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            <Users size={24} className="text-[#864df9]" /> 9 Dimensões do ICP
          </h2>
          <div className="overflow-x-auto bg-white rounded-2xl shadow-[0_4px_20px_rgba(134,77,249,0.1)] border border-purple-100">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="bg-[#864df9] text-white p-4 text-sm uppercase tracking-wider font-bold w-1/4 rounded-tl-2xl">Dimensão</th>
                  <th className="bg-[#864df9] text-white p-4 text-sm uppercase tracking-wider font-bold rounded-tr-2xl">Perfil Analisado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ['🎂 Faixa Etária', icp.dimensions.faixaEtaria],
                  ['💼 Profissão', icp.dimensions.profissao],
                  ['🏢 Cargos (Decisores)', icp.dimensions.cargo?.join(' · ')],
                  ['🏭 Setor', icp.dimensions.setor?.join(' · ')],
                  ['🎓 Formação', icp.dimensions.formacao],
                  ['🎯 Objetivos', icp.dimensions.objetivos?.join(' | ')],
                  ['💡 Tópicos de Interesse', icp.dimensions.topicosInteresse?.join(', ')],
                ].map(([label, value], i) => (
                  <tr key={i} className="hover:bg-purple-50/40 transition-colors">
                    <td className="p-4 font-bold text-[#864df9] text-sm align-top">{label}</td>
                    <td className="p-4 text-slate-700 text-sm align-top">{value || '—'}</td>
                  </tr>
                ))}
                <tr className="hover:bg-red-50/40">
                  <td className="p-4 font-bold text-[#864df9] text-sm align-top">❌ Dores</td>
                  <td className="p-4 text-sm align-top">
                    <ul className="list-disc pl-4 space-y-1">{icp.dimensions.dores?.map((d, i) => <li key={i} className="text-red-700">{d}</li>)}</ul>
                  </td>
                </tr>
                <tr className="hover:bg-green-50/40">
                  <td className="p-4 font-bold text-[#864df9] text-sm align-top">✅ Necessidades</td>
                  <td className="p-4 text-sm align-top">
                    <ul className="list-disc pl-4 space-y-1">{icp.dimensions.necessidades?.map((n, i) => <li key={i} className="text-green-800">{n}</li>)}</ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Psicográfico */}
        <div>
          <h2 className="text-2xl font-black text-[#1a1a1a] mb-5 flex items-center gap-2" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            <Brain size={24} className="text-[#864df9]" /> Análise Psicográfica
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-7 rounded-2xl shadow-[0_4px_20px_rgba(134,77,249,0.1)] border-t-4 border-[#864df9]">
              <h3 className="font-black text-lg mb-4" style={{ fontFamily: "'Inter Tight', sans-serif" }}>⚖️ Objeções + Quebras</h3>
              <div className="space-y-3">
                {icp.psychographic.objecoesComuns?.map((obj, i) => (
                  <div key={i} className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <p className="font-bold text-orange-900 text-sm mb-1">"{obj.objecao}"</p>
                    <p className="text-orange-800 text-sm">✓ {obj.resposta}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-7 rounded-2xl shadow-[0_4px_20px_rgba(134,77,249,0.1)] border-t-4 border-[#864df9]">
              <h3 className="font-black text-lg mb-4" style={{ fontFamily: "'Inter Tight', sans-serif" }}>👁️ Consciência do Problema</h3>
              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Visão Real</p>
                  <p className="text-slate-800 text-sm">{icp.psychographic.conscienciaProblema?.real}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Visão Aspiracional</p>
                  <p className="text-slate-800 text-sm">{icp.psychographic.conscienciaProblema?.aspiracional}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <p className="text-xs font-bold text-[#864df9] uppercase mb-1">⚡ Gatilho de Venda</p>
                  <p className="text-purple-900 text-sm font-semibold">{icp.psychographic.conscienciaProblema?.gatilho}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modelos Mentais */}
        <div>
          <h2 className="text-2xl font-black text-[#1a1a1a] mb-5 flex items-center gap-2" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            <TrendingUp size={24} className="text-[#864df9]" /> Modelos Mentais + Canais
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {icp.modelosMentais?.map((modelo, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(134,77,249,0.1)] border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-[#f0eaff] text-[#864df9] flex items-center justify-center font-black text-sm shrink-0">M{i + 1}</div>
                  <div>
                    <p className="font-black text-sm">{modelo.modelo}</p>
                    <p className="text-slate-400 text-xs">{modelo.aplicacao}</p>
                  </div>
                </div>
                <p className="text-sm bg-[#f7f3ed] p-3 rounded-xl font-medium text-slate-700 italic border-l-4 border-[#864df9]">💡 "{modelo.exemploCopy}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ SEÇÃO FINAL — PITCH COMPLETO COM PLANOS ═══ */}
        <div className="rounded-3xl overflow-hidden bg-[#0f0f0f] border border-white/10 shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#864df9]/20 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 p-8 sm:p-12">

            {/* Cronômetro + Prova Social */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-8 border-b border-white/10">
              <SocialProofAvatars />
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-orange-400" />
                <CountdownTimer />
              </div>
            </div>

            {/* Headline */}
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 bg-[#F7E397]/10 text-[#F7E397] text-xs font-black uppercase px-3 py-1 rounded-full border border-[#F7E397]/20 mb-5">
                <ShieldCheck size={12} /> Diagnóstico Concluído — Seu Plano Já Está Pronto
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                A IA mapeou onde <span className="text-[#864df9]">{lead.company_url || lead.name}</span> perde dinheiro. Hora de corrigir.
              </h2>
              <p className="text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
                Os {icp.dimensions.dores?.length || 3} gargalos identificados custam leads todos os dias. 
                Escolha o plano abaixo, conclua o checkout e o nosso time já inicia no próximo dia útil.
              </p>
            </div>

            {/* Cards de Planos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {plans.map((plan) => (
                <div key={plan.slug}
                  className={`relative flex flex-col rounded-2xl p-6 border transition-all hover:-translate-y-1 ${plan.highlight
                    ? 'bg-white border-transparent ring-2 ring-[#864df9] shadow-[0_0_30px_rgba(134,77,249,0.4)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}>

                  {plan.tag && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#864df9] text-white text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap">
                      {plan.tag}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${plan.highlight ? 'bg-[#f0eaff]' : 'bg-white/10'}`}>
                      {plan.icon}
                    </div>
                    <span className={`font-black text-xs leading-tight ${plan.highlight ? 'text-[#1a1a1a]' : 'text-white'}`}>{plan.name}</span>
                  </div>

                  <div className="mb-4">
                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${plan.highlight ? 'text-slate-500' : 'text-white/40'}`}>
                      {plan.parcelas} de
                    </div>
                    <div className={`text-3xl font-black ${plan.highlight ? 'text-[#864df9]' : 'text-white'}`} style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                      R$ {plan.installment}
                    </div>
                    <div className={`text-xs mt-1 ${plan.highlight ? 'text-slate-400' : 'text-white/30'}`}>ou {plan.cashValue} à vista</div>
                  </div>

                  <ul className="space-y-1.5 flex-1 mb-5">
                    {plan.features.map((f, i) => (
                      <li key={i} className={`flex items-start gap-1.5 text-xs ${plan.highlight ? 'text-slate-600' : 'text-white/60'}`}>
                        <CheckCircle2 size={12} className={`shrink-0 mt-0.5 ${plan.highlight ? 'text-[#864df9]' : 'text-emerald-400'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a href={CHECKOUT_URLS[plan.slug]} target="_blank" rel="noreferrer"
                    className={`w-full py-3 rounded-xl font-black text-center text-sm transition-all ${plan.highlight
                      ? 'bg-[#864df9] text-white hover:bg-[#6c39d3] shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    }`}>
                    {plan.highlight ? '⚡ Escolher PRO' : 'Selecionar'}
                  </a>
                </div>
              ))}
            </div>

            {/* CTA Final */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={CHECKOUT_URLS[highlightPlan.slug]} target="_blank" rel="noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#864df9] hover:bg-[#6c39d3] text-white font-black text-lg px-10 py-4 rounded-full transition-all shadow-[0_0_40px_rgba(134,77,249,0.5)] hover:scale-105 active:scale-95">
                <Zap size={20} fill="white" />
                Comprar Plano e Iniciar Projeto
                <ArrowRight size={20} />
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-white/70 hover:text-white border border-white/20 hover:border-white/40 px-8 py-4 rounded-full font-medium transition-all">
                <PhoneCall size={18} /> Falar com um Consultor
              </a>
            </div>
            <p className="text-white/30 text-xs text-center mt-4">Sem fidelidade mínima no 1º mês. Garantia de resultado ou devolvemos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
