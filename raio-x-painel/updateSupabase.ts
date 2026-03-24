import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const fallbackGoogleAds = {
  estrategia: "Estratégia simulada de fundo de funil focada em palavras transacionais de alta conversão.",
  keywordsPositivas: ["agência de performance", "gestão de tráfego pago", "consultoria de marketing bh"],
  keywordsNegativas: ["grátis", "vaga", "curso", "o que é", "aprender"],
  anunciosRSA: [
    { headline: "Agência de Tráfego de Alta Conversão", description: "Pare de perder dinheiro com agências focadas em likes. Nós focamos no seu lucro." },
    { headline: "Atraia 10x Mais Clientes Qualificados", description: "Estruturamos engrenagens de vendas reais integrando Google Ads e CRM Automatizado." }
  ]
};

const fallbackLandingPage = {
  framework: "P.A.S.T.O.R. (Problema, Agitação, Solução)",
  hero: {
    headline: "Sua Empresa Precisa Parar de Gastar com \"Estar na Internet\"",
    subheadline: "Transformamos o seu website passivo em uma máquina de vendas de alta performance focada apenas em lucro real no caixa.",
    cta: "Falar com Consultor Estratégico"
  },
  secoes: [
    { titulo: "O Diagnóstico Rápido", foco: "Mostramos por que 90% dos funis convencionais queimam dinheiro de empresários honestos." },
    { titulo: "Autoridade e Prova Social", foco: "Casos de sucesso de clientes nossos que saíram de R$ 30k para R$ 100k na nossa primeira revisão estrutural." },
    { titulo: "A Nossa Proposta B2B", foco: "Metodologia comprovada. Transparência na aquisição e ferramentas state-of-the-art ao seu dispor." }
  ]
};

const fallbackMetaAds = {
  insight: "A maioria entra no Instagram para desligar o cérebro. Para o empresário B2B, vamos interromper rolagens com promessas baseadas em previsibilidade e não em glamour.",
  conceitos: [
    { nome: "Tela Escura + B-Roll Câmera Cruzada", visual: "Especialista traçando funil tático de cabeça em quadro negro. Ambiente brutalista e iluminado por LED cinza/branco.", copyCurta: "Tráfego não paga boleto. Intenção sim. Estratégia revelada em 3 minutos." },
    { nome: "A Tabela do Competidor", visual: "Planilha 50/50 desfocada contrastando o relatório da \"outra agência\" vs o relatório de Performance Comercial da AgenciAR.", copyCurta: "Por que você está aceitando relatórios de curtida do Instagram no fim do mês?" }
  ]
};

async function main() {
  const { data: leads, error } = await supabase.from('leads').select('*').not('icp_data', 'is', null);
  if (error) {
    console.error("Error fetching leads:", error);
    return;
  }

  for (const lead of leads) {
    const newIcpData = {
      ...lead.icp_data,
      googleAds: fallbackGoogleAds,
      landingPage: fallbackLandingPage,
      metaAds: fallbackMetaAds
    };

    const { error: updateError } = await supabase.from('leads').update({ icp_data: newIcpData }).eq('id', lead.id);
    if (updateError) {
      console.error(`Error updating lead ${lead.id}:`, updateError);
    } else {
      console.log(`Successfully updated previously generated lead: ${lead.name}`);
    }
  }
}

main();
