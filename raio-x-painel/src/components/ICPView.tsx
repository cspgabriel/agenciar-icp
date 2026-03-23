import React from 'react';
import type { ICPData, Lead } from '../types';
import { Target, CheckCircle2, TrendingUp, Presentation, ArrowRight, PhoneCall } from 'lucide-react';

interface ICPViewProps {
  lead: Lead;
  icp: ICPData;
  onRegenerate: () => void;
  isGenerating: boolean;
}

export const ICPView: React.FC<ICPViewProps> = ({ lead, icp, onRegenerate, isGenerating }) => {
  return (
    <div className="animate-fade-in font-sans pb-16">
      
      {/* Header Estilo AgenciAR HTML */}
      <div className="text-center py-10 bg-white border-b-2 border-[var(--brand-accent)] mb-10 rounded-t-2xl shadow-sm">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight font-['Inter_Tight']">ICP Dossiê — {lead.company_url || lead.name}</h1>
        <p className="text-slate-500 mt-2 font-medium">Perfil Estratégico de Cliente para Alta Performance</p>
        
        <button 
          onClick={onRegenerate}
          disabled={isGenerating}
          className="mt-6 mx-auto flex items-center gap-2 text-sm text-[var(--brand-accent)] hover:text-white hover:bg-[var(--brand-accent)] font-medium bg-purple-50 px-4 py-2 rounded-full border border-purple-200 transition-all"
        >
          {isGenerating ? 'Recalculando IA...' : 'Refazer Diagnóstico com IA'}
        </button>
      </div>

      <div className="max-w-5xl mx-auto space-y-12 px-4">

        {/* Banner Sinergia (AgenciAR Style) */}
        <div className="bg-[var(--brand-accent)] text-white rounded-2xl p-8 text-center shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <h2 className="text-2xl font-black mb-3 font-['Inter_Tight'] flex items-center justify-center gap-2">
             <Target /> Mapa de Prospecção Ativa
           </h2>
           <p className="text-purple-100 max-w-2xl mx-auto text-lg">
             A inteligência abaixo desenhou a arquitetura de conversão exata para transformar a audiência da <strong>{lead.company_url || lead.name}</strong> em leads qualificados.
           </p>
        </div>

        {/* 9 Dimensões Tabela HTML-Like */}
        <div>
          <h2 className="text-2xl font-black font-['Inter_Tight'] text-slate-800 mb-6 flex items-center gap-2">
            📊 9 Dimensões do ICP
          </h2>
          <div className="overflow-x-auto bg-white rounded-2xl shadow-[0_4px_20px_rgba(134,77,249,0.12)] border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="bg-[var(--brand-accent)] text-white p-4 font-bold uppercase tracking-wider text-sm w-1/4">Dimensão</th>
                  <th className="bg-[var(--brand-accent)] text-white p-4 font-bold uppercase tracking-wider text-sm">Perfil Analisado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                   <td className="p-4 font-bold text-[var(--brand-accent)]">Faixa Etária</td>
                   <td className="p-4 text-slate-700">{icp.dimensions.faixaEtaria}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                   <td className="p-4 font-bold text-[var(--brand-accent)]">Profissão/Ocupação</td>
                   <td className="p-4 text-slate-700">{icp.dimensions.profissao}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                   <td className="p-4 font-bold text-[var(--brand-accent)]">Cargos/Decisores</td>
                   <td className="p-4 text-slate-700">{icp.dimensions.cargo?.join(', ')}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                   <td className="p-4 font-bold text-[var(--brand-accent)]">Setor Primário</td>
                   <td className="p-4 text-slate-700">{icp.dimensions.setor?.join(', ')}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                   <td className="p-4 font-bold text-[var(--brand-accent)]">Dores Identificadas</td>
                   <td className="p-4 text-slate-700">
                      <ul className="list-disc pl-5 space-y-1 text-red-700">
                        {icp.dimensions.dores?.map((d, i) => <li key={i}>{d}</li>)}
                      </ul>
                   </td>
                </tr>
                <tr className="hover:bg-slate-50">
                   <td className="p-4 font-bold text-[var(--brand-accent)]">Necessidades Pós-Raio-X</td>
                   <td className="p-4 text-slate-700">
                      <ul className="list-disc pl-5 space-y-1 text-green-700">
                        {icp.dimensions.necessidades?.map((n, i) => <li key={i}>{n}</li>)}
                      </ul>
                   </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Psy Grid HTML-Like */}
        <div>
           <h2 className="text-2xl font-black font-['Inter_Tight'] text-slate-800 mb-6 mt-12">
             🧠 Análise Psicográfica & Argumentos
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(134,77,249,0.12)] border-t-4 border-[var(--brand-accent)]">
                 <h3 className="font-['Inter_Tight'] text-xl font-bold mb-4 text-slate-900">⚖️ Objeções e Quebras</h3>
                 <ul className="space-y-4">
                    {icp.psychographic.objecoesComuns?.map((obj, i) => (
                      <li key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <strong className="text-slate-800 block text-sm">Se o cliente disser: "{obj.objecao}"</strong>
                        <span className="text-slate-600 block text-sm mt-1">✓ {obj.resposta}</span>
                      </li>
                    ))}
                 </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(134,77,249,0.12)] border-t-4 border-[var(--brand-accent)]">
                 <h3 className="font-['Inter_Tight'] text-xl font-bold mb-4 text-slate-900">🎯 Consciência do Problema</h3>
                 <ul className="space-y-4">
                    <li className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <strong className="text-slate-800 text-sm">Visão Real:</strong>
                      <p className="text-slate-600 text-sm">{icp.psychographic.conscienciaProblema?.real}</p>
                    </li>
                    <li className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <strong className="text-slate-800 text-sm">Visão Aspiracional:</strong>
                      <p className="text-slate-600 text-sm">{icp.psychographic.conscienciaProblema?.aspiracional}</p>
                    </li>
                    <li className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <strong className="text-[var(--brand-accent)] text-sm">Gatilho de Venda:</strong>
                      <p className="text-purple-800 font-medium text-sm">{icp.psychographic.conscienciaProblema?.gatilho}</p>
                    </li>
                 </ul>
              </div>

           </div>
        </div>

        {/* Pitch de Fechamento Integrado (Nova Seção para Vendas) */}
        <div className="mt-16 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-3xl p-1 shadow-2xl overflow-hidden relative">
           <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
           
           <div className="bg-[#1a1a1a] rounded-[22px] p-8 lg:p-12 relative z-10 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-[#F7E397] text-[#6d5a0a] text-xs font-black uppercase px-3 py-1 rounded-full tracking-wider">Passo Final</span>
                <span className="text-white/50 text-sm uppercase tracking-widest font-bold">Diagnóstico Concluído</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-black text-white font-['Inter_Tight'] mb-4">
                Hora de destruir essa perda <br/>de dinheiro no Marketing.
              </h2>
              
              <p className="text-white/70 text-lg max-w-2xl mb-10 leading-relaxed font-light">
                O Raio-X identificou exatamente onde <strong className="text-white">{lead.company_url || lead.name}</strong> está travando a conversão. 
                Deixar isso como está significa deixar clientes pro seu concorrente todos os dias.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-10">
                 <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
                    <h3 className="text-white font-bold flex items-center gap-2 mb-2"><CheckCircle2 className="text-[#F7E397]" size={20} /> A Solução</h3>
                    <p className="text-white/60 text-sm">Assumirmos o tráfego com a nossa metodologia validada (mais de R$15M de ROI gerado), eliminando o seu 'achismo' e garantindo performance previsível.</p>
                 </div>
                 <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
                    <h3 className="text-white font-bold flex items-center gap-2 mb-2"><TrendingUp className="text-[#F7E397]" size={20} /> O Próximo Passo</h3>
                    <p className="text-white/60 text-sm">Assine um de nossos planos básicos de aceleração e deixe o setup inicial por nossa conta. Resultado antes do primeiro ciclo.</p>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a href="#" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--brand-accent)] hover:bg-[#6c39d3] text-white font-bold text-lg px-8 py-4 rounded-full transition-transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(134,77,249,0.4)]">
                  Iniciar Parceria Agora <ArrowRight size={20} />
                </a>
                <a href="#" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 text-white font-medium px-8 py-4 rounded-full border border-white/20 transition-colors">
                  <PhoneCall size={18} /> Quero falar com um Consultor
                </a>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
