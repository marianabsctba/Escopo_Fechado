import { describe, expect, it } from 'vitest';
import { classificar, extrairAlvos, ipNaFaixa, violacoes } from '../src/motor/escopo';
import { boiNaNuvem } from '../src/cenarios/boi_na_nuvem';

const escopo = boiNaNuvem.escopo!;

describe('faixas', () => {
  it('reconhece endereços dentro e fora do /28', () => {
    expect(ipNaFaixa('203.0.113.10', '203.0.113.0/28')).toBe(true);
    expect(ipNaFaixa('203.0.113.15', '203.0.113.0/28')).toBe(true);
    expect(ipNaFaixa('203.0.113.16', '203.0.113.0/28')).toBe(false);
  });
});

describe('alvos', () => {
  it('extrai IPs, faixas e hosts, ignorando nomes de arquivo', () => {
    expect(extrairAlvos('curl http://www.boinanuvem.exemplo/robots.txt -o robots.txt')).toEqual(['www.boinanuvem.exemplo']);
    expect(extrairAlvos('nmap -sn 203.0.113.0/28')).toEqual(['203.0.113.0/28']);
  });

  it('uma faixa maior que a do contrato é fora do escopo', () => {
    expect(classificar('203.0.113.0/24', escopo).situacao).toBe('fora');
    expect(classificar('203.0.113.0/28', escopo).situacao).toBe('dentro');
  });
});

describe('violações', () => {
  it('não acusa comandos dentro do escopo nem comandos locais', () => {
    expect(violacoes('nmap 203.0.113.0/28', escopo)).toEqual([]);
    expect(violacoes('curl -I http://www.boinanuvem.exemplo/', escopo)).toEqual([]);
    expect(violacoes('cat notas-hostbacana.exemplo', escopo)).toEqual([]);
    expect(violacoes('grep 198.51.100.20 notas.txt', escopo)).toEqual([]);
  });

  it('acusa a hospedagem e o concorrente', () => {
    expect(violacoes('curl http://painel.hostbacana.exemplo:2083/', escopo)[0].alvo).toBe('painel.hostbacana.exemplo');
    expect(violacoes('nmap 198.51.100.77', escopo)).toHaveLength(1);
    expect(violacoes('ls && wget www.frigorificoparaiso.exemplo', escopo)).toHaveLength(1);
  });

  it('acusa endereço que não está no contrato', () => {
    expect(violacoes('nmap 192.0.2.50', escopo)[0].situacao).toBe('fora');
  });
});
