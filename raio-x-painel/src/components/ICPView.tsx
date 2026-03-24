import React from 'react';
import type { ICPData, Lead } from '../types';
import { ExternalLink, RefreshCw } from 'lucide-react';

interface ICPViewProps {
  lead: Lead;
  icp: ICPData;
  onRegenerate: () => void;
  isGenerating: boolean;
}

export const ICPView: React.FC<ICPViewProps> = ({ lead, onRegenerate, isGenerating }) => {
  const publicUrl = `/icp/${lead.id}`;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-fade-in">
      {/* Header do Iframe */}
      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-white/60 font-medium text-sm hidden sm:block">Visualização ao vivo do Cliente</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onRegenerate} 
            disabled={isGenerating} 
            title="Refazer diagnóstico (gera novo ICP)" 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors text-xs font-semibold"
          >
            <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
            Regerar ICP
          </button>
          <a 
            href={publicUrl} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 bg-[#864df9] hover:bg-[#6c39d3] text-white font-bold px-4 py-1.5 rounded-lg text-sm transition-all shadow-lg"
          >
            <ExternalLink size={14} />
            Abrir Link do Cliente em Tela Cheia
          </a>
        </div>
      </div>

      {/* Embedded Iframe */}
      <div className="w-full bg-[#0f172a] relative">
        {isGenerating && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center z-10 text-white">
            <RefreshCw size={40} className="animate-spin text-[#864df9] mb-4" />
            <p className="font-bold text-lg">Analisando dados do lead...</p>
            <p className="text-white/60 text-sm mt-1">Nossa IA está refazendo o perfil estratégico.</p>
          </div>
        )}
        <iframe 
          src={publicUrl} 
          className="w-full h-[800px] border-none"
          title={`ICP de ${lead.company_url || lead.name}`}
        />
      </div>
    </div>
  );
};
