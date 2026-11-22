// Ato 2: montar o relatório seção por seção, escrever o sumário executivo
// e conduzir a reunião de entrega.
import type { Cenario, ItemRelatorio, Pergunta } from '../motor/tipos';
import { type Estado, salvar } from '../motor/estado';
import { METRICAS, classificacao, lerVetor, pontuar, vetorTexto, type Vetor } from '../motor/cvss';
import {
  type EstadoItem, finalPara, itemCompleto, itensDoRelatorio, notaFinal, notaItem, novoItem, ordemCerta, respondeu,
} from '../motor/relatorio';
import { h, limpar } from './dom';
import { avatar, leitura, pessoa } from './mensagens';

type Passo =
  | { tipo: 'cvss' | 'passos' | 'evidencia' | 'recomendacao'; item: ItemRelatorio }
  | { tipo: 'sumario' }
  | { tipo: 'sumario-retorno' }
  | { tipo: 'reuniao'; p: Pergunta & { de: string } }
  | { tipo: 'final' };

/** Embaralha de forma estável (mesma ordem a cada visita). */
function embaralhar(n: number, semente: string): number[] {
  let s = [...semente].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) >>> 0;
    const j = s % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  if (idx.every((v, i) => v === i) && n > 1) idx.reverse();
  return idx;
}

export function telaRelatorio(raiz: HTMLElement, c: Cenario, e: Estado, aoVoltar: () => void, aoReteste: () => void): void {
  const ato = c.ato2!;
  const r = (e.relatorio ??= { itens: {} });
  const itens = itensDoRelatorio(ato, e);
  let retorno: { texto: string; certa: boolean } | null = null;
  let ordem: number[] = [];
  let vetor: Vetor = lerVetor('CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N');

  const st = (i: ItemRelatorio): EstadoItem => (r.itens[i.achado] ??= novoItem());

  const passoAtual = (): Passo => {
    for (const item of itens) {
      const s = st(item);
      if (item.cvss && !s.cvssOk) return { tipo: 'cvss', item };
      if (!s.passosOk) return { tipo: 'passos', item };
      if (!respondeu(item.evidencia, e)) return { tipo: 'evidencia', item };
      if (!respondeu(item.recomendacao, e)) return { tipo: 'recomendacao', item };
    }
    if (!r.sumario) return { tipo: 'sumario' };
    if (!e.lidas.includes('sumario-visto')) return { tipo: 'sumario-retorno' };
    const p = ato.reuniao.find((x) => !respondeu(x, e));
    if (p) return { tipo: 'reuniao', p };
    return { tipo: 'final' };
  };

  const tituloAchado = (item: ItemRelatorio) => c.ato1?.achados.find((a) => a.id === item.achado)?.titulo ?? item.achado;

  const pergunta = (p: Pergunta, cabecalho: HTMLElement | null) => {
    const tentadas = e.tentativas[p.id] ?? [];
    return h('div', { class: 'leitura pergunta' },
      cabecalho,
      h('p', { class: 'situacao' }, p.situacao),
      h('div', { class: 'alternativas' },
        ...p.alternativas.map((alt, i) =>
          h('button', {
            class: `alt${tentadas.includes(i) ? (alt.certa ? ' certa' : ' errada') : ''}`,
            disabled: tentadas.includes(i),
            onclick: () => { (e.tentativas[p.id] ??= []).push(i); retorno = { texto: alt.retorno, certa: alt.certa }; desenhar(); },
          }, alt.texto))));
  };

  let vetorDe = '';
  const calculadora = (item: ItemRelatorio) => {
    const s = st(item);
    if (vetorDe !== item.achado) {
      vetorDe = item.achado;
      vetor = lerVetor(s.vetor ?? 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N');
    }
    const cv = item.cvss!;
    const nota = pontuar(vetor);
    const caixa = h('div', { class: 'leitura cvss' },
      h('p', { class: 'sobretitulo' }, 'Severidade (CVSS 3.1)'),
      h('p', {}, 'Monte o vetor do achado. A nota é calculada com a fórmula oficial do CVSS 3.1.'),
      ...METRICAS.map((m) =>
        h('div', { class: 'metrica' },
          h('span', { class: 'metrica-nome' }, m.nome),
          h('div', { class: 'segmentos', role: 'radiogroup', 'aria-label': m.nome },
            ...m.opcoes.map((o) =>
              h('button', {
                role: 'radio', 'aria-checked': String(vetor[m.id] === o.v), title: o.explica,
                class: vetor[m.id] === o.v ? 'ativo' : '',
                onclick: () => { vetor = { ...vetor, [m.id]: o.v }; desenhar(); },
              }, o.nome))),
          h('small', {}, m.opcoes.find((o) => o.v === vetor[m.id])?.explica ?? ''))),
      h('p', { class: 'nota-cvss' }, h('code', {}, vetorTexto(vetor)), h('strong', {}, ` ${nota.toFixed(1)} `), classificacao(nota)),
      s.cvssTentativas >= 2 ? h('p', { class: 'nota-sev' }, 'A Tânia sugere: ', h('code', {}, cv.sugerido), ' ', cv.explica) : '',
      h('button', {
        class: 'botao',
        onclick: () => {
          s.cvssTentativas++;
          s.vetor = vetorTexto(vetor);
          if (nota >= cv.min && nota <= cv.max) {
            s.cvssOk = true;
            retorno = { certa: true, texto: `${nota.toFixed(1)} (${classificacao(nota)}). ${cv.explica}` };
          } else {
            retorno = { certa: false, texto: `${nota.toFixed(1)} (${classificacao(nota)}) não combina com esse achado. Releia o que o achado permite: precisa de login? Vaza o quê? Altera ou derruba alguma coisa?` };
          }
          desenhar();
        },
      }, 'Confirmar severidade'));
    return caixa;
  };

  const montarPassos = (item: ItemRelatorio) => {
    const s = st(item);
    const embaralhado = embaralhar(item.passos.length, item.achado);
    return h('div', { class: 'leitura passos-repro' },
      h('p', { class: 'sobretitulo' }, 'Passos para reproduzir'),
      h('p', {}, 'Clique nos passos na ordem em que alguém do TI deveria seguir para ver o problema com os próprios olhos.'),
      h('ol', { class: 'montados' }, ...ordem.map((i) => h('li', {}, item.passos[i]))),
      h('div', { class: 'alternativas' },
        ...embaralhado.filter((i) => !ordem.includes(i)).map((i) =>
          h('button', {
            class: 'alt',
            onclick: () => {
              ordem.push(i);
              if (ordem.length === item.passos.length) {
                if (ordemCerta(item, ordem)) { s.passosOk = true; retorno = { certa: true, texto: 'Ordem certa. Qualquer pessoa do TI consegue reproduzir.' }; }
                else { s.passosErros++; retorno = { certa: false, texto: 'A ordem não fecha: pense no que precisa existir antes de cada passo.' }; }
                ordem = [];
              }
              desenhar();
            },
          }, item.passos[i]))),
      ordem.length ? h('button', { class: 'botao secundario pequeno', onclick: () => { ordem = []; desenhar(); } }, 'recomeçar a ordem') : '');
  };

  const sumario = () => {
    const marcadas = new Set<number>();
    return h('div', { class: 'leitura sumario' },
      h('p', { class: 'sobretitulo' }, 'Sumário executivo'),
      h('p', { class: 'situacao' }, ato.sumario.pedido),
      ...ato.sumario.frases.map((f, i) => {
        const cx = h('input', { type: 'checkbox', id: `fr-${i}` });
        cx.addEventListener('change', () => (cx.checked ? marcadas.add(i) : marcadas.delete(i)));
        return h('label', { class: 'frase', for: `fr-${i}` }, cx, h('span', {}, f.texto));
      }),
      h('button', { class: 'botao', onclick: () => { r.sumario = [...marcadas]; retorno = null; desenhar(); } }, 'Fechar o sumário'));
  };

  const sumarioRetorno = () =>
    h('div', { class: 'leitura sumario' },
      h('p', { class: 'sobretitulo' }, 'Revisão da Tânia'),
      ...ato.sumario.frases.map((f, i) => {
        const marcada = r.sumario!.includes(i);
        const acertou = marcada === f.boa;
        return h('div', { class: `frase-retorno ${acertou ? 'ok' : 'nao'}` },
          h('p', {}, h('strong', {}, marcada ? '[incluída] ' : '[fora] '), f.texto),
          h('p', { class: 'mini' }, acertou ? '✔ ' : '✘ ', f.retorno));
      }),
      h('button', { class: 'botao', onclick: () => { e.lidas.push('sumario-visto'); desenhar(); } }, 'Ir para a reunião de entrega'));

  const final = () => {
    const nota = notaFinal(ato, e, r);
    const f = finalPara(ato, nota);
    if (!r.concluido) { r.concluido = true; r.nota = nota; salvar(e); }
    return h('div', { class: 'leitura final' },
      h('p', { class: 'sobretitulo' }, `Nota do relatório: ${nota}/100`),
      h('h2', {}, f.titulo),
      ...f.texto.map((t) => h('p', {}, t)),
      h('h3', {}, 'Por seção'),
      h('ul', { class: 'manual' }, ...itens.map((i) => h('li', {}, `${tituloAchado(i)}: ${notaItem(i, r.itens[i.achado], e)}/100`))),
      h('div', { class: 'acoes' },
        c.ato3
          ? h('button', { class: 'botao', onclick: aoReteste }, '> agendar o reteste (Ato 3)')
          : h('button', { class: 'botao', disabled: true }, 'reteste (Ato 3) em construção'),
        h('button', { class: 'botao secundario', onclick: aoVoltar }, 'voltar para a mesa')));
  };

  const desenhar = () => {
    salvar(e);
    limpar(raiz);
    const passo = passoAtual();
    let painel: HTMLElement;
    let cab: HTMLElement | null = null;
    if (passo.tipo === 'cvss' || passo.tipo === 'passos' || passo.tipo === 'evidencia' || passo.tipo === 'recomendacao') {
      cab = h('header', { class: 'cab-secao' }, h('p', { class: 'sobretitulo' }, `Seção ${itens.indexOf(passo.item) + 1} de ${itens.length}`), h('h2', {}, tituloAchado(passo.item)));
    }
    if (passo.tipo === 'cvss') painel = calculadora(passo.item);
    else if (passo.tipo === 'passos') painel = montarPassos(passo.item);
    else if (passo.tipo === 'evidencia') painel = pergunta(passo.item.evidencia, h('p', { class: 'sobretitulo' }, 'Evidência'));
    else if (passo.tipo === 'recomendacao') painel = pergunta(passo.item.recomendacao, h('p', { class: 'sobretitulo' }, 'Recomendação'));
    else if (passo.tipo === 'sumario') painel = sumario();
    else if (passo.tipo === 'sumario-retorno') painel = sumarioRetorno();
    else if (passo.tipo === 'reuniao') {
      const p = pessoa(c, passo.p.de);
      painel = pergunta(passo.p, h('header', {}, avatar(p), h('div', {}, h('strong', {}, p.nome), h('small', {}, 'Reunião de entrega, 9h'))));
    } else painel = final();

    const indice = h('nav', { class: 'caixa indice' },
      h('h2', {}, 'Relatório'),
      h('ol', {},
        ...itens.map((i) => h('li', { class: itemCompleto(i, r.itens[i.achado], e) ? 'feito' : passo.tipo !== 'final' && 'item' in passo && passo.item === i ? 'atual' : '' }, tituloAchado(i))),
        h('li', { class: r.sumario ? 'feito' : passo.tipo === 'sumario' ? 'atual' : '' }, 'Sumário executivo'),
        h('li', { class: ato.reuniao.every((x) => respondeu(x, e)) ? 'feito' : passo.tipo === 'reuniao' ? 'atual' : '' }, 'Reunião de entrega')),
      h('div', { class: 'msg-relatorio' }, ...ato.abertura.map((m) => leitura(c, m))));

    const fb = retorno
      ? h('div', { class: `retorno ${retorno.certa ? 'ok' : 'nao'}`, role: 'status' }, h('strong', {}, retorno.certa ? 'Certo.' : 'Não.'), ' ', retorno.texto)
      : null;

    raiz.append(
      h('div', { class: 'ato0' },
        h('header', { class: 'topo' }, h('h1', {}, ato.titulo), h('span', { class: 'caso' }, c.nome),
          h('button', { class: 'botao secundario pequeno', style: 'margin-left:auto', onclick: aoVoltar }, 'mesa')),
        h('div', { class: 'ato0-corpo' }, indice, h('main', { class: 'painel' }, fb, cab, painel))),
    );
  };

  desenhar();
}
