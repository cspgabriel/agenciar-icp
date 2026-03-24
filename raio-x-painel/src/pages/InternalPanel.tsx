import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Lead } from '../types';
import { LeadDetail } from '../components/LeadDetail';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Database, Search, Filter, Loader2, ArrowRight, Cpu, ExternalLink } from 'lucide-react';

export default function InternalPanel() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => { fetchLeads(); }, []);

  async function fetchLeads() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setLeads((data || []).filter(l => l.raiox_data || l.icp_data));
    } catch (err: any) {
      setError('Erro ao carregar os leads do banco. Verifique as credenciais no .env.local.');
    } finally {
      setLoading(false);
    }
  }

  const handleICPSaved = (leadId: string, newIcp: any) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, icp_data: newIcp } : l));
    if (selectedLead?.id === leadId) setSelectedLead({ ...selectedLead, icp_data: newIcp });
  };

  const filteredLeads = leads.filter(lead => {
    const matchSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company_url || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;
    const score = lead.raiox_data?.result?.overallScore || 0;
    if (filterScore === 'high' && score < 70) return false;
    if (filterScore === 'medium' && (score < 40 || score >= 70)) return false;
    if (filterScore === 'low' && score >= 40) return false;
    return true;
  });

  return (
    <div className="min-h-screen relative p-4 lg:p-8">
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-slate-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-300 blur-[120px] opacity-40 mix-blend-multiply" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-300 blur-[120px] opacity-40 mix-blend-multiply" />
      </div>

      <header className="max-w-7xl mx-auto mb-10 flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--brand-accent)] to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Cpu size={24} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Painel de Prospecção IA</h1>
            <p className="text-slate-500 font-medium">Motor de Conversão ICP Raio-X</p>
          </div>
        </div>
      </header>

      {selectedLead ? (
        <LeadDetail lead={selectedLead} onBack={() => setSelectedLead(null)} onICPSaved={handleICPSaved} />
      ) : (
        <main className="max-w-7xl mx-auto animate-fade-in">
          <div className="glass-card rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Buscar lead ou empresa..."
                className="w-full bg-white/60 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[var(--brand-accent)] transition-all"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="relative w-full md:w-auto">
              <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select className="w-full md:w-auto appearance-none bg-white/60 border border-slate-200 rounded-xl py-3 pl-12 pr-10 outline-none focus:ring-2 focus:ring-[var(--brand-accent)] font-medium text-slate-700"
                value={filterScore} onChange={e => setFilterScore(e.target.value as any)}>
                <option value="all">Score (Todos)</option>
                <option value="high">Quentes (70+)</option>
                <option value="medium">Mornos (40-69)</option>
                <option value="low">Frios (0-39)</option>
              </select>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-8">{error}</div>}

          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 size={40} className="text-[var(--brand-accent)] animate-spin" />
              <p className="text-slate-500 font-medium">Sincronizando com Supabase...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center p-20 glass-card rounded-3xl border-dashed border-2 border-slate-300">
              <Database size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-700">Nenhum lead encontrado</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-2">Os leads do formulário Raio-X aparecerão aqui.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLeads.map(lead => {
                const score = lead.raiox_data?.result?.overallScore || 0;
                const hasICP = !!lead.icp_data;
                const publicUrl = `${window.location.origin}/icp/${lead.id}`;

                return (
                  <div key={lead.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between group">
                    <div onClick={() => setSelectedLead(lead)} className="cursor-pointer flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-[var(--brand-accent)] transition-colors">{lead.name}</h3>
                          <p className="text-slate-500 text-sm">{lead.company_url || 'Empresa não informada'}</p>
                        </div>
                        <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-sm font-black text-sm"
                          style={{
                            backgroundColor: score >= 70 ? '#f0fdf4' : score >= 40 ? '#fffbeb' : '#fef2f2',
                            color: score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626'
                          }}>
                          {score}
                        </div>
                      </div>
                      <div className="text-slate-600 text-sm space-y-1 mb-4">
                        <p className="truncate">📧 {lead.email}</p>
                        <p className="truncate">📱 {lead.phone}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {format(new Date(lead.created_at), "dd 'de' MMM, yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${hasICP
                        ? 'bg-purple-100 text-[var(--brand-accent)] border border-purple-200'
                        : 'bg-slate-100 text-slate-500'}`}>
                        {hasICP ? '⭐ ICP Gerado' : '⏳ Sem ICP'}
                      </span>

                      {/* Link público para o cliente */}
                      {hasICP && (
                        <a href={publicUrl} target="_blank" rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          title="Abrir link público do cliente"
                          className="flex items-center gap-1.5 text-xs font-bold text-[var(--brand-accent)] hover:underline">
                          <ExternalLink size={14} /> Enviar ao Cliente
                        </a>
                      )}

                      <ArrowRight size={20} onClick={() => setSelectedLead(lead)}
                        className="text-slate-300 group-hover:text-[var(--brand-accent)] transform group-hover:translate-x-1 transition-all cursor-pointer shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}
    </div>
  );
}
