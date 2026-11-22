// Contrato entre o motor e os cenarios.
import type { Escopo } from './escopo';

export type Canal = 'whatsapp' | 'email';

export interface Personagem {
  id: string;
  nome: string;
  papel: string;
  /** Cor do avatar (iniciais). */
  cor: string;
}

export interface Mensagem {
  id: string;
  de: string;
  canal: Canal;
  assunto?: string;
  /** Parágrafos. */
  texto: string[];
}

export interface SecaoContrato {
  titulo: string;
  itens: string[];
}

export interface Alternativa {
  texto: string;
  certa: boolean;
  /** Resposta do mundo quando o jogador escolhe esta opção. */
  retorno: string;
}

export interface Pergunta {
  id: string;
  situacao: string;
  alternativas: Alternativa[];
}

export interface Comando {
  nome: string;
  resumo: string;
  exemplos: { cmd: string; explica: string }[];
  /** Boa prática ligada ao comando. */
  pratica?: string;
}

export type Severidade = 'informativa' | 'baixa' | 'media' | 'alta' | 'critica';

/** Situação de um achado no reteste. */
export type Status = 'corrigido' | 'parcial' | 'nao';

export interface Resultado {
  ok: boolean;
  /** Explicação mostrada quando não passa. */
  motivo?: string;
  /** Evidência expôs dado pessoal sem máscara. */
  lgpd?: boolean;
}

export interface Achado {
  id: string;
  titulo: string;
  /** O que a jogadora precisa descobrir e registrar. */
  objetivo: string;
  /** Texto de exemplo no campo de evidência. */
  exemplo: string;
  dicas: string[];
  severidade: Severidade;
  porqueSeveridade: string;
  recomendacao: string;
  bonus?: boolean;
  /** No reteste: a situação que a evidência deve mostrar. */
  status?: Status;
  validar: (evidencia: string) => Promise<Resultado>;
  /** Mensagem que chega quando o achado é registrado. */
  aoRegistrar?: Mensagem;
}

/** Evento da VM visto pelas reações do cenário. */
export type EventoMundo =
  | { tipo: 'cmd'; comando: string }
  | { tipo: 'http'; host: string; caminho: string; agente: string };

export interface Ato {
  titulo: string;
  /** reteste: o caderno pede status em vez de severidade. */
  modo?: 'teste' | 'reteste';
  /** Mensagens que chegam quando o ato começa. */
  abertura?: Mensagem[];
  achados: Achado[];
  /** Reações únicas (cada id dispara uma vez). */
  reacoes: { id: string; quando: (e: EventoMundo) => boolean; mensagem: Mensagem }[];
  conclusao: Mensagem[];
}

/** Um achado do Ato 1 transformado em seção do relatório. */
export interface ItemRelatorio {
  achado: string;
  /** null: achado informativo, sem CVSS. */
  cvss: { min: number; max: number; sugerido: string; explica: string } | null;
  /** Passos para reproduzir, na ordem certa. */
  passos: string[];
  evidencia: Pergunta;
  recomendacao: Pergunta;
}

export interface Final {
  minimo: number;
  titulo: string;
  texto: string[];
}

export interface AtoRelatorio {
  titulo: string;
  abertura: Mensagem[];
  itens: ItemRelatorio[];
  sumario: { pedido: string; frases: { texto: string; boa: boolean; retorno: string }[] };
  /** Perguntas da reunião; o id do personagem fica em Pergunta.de. */
  reuniao: (Pergunta & { de: string })[];
  finais: Final[];
}

export interface Cenario {
  id: string;
  nome: string;
  nivel: 'iniciante' | 'intermediario' | 'expert';
  local: string;
  chamada: string;
  disponivel: boolean;
  personagens?: Personagem[];
  escopo?: Escopo;
  contrato?: { titulo: string; janela: string; secoes: SecaoContrato[] };
  ato0?: {
    abertura: Mensagem[];
    perguntas: Pergunta[];
    /** Resposta do jogador ao pedido fora do escopo do cliente. */
    pedidoIndecente: Pergunta;
    assinado: Mensagem[];
  };
  /** Reações do mundo a eventos da VM. */
  reacoes?: {
    foraDoEscopo: (alvo: string, motivo: string, vez: number) => Mensagem;
  };
  manual?: Comando[];
  ato1?: Ato;
  ato2?: AtoRelatorio;
  /** Reteste: mesmo formato de ato, com o mundo na fase "corrigida". */
  ato3?: Ato;
  /** Hosts do mundo que estão fora do escopo (para os acessos HTTP). */
  hostsFora?: Record<string, string>;
}
