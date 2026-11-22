// Mesa de trabalho: terminal real à esquerda, painel do caso à direita.
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import type { Achado, Cenario, EventoMundo, Mensagem, Severidade } from '../motor/tipos';
import { type Estado, salvar, prudencia, pontosEscopo, pontosLgpd, explicar } from '../motor/estado';
import { violacoes } from '../motor/escopo';
import { MaquinaVM, type EventoVM } from '../motor/vm';
import { h, limpar } from './dom';
import { itemLista, leitura, pessoa } from './mensagens';
import { documentoContrato } from './contrato';
import { caderno } from './caderno';
import { chuva } from './chuva';

type Aba = 'caderno' | 'mensagens' | 'manual' | 'contrato';

/** Comandos que o próprio jogo digita não contam. */
export function comandoDoJogo(cmd: string): boolean {
  return /^\s*stty rows \d+ cols \d+; clear$/.test(cmd);
}

export function telaMesa(raiz: HTMLElement, c: Cenario, e: Estado, aoSair: () => void, aoRelatorio: () => void): void {
  limpar(raiz);
  const ato = c.ato1;
  const todas = (): Mensagem[] => [...(c.ato0?.assinado ?? []), ...(e.extras ?? [])];
  let aba: Aba = ato ? 'caderno' : 'manual';
  let aberta: string | null = null;
  let achadoAberto: string | null = ato?.achados.find((a) => !e.achados?.[a.id])?.id ?? null;
  let ultimoCmd: string | null = null;
  let ultimaViolacao = 0;

  const placar = h('div', { class: 'placar' });
  const abas = h('nav', { class: 'abas', role: 'tablist' });
  const conteudo = h('div', { class: 'aba-conteudo' });
  const avisos = h('div', { class: 'avisos', 'aria-live': 'polite' });
  const canvasChuva = h('canvas', { class: 'chuva', 'aria-hidden': 'true' });
  const carregando = h('div', { class: 'carregando' },
    canvasChuva,
    h('p', { class: 'digitando' }, 'conectando na VPN do cliente'),
    h('div', { class: 'barra' }, h('span', {})),
    h('small', {}, 'O notebook de teste é um Linux de verdade rodando no seu navegador. O primeiro boot leva uns 20 segundos.'));
  const terminalEl = h('div', { class: 'terminal' });

  const desenharPlacar = () => {
    limpar(placar);
    const obrig = ato?.achados.filter((a) => !a.bonus) ?? [];
    const feitos = obrig.filter((a) => e.achados?.[a.id]).length;
    placar.append(
      h('span', { title: 'Respostas do checklist do contrato' }, 'prudência ', h('b', {}, String(prudencia(e)))),
      h('span', { title: 'Cada saída do escopo custa pontos' }, 'escopo ', h('b', { class: e.violacoes.length ? 'ruim' : '' }, String(pontosEscopo(e)))),
      h('span', { title: 'Evidência com dado pessoal exposto custa pontos' }, 'lgpd ', h('b', { class: e.lgpd ? 'ruim' : '' }, String(pontosLgpd(e)))),
      ato ? h('span', { title: 'Achados obrigatórios registrados' }, 'achados ', h('b', {}, `${feitos}/${obrig.length}`)) : '',
    );
  };

  const naoLidas = () => todas().filter((m) => !e.lidas.includes(m.id)).length;

  const desenharAbas = () => {
    limpar(abas);
    const nomes: [Aba, string][] = [['caderno', 'Caderno'], ['mensagens', 'Mensagens'], ['manual', 'Manual'], ['contrato', 'Contrato']];
    for (const [id, nome] of nomes) {
      const n = id === 'mensagens' ? naoLidas() : 0;
      abas.append(
        h('button', { role: 'tab', 'aria-selected': String(aba === id), class: aba === id ? 'ativa' : '', onclick: () => { aba = id; desenharConteudo(); desenharAbas(); } },
          nome, n ? h('span', { class: 'contador' }, String(n)) : null),
      );
    }
  };

  const registrar = (a: Achado, sev: Severidade) => {
    (e.achados ??= {})[a.id] = { quando: new Date().toISOString(), severidade: sev };
    avisar(`Achado registrado: ${a.titulo}`);
    if (a.aoRegistrar) novaMensagem(a.aoRegistrar);
    const obrig = ato!.achados.filter((x) => !x.bonus);
    if (!e.ato1Concluido && obrig.every((x) => e.achados?.[x.id])) {
      e.ato1Concluido = true;
      for (const m of ato!.conclusao) novaMensagem(m);
    }
    achadoAberto = ato!.achados.find((x) => !e.achados?.[x.id])?.id ?? null;
    salvar(e);
    desenharPlacar();
    desenharConteudo();
  };

  const desenharConteudo = () => {
    limpar(conteudo);
    if (aba === 'caderno' && ato) {
      conteudo.append(
        caderno(ato, e, achadoAberto,
          (id) => { achadoAberto = id; desenharConteudo(); },
          (a) => { (e.dicas ??= {})[a.id] = (e.dicas[a.id] ?? 0) + 1; salvar(e); desenharConteudo(); },
          registrar,
          () => { e.lgpd = (e.lgpd ?? 0) + 1; salvar(e); desenharPlacar(); avisar('Evidência com CPF inteiro. Prova mínima é mascarada.', 'ruim'); }),
        e.ato1Concluido && c.ato2 ? h('div', { class: 'fim-ato' }, h('h3', {}, 'Ato 1 concluído'), h('p', {}, 'Reconhecimento fechado. Agora vem a parte que o cliente paga de verdade: o relatório.'), h('button', { class: 'botao', onclick: aoRelatorio }, '> escrever o relatório (Ato 2)')) : '',
        h('p', { class: 'dica-copia' }, 'Dica: selecionar texto no terminal já copia. Cole aqui com Ctrl+V.'),
      );
    } else if (aba === 'mensagens') {
      const ms = todas().slice().reverse();
      const m = ms.find((x) => x.id === aberta) ?? ms[0];
      if (m && !e.lidas.includes(m.id)) { e.lidas.push(m.id); salvar(e); }
      conteudo.append(
        h('div', { class: 'lista-mini' }, ...ms.map((x) => itemLista(c, x, e.lidas.includes(x.id), x === m, () => { aberta = x.id; desenharConteudo(); desenharAbas(); }))),
        m ? leitura(c, m) : h('p', {}, 'Nenhuma mensagem.'),
      );
    } else if (aba === 'contrato') {
      conteudo.append(documentoContrato(c), h('p', { class: 'assinatura' }, `Assinado por ${e.assinadoPor ?? '?'}.`));
    } else {
      const cmd = ultimoCmd ? explicar(ultimoCmd, c.manual ?? []) : null;
      conteudo.append(
        cmd
          ? h('section', { class: 'explica' }, h('p', { class: 'sobretitulo' }, 'você digitou'), h('code', {}, ultimoCmd!), h('h3', {}, cmd.nome), h('p', {}, cmd.resumo),
              ...cmd.exemplos.map((x) => h('p', { class: 'exemplo' }, h('code', {}, x.cmd), ' ', x.explica)),
              cmd.pratica ? h('p', { class: 'pratica' }, h('strong', {}, 'Boa prática: '), cmd.pratica) : null)
          : h('section', { class: 'explica' }, h('h3', {}, 'Manual do terminal'), h('p', {}, 'Digite um comando no terminal e a explicação aparece aqui. Comece por ', h('code', {}, 'pwd'), ', ', h('code', {}, 'ls -la'), ' e ', h('code', {}, 'cat /etc/hosts'), '.')),
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
    if (e.extras!.some((x) => x.id === m.id)) return;
    e.extras!.push(m);
    salvar(e);
    avisar(`Nova mensagem de ${pessoa(c, m.de).nome}`, 'ruim');
    desenharAbas();
    if (aba === 'mensagens') desenharConteudo();
  };

  const foraDoEscopo = (alvo: string, motivo: string) => {
    e.violacoes.push({ alvo, quando: new Date().toISOString() });
    ultimaViolacao = Date.now();
    const r = c.reacoes?.foraDoEscopo(alvo, motivo, e.violacoes.length);
    if (r) novaMensagem({ ...r, id: `${r.id}-${e.violacoes.length}` });
    salvar(e);
    desenharPlacar();
  };

  const reagir = (ev: EventoMundo) => {
    for (const r of ato?.reacoes ?? []) {
      if (e.disparadas!.includes(r.id) || !r.quando(ev)) continue;
      e.disparadas!.push(r.id);
      // pequena demora: ninguém responde WhatsApp na mesma hora
      setTimeout(() => novaMensagem(r.mensagem), 2500);
    }
  };

  raiz.append(
    h(
      'div',
      { class: 'mesa' },
      h('header', { class: 'topo' },
        h('h1', {}, 'escopo_fechado'),
        h('span', { class: 'caso' }, `${c.nome} · ${c.nivel}`),
        placar,
        h('button', { class: 'botao secundario pequeno', onclick: aoSair }, 'menu')),
      h('div', { class: 'mesa-corpo' },
        h('section', { class: 'lado-terminal' }, carregando, terminalEl),
        h('aside', { class: 'lado-caso' }, abas, conteudo)),
      avisos,
    ),
  );
  desenharPlacar();
  desenharAbas();
  desenharConteudo();
  const chuvaBoot = chuva(canvasChuva, { intensidade: 0.7 });

  const term = new Terminal({
    fontFamily: '"JetBrains Mono", "Cascadia Mono", Consolas, monospace',
    fontSize: 15,
    cursorBlink: true,
    theme: {
      background: '#000000', foreground: '#c8ffd4', cursor: '#00ff66', selectionBackground: '#00ff6644',
      green: '#00e05a', brightGreen: '#5dff9a', blue: '#3fbf7f', brightBlue: '#7dffb0', cyan: '#4fe0a0', brightCyan: '#9dffd0',
    },
    scrollback: 5000,
  });
  const fit = new FitAddon();
  term.loadAddon(fit);
  term.open(terminalEl);
  fit.fit();
  new ResizeObserver(() => fit.fit()).observe(terminalEl);
  term.onSelectionChange(() => {
    const s = term.getSelection();
    if (s) navigator.clipboard?.writeText(s).catch(() => {});
  });

  let ajustarTamanho = () => {};

  const aoEvento = (ev: EventoVM) => {
    if (ev.tipo === 'pronto') {
      chuvaBoot.parar();
      carregando.remove();
      fit.fit();
      setTimeout(() => { ajustarTamanho(); term.focus(); }, 800);
      avisar('VPN conectada. O notebook de teste é seu.');
    } else if (ev.tipo === 'cmd' && !comandoDoJogo(ev.comando)) {
      e.comandos++;
      ultimoCmd = ev.comando;
      const v = violacoes(ev.comando, c.escopo!)[0];
      if (v) foraDoEscopo(v.alvo, v.motivo ?? '');
      reagir({ tipo: 'cmd', comando: ev.comando });
      salvar(e);
      desenharPlacar();
      if (aba === 'manual') desenharConteudo();
    } else if (ev.tipo === 'http') {
      const motivo = c.hostsFora?.[ev.host];
      // o comando já foi acusado; o acesso HTTP só conta se veio por outro caminho
      if (motivo && Date.now() - ultimaViolacao > 20_000) foraDoEscopo(ev.host, motivo);
      reagir({ tipo: 'http', host: ev.host, caminho: ev.caminho, agente: ev.agente });
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
