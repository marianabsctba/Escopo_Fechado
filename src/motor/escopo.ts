// Confere se um comando digitado mira algo fora do escopo assinado.
// Regra de ouro de pentest: so se testa o que esta escrito no contrato.

export interface Escopo {
  /** Faixas autorizadas, em CIDR. */
  faixas: string[];
  /** Dominios autorizados (inclui subdominios). */
  dominios: string[];
  /** Alvos explicitamente proibidos, com o motivo mostrado ao jogador. */
  proibidos: { alvo: string; motivo: string }[];
}

export type Situacao = 'dentro' | 'fora' | 'desconhecido';

export interface Alvo {
  alvo: string;
  situacao: Situacao;
  motivo?: string;
}

/** Programas que tocam a rede. Comandos locais (ls, cat, grep) nunca violam escopo. */
const DE_REDE = new Set([
  'nmap', 'curl', 'wget', 'ssh', 'scp', 'sftp', 'nc', 'ncat', 'netcat', 'ping', 'dig', 'nslookup',
  'host', 'telnet', 'git', 'whatweb', 'nikto', 'gobuster', 'ffuf', 'sqlmap', 'hydra', 'ftp', 'rsync',
]);

function ipParaNumero(ip: string): number | null {
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3];
}

export function ipNaFaixa(ip: string, cidr: string): boolean {
  const [rede, bitsTxt] = cidr.split('/');
  const n = ipParaNumero(ip);
  const r = ipParaNumero(rede);
  if (n === null || r === null) return false;
  const bits = Number(bitsTxt ?? 32);
  const mascara = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (n & mascara) >>> 0 === (r & mascara) >>> 0;
}

function dominioCasa(host: string, dominio: string): boolean {
  const h = host.toLowerCase().replace(/\.$/, '');
  const d = dominio.toLowerCase();
  return h === d || h.endsWith('.' + d);
}

/** Extrai IPs (ou faixas) e nomes de host citados num comando. */
export function extrairAlvos(comando: string): string[] {
  const alvos = new Set<string>();
  for (const m of comando.matchAll(/\b(\d{1,3}(?:\.\d{1,3}){3})(?:\/\d{1,2})?\b/g)) alvos.add(m[0]);
  for (const m of comando.matchAll(/\b((?:[a-z0-9-]+\.)+[a-z]{2,})\b/gi)) {
    const nome = m[1];
    if (/^\d+(\.\d+)+$/.test(nome)) continue;
    // nomes de arquivo comuns nao sao hosts
    if (/\.(txt|html?|php|json|csv|md|sh|py|png|jpe?g|zip|gz|tar|log|conf|xml|js|css)$/i.test(nome)) continue;
    alvos.add(nome.toLowerCase());
  }
  return [...alvos];
}

export function classificar(alvo: string, escopo: Escopo): Alvo {
  for (const p of escopo.proibidos) {
    if (p.alvo.includes('/') ? ipNaFaixa(alvo.split('/')[0], p.alvo) : dominioCasa(alvo, p.alvo) || alvo === p.alvo) {
      return { alvo, situacao: 'fora', motivo: p.motivo };
    }
  }
  const ip = alvo.split('/')[0];
  if (ipParaNumero(ip) !== null) {
    if (ip.startsWith('127.') || ip === '10.8.0.2') return { alvo, situacao: 'dentro' };
    const bits = Number(alvo.split('/')[1] ?? 32);
    const ok = escopo.faixas.some((f) => ipNaFaixa(ip, f) && bits >= Number(f.split('/')[1] ?? 32));
    return { alvo, situacao: ok ? 'dentro' : 'fora', motivo: ok ? undefined : 'Esse endereço não está na lista do contrato.' };
  }
  if (alvo === 'localhost') return { alvo, situacao: 'dentro' };
  if (escopo.dominios.some((d) => dominioCasa(alvo, d))) return { alvo, situacao: 'dentro' };
  return { alvo, situacao: 'desconhecido' };
}

/** Primeiro programa de cada trecho do comando (pipes, ;, &&, sudo). */
function programas(comando: string): string[] {
  return comando
    .split(/\|\||&&|[|;]/)
    .map((t) => t.trim().split(/\s+/).filter((p) => !/^[A-Z_]+=/.test(p) && p !== 'sudo' && p !== 'time')[0] ?? '')
    .map((p) => p.split('/').pop() ?? p)
    .filter(Boolean);
}

/** Alvos fora do escopo que um comando de rede tenta alcançar. */
export function violacoes(comando: string, escopo: Escopo): Alvo[] {
  if (!programas(comando).some((p) => DE_REDE.has(p))) return [];
  return extrairAlvos(comando)
    .map((a) => classificar(a, escopo))
    .filter((a) => a.situacao === 'fora');
}
