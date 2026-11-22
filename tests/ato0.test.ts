import { describe, expect, it } from 'vitest';
import { cenarios } from '../src/cenarios';
import { explicar, novoEstado, pontosEscopo, prudencia } from '../src/motor/estado';
import { lerLinhaCanal } from '../src/motor/vm';
import { etapaAtual } from '../src/ui/contrato';

const disponiveis = cenarios.filter((c) => c.disponivel);

describe.each(disponiveis.map((c) => [c.id, c] as const))('cenário %s', (_id, c) => {
  const a0 = c.ato0!;

  it('cada pergunta tem exatamente uma alternativa certa', () => {
    for (const p of [...a0.perguntas, a0.pedidoIndecente]) {
      expect(p.alternativas.filter((a) => a.certa), p.id).toHaveLength(1);
    }
  });

  it('toda mensagem tem remetente conhecido', () => {
    const ids = new Set(c.personagens!.map((p) => p.id));
    for (const m of [...a0.abertura, ...a0.assinado]) expect(ids.has(m.de), m.id).toBe(true);
    for (let v = 1; v <= 4; v++) expect(ids.has(c.reacoes!.foraDoEscopo('x', 'y', v).de)).toBe(true);
  });

  it('textos sem travessão', () => {
    expect(JSON.stringify(c)).not.toMatch(/[–—]/);
  });

  it('o contrato avança na ordem até ficar pronto', () => {
    const e = novoEstado(c.id);
    expect(etapaAtual(c, e)).toBe('caixa');
    e.lidas.push(...a0.abertura.map((m) => m.id));
    expect(etapaAtual(c, e)).toBe('caixa');
    e.lidas.push('anexo');
    expect(etapaAtual(c, e)).toBe('contrato');
    e.lidas.push('contrato');
    expect(etapaAtual(c, e)).toBe('checklist');
    for (const p of a0.perguntas) {
      const errada = p.alternativas.findIndex((a) => !a.certa);
      e.tentativas[p.id] = [errada, p.alternativas.findIndex((a) => a.certa)];
    }
    expect(etapaAtual(c, e)).toBe('pedido');
    e.tentativas[a0.pedidoIndecente.id] = [a0.pedidoIndecente.alternativas.findIndex((a) => a.certa)];
    expect(etapaAtual(c, e)).toBe('assinar');
    e.assinadoPor = 'Teste';
    expect(etapaAtual(c, e)).toBe('pronto');
    expect(prudencia(e)).toBe(100 - a0.perguntas.length * 5);
  });
});

describe('placar e manual', () => {
  it('saídas de escopo custam caro', () => {
    const e = novoEstado('x');
    expect(pontosEscopo(e)).toBe(100);
    e.violacoes.push({ alvo: 'a', quando: '' });
    expect(pontosEscopo(e)).toBe(80);
    e.violacoes.push({ alvo: 'b', quando: '' });
    expect(pontosEscopo(e)).toBe(50);
  });

  it('o manual explica comandos com e sem sudo', () => {
    const m = disponiveis[0].manual!;
    expect(explicar('ls -la /tmp', m)?.nome).toBe('ls');
    expect(explicar('cat /etc/hosts', m)?.nome).toBe('cat /etc/hosts');
    expect(explicar('cat notas.txt', m)?.nome).toBe('cat');
    expect(explicar('/usr/bin/nmap -sn x', m)?.nome).toBe('nmap');
    expect(explicar('programa-inventado', m)).toBeNull();
  });
});

describe('canal da VM', () => {
  it('lê os eventos', () => {
    expect(lerLinhaCanal('EF:PRONTO')).toEqual({ tipo: 'pronto' });
    expect(lerLinhaCanal('EF:CMD /home/pentester\tls -la')).toEqual({ tipo: 'cmd', pasta: '/home/pentester', comando: 'ls -la' });
    expect(lerLinhaCanal('EF:HTTP www\t80\tGET\t/robots.txt\t200\tcurl/8.14.1')).toMatchObject({ host: 'www', porta: 80, status: 200 });
    expect(lerLinhaCanal('lixo')).toBeNull();
  });
});
