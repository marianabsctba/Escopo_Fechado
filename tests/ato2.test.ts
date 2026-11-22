import { describe, expect, it } from 'vitest';
import { boiNaNuvem } from '../src/cenarios/boi_na_nuvem';
import { lerVetor, pontuar } from '../src/motor/cvss';
import { novoEstado } from '../src/motor/estado';
import {
  finalPara, itensDoRelatorio, notaFinal, notaItem, notaReuniao, notaSumario, ordemCerta, type EstadoRelatorio,
} from '../src/motor/relatorio';

const ato = boiNaNuvem.ato2!;

function estadoComAchados(ids: string[]) {
  const e = novoEstado('boi_na_nuvem');
  for (const id of ids) e.achados![id] = { quando: '', severidade: 'alta' };
  return e;
}

describe('Ato 2 (relatório)', () => {
  it('todo item aponta para um achado do Ato 1 e tem resposta única', () => {
    const ids = new Set(boiNaNuvem.ato1!.achados.map((a) => a.id));
    for (const i of ato.itens) {
      expect(ids.has(i.achado), i.achado).toBe(true);
      expect(i.evidencia.alternativas.filter((a) => a.certa)).toHaveLength(1);
      expect(i.recomendacao.alternativas.filter((a) => a.certa)).toHaveLength(1);
    }
    for (const p of ato.reuniao) expect(p.alternativas.filter((a) => a.certa)).toHaveLength(1);
  });

  it('o vetor sugerido cai na faixa esperada de cada item', () => {
    for (const i of ato.itens) {
      if (!i.cvss) continue;
      const n = pontuar(lerVetor(i.cvss.sugerido));
      expect(n, i.achado).toBeGreaterThanOrEqual(i.cvss.min);
      expect(n, i.achado).toBeLessThanOrEqual(i.cvss.max);
    }
  });

  it('o relatório só tem os achados registrados', () => {
    expect(itensDoRelatorio(ato, estadoComAchados(['mapa', 'git'])).map((i) => i.achado)).toEqual(['mapa', 'git']);
  });

  it('ordem dos passos', () => {
    const git = ato.itens.find((i) => i.achado === 'git')!;
    expect(ordemCerta(git, [0, 1, 2, 3])).toBe(true);
    expect(ordemCerta(git, [1, 0, 2, 3])).toBe(false);
  });

  it('sumário pune jargão e culpa', () => {
    const boas = ato.sumario.frases.map((f, i) => (f.boa ? i : -1)).filter((i) => i >= 0);
    const ruins = ato.sumario.frases.map((f, i) => (f.boa ? -1 : i)).filter((i) => i >= 0);
    expect(notaSumario(ato, boas)).toBe(100);
    expect(notaSumario(ato, [...boas, ...ruins])).toBeLessThan(50);
    expect(notaSumario(ato, ruins)).toBe(0);
  });

  it('relatório perfeito tira 100 e cai no melhor final', () => {
    const e = estadoComAchados(['mapa', 'robots', 'git', 'backup']);
    const r: EstadoRelatorio = { itens: {} };
    for (const i of itensDoRelatorio(ato, e)) {
      r.itens[i.achado] = { cvssTentativas: 1, cvssOk: true, passosErros: 0, passosOk: true };
      e.tentativas[i.evidencia.id] = [i.evidencia.alternativas.findIndex((a) => a.certa)];
      e.tentativas[i.recomendacao.id] = [i.recomendacao.alternativas.findIndex((a) => a.certa)];
      expect(notaItem(i, r.itens[i.achado], e)).toBe(100);
    }
    for (const p of ato.reuniao) e.tentativas[p.id] = [p.alternativas.findIndex((a) => a.certa)];
    r.sumario = ato.sumario.frases.map((f, i) => (f.boa ? i : -1)).filter((i) => i >= 0);
    expect(notaReuniao(ato, e)).toBe(100);
    const nota = notaFinal(ato, e, r);
    expect(nota).toBe(100);
    expect(finalPara(ato, nota).titulo).toBe('Relatório exemplar');
    expect(finalPara(ato, 10).titulo).toBe('Relatório devolvido');
  });

  it('sem travessão nos textos', () => {
    expect(JSON.stringify(ato)).not.toMatch(/[\u2013\u2014]/);
  });
});
