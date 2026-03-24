export interface RaioXAnswer {
  questionId: string;
  questionText: string;
  selectedOptionId: string;
  selectedOptionText: string;
}

export interface CategoryScore {
  category: string;
  score: number;
  feedback: string;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'Alta' | 'Média' | 'Baixa';
}

export interface AnalysisResult {
  overallScore: number;
  executiveSummary: string;
  categoryBreakdown: CategoryScore[];
  recommendations: Recommendation[];
}

export interface RaioXData {
  objective?: string;
  answers?: RaioXAnswer[];
  result?: AnalysisResult;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company_url?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  raiox_data?: RaioXData;
  icp_data?: ICPData;
  created_at: string;
  updated_at?: string;
}

export interface ICPDimension {
  faixaEtaria: string;
  profissao: string;
  cargo: string[];
  setor: string[];
  formacao: string;
  objetivos: string[];
  dores: string[];
  necessidades: string[];
  topicosInteresse: string[];
}

export interface ICPPsychographic {
  criteriosDecisao: Array<{ criterio: string; modeloMental: string }>;
  conscienciaProblema: { real: string; aspiracional: string; gatilho: string };
  objecoesComuns: Array<{ objecao: string; resposta: string }>;
  canaisAquisicao: Array<{ canal: string; estrategia: string; budget: string }>;
}

export interface ICPData {
  generated_at: string;
  lead_name: string;
  company: string;
  dimensions: ICPDimension;
  psychographic: ICPPsychographic;
  realVsAspiracional: Array<{
    criterio: string;
    real: string;
    aspiracional: string;
  }>;
  modelosMentais: Array<{
    modelo: string;
    descricao: string;
    aplicacao: string;
    exemploCopy: string;
  }>;
  googleAds?: {
    estrategia: string;
    keywordsPositivas: string[];
    keywordsNegativas: string[];
    anunciosRSA: Array<{
      headline: string;
      description: string;
    }>;
  };
  landingPage?: {
    framework: string;
    hero: {
      headline: string;
      subheadline: string;
      cta: string;
    };
    secoes: Array<{
      titulo: string;
      foco: string;
    }>;
  };
  metaAds?: {
    insight: string;
    conceitos: Array<{
      nome: string;
      visual: string;
      copyCurta: string;
    }>;
  };
  rawText?: string;
}

export type PanelView = 'leads' | 'lead-detail' | 'icp-generate' | 'icp-view';

export type StatusFilter = 'all' | Lead['status'];
