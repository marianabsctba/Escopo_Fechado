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
}
