// Trilha sonora: definição das faixas (dados puros, sem Web Audio).
// Todas as composições são originais: progressões, linhas de baixo e arpejos
// escritos para o jogo. O motor em ./motor.ts lê estes dados e sintetiza tudo.

export type Onda = 'sine' | 'square' | 'sawtooth' | 'triangle';
export type TipoAcorde = 'm' | 'M' | 'm7' | 'M7' | 'sus2' | 'dim';

/** Intervalos em semitons a partir da raiz. */
export const INTERVALOS: Record<TipoAcorde, number[]> = {
  m: [0, 3, 7],
  M: [0, 4, 7],
  m7: [0, 3, 7, 10],
  M7: [0, 4, 7, 11],
  sus2: [0, 2, 7],
  dim: [0, 3, 6],
};

/** Raiz em MIDI (48 = dó 3 até 59 = si 3). Cada acorde dura um compasso. */
export interface Acorde { raiz: number; tipo: TipoAcorde }

/** Um passo de sequência: número (semitom ou índice de nota do acorde) ou pausa. */
export type Passo = number | null;

export interface Faixa {
  id: string;
  nome: string;
  bpm: number;
  /** Tamanho dos padrões, em semicolcheias (16 = um compasso, 32 = dois). */
  passos: 16 | 32;
  /** Atraso das semicolcheias pares, de 0 a 0.3 do passo. */
  swing: number;
  progressao: Acorde[];
  /** Bateria: 'x' toca, 'X' com acento, 'o' chimbal aberto, '.' pausa. */
  bumbo: string;
  caixa: string;
  chimbal: string;
  /** Caixa alternativa no último compasso de cada bloco de 8. */
  virada?: string;
  /** Baixo: semitons somados à raiz do acorde (uma oitava abaixo). */
  baixo: Passo[];
  /** Arpejo: índice da nota do acorde, subindo oitavas quando passa do tamanho. */
  arpejo: Passo[];
  /** Sino agudo e esparso, mesmo esquema do arpejo, duas oitavas acima. */
  sino?: Passo[];
  pad: boolean;
  /** Compasso em que cada camada entra na primeira volta (introdução). */
  entradas: { baixo: number; arpejo: number; bateria: number };
  /** Compassos [início, fim) de cada ciclo de 16 sem bumbo e sem baixo. */
  quebra?: [number, number];
  timbre: {
    baixoOnda: Onda;
    baixoCorte: number;
    arpOnda: Onda;
    arpCorte: number;
    padCorte: number;
    /** Tempo do eco em tempos (0.75 = colcheia pontuada). */
    atraso: number;
    /** Realimentação do eco, de 0 a 0.7. */
    retorno: number;
  };
}

/** Converte "0 . 12 7" em [0, null, 12, 7]. */
export function seq(texto: string): Passo[] {
  return texto.trim().split(/\s+/).map((t) => (t === '.' ? null : Number(t)));
}

/** Notas MIDI do acorde. */
export function notasDoAcorde(a: Acorde): number[] {
  return INTERVALOS[a.tipo].map((i) => a.raiz + i);
}

/** Nota MIDI do índice de arpejo, subindo uma oitava a cada volta no acorde. */
export function notaDoIndice(a: Acorde, indice: number): number {
  const notas = notasDoAcorde(a);
  return notas[indice % notas.length] + 12 * Math.floor(indice / notas.length);
}

export const faixas: Faixa[] = [
  {
    id: 'chuva_de_neon',
    nome: 'Chuva de Néon',
    bpm: 100,
    passos: 16,
    swing: 0,
    progressao: [{ raiz: 57, tipo: 'm' }, { raiz: 53, tipo: 'M' }, { raiz: 50, tipo: 'm' }, { raiz: 52, tipo: 'M' }],
    bumbo: 'x...x...x...x...',
    caixa: '....x.......x...',
    chimbal: '..x...x...x...x.',
    virada: '....x.......x.xx',
    baixo: seq('0 . 0 . 0 . 12 . 0 . 0 . 0 . 7 .'),
    arpejo: seq('0 1 2 3 2 1 0 1 2 3 4 3 2 1 2 3'),
    sino: seq('. . . . . . . . 4 . . . . . . .'),
    pad: true,
    entradas: { baixo: 2, arpejo: 0, bateria: 4 },
    quebra: [12, 14],
    timbre: { baixoOnda: 'sawtooth', baixoCorte: 380, arpOnda: 'square', arpCorte: 1800, padCorte: 1400, atraso: 0.75, retorno: 0.35 },
  },
  {
    id: 'letras_miudas',
    nome: 'Letras Miúdas',
    bpm: 84,
    passos: 16,
    swing: 0.12,
    progressao: [{ raiz: 50, tipo: 'm7' }, { raiz: 58, tipo: 'M7' }, { raiz: 55, tipo: 'm7' }, { raiz: 57, tipo: 'M' }],
    bumbo: 'x.......x.......',
    caixa: '............x...',
    chimbal: 'x.x.x.x.x.x.x.x.',
    baixo: seq('0 . . . . . . . 0 . . 7 . . . .'),
    arpejo: seq('0 . 2 . 1 . 3 . 0 . 2 . 4 . 3 .'),
    pad: true,
    entradas: { baixo: 1, arpejo: 0, bateria: 2 },
    timbre: { baixoOnda: 'triangle', baixoCorte: 600, arpOnda: 'triangle', arpCorte: 2500, padCorte: 900, atraso: 0.5, retorno: 0.4 },
  },
  {
    id: 'pasto_na_nuvem',
    nome: 'Pasto na Nuvem',
    bpm: 116,
    passos: 16,
    swing: 0,
    progressao: [{ raiz: 52, tipo: 'm' }, { raiz: 48, tipo: 'M' }, { raiz: 55, tipo: 'M' }, { raiz: 50, tipo: 'M' }],
    bumbo: 'X...x...X...x...',
    caixa: '....x.......x...',
    chimbal: 'x.xxx.xxx.xxx.xo',
    virada: '....x.......xxxx',
    baixo: seq('0 0 12 0 0 0 12 0 0 0 12 0 0 0 12 0'),
    arpejo: seq('0 2 1 3 0 2 1 3 0 2 1 3 4 3 2 1'),
    pad: true,
    entradas: { baixo: 0, arpejo: 2, bateria: 2 },
    quebra: [12, 14],
    timbre: { baixoOnda: 'sawtooth', baixoCorte: 520, arpOnda: 'sawtooth', arpCorte: 2200, padCorte: 1600, atraso: 0.75, retorno: 0.3 },
  },
  {
    id: 'pinhao_no_escuro',
    nome: 'Pinhão no Escuro',
    bpm: 92,
    passos: 16,
    swing: 0.05,
    progressao: [{ raiz: 49, tipo: 'm' }, { raiz: 50, tipo: 'M' }, { raiz: 49, tipo: 'm' }, { raiz: 56, tipo: 'dim' }],
    bumbo: 'x......x..x.....',
    caixa: '........x.......',
    chimbal: '..x...x...x...o.',
    baixo: seq('0 . . 0 . . 0 . . . 0 . 1 . 0 .'),
    arpejo: seq('0 . . 1 . . 2 . . 1 . . 0 . . .'),
    sino: seq('. . . . . . . . . . . . 5 . . .'),
    pad: true,
    entradas: { baixo: 1, arpejo: 2, bateria: 4 },
    quebra: [8, 10],
    timbre: { baixoOnda: 'square', baixoCorte: 300, arpOnda: 'sawtooth', arpCorte: 900, padCorte: 700, atraso: 0.375, retorno: 0.5 },
  },
  {
    id: 'sossego_nenhum',
    nome: 'Sossego Nenhum',
    bpm: 132,
    passos: 16,
    swing: 0,
    progressao: [{ raiz: 53, tipo: 'm' }, { raiz: 54, tipo: 'M' }, { raiz: 53, tipo: 'm' }, { raiz: 52, tipo: 'dim' }],
    bumbo: 'X...x...X...x...',
    caixa: '....x.......x..x',
    chimbal: 'xxoxxxoxxxoxxxox',
    virada: '....x.......xxxx',
    baixo: seq('0 0 0 0 0 0 0 0 0 0 0 0 1 1 0 0'),
    arpejo: seq('0 1 2 0 1 2 0 1 2 0 1 2 3 2 1 0'),
    pad: true,
    entradas: { baixo: 0, arpejo: 1, bateria: 2 },
    quebra: [12, 14],
    timbre: { baixoOnda: 'sawtooth', baixoCorte: 700, arpOnda: 'square', arpCorte: 2600, padCorte: 1100, atraso: 0.5, retorno: 0.25 },
  },
  {
    id: 'prazo_de_entrega',
    nome: 'Prazo de Entrega',
    bpm: 96,
    passos: 16,
    swing: 0.08,
    progressao: [{ raiz: 55, tipo: 'm7' }, { raiz: 51, tipo: 'M7' }, { raiz: 58, tipo: 'M' }, { raiz: 53, tipo: 'sus2' }],
    bumbo: 'x.....x...x.....',
    caixa: '....x.......x...',
    chimbal: '..x...x...x...x.',
    baixo: seq('0 . . 0 . . 0 . 0 . . 0 . . 7 .'),
    arpejo: seq('0 . 1 . 2 . 3 . 2 . 1 . 2 . 3 .'),
    pad: true,
    entradas: { baixo: 1, arpejo: 0, bateria: 2 },
    timbre: { baixoOnda: 'square', baixoCorte: 450, arpOnda: 'triangle', arpCorte: 2000, padCorte: 1200, atraso: 0.75, retorno: 0.4 },
  },
  {
    id: 'varredura_noturna',
    nome: 'Varredura Noturna',
    bpm: 108,
    passos: 32,
    swing: 0,
    progressao: [{ raiz: 59, tipo: 'm' }, { raiz: 55, tipo: 'M' }, { raiz: 57, tipo: 'M' }, { raiz: 54, tipo: 'm' }],
    bumbo: 'x...x...x...x...x...x...x..xx...',
    caixa: '....x.......x.......x.......x...',
    chimbal: 'x.x.x.x.x.x.x.xox.x.x.x.x.x.x.xo',
    baixo: seq('0 . 0 12 . 0 . 0 0 . 0 12 . 0 7 . 0 . 0 12 . 0 . 0 0 . 0 12 . 3 5 .'),
    arpejo: seq('0 . 1 2 . 1 3 . 2 . 4 3 . 2 1 . 0 . 1 2 . 1 3 . 4 . 5 4 . 3 2 .'),
    sino: seq('. . . . . . . . . . . . . . . . . . . . . . . . 3 . . . . . . .'),
    pad: true,
    entradas: { baixo: 0, arpejo: 2, bateria: 2 },
    quebra: [10, 12],
    timbre: { baixoOnda: 'sawtooth', baixoCorte: 450, arpOnda: 'square', arpCorte: 1500, padCorte: 1300, atraso: 0.75, retorno: 0.35 },
  },
];

export type Tela = 'capa' | 'contrato' | 'mesa' | 'relatorio';

const MESA_POR_CLIENTE: Record<string, string> = {
  boi_na_nuvem: 'pasto_na_nuvem',
  pinhao_forte: 'pinhao_no_escuro',
  bom_sossego: 'sossego_nenhum',
};

/** Qual faixa toca em cada tela (a mesa depende do cliente). */
export function faixaDaTela(tela: Tela, cliente?: string): string {
  if (tela === 'capa') return 'chuva_de_neon';
  if (tela === 'contrato') return 'letras_miudas';
  if (tela === 'relatorio') return 'prazo_de_entrega';
  return (cliente && MESA_POR_CLIENTE[cliente]) || 'pasto_na_nuvem';
}

export function faixaPorId(id: string): Faixa {
  return faixas.find((f) => f.id === id) ?? faixas[0];
}

/** Próxima faixa na ordem da lista, voltando ao começo. */
export function proximaFaixa(id: string): Faixa {
  const i = faixas.findIndex((f) => f.id === id);
  return faixas[(i + 1) % faixas.length];
}
