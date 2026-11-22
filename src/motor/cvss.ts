// CVSS 3.1, pontuação base, conforme a especificação do FIRST.

export type Metrica = 'AV' | 'AC' | 'PR' | 'UI' | 'S' | 'C' | 'I' | 'A';
export type Vetor = Record<Metrica, string>;

export const METRICAS: { id: Metrica; nome: string; opcoes: { v: string; nome: string; explica: string }[] }[] = [
  { id: 'AV', nome: 'Vetor de ataque', opcoes: [
    { v: 'N', nome: 'Rede', explica: 'Dá para explorar pela internet.' },
    { v: 'A', nome: 'Rede adjacente', explica: 'Precisa estar na mesma rede local.' },
    { v: 'L', nome: 'Local', explica: 'Precisa de acesso à máquina.' },
    { v: 'P', nome: 'Físico', explica: 'Precisa tocar no equipamento.' },
  ] },
  { id: 'AC', nome: 'Complexidade', opcoes: [
    { v: 'L', nome: 'Baixa', explica: 'Funciona sempre, sem condição especial.' },
    { v: 'H', nome: 'Alta', explica: 'Depende de algo fora do controle do atacante.' },
  ] },
  { id: 'PR', nome: 'Privilégio exigido', opcoes: [
    { v: 'N', nome: 'Nenhum', explica: 'Não precisa de login.' },
    { v: 'L', nome: 'Baixo', explica: 'Precisa de uma conta comum.' },
    { v: 'H', nome: 'Alto', explica: 'Precisa de conta administrativa.' },
  ] },
  { id: 'UI', nome: 'Interação do usuário', opcoes: [
    { v: 'N', nome: 'Nenhuma', explica: 'Ninguém precisa clicar em nada.' },
    { v: 'R', nome: 'Necessária', explica: 'Alguém precisa fazer algo (abrir link, arquivo...).' },
  ] },
  { id: 'S', nome: 'Escopo', opcoes: [
    { v: 'U', nome: 'Inalterado', explica: 'O impacto fica no próprio componente.' },
    { v: 'C', nome: 'Alterado', explica: 'O impacto atinge outros componentes.' },
  ] },
  { id: 'C', nome: 'Confidencialidade', opcoes: [
    { v: 'H', nome: 'Alta', explica: 'Vaza tudo ou algo muito sensível.' },
    { v: 'L', nome: 'Baixa', explica: 'Vaza pouca coisa ou algo limitado.' },
    { v: 'N', nome: 'Nenhuma', explica: 'Não vaza nada.' },
  ] },
  { id: 'I', nome: 'Integridade', opcoes: [
    { v: 'H', nome: 'Alta', explica: 'Dá para alterar qualquer dado.' },
    { v: 'L', nome: 'Baixa', explica: 'Dá para alterar algo limitado.' },
    { v: 'N', nome: 'Nenhuma', explica: 'Nada pode ser alterado.' },
  ] },
  { id: 'A', nome: 'Disponibilidade', opcoes: [
    { v: 'H', nome: 'Alta', explica: 'Derruba o serviço.' },
    { v: 'L', nome: 'Baixa', explica: 'Degrada o serviço.' },
    { v: 'N', nome: 'Nenhuma', explica: 'Não afeta o funcionamento.' },
  ] },
];

const PESO = {
  AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
  AC: { L: 0.77, H: 0.44 },
  UI: { N: 0.85, R: 0.62 },
  CIA: { H: 0.56, L: 0.22, N: 0 },
} as const;

function pesoPR(pr: string, escopoAlterado: boolean): number {
  if (pr === 'N') return 0.85;
  if (pr === 'L') return escopoAlterado ? 0.68 : 0.62;
  return escopoAlterado ? 0.5 : 0.27;
}

/** Arredondamento para cima com uma casa, como define o apêndice A da especificação. */
export function arredondarCima(x: number): number {
  const inteiro = Math.round(x * 100000);
  return inteiro % 10000 === 0 ? inteiro / 100000 : (Math.floor(inteiro / 10000) + 1) / 10;
}

export function pontuar(v: Vetor): number {
  const alterado = v.S === 'C';
  const k = (m: 'C' | 'I' | 'A') => PESO.CIA[v[m] as 'H' | 'L' | 'N'];
  const iss = 1 - (1 - k('C')) * (1 - k('I')) * (1 - k('A'));
  const impacto = alterado ? 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15) : 6.42 * iss;
  const explorabilidade = 8.22 * PESO.AV[v.AV as 'N'] * PESO.AC[v.AC as 'L'] * pesoPR(v.PR, alterado) * PESO.UI[v.UI as 'N'];
  if (impacto <= 0) return 0;
  return alterado
    ? arredondarCima(Math.min(1.08 * (impacto + explorabilidade), 10))
    : arredondarCima(Math.min(impacto + explorabilidade, 10));
}

export function classificacao(nota: number): 'Nenhuma' | 'Baixa' | 'Média' | 'Alta' | 'Crítica' {
  if (nota === 0) return 'Nenhuma';
  if (nota < 4) return 'Baixa';
  if (nota < 7) return 'Média';
  if (nota < 9) return 'Alta';
  return 'Crítica';
}

export function vetorTexto(v: Vetor): string {
  return 'CVSS:3.1/' + METRICAS.map((m) => `${m.id}:${v[m.id]}`).join('/');
}

export function lerVetor(txt: string): Vetor {
  const v = {} as Vetor;
  for (const par of txt.replace(/^CVSS:3\.1\//, '').split('/')) {
    const [k, val] = par.split(':');
    v[k as Metrica] = val;
  }
  return v;
}
