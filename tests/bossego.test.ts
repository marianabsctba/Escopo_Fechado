import { describe, expect, it } from 'vitest';
import { bomSossego } from '../src/cenarios/bom_sossego';
import { violacoes } from '../src/motor/escopo';
import { lerVetor, pontuar } from '../src/motor/cvss';

const a1 = (id: string) => bomSossego.ato1!.achados.find((a) => a.id === id)!;
const a3 = (id: string) => bomSossego.ato3!.achados.find((a) => a.id === id)!;

describe('Bom Sossego: escopo', () => {
  it('a Câmara fica fora mesmo sendo subdomínio, e a rede administrativa fica dentro', () => {
    const esc = bomSossego.escopo!;
    expect(violacoes('curl http://camara.bomsossego.exemplo/', esc)).toHaveLength(1);
    expect(violacoes('nmap 10.20.1.5', esc)).toHaveLength(1);
    expect(violacoes('nmap -sT -p 389,445 10.20.0.0/24', esc)).toEqual([]);
    expect(violacoes("ldapsearch -x -H ldap://10.20.0.10 -s base -b '' namingContexts", esc)).toEqual([]);
  });
});

describe('Bom Sossego: Ato 1', () => {
  it('senha na descrição exige senha, pwdLastSet e grupos', async () => {
    const ev = 'sAMAccountName: estagiario.ti\ndescription: Estagiario TI - senha provisoria: Sossego@2024\npwdLastSet: 2024-02-05\nmemberOf: cn=Domain Admins,ou=Grupos,dc=bomsossego,dc=exemplo';
    expect((await a1('bs-descricao').validar(ev)).ok).toBe(true);
    expect((await a1('bs-descricao').validar('Sossego@2024')).ok).toBe(false);
  });

  it('script de logon exige a senha e a conta', async () => {
    expect((await a1('bs-netlogon').validar('net use F: \\\\fs01\\Financas /user:BOMSOSSEGO\\adm.financas Sossego#Financas2019')).ok).toBe(true);
  });

  it('folha recusa CPF inteiro e aceita prova mínima', async () => {
    expect(await a1('bs-folha').validar('folha_pagamento_2026-10.csv 412 123.456.789-01')).toMatchObject({ ok: false, lgpd: true });
    expect((await a1('bs-folha').validar('Publico/folha_pagamento_2026-10.csv, 412 servidores. Ex.: Maria S., 123.***.***-01')).ok).toBe(true);
  });

  it('SMB e consulta anônima', async () => {
    expect((await a1('bs-smb').validar('NT LM 0.12 (SMBv1) | Message signing enabled but not required')).ok).toBe(true);
    expect((await a1('bs-anonimo').validar('ldapsearch -x sem -D: 22 contas')).ok).toBe(true);
  });
});

describe('Bom Sossego: Atos 2 e 3', () => {
  it('vetores sugeridos caem nas faixas, incluindo os críticos', () => {
    for (const i of bomSossego.ato2!.itens) {
      if (!i.cvss) continue;
      const n = pontuar(lerVetor(i.cvss.sugerido));
      expect(n, i.achado).toBeGreaterThanOrEqual(i.cvss.min);
      expect(n, i.achado).toBeLessThanOrEqual(i.cvss.max);
    }
    expect(pontuar(lerVetor(bomSossego.ato2!.itens.find((i) => i.achado === 'bs-descricao')!.cvss!.sugerido))).toBe(9.6);
  });

  it('reteste: backup do script e planilha movida não contam como correção', async () => {
    expect(a3('bs-rt-netlogon').status).toBe('nao');
    expect(a3('bs-rt-folha').status).toBe('nao');
    expect(a3('bs-rt-smb').status).toBe('parcial');
    expect((await a3('bs-rt-netlogon').validar('logon.bat.bak: /user:BOMSOSSEGO\\adm.financas Sossego#Financas2019')).ok).toBe(true);
    expect((await a3('bs-rt-folha').validar('Publico/arquivo_morto/folha_pagamento_2026-10.csv')).ok).toBe(true);
    expect((await a3('bs-rt-smb').validar('NT LM 0.12 | Message signing enabled and required')).ok).toBe(true);
    expect((await a3('bs-rt-smb').validar('NT LM 0.12 | enabled but not required')).ok).toBe(false);
    expect((await a3('bs-rt-descricao').validar('description: Estagiario TI, pwdLastSet: 2026-11-21')).ok).toBe(true);
  });

  it('sem travessão nos textos', () => {
    expect(JSON.stringify(bomSossego)).not.toMatch(/[\u2013\u2014]/);
  });
});
