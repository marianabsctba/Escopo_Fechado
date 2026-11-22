// Conferência de evidências. Segredos são comparados por SHA-256, para a
// resposta não ficar legível no código do site.

export async function sha256(texto: string): Promise<string> {
  const dados = new TextEncoder().encode(texto);
  const hash = await crypto.subtle.digest('SHA-256', dados);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Pedaços candidatos a segredo: palavras e trechos entre aspas, sem pontuação de borda. */
export function pedacos(texto: string): string[] {
  const brutos = texto.split(/[\s"'`,;=<>()]+/).filter(Boolean);
  const limpos = brutos.flatMap((p) => [p, p.replace(/^[^\w@!#$%&*]+|[.:]+$/g, '')]);
  return [...new Set(limpos.filter((p) => p.length >= 4 && p.length <= 64))];
}

export async function contemSegredo(texto: string, hashHex: string): Promise<boolean> {
  for (const p of pedacos(texto)) if ((await sha256(p)) === hashHex) return true;
  return false;
}

/** CPF completo (com ou sem pontuação). Máscara com * não conta. */
export function temCpfCompleto(texto: string): boolean {
  return /(?<![\d*])\d{3}\.?\d{3}\.?\d{3}-?\d{2}(?![\d*])/.test(texto);
}

export function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
