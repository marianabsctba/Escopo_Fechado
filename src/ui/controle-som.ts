// Controle flutuante da trilha sonora: mudo, volume, faixa atual e próxima faixa.
// Fica fora de #app, então sobrevive às trocas de tela.
import { trilha, type EstadoSom } from '../som/motor';
import { h } from './dom';

const PASSO = 0.05;
const SVG = 'http://www.w3.org/2000/svg';

function icone(mudo: boolean): SVGSVGElement {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('aria-hidden', 'true');
  const caminho = (d: string) => {
    const p = document.createElementNS(SVG, 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '1.5');
    svg.append(p);
  };
  caminho('M2 6h3l4-3v10l-4-3H2z');
  if (mudo) caminho('M11 6l4 4M15 6l-4 4');
  else { caminho('M11 5.5a3.5 3.5 0 0 1 0 5'); caminho('M12.5 3.5a6 6 0 0 1 0 9'); }
  return svg;
}

export function controleSom(): void {
  if (!trilha.estado().disponivel || document.querySelector('.som')) return;

  const mudo = h('button', { class: 'som-botao', type: 'button', onclick: () => trilha.alternarMudo() });
  const menos = h('button', { class: 'som-botao', type: 'button', onclick: () => trilha.definirVolume(trilha.estado().volume - PASSO) }, '-');
  const nivel = h('span', { class: 'som-nivel', 'aria-hidden': 'true' });
  const mais = h('button', { class: 'som-botao', type: 'button', onclick: () => trilha.definirVolume(trilha.estado().volume + PASSO) }, '+');
  const nome = h('span', { class: 'som-faixa', 'aria-live': 'polite' });
  const proxima = h('button', { class: 'som-botao', type: 'button', 'aria-label': 'Próxima faixa', title: 'Próxima faixa', onclick: () => trilha.proxima() }, '>>');
  const caixa = h('div', { class: 'som', role: 'group', 'aria-label': 'Trilha sonora' }, mudo, menos, nivel, mais, nome, proxima);
  document.body.append(caixa);

  trilha.aoMudar((e: EstadoSom) => {
    const pct = Math.round(e.volume * 100);
    mudo.replaceChildren(icone(e.mudo));
    mudo.setAttribute('aria-label', e.mudo ? 'Ligar o som' : 'Desligar o som');
    mudo.title = e.mudo ? 'Ligar o som' : 'Desligar o som';
    nivel.textContent = e.mudo ? 'mudo' : `${pct}%`;
    menos.setAttribute('aria-label', `Diminuir o volume, agora em ${pct}%`);
    mais.setAttribute('aria-label', `Aumentar o volume, agora em ${pct}%`);
    menos.title = 'Diminuir o volume';
    mais.title = 'Aumentar o volume';
    nome.textContent = `♪ ${e.faixa.nome}`;
    nome.title = e.liberado ? `Tocando: ${e.faixa.nome}` : 'A música começa no seu primeiro clique ou tecla';
    caixa.classList.toggle('mudo', e.mudo);
    caixa.classList.toggle('esperando', !e.liberado);
  });
}
