// Caderno de evidências: cada achado do ato com dicas, evidência e severidade.
import type { Achado, Ato, Severidade, Status } from '../motor/tipos';
import type { Estado } from '../motor/estado';
import { h } from './dom';

export const rotuloSeveridade: Record<Severidade, string> = {
  informativa: 'Informativa',
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
};

export const rotuloStatus: Record<Status, string> = {
  corrigido: 'Corrigido',
  parcial: 'Parcialmente corrigido',
  nao: 'Não corrigido',
};

export interface AoRegistrar {
  (a: Achado, valor: Severidade | Status): void;
}

export function caderno(
  ato: Ato,
  e: Estado,
  aberto: string | null,
  aoAbrir: (id: string | null) => void,
  aoDica: (a: Achado) => void,
  aoRegistrar: AoRegistrar,
  aoLgpd: () => void,
  custoDica = false,
): HTMLElement {
  const obrig = ato.achados.filter((a) => !a.bonus);
  const feitos = obrig.filter((a) => e.achados?.[a.id]).length;
  return h(
    'div',
    { class: 'caderno' },
    h('p', { class: 'sobretitulo' }, ato.titulo),
    h('h2', {}, 'Caderno de evidências'),
    h('p', { class: 'progresso' }, `${feitos} de ${obrig.length} ${ato.modo === 'reteste' ? 'itens retestados' : 'achados registrados'}`, h('span', { class: 'trilho' }, h('span', { style: `width:${(feitos / obrig.length) * 100}%` }))),
    ...ato.achados.map((a) => cartao(a, e, aberto === a.id, aoAbrir, aoDica, aoRegistrar, aoLgpd, ato.modo === 'reteste', custoDica)),
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
  reteste: boolean,
  custoDica: boolean,
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
    corpo.push(h('button', { class: 'botao secundario pequeno', onclick: () => aoDica(a) }, (nDicas ? 'Mais uma dica' : 'Pedir dica') + (custoDica ? ' (custa pontos)' : '')));
  }

  const hora = (q: string) => new Date(q).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (reg && reteste) {
    corpo.push(
      h('p', { class: 'registrado' }, `Registrado às ${hora(reg.quando)}: ${rotuloStatus[reg.status ?? 'nao']}.`),
      h('p', { class: 'recomenda' }, h('strong', {}, a.status === 'corrigido' ? 'Conclusão: ' : 'Pendência: '), a.recomendacao),
    );
  } else if (reg) {
    const sevReg = reg.severidade ?? a.severidade;
    corpo.push(
      h('p', { class: 'registrado' }, `Registrado às ${hora(reg.quando)}, severidade ${rotuloSeveridade[sevReg]}.`),
      sevReg === a.severidade
        ? h('p', { class: 'nota-sev ok' }, 'Severidade certeira. ', a.porqueSeveridade)
        : h('p', { class: 'nota-sev' }, `A Tânia classificaria como ${rotuloSeveridade[a.severidade]}. `, a.porqueSeveridade),
      h('p', { class: 'recomenda' }, h('strong', {}, 'Recomendação: '), a.recomendacao),
    );
  } else {
    const campo = h('textarea', { rows: '4', placeholder: a.exemplo, 'aria-label': 'Evidência', spellcheck: 'false' });
    const opcoes: [string, string][] = reteste
      ? (Object.keys(rotuloStatus) as Status[]).map((s) => [s, rotuloStatus[s]])
      : (Object.keys(rotuloSeveridade) as Severidade[]).map((s) => [s, rotuloSeveridade[s]]);
    const sel = h('select', { 'aria-label': reteste ? 'Situação' : 'Severidade' },
      h('option', { value: '' }, reteste ? 'Situação...' : 'Severidade...'),
      ...opcoes.map(([v, t]) => h('option', { value: v }, t)));
    const msg = h('p', { class: 'erro', role: 'status' });
    const botao = h('button', { class: 'botao' }, reteste ? 'Registrar reteste' : 'Registrar achado');
    botao.addEventListener('click', async () => {
      if (!campo.value.trim()) { msg.textContent = 'Achado sem evidência é opinião.'; return; }
      if (!sel.value) { msg.textContent = reteste ? 'Escolha a situação.' : 'Escolha a severidade.'; return; }
      botao.setAttribute('disabled', '');
      const r = await a.validar(campo.value);
      botao.removeAttribute('disabled');
      if (r.lgpd) aoLgpd();
      if (!r.ok) { msg.textContent = r.motivo ?? 'A evidência não confirma o achado.'; return; }
      if (reteste && sel.value !== a.status) {
        msg.textContent = `A evidência é boa, mas ela não mostra "${rotuloStatus[sel.value as Status]}". Releia o que o servidor respondeu.`;
        return;
      }
      aoRegistrar(a, sel.value as Severidade | Status);
    });
    corpo.push(h('label', { class: 'rotulo' }, 'Evidência (cole a saída do terminal ou descreva)'), campo, sel, msg, botao);
  }
  return h('section', { class: `achado aberto${reg ? ' feito' : ''}` }, cab, h('div', { class: 'achado-corpo' }, ...corpo));
}
