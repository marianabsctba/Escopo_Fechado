// Caderno de evidências: cada achado do ato com dicas, evidência e severidade.
import type { Achado, Ato, Severidade } from '../motor/tipos';
import type { Estado } from '../motor/estado';
import { h } from './dom';

export const rotuloSeveridade: Record<Severidade, string> = {
  informativa: 'Informativa',
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
};

export interface AoRegistrar {
  (a: Achado, sev: Severidade): void;
}

export function caderno(
  ato: Ato,
  e: Estado,
  aberto: string | null,
  aoAbrir: (id: string | null) => void,
  aoDica: (a: Achado) => void,
  aoRegistrar: AoRegistrar,
  aoLgpd: () => void,
): HTMLElement {
  const obrig = ato.achados.filter((a) => !a.bonus);
  const feitos = obrig.filter((a) => e.achados?.[a.id]).length;
  return h(
    'div',
    { class: 'caderno' },
    h('p', { class: 'sobretitulo' }, ato.titulo),
    h('h2', {}, 'Caderno de evidências'),
    h('p', { class: 'progresso' }, `${feitos} de ${obrig.length} achados registrados`, h('span', { class: 'trilho' }, h('span', { style: `width:${(feitos / obrig.length) * 100}%` }))),
    ...ato.achados.map((a) => cartao(a, e, aberto === a.id, aoAbrir, aoDica, aoRegistrar, aoLgpd)),
  );
}

function cartao(
  a: Achado,
  e: Estado,
  aberto: boolean,
  aoAbrir: (id: string | null) => void,
  aoDica: (a: Achado) => void,
  aoRegistrar: AoRegistrar,
  aoLgpd: () => void,
): HTMLElement {
  const reg = e.achados?.[a.id];
  const nDicas = e.dicas?.[a.id] ?? 0;
  const cab = h(
    'button',
    { class: 'achado-cab', 'aria-expanded': String(aberto), onclick: () => aoAbrir(aberto ? null : a.id) },
    h('span', { class: `marca${reg ? ' ok' : ''}` }, reg ? '✔' : a.bonus ? '★' : '○'),
    h('span', {}, a.titulo, a.bonus ? h('small', { class: 'bonus' }, ' bônus') : null),
  );
  if (!aberto) return h('section', { class: `achado${reg ? ' feito' : ''}` }, cab);

  const corpo: (HTMLElement | null)[] = [h('p', {}, a.objetivo)];
  if (nDicas) corpo.push(h('ol', { class: 'dicas' }, ...a.dicas.slice(0, nDicas).map((d) => h('li', {}, d))));
  if (!reg && nDicas < a.dicas.length) {
    corpo.push(h('button', { class: 'botao secundario pequeno', onclick: () => aoDica(a) }, nDicas ? 'Mais uma dica' : 'Pedir dica'));
  }

  if (reg) {
    corpo.push(
      h('p', { class: 'registrado' }, `Registrado às ${new Date(reg.quando).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}, severidade ${rotuloSeveridade[reg.severidade]}.`),
      reg.severidade === a.severidade
        ? h('p', { class: 'nota-sev ok' }, 'Severidade certeira. ', a.porqueSeveridade)
        : h('p', { class: 'nota-sev' }, `A Tânia classificaria como ${rotuloSeveridade[a.severidade]}. `, a.porqueSeveridade),
      h('p', { class: 'recomenda' }, h('strong', {}, 'Recomendação: '), a.recomendacao),
    );
  } else {
    const campo = h('textarea', { rows: '4', placeholder: a.exemplo, 'aria-label': 'Evidência', spellcheck: 'false' });
    const sev = h('select', { 'aria-label': 'Severidade' },
      h('option', { value: '' }, 'Severidade...'),
      ...(Object.keys(rotuloSeveridade) as Severidade[]).map((s) => h('option', { value: s }, rotuloSeveridade[s])));
    const msg = h('p', { class: 'erro', role: 'status' });
    const botao = h('button', { class: 'botao' }, 'Registrar achado');
    botao.addEventListener('click', async () => {
      if (!campo.value.trim()) { msg.textContent = 'Achado sem evidência é opinião.'; return; }
      if (!sev.value) { msg.textContent = 'Escolha a severidade.'; return; }
      botao.setAttribute('disabled', '');
      const r = await a.validar(campo.value);
      botao.removeAttribute('disabled');
      if (r.lgpd) aoLgpd();
      if (!r.ok) { msg.textContent = r.motivo ?? 'A evidência não confirma o achado.'; return; }
      aoRegistrar(a, sev.value as Severidade);
    });
    corpo.push(h('label', { class: 'rotulo' }, 'Evidência (cole a saída do terminal ou descreva)'), campo, sev, msg, botao);
  }
  return h('section', { class: `achado aberto${reg ? ' feito' : ''}` }, cab, h('div', { class: 'achado-corpo' }, ...corpo));
}
