import { describe, expect, it } from 'vitest';
import { arredondarCima, classificacao, lerVetor, pontuar, vetorTexto } from '../src/motor/cvss';

// Valores conferidos com a calculadora oficial do FIRST (CVSS 3.1).
const casos: [string, number][] = [
  ['CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 9.8],
  ['CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N', 7.5],
  ['CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N', 5.3],
  ['CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N', 3.7],
  ['CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:N', 6.5],
  ['CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N', 6.1],
  ['CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H', 9.9],
  ['CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H', 7.8],
  ['CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N', 0],
];

describe('CVSS 3.1', () => {
  it.each(casos)('%s = %s', (vetor, nota) => {
    expect(pontuar(lerVetor(vetor))).toBe(nota);
  });

  it('ida e volta do texto do vetor', () => {
    for (const [v] of casos) expect(vetorTexto(lerVetor(v))).toBe(v);
  });

  it('arredonda para cima sem erro de ponto flutuante', () => {
    expect(arredondarCima(4.0)).toBe(4.0);
    expect(arredondarCima(4.02)).toBe(4.1);
    expect(arredondarCima(4.000001)).toBe(4.0);
  });

  it('classifica nas faixas oficiais', () => {
    expect(classificacao(0)).toBe('Nenhuma');
    expect(classificacao(3.9)).toBe('Baixa');
    expect(classificacao(4)).toBe('Média');
    expect(classificacao(7)).toBe('Alta');
    expect(classificacao(9)).toBe('Crítica');
  });
});
