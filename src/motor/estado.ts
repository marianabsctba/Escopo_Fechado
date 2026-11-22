// Progresso salvo no navegador. A VM não é salva: ao recarregar ela boota de novo.
import type { Comando } from './tipos';

export interface Estado {
  versao: 1;
  cenario: string;
  etapa: 'contrato' | 'mesa';
  /** Pergunta id -> índice das alternativas já tentadas. */
  tentativas: Record<string, number[]>;
  assinadoPor?: string;
  mensagens: string[];
  lidas: string[];
  violacoes: { alvo: string; quando: string }[];
  comandos: number;
}

const CHAVE = 'escopo-fechado:v1';

export function novoEstado(cenario: string): Estado {
  return { versao: 1, cenario, etapa: 'contrato', tentativas: {}, mensagens: [], lidas: [], violacoes: [], comandos: 0 };
}

export function carregar(): Estado | null {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const e = JSON.parse(bruto) as Estado;
    return e.versao === 1 ? e : null;
  } catch {
    return null;
  }
}

export function salvar(e: Estado): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(e));
  } catch {
    /* sem armazenamento: o jogo segue sem salvar */
  }
}

export function apagar(): void {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* nada a fazer */
  }
}

/** Pontos de prudência: cada resposta errada no contrato custa 5. */
export function prudencia(e: Estado): number {
  const erros = Object.values(e.tentativas).reduce((s, t) => s + Math.max(0, t.length - 1), 0);
  return Math.max(0, 100 - erros * 5);
}

/** Pontos de escopo: a primeira saída custa 20, as seguintes 30. */
export function pontosEscopo(e: Estado): number {
  const n = e.violacoes.length;
  return Math.max(0, 100 - (n === 0 ? 0 : 20 + (n - 1) * 30));
}

/** Acha a entrada do manual para um comando digitado. */
export function explicar(comando: string, manual: Comando[]): Comando | null {
  const limpo = comando.trim().replace(/^sudo\s+/, '');
  const exato = manual.find((c) => c.nome.includes(' ') && limpo.startsWith(c.nome));
  if (exato) return exato;
  const prog = limpo.split(/\s+/)[0]?.split('/').pop() ?? '';
  return manual.find((c) => c.nome === prog) ?? null;
}
