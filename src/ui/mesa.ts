// Mesa de trabalho: terminal real à esquerda, painel do caso à direita.
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import type { Cenario, Mensagem } from '../motor/tipos';
import { type Estado, salvar, prudencia, pontosEscopo, explicar } from '../motor/estado';
import { violacoes } from '../motor/escopo';
import { MaquinaVM, type EventoVM } from '../motor/vm';
import { h, limpar } from './dom';
import { itemLista, leitura } from './mensagens';
import { documentoContrato } from './contrato';

type Aba = 'mensagens' | 'contrato' | 'caderno' | 'manual';

export function telaMesa(raiz: HTMLElement, c: Cenario, e: Estado, aoSair: () => void): void {
  limpar(raiz);
  const dinamicas = new Map<string, Mensagem>();
  const todas = (): Mensagem[] => [...(c.ato0?.assinado ?? []), ...dinamicas.values()];
  let aba: Aba = 'manual';
  let aberta: string | null = null;
  let ultimoCmd: string | null = null;

  // reconstrói reações já recebidas
  e.violacoes.forEach((v, i) => {
    const r = c.reacoes?.foraDoEscopo(v.alvo, '', i + 1);
    if (r) dinamicas.set(r.id, r);
  });

  const placar = h('div', { class: 'placar' });
  const abas = h('nav', { class: 'abas', role: 'tablist' });
  const conteudo = h('div', { class: 'aba-conteudo' });
  const avisos = h('div', { class: 'avisos', 'aria-live': 'polite' });
  const carregando = h('div', { class: 'carregando' }, h('p', {}, 'Conectando na VPN do cliente...'), h('div', { class: 'barra' }, h('span', {})), h('small', {}, 'O notebook de teste é um Linux de verdade rodando no seu navegador. O primeiro boot leva um tempinho.'));
  const terminalEl = h('div', { class: 'terminal' });

  const desenharPlacar = () => {
    limpar(placar);
    placar.append(
      h('span', { title: 'Respostas do checklist do contrato' }, 'Prudência ', h('b', {}, String(prudencia(e)))),
      h('span', { title: 'Cada saída do escopo custa pontos' }, 'Escopo ', h('b', { class: e.violacoes.length ? 'ruim' : '' }, String(pontosEscopo(e)))),
      h('span', {}, 'Comandos ', h('b', {}, String(e.comandos))),
    );
  };

  const naoLidas = () => todas().filter((m) => !e.lidas.includes(m.id)).length;

  const desenharAbas = () => {
    limpar(abas);
    const nomes: [Aba, string][] = [['manual', 'Manual'], ['mensagens', 'Mensagens'], ['contrato', 'Contrato'], ['caderno', 'Caderno']];
    for (const [id, nome] of nomes) {
      const n = id === 'mensagens' ? naoLidas() : 0;
      abas.append(
        h('button', { role: 'tab', 'aria-selected': String(aba === id), class: aba === id ? 'ativa' : '', onclick: () => { aba = id; desenharConteudo(); desenharAbas(); } },
          nome, n ? h('span', { class: 'contador' }, String(n)) : null),
      );
    }
  };

  const desenharConteudo = () => {
    limpar(conteudo);
    if (aba === 'mensagens') {
      const ms = todas().slice().reverse();
      const m = ms.find((x) => x.id === aberta) ?? ms[0];
      if (m && !e.lidas.includes(m.id)) { e.lidas.push(m.id); salvar(e); }
      conteudo.append(
        h('div', { class: 'lista-mini' }, ...ms.map((x) => itemLista(c, x, e.lidas.includes(x.id), x === m, () => { aberta = x.id; desenharConteudo(); desenharAbas(); }))),
        m ? leitura(c, m) : h('p', {}, 'Nenhuma mensagem.'),
      );
    } else if (aba === 'contrato') {
      conteudo.append(documentoContrato(c), h('p', { class: 'assinatura' }, `Assinado por ${e.assinadoPor ?? '?'}.`));
    } else if (aba === 'caderno') {
      conteudo.append(
        h('h2', {}, 'Caderno de evidências'),
        h('p', {}, 'Aqui vão os achados do reconhecimento, cada um com evidência, horário e severidade. O Ato 1 chega na próxima versão.'),
        h('p', {}, 'Enquanto isso, o terminal já é seu: explore o notebook, leia o manual e confira o escopo antes de cada comando de rede.'),
      );
    } else {
      const cmd = ultimoCmd ? explicar(ultimoCmd, c.manual ?? []) : null;
      conteudo.append(
        cmd
          ? h('section', { class: 'explica' }, h('p', { class: 'sobretitulo' }, 'Você digitou'), h('code', {}, ultimoCmd!), h('h3', {}, cmd.nome), h('p', {}, cmd.resumo),
              ...cmd.exemplos.map((x) => h('p', { class: 'exemplo' }, h('code', {}, x.cmd), ' ', x.explica)),
              cmd.pratica ? h('p', { class: 'pratica' }, h('strong', {}, 'Boa prática: '), cmd.pratica) : null)
          : h('section', { class: 'explica' }, h('h3', {}, 'Manual do terminal'), h('p', {}, 'Digite um comando no terminal e a explicação aparece aqui. Comece por ', h('code', {}, 'pwd'), ', ', h('code', {}, 'ls -la'), ' e ', h('code', {}, 'ip -br addr'), '.')),
        h('h3', {}, 'Todos os comandos'),
        h('ul', { class: 'manual' }, ...(c.manual ?? []).map((x) => h('li', {}, h('code', {}, x.nome), ' ', x.resumo))),
      );
    }
  };

  const avisar = (texto: string, tipo: 'info' | 'ruim' = 'info') => {
    const el = h('div', { class: `aviso ${tipo}` }, texto);
    avisos.append(el);
    setTimeout(() => el.remove(), 6000);
  };

  const novaMensagem = (m: Mensagem) => {
    dinamicas.set(m.id, m);
    avisar(`Nova mensagem de ${c.personagens?.find((p) => p.id === m.de)?.nome ?? m.de}`, 'ruim');
    desenharAbas();
    if (aba === 'mensagens') desenharConteudo();
  };

  raiz.append(
    h(
      'div',
      { class: 'mesa' },
      h('header', { class: 'topo' },
        h('h1', {}, 'Escopo Fechado'),
        h('span', { class: 'caso' }, `${c.nome}, nível ${c.nivel}`),
        placar,
        h('button', { class: 'botao secundario pequeno', onclick: aoSair }, 'Menu')),
      h('div', { class: 'mesa-corpo' },
        h('section', { class: 'lado-terminal' }, carregando, terminalEl),
        h('aside', { class: 'lado-caso' }, abas, conteudo)),
      avisos,
    ),
  );
  desenharPlacar();
  desenharAbas();
  desenharConteudo();

  const term = new Terminal({
    fontFamily: '"JetBrains Mono", "Cascadia Mono", Consolas, monospace',
    fontSize: 15,
    cursorBlink: true,
    theme: { background: '#0b0d12', foreground: '#e6e6e6', cursor: '#ff5fa2', selectionBackground: '#ff5fa255' },
    scrollback: 5000,
  });
  const fit = new FitAddon();
  term.loadAddon(fit);
  term.open(terminalEl);
  fit.fit();
  new ResizeObserver(() => fit.fit()).observe(terminalEl);

  const aoEvento = (ev: EventoVM) => {
    if (ev.tipo === 'pronto') {
      carregando.remove();
      fit.fit();
      setTimeout(() => { ajustarTamanho(); term.focus(); }, 800);
      avisar('VPN conectada. O notebook de teste é seu.');
    } else if (ev.tipo === 'cmd' && !comandoDoJogo(ev.comando)) {
      e.comandos++;
      ultimoCmd = ev.comando;
      for (const v of violacoes(ev.comando, c.escopo!)) {
        e.violacoes.push({ alvo: v.alvo, quando: new Date().toISOString() });
        const r = c.reacoes?.foraDoEscopo(v.alvo, v.motivo ?? '', e.violacoes.length);
        if (r) novaMensagem(r);
        break;
      }
      salvar(e);
      desenharPlacar();
      if (aba === 'manual') desenharConteudo();
    }
  };

  const barra = carregando.querySelector('.barra span') as HTMLElement;
  const vm = new MaquinaVM({
    cenario: c.id,
    aoProgresso: (f) => { barra.style.width = `${Math.round(f * 100)}%`; },
    aoTerminal: (b) => term.write(b),
    aoEvento,
  });
  term.onData((d) => vm.digitar(d));
  // Serial não avisa mudança de tamanho; o less e o nano precisam saber.
  ajustarTamanho = () => vm.digitar(` stty rows ${term.rows} cols ${term.cols}; clear\n`);
}

let ajustarTamanho = () => {};

/** Comandos que o próprio jogo digita (começam com espaço) não contam. */
export function comandoDoJogo(cmd: string): boolean {
  return /^\s*stty rows \d+ cols \d+; clear$/.test(cmd);
}
