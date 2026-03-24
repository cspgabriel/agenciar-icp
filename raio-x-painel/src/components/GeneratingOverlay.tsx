import { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, Loader2 } from 'lucide-react';

const MESSAGES = [
  "Iniciando integração com a base de dados...",
  "Mapeando comportamento digital e padrões de busca...",
  "Analisando concorrentes do mercado local...",
  "Cruzando dados psicográficos com IA Avançada...",
  "Estruturando funil de conversão personalizado...",
  "Definindo ancoragem de preço e estratégias de downsell...",
  "Otimizando gatilhos mentais para vendas...",
  "Escrevendo relatórios executivos...",
  "Finalizando Dossiê de ICP Premium..."
];

export const GeneratingOverlay = ({ isGenerating }: { isGenerating: boolean }) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const estimatedTime = 25; // 25 seconds average for Gemini
  const [timeLeft, setTimeLeft] = useState(estimatedTime);

  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      setTimeLeft(estimatedTime);
      setMessageIndex(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      let newProgress = (elapsed / estimatedTime) * 100;
      if (newProgress > 98) newProgress = 98; // Hold at 98% until actually finished
      
      setProgress(newProgress);
      setTimeLeft(Math.max(1, Math.ceil(estimatedTime - elapsed)));
      
      const newMsgIndex = Math.min(Math.floor(elapsed / 3), MESSAGES.length - 1);
      setMessageIndex(newMsgIndex);
    }, 100);

    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isGenerating) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/80 animate-fade-in">
      <div className="bg-white rounded-[2rem] p-8 md:p-12 max-w-lg w-full shadow-[0_0_80px_rgba(139,92,246,0.25)] relative overflow-hidden flex flex-col items-center text-center">
        
        {/* Glow Effects */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 flex flex-col items-center w-full">
          {/* Main Icon */}
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl relative animate-bounce" style={{ animationDuration: '2s' }}>
            <BrainCircuit size={40} />
            <Sparkles size={20} className="absolute -top-3 -right-3 text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
          </div>

          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2 font-['Inter_Tight',sans-serif]">
            Processando Inteligência
          </h2>
          
          {/* Dynamic Authority Message */}
          <div className="h-10 flex items-center justify-center mb-8 w-full">
            <p key={messageIndex} className="text-slate-500 font-medium animate-fade-in text-sm md:text-base">
              {MESSAGES[messageIndex]}
            </p>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden shadow-inner relative">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all ease-out"
              style={{ width: `${progress}%`, transitionDuration: '300ms' }}
            />
          </div>

          {/* Stats Footer */}
          <div className="flex justify-between w-full text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            <span>{Math.round(progress)}% Concluído</span>
            <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin"/> {timeLeft}s restantes</span>
          </div>
        </div>

      </div>
    </div>
  );
};
