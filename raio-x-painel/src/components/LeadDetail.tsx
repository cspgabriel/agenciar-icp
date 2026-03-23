import React from 'react';
import type { Lead } from '../types';
import { ICPView } from './ICPView';
import { generateICPForLead } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Loader2, Target, Brain, BrainCircuit, RefreshCw } from 'lucide-react';

interface LeadDetailProps {
  lead: Lead;
  onBack: () => void;
  onICPSaved: (leadId: string, icp: any) => void;
}

export const LeadDetail: React.FC<LeadDetailProps> = ({ lead, onBack, onICPSaved }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const hasICP = !!lead.icp_data;

  const handleGenerateICP = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const generatedICP = await generateICPForLead(lead);

      // Simular save no banco - Você precisará criar uma coluna "icp_data" jsonb na tabela "leads" caso não exista
      const { error: sbError } = await supabase
        .from('leads')
        .update({ icp_data: generatedICP })
        .eq('id', lead.id);

      if (sbError) throw sbError;

      onICPSaved(lead.id, generatedICP);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao gerar ICP.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-[var(--brand-accent)] transition-colors gap-2 font-medium"
      >
        <ArrowLeft size={18} /> Voltar para lista de leads
      </button>

      {/* Header do Lead */}
      <div className="glass-card rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{lead.name}</h2>
          <div className="flex items-center gap-4 mt-2 text-slate-600">
            <span className="font-medium bg-slate-100 px-3 py-1 rounded-full text-sm">{lead.company_url || 'N/A'}</span>
            <span>{lead.email}</span>
            <span>{lead.phone}</span>
          </div>
        </div>

        <div className="flex shrink-0">
          {!hasICP ? (
            <button 
              onClick={handleGenerateICP}
              disabled={isGenerating}
              className="px-6 py-3 bg-[var(--brand-accent)] text-white hover:bg-[#6c39d3] transition-colors rounded-full font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <BrainCircuit size={20} />}
              {isGenerating ? 'Analisando perfil...' : 'Gerar ICP Premium com IA'}
            </button>
          ) : (
            <div className="px-6 py-3 bg-green-50 text-green-700 font-semibold border border-green-200 rounded-full flex gap-2 items-center">
              <Target size={20} /> ICP Gerado
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl">
          <p className="font-bold">Atenção</p>
          <p>{error}</p>
        </div>
      )}

      {/* Visão de ICP Gerada ou Dados do Raio-X */}
      {hasICP ? (
        <ICPView lead={lead} icp={lead.icp_data!} onRegenerate={handleGenerateICP} isGenerating={isGenerating} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Brain size={24} className="text-[var(--brand-accent)]" /> 
              Respostas do Assessment
            </h3>
            {lead.raiox_data?.answers?.length ? (
              <div className="space-y-4">
                {lead.raiox_data.answers.map((ans, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-sm font-medium text-slate-500">{ans.questionText}</p>
                    <p className="text-slate-900 font-semibold mt-1">{ans.selectedOptionText}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">Nenhum dado de diagnóstico disponível.</p>
            )}
          </div>
          <div className="glass-card rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-6 text-slate-900">Análise Raio-X</h3>
            {lead.raiox_data?.result ? (
              <div className="space-y-6">
                <div>
                   <p className="text-sm text-slate-500">Score de Saúde Digital</p>
                   <div className="text-4xl font-black text-[var(--brand-accent)]">{lead.raiox_data.result.overallScore}/100</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-sm font-medium text-slate-500 mb-2">Resumo Executivo</p>
                  <p className="text-slate-700">{lead.raiox_data.result.executiveSummary}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">Relatório da IA Raio-X não gerado ou não disponível.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
