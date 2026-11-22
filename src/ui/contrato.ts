// Ato 0: ler as mensagens, ler as Regras de Engajamento, passar pelo
// checklist de escopo, responder ao pedido do cliente e assinar.
import type { Cenario, Pergunta } from '../motor/tipos';
import { type Estado, salvar } from '../motor/estado';
import { h, limpar } from './dom';
import { itemLista, leitura, pessoa, avatar } from './mensagens';

export function documentoContrato(c: Cenario): HTMLElement {
  const k = c.contrato!;
  return h(
    'div',
    { class: 'documento' },
    h('h2', {}, k.titulo),
    h('p', { class: 'janela' }, 'Janela de testes: ', h('strong', {}, k.janela)),
    ...k.secoes.map((s) => h('section', {}, h('h3', {}, s.titulo), h('ul', {}, ...s.itens.map((i) => h('li', {}, i))))),
  );
}

export function respondida(e: Estado, p: Pergunta): boolean {
  const t = e.tentativas[p.id] ?? [];
  return t.some((i) => p.alternativas[i]?.certa);
}

type Etapa = 'caixa' | 'contrato' | 'checklist' | 'pedido' | 'assinar' | 'pronto';

export function etapaAtual(c: Cenario, e: Estado): Etapa {
  const a0 = c.ato0!;
  if (!a0.abertura.every((m) => e.lidas.includes(m.id)) || !e.lidas.includes('anexo')) return 'caixa';
  if (!e.lidas.includes('contrato')) return 'contrato';
  if (!a0.perguntas.every((p) => respondida(e, p))) return 'checklist';
  if (!respondida(e, a0.pedidoIndecente)) return 'pedido';
  if (!e.assinadoPor) return 'assinar';
  return 'pronto';
}

const PASSOS: [Etapa, string][] = [
  ['caixa', 'Mensagens'],
  ['contrato', 'Regras de Engajamento'],
  ['checklist', 'Checklist'],
  ['pedido', 'Pedido do cliente'],
  ['assinar', 'Assinatura'],
];

export function telaContrato(raiz: HTMLElement, c: Cenario, e: Estado, aoConcluir: () => void): void {
  const a0 = c.ato0!;
  let aberta = a0.abertura.find((m) => !e.lidas.includes(m.id))?.id ?? a0.abertura[0].id;
  let retorno: { texto: string; certa: boolean } | null = null;

  const desenhar = () => {
    salvar(e);
    limpar(raiz);
    const etapa = etapaAtual(c, e);
    const idx = PASSOS.findIndex(([p]) => p === etapa);

    const passos = h(
      'ol',
      { class: 'passos' },
      ...PASSOS.map(([p, nome], i) => h('li', { class: i < idx || etapa === 'pronto' ? 'feito' : i === idx ? 'atual' : '' }, nome)),
    );

    const lista = h(
      'nav',
      { class: 'caixa' },
      h('h2', {}, 'Caixa de entrada'),
      ...a0.abertura.map((m) =>
        itemLista(c, m, e.lidas.includes(m.id), etapa === 'caixa' && aberta === m.id, () => {
          aberta = m.id;
          if (!e.lidas.includes(m.id)) e.lidas.push(m.id);
          retorno = null;
          desenhar();
        }),
      ),
      ...(etapa === 'pronto' ? a0.assinado : []).map((m) => itemLista(c, m, true, false, () => {})),
    );

    let painel: HTMLElement;
    if (etapa === 'caixa') {
      const m = a0.abertura.find((x) => x.id === aberta)!;
      if (!e.lidas.includes(m.id)) e.lidas.push(m.id);
      const prox = a0.abertura.find((x) => !e.lidas.includes(x.id));
      painel = leitura(
        c,
        m,
        prox
          ? h('button', { class: 'botao secundario', onclick: () => { aberta = prox.id; e.lidas.push(prox.id); desenhar(); } }, 'Próxima mensagem')
          : h('button', { class: 'botao', onclick: () => { e.lidas.push('anexo'); desenhar(); } }, 'Abrir o anexo: Regras de Engajamento'),
      );
      salvar(e);
    } else if (etapa === 'contrato') {
      painel = h(
        'div',
        { class: 'leitura' },
        documentoContrato(c),
        h('button', { class: 'botao', onclick: () => { e.lidas.push('contrato'); desenhar(); } }, 'Li tudo. Ir para o checklist'),
      );
    } else if (etapa === 'checklist' || etapa === 'pedido') {
      const p = etapa === 'pedido' ? a0.pedidoIndecente : a0.perguntas.find((x) => !respondida(e, x))!;
      const num = a0.perguntas.indexOf(p) + 1;
      const tentadas = e.tentativas[p.id] ?? [];
      painel = h(
        'div',
        { class: 'leitura pergunta' },
        etapa === 'pedido'
          ? h('header', {}, avatar(pessoa(c, 'dirceu')), h('div', {}, h('strong', {}, 'Seu Dirceu'), h('small', {}, 'WhatsApp, 21h47')))
          : h('p', { class: 'sobretitulo' }, `Checklist antes de assinar, ${num} de ${a0.perguntas.length}`),
        h('p', { class: 'situacao' }, p.situacao),
        h(
          'div',
          { class: 'alternativas' },
          ...p.alternativas.map((alt, i) =>
            h(
              'button',
              {
                class: `alt${tentadas.includes(i) ? (alt.certa ? ' certa' : ' errada') : ''}`,
                disabled: tentadas.includes(i),
                onclick: () => {
                  (e.tentativas[p.id] ??= []).push(i);
                  retorno = { texto: alt.retorno, certa: alt.certa };
                  desenhar();
                },
              },
              alt.texto,
            ),
          ),
        ),
      );
    } else if (etapa === 'assinar') {
      const campo = h('input', { type: 'text', placeholder: 'Seu nome ou apelido', maxlength: '40', 'aria-label': 'Nome para assinatura' });
      const ciente = h('input', { type: 'checkbox', id: 'ciente' });
      const erro = h('p', { class: 'erro' });
      painel = h(
        'div',
        { class: 'leitura assinar' },
        h('h2', {}, 'Assinatura'),
        h('p', {}, 'Ao assinar, você declara que leu as Regras de Engajamento e vai testar apenas o escopo autorizado, dentro da janela, sem negação de serviço e com prova mínima de dados pessoais.'),
        h('label', {}, 'Nome', campo),
        h('label', { class: 'ciente' }, ciente, ' Li e concordo com as Regras de Engajamento.'),
        erro,
        h(
          'button',
          {
            class: 'botao',
            onclick: () => {
              const nome = campo.value.trim();
              if (!nome) { erro.textContent = 'Contrato sem nome não vale nada.'; return; }
              if (!ciente.checked) { erro.textContent = 'Marque que leu e concorda. A Dra. Patrícia vai conferir.'; return; }
              e.assinadoPor = nome;
              for (const m of a0.assinado) if (!e.mensagens.includes(m.id)) e.mensagens.push(m.id);
              desenhar();
            },
          },
          'Assinar',
        ),
      );
    } else {
      painel = h(
        'div',
        { class: 'leitura' },
        ...a0.assinado.map((m) => leitura(c, m)),
        h('button', { class: 'botao', onclick: () => { e.etapa = 'mesa'; salvar(e); aoConcluir(); } }, 'Conectar na VPN e abrir o terminal'),
      );
    }

    const fb = retorno
      ? h('div', { class: `retorno ${retorno.certa ? 'ok' : 'nao'}`, role: 'status' }, h('strong', {}, retorno.certa ? 'Certo.' : 'Não.'), ' ', retorno.texto)
      : null;

    raiz.append(
      h(
        'div',
        { class: 'ato0' },
        h('header', { class: 'topo' }, h('h1', {}, 'Ato 0: o contrato'), passos),
        h('div', { class: 'ato0-corpo' }, lista, h('main', { class: 'painel' }, fb, painel)),
      ),
    );
  };

  desenhar();
}

