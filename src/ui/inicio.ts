// Tela inicial: escolha do cliente (cada um é um nível).
import { cenarios, rotuloNivel } from '../cenarios';
import type { Cenario } from '../motor/tipos';
import { h, limpar } from './dom';

export function telaInicio(raiz: HTMLElement, temProgresso: boolean, aoEscolher: (c: Cenario, recomecar: boolean) => void): void {
  limpar(raiz);
  raiz.append(
    h(
      'div',
      { class: 'inicio' },
      h('header', {},
        h('p', { class: 'sobretitulo' }, 'Pente Fino Segurança da Informação'),
        h('h1', {}, 'Escopo Fechado'),
        h('p', { class: 'chamada' }, 'A sua consultoria é paga para invadir empresas. Com contrato, escopo e relatório. O cliente é que nem sempre ajuda.'),
        h('p', { class: 'nota' }, 'Os comandos são de verdade: o seu notebook de teste é um Linux rodando aqui no navegador. Nada sai da sua máquina.')),
      h('div', { class: 'cartoes' },
        ...cenarios.map((c) =>
          h('article', { class: `cartao${c.disponivel ? '' : ' bloqueado'}` },
            h('span', { class: `nivel nivel-${c.nivel}` }, rotuloNivel[c.nivel]),
            h('h2', {}, c.nome),
            h('p', { class: 'local' }, c.local),
            h('p', {}, c.chamada),
            c.disponivel
              ? h('div', { class: 'acoes' },
                  h('button', { class: 'botao', onclick: () => aoEscolher(c, false) }, temProgresso ? 'Continuar' : 'Aceitar o trabalho'),
                  temProgresso ? h('button', { class: 'botao secundario', onclick: () => { if (confirm('Apagar o progresso e começar do contrato?')) aoEscolher(c, true); } }, 'Recomeçar') : null)
              : h('p', { class: 'embreve' }, 'Em negociação com o cliente (em breve)'))),
      ),
      h('footer', {}, 'Powered by Mariana BS. Empresas, pessoas e endereços são fictícios.'),
    ),
  );
}
