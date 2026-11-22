// Pontuação do Ato 2 (relatório). Funções puras, testadas em tests/ato2.test.ts.
import type { AtoRelatorio, Final, ItemRelatorio, Pergunta } from './tipos';
import type { Estado } from './estado';

export interface EstadoItem {
  vetor?: string;
  cvssTentativas: number;
  cvssOk?: boolean;
  passosErros: number;
  passosOk?: boolean;
}

export interface EstadoRelatorio {
  itens: Record<string, EstadoItem>;
  sumario?: number[];
  concluido?: boolean;
  nota?: number;
}

export function novoItem(): EstadoItem {
  return { cvssTentativas: 0, passosErros: 0 };
}

/** Itens do relatório: só os achados que a jogadora registrou no Ato 1. */
export function itensDoRelatorio(ato: AtoRelatorio, e: Estado): ItemRelatorio[] {
  return ato.itens.filter((i) => e.achados?.[i.achado]);
}

function primeiraCerta(p: Pergunta, e: Estado): number | null {
  const t = e.tentativas[p.id] ?? [];
  const i = t.findIndex((x) => p.alternativas[x]?.certa);
  return i < 0 ? null : i;
}

export function respondeu(p: Pergunta, e: Estado): boolean {
  return primeiraCerta(p, e) !== null;
}

/** 25 na primeira, 10 depois. */
function pontosPergunta(p: Pergunta, e: Estado): number {
  const i = primeiraCerta(p, e);
  return i === null ? 0 : i === 0 ? 25 : 10;
}

export function itemCompleto(item: ItemRelatorio, st: EstadoItem | undefined, e: Estado): boolean {
  if (!st) return false;
  if (item.cvss && !st.cvssOk) return false;
  return !!st.passosOk && respondeu(item.evidencia, e) && respondeu(item.recomendacao, e);
}

/** Nota de 0 a 100 de uma seção do relatório. */
export function notaItem(item: ItemRelatorio, st: EstadoItem | undefined, e: Estado): number {
  if (!st) return 0;
  const partes: number[] = [];
  if (item.cvss) partes.push(!st.cvssOk ? 0 : st.cvssTentativas <= 1 ? 25 : st.cvssTentativas === 2 ? 15 : 5);
  partes.push(st.passosOk ? Math.max(5, 25 - st.passosErros * 5) : 0);
  partes.push(pontosPergunta(item.evidencia, e), pontosPergunta(item.recomendacao, e));
  return Math.round((partes.reduce((a, b) => a + b, 0) / (partes.length * 25)) * 100);
}

export function notaSumario(ato: AtoRelatorio, escolhidas: number[] | undefined): number {
  if (!escolhidas) return 0;
  const boas = ato.sumario.frases.filter((f) => f.boa).length;
  const acertos = escolhidas.filter((i) => ato.sumario.frases[i]?.boa).length;
  const erros = escolhidas.length - acertos;
  return Math.max(0, Math.round(((acertos - erros) / boas) * 100));
}

export function notaReuniao(ato: AtoRelatorio, e: Estado): number {
  const pts = ato.reuniao.map((p): number => (pontosPergunta(p, e) === 25 ? 20 : pontosPergunta(p, e) ? 8 : 0));
  return Math.round((pts.reduce((a, b) => a + b, 0) / (ato.reuniao.length * 20)) * 100);
}

/** 50% seções, 20% sumário, 30% reunião. */
export function notaFinal(ato: AtoRelatorio, e: Estado, r: EstadoRelatorio): number {
  const itens = itensDoRelatorio(ato, e);
  const mediaItens = itens.length ? itens.reduce((s, i) => s + notaItem(i, r.itens[i.achado], e), 0) / itens.length : 0;
  return Math.round(mediaItens * 0.5 + notaSumario(ato, r.sumario) * 0.2 + notaReuniao(ato, e) * 0.3);
}

export function finalPara(ato: AtoRelatorio, nota: number): Final {
  return [...ato.finais].sort((a, b) => b.minimo - a.minimo).find((f) => nota >= f.minimo)!;
}

/** Confere a ordem dos passos montada pela jogadora. */
export function ordemCerta(item: ItemRelatorio, ordem: number[]): boolean {
  return ordem.length === item.passos.length && ordem.every((v, i) => v === i);
}
