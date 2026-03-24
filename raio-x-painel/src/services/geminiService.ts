import { GoogleGenAI } from '@google/genai';
import type { Lead, ICPData } from '../types';

// The Google Gen AI SDK format
export async function generateICPForLead(lead: Lead): Promise<ICPData> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY não configurada. ICP não pode ser gerado.');
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const leadContext = `
    NOME DO LEAD: ${lead.name}
    EMPRESA: ${lead.company_url || 'Não informado'}
    ORIGEM: ${lead.source}
    
    RESUMO DO RAIO-X (DADOS DE ENTRADA):
    Objetivo principal: ${lead.raiox_data?.objective || 'Não informado'}
    Respostas do Assessment:
    ${lead.raiox_data?.answers?.map(a => `- ${a.questionText}: ${a.selectedOptionText}`).join('\n') || 'Nenhuma resposta registrada'}
    
    PONTUAÇÃO NO RAIO-X: ${lead.raiox_data?.result?.overallScore || 'N/A'}/100
  `;

  const prompt = `Você é um Estrategista-Chefe Growth (como o Guilherme Lacerda do método ESC).
  Seu objetivo é extrair um Plano Integrado de Marketing Comercial com base nos dados captados do lead via formulário Raio-X.
  Abaixo está o contexto do lead (escassez e informações limitadas são esperadas, use criatividade e lógica do método ESC para inferir gaps):
  
  ${leadContext}
  
  Gere uma estrutura JSON que siga APENAS este formato, sem markdown ou crases e formatando EXATAMENTE como JSON:
  {
    "generated_at": "${new Date().toISOString()}",
    "lead_name": "${lead.name}",
    "company": "${lead.company_url || 'N/A'}",
    "dimensions": {
      "faixaEtaria": "Idade ou faixa etária inferida",
      "profissao": "Área ou profissão provável do decisor",
      "cargo": ["Cargo 1", "Cargo 2", "Cargo 3"],
      "setor": ["Setor ou nicho principal"],
      "formacao": "Formação esperada do decisor",
      "objetivos": ["Objetivo 1", "Objetivo 2", "Objetivo 3"],
      "dores": ["Dor 1 (inferida pelo assessment)", "Dor 2", "Dor 3"],
      "necessidades": ["Necessidade 1", "Necessidade 2", "Necessidade 3"],
      "topicosInteresse": ["Tema 1", "Tema 2", "Tema 3"]
    },
    "psychographic": {
      "criteriosDecisao": [
        {"criterio": "Critério 1", "modeloMental": "Modelo M 1"}
      ],
      "conscienciaProblema": {
        "real": "Nível real de consciência do lead hoje",
        "aspiracional": "Como ele acha que está",
        "gatilho": "Gatilho de educação (mover do aspiracional para o real)"
      },
      "objecoesComuns": [
        {"objecao": "Objeção 1 (ex: Caro)", "resposta": "Excluir o risco focando no ROI"},
        {"objecao": "Objeção 2", "resposta": "Resposta 2"}
      ],
      "canaisAquisicao": [
        {"canal": "Google Ads Search", "estrategia": "Captura Intenção Alta", "budget": "70%"},
        {"canal": "Meta Ads (Instagram)", "estrategia": "Awareness", "budget": "30%"}
      ]
    },
    "realVsAspiracional": [
      {"criterio": "Maturidade", "real": "Não entende OMNI", "aspiracional": "Acha que só tráfego resolve"}
    ],
    "modelosMentais": [
      {
        "modelo": "Aversão à Perda",
        "descricao": "Medo de perder > Ganhar",
        "aplicacao": "Mostrar perda diária por falta do serviço",
        "exemploCopy": "Você perde 3 leads p/ dia sem o processo X"
      }
    ],
    "googleAds": {
      "estrategia": "Resumo tático de busca",
      "keywordsPositivas": ["keyword exata 1", "keyword 2", "keyword 3"],
      "keywordsNegativas": ["grátis", "curso", "como fazer"],
      "anunciosRSA": [
        {"headline": "Headline agressiva (máx 30c)", "description": "Dor + Solução direta"}
      ]
    },
    "landingPage": {
      "framework": "Ex: PAS (Problema, Agitação, Solução)",
      "hero": {
        "headline": "Headline poderosa prometendo resultado (H1)",
        "subheadline": "Mecanismo de como o resultado é entregue",
        "cta": "Baixar Agora / Agendar Sessão (foco no benefício)"
      },
      "secoes": [
        {"titulo": "Seção Agitação Fricção", "foco": "Mostrar que entendemos o problema atual"}
      ]
    },
    "metaAds": {
      "insight": "Ângulo contraintuitivo para chamar atenção no feed",
      "conceitos": [
        {"nome": "O Elevador", "visual": "Vídeo B-roll escuro acelerado", "copyCurta": "Copy hook focada em reter os 3 primeiros segs"}
      ]
    }
  }
  
  Retorne SOMENTE um JSON válido. Não inclua \`\`\`json.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error('Resposta vazia do modelo Gemini');
    
    let icpData: ICPData;
    try {
      // Limpeza por precaução se ainda vier ```json
      const cleanJson = resultText.replace(/```json\n|\n```/g, '').trim();
      icpData = JSON.parse(cleanJson);
      icpData.rawText = resultText;
      return icpData;
    } catch (e) {
      console.error('Falha ao parsear JSON:', e);
      throw new Error('Falha ao interpretar a resposta da IA. O formato não foi retornado como JSON.');
    }
  } catch (error) {
    console.error('Erro ao gerar ICP:', error);
    throw error;
  }
}
