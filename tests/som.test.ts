import { describe, expect, it } from 'vitest';
import { faixaDaTela, faixaPorId, faixas, notaDoIndice, notasDoAcorde, proximaFaixa, seq } from '../src/som/faixas';

describe('faixas da trilha', () => {
  it('tem pelo menos 5 faixas com id e nome únicos', () => {
    expect(faixas.length).toBeGreaterThanOrEqual(5);
    expect(new Set(faixas.map((f) => f.id)).size).toBe(faixas.length);
    expect(new Set(faixas.map((f) => f.nome)).size).toBe(faixas.length);
    for (const f of faixas) expect(f.nome.trim().length).toBeGreaterThan(2);
  });

  it('não usa travessão em nome nenhum', () => {
    const proibidos = new RegExp('[\\u2013\\u2014]');
    for (const f of faixas) expect(f.nome).not.toMatch(proibidos);
  });

  it('tem andamento e parâmetros válidos', () => {
    for (const f of faixas) {
      expect(f.bpm).toBeGreaterThanOrEqual(60);
      expect(f.bpm).toBeLessThanOrEqual(160);
      expect(f.swing).toBeGreaterThanOrEqual(0);
      expect(f.swing).toBeLessThanOrEqual(0.3);
      expect(f.timbre.retorno).toBeLessThanOrEqual(0.7);
      expect(f.progressao.length).toBeGreaterThan(0);
      for (const a of f.progressao) {
        expect(a.raiz).toBeGreaterThanOrEqual(48);
        expect(a.raiz).toBeLessThanOrEqual(59);
      }
    }
  });

  it('tem padrões do mesmo tamanho e com símbolos conhecidos', () => {
    for (const f of faixas) {
      const tamanho = f.passos;
      for (const p of [f.bumbo, f.caixa, f.chimbal, f.virada].filter((x): x is string => !!x)) {
        expect(p.length, `${f.id}: ${p}`).toBe(tamanho);
        expect(p).toMatch(/^[xXo.]+$/);
      }
      for (const p of [f.baixo, f.arpejo, f.sino].filter((x) => !!x)) {
        expect(p!.length, f.id).toBe(tamanho);
        for (const n of p!) if (n !== null) expect(Number.isInteger(n), f.id).toBe(true);
      }
    }
  });
});

describe('ajudantes', () => {
  it('lê sequências com pausa', () => {
    expect(seq('0 . 12 7')).toEqual([0, null, 12, 7]);
  });

  it('monta acordes e sobe oitava no arpejo', () => {
    expect(notasDoAcorde({ raiz: 57, tipo: 'm' })).toEqual([57, 60, 64]);
    expect(notaDoIndice({ raiz: 57, tipo: 'm' }, 3)).toBe(69);
    expect(notaDoIndice({ raiz: 57, tipo: 'm' }, 4)).toBe(72);
  });

  it('a próxima faixa percorre todas e volta ao começo', () => {
    let f = faixas[0];
    const vistas = new Set<string>();
    for (let i = 0; i < faixas.length; i++) { vistas.add(f.id); f = proximaFaixa(f.id); }
    expect(vistas.size).toBe(faixas.length);
    expect(f.id).toBe(faixas[0].id);
  });
});

describe('tela para faixa', () => {
  it('cada tela tem a sua faixa', () => {
    const ids = [
      faixaDaTela('capa'),
      faixaDaTela('contrato', 'boi_na_nuvem'),
      faixaDaTela('mesa', 'boi_na_nuvem'),
      faixaDaTela('mesa', 'pinhao_forte'),
      faixaDaTela('mesa', 'bom_sossego'),
      faixaDaTela('relatorio', 'boi_na_nuvem'),
    ];
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(faixas.some((f) => f.id === id)).toBe(true);
  });

  it('cliente desconhecido na mesa cai numa faixa existente', () => {
    expect(faixaPorId(faixaDaTela('mesa', 'cliente_novo')).id).toBe(faixaDaTela('mesa', 'boi_na_nuvem'));
    expect(faixaPorId('nao_existe').id).toBe(faixas[0].id);
  });
});
