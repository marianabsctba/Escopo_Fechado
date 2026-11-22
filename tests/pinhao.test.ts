import { describe, expect, it } from 'vitest';
import { pinhaoForte } from '../src/cenarios/pinhao_forte';
import { violacoes } from '../src/motor/escopo';
import { lerVetor, pontuar } from '../src/motor/cvss';

const a1 = (id: string) => pinhaoForte.ato1!.achados.find((a) => a.id === id)!;
const a3 = (id: string) => pinhaoForte.ato3!.achados.find((a) => a.id === id)!;

describe('Pinhão Forte: escopo e SOC', () => {
  it('fábrica de software e cooperativa vizinha ficam fora; homologação fica dentro', () => {
    const esc = pinhaoForte.escopo!;
    expect(violacoes('curl -sk https://git.coderapido.exemplo/', esc)).toHaveLength(1);
    expect(violacoes('nmap 198.51.100.90', esc)).toHaveLength(1);
    expect(violacoes('curl -sk https://homolog-app.pinhaoforte.exemplo:8443/status', esc)).toEqual([]);
    expect(violacoes('nmap -sT 192.0.2.32/28', esc)).toEqual([]);
  });

  it('o SOC acusa varredura agressiva e deixa passar a discreta', () => {
    const r = pinhaoForte.soc!.barulhento;
    expect(r.test('nmap -A 192.0.2.36')).toBe(true);
    expect(r.test('nmap -p- 192.0.2.36')).toBe(true);
    expect(r.test('gobuster dir -u https://app.pinhaoforte.exemplo')).toBe(true);
    expect(r.test('nmap -sT -p 80,443,8443 192.0.2.32/28')).toBe(false);
  });
});

describe('Pinhão Forte: Ato 1', () => {
  it('mapa exige a homologação descoberta pelo certificado', async () => {
    expect((await a1('pf-mapa').validar('192.0.2.34 192.0.2.36 192.0.2.40:8443')).ok).toBe(false);
    expect((await a1('pf-mapa').validar('192.0.2.34 (80,443) 192.0.2.36 (443) 192.0.2.40 (8443) SAN: homolog-app.pinhaoforte.exemplo')).ok).toBe(true);
  });

  it('homologação recusa CPF inteiro e saldo', async () => {
    expect(await a1('pf-homolog').validar('copia de producao, 4310, 418.207.553-10')).toMatchObject({ ok: false, lgpd: true });
    expect(await a1('pf-homolog').validar('copia de producao, 4310, 418.***.***-10, "saldo": 18240.55')).toMatchObject({ ok: false, lgpd: true });
    expect((await a1('pf-homolog').validar('base: copia de producao de 2026-10-01, 4.310 associados. Ex.: Zbigniew K., 418.***.***-10')).ok).toBe(true);
  });

  it('erro, docs, cookie e versão', async () => {
    expect((await a1('pf-erro').validar('host=db-core.pinhao.interno')).ok).toBe(true);
    expect((await a1('pf-docs').validar('/api/docs/openapi.json: /v1/interno/exportar-associados')).ok).toBe(true);
    expect((await a1('pf-cookie').validar('Set-Cookie: PFSESSID=7f3a...; Path=/ (faltam Secure, HttpOnly, SameSite)')).ok).toBe(true);
    expect((await a1('pf-versao').validar('X-Powered-By: Express 4.16.0')).ok).toBe(true);
  });
});

describe('Pinhão Forte: Atos 2 e 3', () => {
  it('vetores sugeridos caem nas faixas e todo item aponta para um achado', () => {
    const ids = new Set(pinhaoForte.ato1!.achados.map((a) => a.id));
    for (const i of pinhaoForte.ato2!.itens) {
      expect(ids.has(i.achado), i.achado).toBe(true);
      if (!i.cvss) continue;
      const n = pontuar(lerVetor(i.cvss.sugerido));
      expect(n, i.achado).toBeGreaterThanOrEqual(i.cvss.min);
      expect(n, i.achado).toBeLessThanOrEqual(i.cvss.max);
    }
    for (const p of pinhaoForte.ato2!.reuniao) expect(p.alternativas.filter((x) => x.certa)).toHaveLength(1);
  });

  it('reteste: cookie e homologação parciais, docs e erro corrigidos', async () => {
    expect(a3('pf-rt-cookie').status).toBe('parcial');
    expect(a3('pf-rt-homolog').status).toBe('parcial');
    expect((await a3('pf-rt-cookie').validar('Set-Cookie: PFSESSID=...; Path=/; Secure; HttpOnly (falta SameSite)')).ok).toBe(true);
    expect((await a3('pf-rt-homolog').validar('base: copia de producao, amostra: 418.***.***-10, saldo ***')).ok).toBe(true);
    expect((await a3('pf-rt-erro').validar('moeda=XYZ -> {"erro": "Moeda inválida."}')).ok).toBe(true);
    expect((await a3('pf-rt-docs').validar('/api/docs/openapi.json -> 401')).ok).toBe(true);
  });

  it('sem travessão nos textos', () => {
    expect(JSON.stringify(pinhaoForte)).not.toMatch(/[\u2013\u2014]/);
  });
});
