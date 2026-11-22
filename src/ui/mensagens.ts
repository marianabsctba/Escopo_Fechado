// Caixa de mensagens (WhatsApp e e-mail) usada no contrato e na mesa.
import type { Cenario, Mensagem, Personagem } from '../motor/tipos';
import { h, paragrafos } from './dom';

export function pessoa(c: Cenario, id: string): Personagem {
  return c.personagens?.find((p) => p.id === id) ?? { id, nome: id, papel: '', cor: '#888' };
}

export function avatar(p: Personagem): HTMLElement {
  const ini = p.nome.replace(/^(Seu|Dona|Dra\.)\s+/, '').slice(0, 1).toUpperCase();
  return h('span', { class: 'avatar', style: `background:${p.cor}` }, ini);
}

export function itemLista(c: Cenario, m: Mensagem, lida: boolean, ativa: boolean, aoAbrir: () => void): HTMLElement {
  const p = pessoa(c, m.de);
  const previa = m.assunto ?? m.texto[0];
  return h(
    'button',
    { class: `msg-item${lida ? '' : ' nova'}${ativa ? ' ativa' : ''}`, onclick: aoAbrir },
    avatar(p),
    h(
      'span',
      { class: 'msg-item-txt' },
      h('strong', {}, p.nome, h('span', { class: `canal canal-${m.canal}` }, m.canal === 'email' ? 'e-mail' : 'WhatsApp')),
      h('span', { class: 'previa' }, previa),
    ),
  );
}

export function leitura(c: Cenario, m: Mensagem, extra?: HTMLElement): HTMLElement {
  const p = pessoa(c, m.de);
  if (m.canal === 'whatsapp') {
    return h(
      'article',
      { class: 'leitura zap' },
      h('header', {}, avatar(p), h('div', {}, h('strong', {}, p.nome), h('small', {}, p.papel))),
      h('div', { class: 'baloes' }, ...m.texto.map((t) => h('div', { class: 'balao' }, ...paragrafos([t])))),
      extra,
    );
  }
  return h(
    'article',
    { class: 'leitura email' },
    h('header', {}, avatar(p), h('div', {}, h('strong', {}, m.assunto ?? ''), h('small', {}, `${p.nome}, ${p.papel}`))),
    h('div', { class: 'corpo' }, ...paragrafos(m.texto)),
    extra,
  );
}
