import { describe, expect, it } from 'vitest';
import { boiNaNuvem } from '../src/cenarios/boi_na_nuvem';
import { contemSegredo, sha256, temCpfCompleto } from '../src/motor/evidencia';

const ato = boiNaNuvem.ato1!;
const achado = (id: string) => ato.achados.find((a) => a.id === id)!;

describe('evidência', () => {
  it('acha o segredo no meio da saída do terminal', async () => {
    const h = await sha256('Picanha@2021!');
    expect(await contemSegredo("-$db_pass = 'Picanha@2021!';", h)).toBe(true);
    expect(await contemSegredo('senha: Picanha@2021', h)).toBe(false);
  });

  it('reconhece CPF inteiro e aceita mascarado', () => {
    expect(temCpfCompleto('Ana;123.456.789-01;Goiânia')).toBe(true);
    expect(temCpfCompleto('12345678901')).toBe(true);
    expect(temCpfCompleto('CPF 123.***.***-01')).toBe(false);
  });
});

describe('achados do Ato 1 (Boi na Nuvem)', () => {
  it('mapa exige as duas máquinas e as portas', async () => {
    expect((await achado('mapa').validar('203.0.113.10: 22, 80 | 203.0.113.12: 8080')).ok).toBe(true);
    expect((await achado('mapa').validar('203.0.113.10: 22, 80')).ok).toBe(false);
  });

  it('robots exige o caminho do backup', async () => {
    expect((await achado('robots').validar('Disallow: /backup-antigo/')).ok).toBe(true);
    expect((await achado('robots').validar('/admin-jefferson/')).ok).toBe(false);
  });

  it('git exige a senha do histórico', async () => {
    expect((await achado('git').validar("-$db_pass = 'Picanha@2021!';")).ok).toBe(true);
    expect((await achado('git').validar('tem senha no git')).ok).toBe(false);
  });

  it('backup recusa CPF inteiro como falha de LGPD', async () => {
    const r = await achado('backup').validar('clientes_export_2021.csv, 1284 registros, Ana;123.456.789-01');
    expect(r).toMatchObject({ ok: false, lgpd: true });
  });

  it('backup aceita prova mínima mascarada', async () => {
    const r = await achado('backup').validar('clientes_export_2021.csv, 1.284 registros. Ex.: Ana S., CPF 123.***.***-01');
    expect(r.ok).toBe(true);
  });

  it('foto exige a credencial do post-it', async () => {
    expect((await achado('foto').validar('Description: usuario neide / senha Boi@1994')).ok).toBe(true);
  });

  it('todo achado tem dicas, recomendação e severidade', () => {
    for (const a of ato.achados) {
      expect(a.dicas.length, a.id).toBeGreaterThanOrEqual(2);
      expect(a.recomendacao.length, a.id).toBeGreaterThan(20);
    }
  });

  it('reações disparam nos eventos certos', () => {
    const nmap = ato.reacoes.find((r) => r.id === 'jeff-nmap')!;
    expect(nmap.quando({ tipo: 'cmd', comando: 'nmap -sT 203.0.113.0/28' })).toBe(true);
    expect(nmap.quando({ tipo: 'cmd', comando: 'man nmap' })).toBe(false);
  });

  it('sem travessão nos textos', () => {
    expect(JSON.stringify(ato)).not.toMatch(/[\u2013\u2014]/);
  });
});
