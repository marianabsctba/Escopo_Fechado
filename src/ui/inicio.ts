// Capa: chuva de letras, título com brilho e a escolha do cliente (nível).
import { cenarios, rotuloNivel } from '../cenarios';
import type { Cenario } from '../motor/tipos';
import { h, limpar } from './dom';
import { chuva } from './chuva';

const LINHAS = [
  '> pente_fino --novo-cliente',
  '> carregando contrato... ok',
  '> conferindo escopo... ok',
  '> sua consultoria é paga para invadir empresas.',
  '> com contrato, escopo e relatório.',
  '> o cliente é que nem sempre ajuda.',
];

export function telaInicio(raiz: HTMLElement, temProgresso: boolean, aoEscolher: (c: Cenario, recomecar: boolean) => void): void {
  limpar(raiz);
  const canvas = h('canvas', { class: 'chuva', 'aria-hidden': 'true' });
  const console_ = h('pre', { class: 'console-capa', 'aria-label': LINHAS.join(' ') });
  const tela = h(
    'div',
    { class: 'capa' },
    canvas,
    h('div', { class: 'capa-conteudo' },
      h('header', { class: 'capa-topo' },
        h('h1', { class: 'titulo-capa', 'data-texto': 'ESCOPO FECHADO' }, 'ESCOPO FECHADO'),
        h('p', { class: 'powered' }, h('span', {}, 'Powered by'), ' Mariana BS'),
        console_,
        h('p', { class: 'nota-capa' }, 'Os comandos são de verdade: o seu notebook de teste é um Linux rodando aqui no navegador. Nada sai da sua máquina.')),
      h('div', { class: 'cartoes' },
        ...cenarios.map((c) =>
          h('article', { class: `cartao${c.disponivel ? '' : ' bloqueado'}` },
            h('span', { class: `nivel nivel-${c.nivel}` }, `[ ${rotuloNivel[c.nivel].toUpperCase()} ]`),
            h('h2', {}, c.nome),
            h('p', { class: 'local' }, c.local),
            h('p', {}, c.chamada),
            c.disponivel
              ? h('div', { class: 'acoes' },
                  h('button', { class: 'botao', onclick: () => { parar(); aoEscolher(c, false); } }, temProgresso ? '> continuar' : '> aceitar o trabalho'),
                  temProgresso ? h('button', { class: 'botao secundario', onclick: () => { if (confirm('Apagar o progresso e começar do contrato?')) { parar(); aoEscolher(c, true); } } }, 'recomeçar') : null)
              : h('p', { class: 'embreve' }, '// em negociação com o cliente')))),
      h('footer', { class: 'rodape-capa' }, 'Empresas, pessoas, domínios e endereços são fictícios. ', h('a', { href: 'https://github.com/marianabsctba/Escopo_Fechado' }, 'código no GitHub'))),
  );
  raiz.append(tela);
  const ch = chuva(canvas);

  // console digitando as linhas
  let ativo = true;
  const parar = () => { ativo = false; ch.parar(); };
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduzir) {
    console_.textContent = LINHAS.join('\n');
  } else {
    let l = 0;
    let i = 0;
    const passo = () => {
      if (!ativo) return;
      if (l >= LINHAS.length) { console_.classList.add('fim'); return; }
      i++;
      console_.textContent = LINHAS.slice(0, l).join('\n') + (l ? '\n' : '') + LINHAS[l].slice(0, i);
      if (i >= LINHAS[l].length) { l++; i = 0; setTimeout(passo, 260); } else setTimeout(passo, 22 + Math.random() * 30);
    };
    setTimeout(passo, 500);
  }
}
