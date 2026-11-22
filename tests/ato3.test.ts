import { describe, expect, it } from 'vitest';
import { boiNaNuvem } from '../src/cenarios/boi_na_nuvem';

const ato = boiNaNuvem.ato3!;
const item = (id: string) => ato.achados.find((a) => a.id === id)!;

describe('Ato 3 (reteste)', () => {
  it('é um ato de reteste com status em todos os itens', () => {
    expect(ato.modo).toBe('reteste');
    for (const a of ato.achados) expect(a.status, a.id).toBeDefined();
  });

  it('.git: pasta com 403 não prova correção; o HEAD aberto prova que não foi corrigido', async () => {
    expect((await item('rt-git').validar('GET /.git/ -> 403')).ok).toBe(false);
    expect((await item('rt-git').validar('GET /.git/ 403, mas /.git/HEAD: ref: refs/heads/main')).ok).toBe(true);
  });

  it('planilha: exige o mesmo hash do Ato 1 e continua cobrando LGPD', async () => {
    const hash = 'eccc0182d39229088f65404d3aa693f5225b9bb2ed359bca8aa33e9ce8e19cff';
    expect((await item('rt-backup').validar('arquivo ainda responde 200')).ok).toBe(false);
    expect((await item('rt-backup').validar(`200, sha256 ${hash}`)).ok).toBe(true);
    expect(await item('rt-backup').validar(`${hash} Ana;123.456.789-01`)).toMatchObject({ ok: false, lgpd: true });
  });

  it('robots: recusa o arquivo antigo', async () => {
    expect((await item('rt-robots').validar('Disallow: /admin-jefferson/\nDisallow: /backup-antigo/')).ok).toBe(false);
    expect((await item('rt-robots').validar('Disallow: /admin-jefferson/\n# tirei o backup daqui')).ok).toBe(true);
  });

  it('foto: recusa evidência que ainda mostra a senha', async () => {
    expect((await item('rt-foto').validar('PNG image data; senha Boi@1994')).ok).toBe(false);
    expect((await item('rt-foto').validar('/tmp/f.png: PNG image data, 240 x 160\n0')).ok).toBe(true);
  });

  it('sem travessão nos textos', () => {
    expect(JSON.stringify(ato)).not.toMatch(/[\u2013\u2014]/);
  });
});
