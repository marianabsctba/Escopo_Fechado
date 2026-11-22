// Mesa de trabalho: terminal real à esquerda, painel do caso à direita.
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import type { Achado, Cenario, EventoMundo, Mensagem, Severidade, Status } from '../motor/tipos';
import { type Estado, salvar, prudencia, pontosEscopo, pontosLgpd, pontosRuido, explicar } from '../motor/estado';
import { violacoes } from '../motor/escopo';
import { MaquinaVM, type EventoVM } from '../motor/vm';
import { h, limpar } from './dom';
import { itemLista, leitura, pessoa } from './mensagens';
import { documentoContrato } from './contrato';
import { caderno } from './caderno';
import { chuva } from './chuva';
import { rotuloNivel } from '../cenarios';

type Aba = 'caderno' | 'mensagens' | 'manual' | 'contrato';

/** Comandos que o próprio jogo digita não contam. */
export function comandoDoJogo(cmd: string): boolean {
  return /^\s*stty rows \d+ cols \d+; clear$/.test(cmd);
}

export function telaMesa(raiz: HTMLElement, c: Cenario, e: Estado, aoSair: () => void, aoRelatorio: () => void): void {
  limpar(raiz);
  const reteste = e.fase === 'reteste' && !!c.ato3;
  const ato = reteste ? c.ato3 : c.ato1;
  const concluido = () => (reteste ? !!e.ato3Concluido : !!e.ato1Concluido);
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

  const totalDicas = () => Object.values(e.dicas ?? {}).reduce((s, n) => s + n, 0);
  const desenharPlacar = () => {
    limpar(placar);
    const obrig = ato?.achados.filter((a) => !a.bonus) ?? [];
    const feitos = obrig.filter((a) => e.achados?.[a.id]).length;
    placar.append(
      h('span', { title: 'Respostas do checklist do contrato' }, 'prudência ', h('b', {}, String(prudencia(e)))),
      h('span', { title: 'Cada saída do escopo custa pontos' }, 'escopo ', h('b', { class: e.violacoes.length ? 'ruim' : '' }, String(pontosEscopo(e)))),
      h('span', { title: 'Evidência com dado pessoal exposto custa pontos' }, 'lgpd ', h('b', { class: e.lgpd ? 'ruim' : '' }, String(pontosLgpd(e)))),
      c.soc ? h('span', { title: `Chamados abertos pelo ${c.soc.nome}` }, 'discrição ', h('b', { class: e.ruido ? 'ruim' : '' }, String(pontosRuido(e)))) : '',
      c.nivel !== 'iniciante' ? h('span', { title: 'Dicas usadas (custam pontos neste nível)' }, 'dicas ', h('b', { class: totalDicas() ? 'ruim' : '' }, String(totalDicas()))) : '',
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

  const registrar = (a: Achado, valor: Severidade | Status) => {
    (e.achados ??= {})[a.id] = reteste
      ? { quando: new Date().toISOString(), status: valor as Status }
      : { quando: new Date().toISOString(), severidade: valor as Severidade };
    avisar(`Registrado: ${a.titulo}`);
    if (a.aoRegistrar) novaMensagem(a.aoRegistrar);
    const obrig = ato!.achados.filter((x) => !x.bonus);
    if (!concluido() && obrig.every((x) => e.achados?.[x.id])) {
      if (reteste) e.ato3Concluido = true; else e.ato1Concluido = true;
      for (const m of ato!.conclusao) novaMensagem(m);
    }
    achadoAberto = ato!.achados.find((x) => !e.achados?.[x.id])?.id ?? null;
    salvar(e);
    desenharPlacar();
    desenharConteudo();
  };

  const fimDoAto = (): HTMLElement | string => {
    if (!reteste && e.ato1Concluido && c.ato2) {
      return h('div', { class: 'fim-ato' }, h('h3', {}, 'Ato 1 concluído'),
        h('p', {}, 'Reconhecimento fechado. Agora vem a parte que o cliente paga de verdade: o relatório.'),
        h('button', { class: 'botao', onclick: aoRelatorio }, e.relatorio?.concluido ? '> rever o relatório (Ato 2)' : '> escrever o relatório (Ato 2)'));
    }
    if (reteste && e.ato3Concluido) {
      return h('div', { class: 'fim-ato fim-cliente' },
        h('p', { class: 'sobretitulo' }, 'Boi na Nuvem: trabalho encerrado'),
        h('h3', {}, 'Contrato cumprido'),
        h('p', {}, `Nota do relatório: ${e.relatorio?.nota ?? '?'} · escopo ${pontosEscopo(e)} · lgpd ${pontosLgpd(e)} · prudência ${prudencia(e)}`),
        h('p', {}, 'Você fez o ciclo inteiro de um pentest: contrato, reconhecimento, relatório, reunião e reteste. O próximo cliente, a cooperativa Pinhão Forte, está em negociação.'),
        h('button', { class: 'botao secundario', onclick: aoSair }, 'voltar à capa'));
    }
    return '';
  };

  const desenharConteudo = () => {
    limpar(conteudo);
    if (aba === 'caderno' && ato) {
      conteudo.append(
        caderno(ato, e, achadoAberto,
          (id) => { achadoAberto = id; desenharConteudo(); },
          (a) => { (e.dicas ??= {})[a.id] = (e.dicas[a.id] ?? 0) + 1; salvar(e); desenharConteudo(); desenharPlacar(); },
          registrar,
          () => { e.lgpd = (e.lgpd ?? 0) + 1; salvar(e); desenharPlacar(); avisar('Evidência com dado pessoal exposto. Prova mínima é mascarada.', 'ruim'); },
          c.nivel !== 'iniciante'),
        fimDoAto(),
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

  // SOC do cliente: conta requisições numa janela e reage a varredura agressiva
  let acessos: number[] = [];
  let ultimoChamado = 0;
  const alertaSoc = (motivo: string) => {
    if (!c.soc || Date.now() - ultimoChamado < 60_000) return;
    ultimoChamado = Date.now();
    acessos = [];
    e.ruido = (e.ruido ?? 0) + 1;
    const m = c.soc.chamado(e.ruido, motivo);
    novaMensagem({ ...m, id: `${m.id}-${e.ruido}` });
    salvar(e);
    desenharPlacar();
  };
  const contarAcesso = () => {
    if (!c.soc) return;
    const agora = Date.now();
    acessos = acessos.filter((t) => agora - t < c.soc!.janelaSeg * 1000);
    acessos.push(agora);
    if (acessos.length > c.soc.limite) alertaSoc(`${acessos.length} requisições em menos de ${c.soc.janelaSeg} segundos`);
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
        h('span', { class: 'caso' }, `${c.nome} · ${rotuloNivel[c.nivel].toLowerCase()}`),
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
  // mensagens de abertura do ato (chegam uma vez)
  for (const m of ato?.abertura ?? []) setTimeout(() => novaMensagem(m), 1500);

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
      // ajusta o tamanho do terminal ainda com a tela de carga na frente,
      // para o comando do jogo não se misturar com o que a pessoa digitar
      fit.fit();
      setTimeout(() => ajustarTamanho(), 400);
      setTimeout(() => {
        chuvaBoot.parar();
        carregando.remove();
        term.focus();
        avisar('VPN conectada. O notebook de teste é seu.');
      }, 1400);
    } else if (ev.tipo === 'cmd' && !comandoDoJogo(ev.comando)) {
      e.comandos++;
      ultimoCmd = ev.comando;
      const v = violacoes(ev.comando, c.escopo!)[0];
      if (v) foraDoEscopo(v.alvo, v.motivo ?? '');
      if (c.soc && c.soc.barulhento.test(ev.comando)) alertaSoc('varredura agressiva detectada');
      reagir({ tipo: 'cmd', comando: ev.comando });
      salvar(e);
      desenharPlacar();
      if (aba === 'manual') desenharConteudo();
    } else if (ev.tipo === 'http') {
      const motivo = c.hostsFora?.[ev.host];
      // o comando já foi acusado; o acesso HTTP só conta se veio por outro caminho
      if (motivo && Date.now() - ultimaViolacao > 20_000) foraDoEscopo(ev.host, motivo);
      contarAcesso();
      reagir({ tipo: 'http', host: ev.host, caminho: ev.caminho, agente: ev.agente });
    }
  };

  const barra = carregando.querySelector('.barra span') as HTMLElement;
  const vm = new MaquinaVM({
    cenario: c.id,
    aoProgresso: (f) => { barra.style.width = `${Math.round(f * 100)}%`; },
    aoTerminal: (b) => term.write(b),
    aoEvento,
    fase: reteste ? 'reteste' : 'teste',
  });
  term.onData((d) => vm.digitar(d));
  // Serial não avisa mudança de tamanho; o less e o nano precisam saber.
  ajustarTamanho = () => vm.digitar(` stty rows ${term.rows} cols ${term.cols}; clear\n`);
}
