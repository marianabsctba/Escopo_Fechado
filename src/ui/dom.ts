// Ajudantes mínimos de DOM, sem framework.
type Filho = Node | string | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | boolean | ((ev: Event) => void)> = {},
  ...filhos: (Filho | Filho[])[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (typeof v === 'function') el.addEventListener(k.replace(/^on/, ''), v);
    else if (v === true) el.setAttribute(k, '');
    else if (v !== false) el.setAttribute(k, v);
  }
  for (const f of filhos.flat()) {
    if (f === null || f === undefined || f === false) continue;
    el.append(typeof f === 'string' ? document.createTextNode(f) : f);
  }
  return el;
}

export function limpar(el: HTMLElement): void {
  while (el.firstChild) el.firstChild.remove();
}

/** Parágrafos com quebra de linha preservada. */
export function paragrafos(textos: string[]): HTMLElement[] {
  return textos.map((t) => h('p', {}, ...t.split('\n').flatMap((l, i) => (i ? [h('br'), l] : [l]))));
}
