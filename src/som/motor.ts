// Motor da trilha sonora: sintetizadores e sequenciador em Web Audio, sem arquivo de áudio.
// Agendamento com antecedência (padrão "A Tale of Two Clocks"): um temporizador leve
// acorda de tempos em tempos e marca no relógio do áudio as notas da janela seguinte.
import { faixaPorId, notaDoIndice, notasDoAcorde, proximaFaixa, type Faixa } from './faixas';

const CHAVE = 'escopo-fechado:som';
const VOLUME_INICIAL = 0.35;
const ANTECEDENCIA = 0.35; // segundos agendados à frente
const INTERVALO_MS = 90; // folga para a VM ocupar a página sem buracos na música
const FADE = 1.6; // segundos de transição entre faixas
const CICLO = 16; // compassos por ciclo (para a quebra)

export interface EstadoSom {
  faixa: Faixa;
  volume: number; // 0 a 1
  mudo: boolean;
  /** Já houve gesto e o áudio está liberado. */
  liberado: boolean;
  /** O navegador tem Web Audio. */
  disponivel: boolean;
}

type Ouvinte = (e: EstadoSom) => void;

function hz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function lerPreferencias(): { volume: number; mudo: boolean } {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) {
      const p = JSON.parse(bruto) as { volume?: unknown; mudo?: unknown };
      const v = typeof p.volume === 'number' && p.volume >= 0 && p.volume <= 1 ? p.volume : VOLUME_INICIAL;
      return { volume: v, mudo: p.mudo === true };
    }
  } catch { /* sem armazenamento */ }
  return { volume: VOLUME_INICIAL, mudo: false };
}

function gravarPreferencias(volume: number, mudo: boolean): void {
  try { localStorage.setItem(CHAVE, JSON.stringify({ volume, mudo })); } catch { /* sem armazenamento */ }
}

/** Uma faixa tocando: barramento próprio (para o fade), eco e filtros compartilhados. */
class Tocador {
  readonly bus: GainNode;
  private readonly envio: GainNode;
  private readonly arpFiltro: BiquadFilterNode;
  private readonly padFiltro: BiquadFilterNode;
  private readonly lfo: OscillatorNode;
  private readonly nos: AudioNode[];
  private passo = 0;
  private proximo: number;
  private readonly dur: number;
  /** Momento a partir do qual não agenda mais nada (fim do fade de saída). */
  fim = Infinity;

  constructor(private readonly ctx: AudioContext, destino: AudioNode, readonly faixa: Faixa, private readonly ruido: AudioBuffer, inicio: number, comFade: boolean) {
    this.dur = 60 / faixa.bpm / 4;
    this.proximo = inicio;
    this.bus = ctx.createGain();
    this.bus.gain.setValueAtTime(comFade ? 0 : 1, ctx.currentTime);
    if (comFade) this.bus.gain.linearRampToValueAtTime(1, inicio + FADE);
    this.bus.connect(destino);

    // eco com realimentação filtrada, para arpejo e sino
    const atraso = ctx.createDelay(2);
    atraso.delayTime.value = Math.min(1.9, (60 / faixa.bpm) * faixa.timbre.atraso);
    const retorno = ctx.createGain();
    retorno.gain.value = Math.min(0.7, faixa.timbre.retorno);
    const tom = ctx.createBiquadFilter();
    tom.type = 'lowpass';
    tom.frequency.value = 2200;
    this.envio = ctx.createGain();
    this.envio.gain.value = 0.35;
    this.envio.connect(atraso);
    atraso.connect(tom);
    tom.connect(retorno);
    retorno.connect(atraso);
    tom.connect(this.bus);

    this.arpFiltro = ctx.createBiquadFilter();
    this.arpFiltro.type = 'lowpass';
    this.arpFiltro.frequency.value = faixa.timbre.arpCorte;
    this.arpFiltro.Q.value = 4;
    this.arpFiltro.connect(this.bus);
    this.arpFiltro.connect(this.envio);

    // pad com filtro que respira devagar (um LFO só para a faixa inteira)
    this.padFiltro = ctx.createBiquadFilter();
    this.padFiltro.type = 'lowpass';
    this.padFiltro.frequency.value = faixa.timbre.padCorte;
    this.padFiltro.Q.value = 2;
    this.padFiltro.connect(this.bus);
    this.lfo = ctx.createOscillator();
    this.lfo.frequency.value = 0.07;
    const profundidade = ctx.createGain();
    profundidade.gain.value = faixa.timbre.padCorte * 0.45;
    this.lfo.connect(profundidade);
    profundidade.connect(this.padFiltro.frequency);
    this.lfo.start(inicio);

    this.nos = [this.bus, atraso, retorno, tom, this.envio, this.arpFiltro, this.padFiltro, this.lfo, profundidade];
  }

  /** Agenda os passos até o instante dado. */
  agendar(agora: number, ate: number): void {
    // se a página travou (VM pesada), pula para frente em vez de despejar notas atrasadas
    while (this.proximo < agora - 0.05) { this.proximo += this.dur; this.passo++; }
    while (this.proximo < ate && this.proximo < this.fim) {
      const t = this.proximo + (this.passo % 2 === 1 ? this.faixa.swing * this.dur : 0);
      this.tocarPasso(this.passo, t);
      this.proximo += this.dur;
      this.passo++;
    }
  }

  /** Começa o fade de saída; depois disso o tocador pode ser descartado. */
  sair(agora: number): void {
    const g = this.bus.gain;
    g.cancelScheduledValues(agora);
    g.setValueAtTime(g.value, agora);
    g.linearRampToValueAtTime(0, agora + FADE);
    this.fim = agora + FADE;
  }

  descartar(): void {
    try { this.lfo.stop(); } catch { /* já parado */ }
    for (const n of this.nos) n.disconnect();
  }

  private tocarPasso(p: number, t: number): void {
    const f = this.faixa;
    const compasso = Math.floor(p / 16);
    const noCiclo = compasso % CICLO;
    const i = p % f.passos;
    const acorde = f.progressao[compasso % f.progressao.length];
    const naQuebra = !!f.quebra && noCiclo >= f.quebra[0] && noCiclo < f.quebra[1];
    const bateria = compasso >= f.entradas.bateria;

    if (f.pad && p % 16 === 0) this.pad(notasDoAcorde(acorde), t, this.dur * 16);

    if (bateria) {
      const b = f.bumbo[i];
      if (!naQuebra && (b === 'x' || b === 'X')) this.bumbo(t, b === 'X' ? 1 : 0.8);
      const padraoCaixa = f.virada && compasso % 8 === 7 ? f.virada : f.caixa;
      if (padraoCaixa[i] === 'x' || padraoCaixa[i] === 'X') this.caixa(t);
      const c = f.chimbal[i];
      if (c === 'x' || c === 'X' || c === 'o') this.chimbal(t, c === 'o');
    }
    const nb = f.baixo[i];
    if (nb !== null && nb !== undefined && !naQuebra && compasso >= f.entradas.baixo) this.baixo(hz(acorde.raiz - 12 + nb), t);
    const na = f.arpejo[i];
    if (na !== null && na !== undefined && compasso >= f.entradas.arpejo) this.arpejo(hz(notaDoIndice(acorde, na) + 12), t);
    const ns = f.sino?.[i];
    if (ns !== null && ns !== undefined && compasso >= f.entradas.arpejo) this.sino(hz(notaDoIndice(acorde, ns) + 24), t);
  }

  // Instrumentos. Cada nota cria poucos nós e solta tudo ao terminar.

  private envelope(t: number, pico: number, ataque: number, queda: number): GainNode {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(pico, t + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, t + ataque + queda);
    return g;
  }

  private fonte(no: AudioScheduledSourceNode, saida: AudioNode, t: number, fim: number): void {
    no.onended = () => saida.disconnect();
    no.start(t);
    no.stop(fim);
  }

  private bumbo(t: number, forca: number): void {
    const o = this.ctx.createOscillator();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    const g = this.envelope(t, 0.9 * forca, 0.003, 0.32);
    o.connect(g).connect(this.bus);
    this.fonte(o, g, t, t + 0.4);
  }

  private ruidoEm(t: number, filtro: BiquadFilterType, freq: number, pico: number, queda: number): void {
    const r = this.ctx.createBufferSource();
    r.buffer = this.ruido;
    const fl = this.ctx.createBiquadFilter();
    fl.type = filtro;
    fl.frequency.value = freq;
    const g = this.envelope(t, pico, 0.002, queda);
    r.connect(fl).connect(g).connect(this.bus);
    r.onended = () => { fl.disconnect(); g.disconnect(); };
    // ponto de partida variado no buffer para não soar sempre igual
    r.start(t, Math.random() * 0.5);
    r.stop(t + queda + 0.05);
  }

  private caixa(t: number): void {
    this.ruidoEm(t, 'bandpass', 1900, 0.32, 0.17);
    const o = this.ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(150, t + 0.08);
    const g = this.envelope(t, 0.22, 0.002, 0.09);
    o.connect(g).connect(this.bus);
    this.fonte(o, g, t, t + 0.12);
  }

  private chimbal(t: number, aberto: boolean): void {
    this.ruidoEm(t, 'highpass', 7500, aberto ? 0.09 : 0.07, aberto ? 0.22 : 0.035);
  }

  private baixo(freq: number, t: number): void {
    const tb = this.faixa.timbre;
    const o = this.ctx.createOscillator();
    o.type = tb.baixoOnda;
    o.frequency.value = freq;
    const fl = this.ctx.createBiquadFilter();
    fl.type = 'lowpass';
    fl.Q.value = 6;
    fl.frequency.setValueAtTime(tb.baixoCorte * 3, t);
    fl.frequency.exponentialRampToValueAtTime(tb.baixoCorte, t + 0.09);
    const queda = this.dur * 0.95;
    const g = this.envelope(t, 0.3, 0.005, queda);
    o.connect(fl).connect(g).connect(this.bus);
    o.onended = () => { fl.disconnect(); g.disconnect(); };
    o.start(t);
    o.stop(t + queda + 0.02);
  }

  private arpejo(freq: number, t: number): void {
    const o = this.ctx.createOscillator();
    o.type = this.faixa.timbre.arpOnda;
    o.frequency.value = freq;
    const g = this.envelope(t, 0.07, 0.004, 0.16);
    o.connect(g).connect(this.arpFiltro);
    this.fonte(o, g, t, t + 0.2);
  }

  private sino(freq: number, t: number): void {
    const o = this.ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = freq;
    const g = this.envelope(t, 0.08, 0.004, 0.9);
    o.connect(g);
    g.connect(this.bus);
    g.connect(this.envio);
    this.fonte(o, g, t, t + 1);
  }

  private pad(notas: number[], t: number, duracao: number): void {
    const g = this.ctx.createGain();
    const pico = 0.11 / Math.sqrt(notas.length);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(pico, t + Math.min(0.6, duracao * 0.3));
    g.gain.setValueAtTime(pico, t + duracao * 0.8);
    g.gain.linearRampToValueAtTime(0.0001, t + duracao + 0.25);
    g.connect(this.padFiltro);
    let vivos = notas.length;
    notas.forEach((n, k) => {
      const o = this.ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = hz(n);
      o.detune.value = k % 2 ? 7 : -7;
      o.connect(g);
      o.onended = () => { if (--vivos === 0) g.disconnect(); };
      o.start(t);
      o.stop(t + duracao + 0.3);
    });
  }
}

/** A trilha do jogo: um contexto de áudio, um volume geral e as faixas trocando com fade. */
class Trilha {
  private ctx: AudioContext | null = null;
  private mestre: GainNode | null = null;
  private ruido: AudioBuffer | null = null;
  private atual: Tocador | null = null;
  private saindo: Tocador[] = [];
  private faixa: Faixa = faixaPorId('chuva_de_neon');
  private volume: number;
  private mudo: boolean;
  private oculta = false;
  private relogio: ReturnType<typeof setTimeout> | null = null;
  private ouvintes: Ouvinte[] = [];
  private readonly Classe: typeof AudioContext | undefined;

  constructor() {
    const p = lerPreferencias();
    this.volume = p.volume;
    this.mudo = p.mudo;
    const w = typeof window !== 'undefined' ? (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }) : undefined;
    this.Classe = w?.AudioContext ?? w?.webkitAudioContext;
  }

  /** Liga os ouvintes de gesto e de aba escondida. Chamar uma vez. */
  instalar(): void {
    if (!this.Classe) return;
    const gesto = () => {
      window.removeEventListener('pointerdown', gesto, true);
      window.removeEventListener('keydown', gesto, true);
      this.liberar();
    };
    window.addEventListener('pointerdown', gesto, true);
    window.addEventListener('keydown', gesto, true);
    document.addEventListener('visibilitychange', () => {
      this.oculta = document.hidden;
      this.aplicarEstado();
    });
  }

  estado(): EstadoSom {
    return { faixa: this.faixa, volume: this.volume, mudo: this.mudo, liberado: !!this.ctx, disponivel: !!this.Classe };
  }

  aoMudar(f: Ouvinte): void {
    this.ouvintes.push(f);
    f(this.estado());
  }

  /** Toca a faixa (com fade se já houver outra tocando). */
  tocar(id: string): void {
    const nova = faixaPorId(id);
    if (nova.id === this.faixa.id && this.atual) return;
    this.faixa = nova;
    this.trocar();
    this.avisar();
  }

  proxima(): void {
    this.faixa = proximaFaixa(this.faixa.id);
    this.trocar();
    this.avisar();
  }

  definirVolume(v: number): void {
    this.volume = Math.round(Math.min(1, Math.max(0, v)) * 100) / 100;
    if (this.volume > 0 && this.mudo) this.mudo = false;
    gravarPreferencias(this.volume, this.mudo);
    this.aplicarEstado();
    this.avisar();
  }

  alternarMudo(): void {
    this.mudo = !this.mudo;
    if (!this.mudo && this.volume === 0) this.volume = VOLUME_INICIAL;
    gravarPreferencias(this.volume, this.mudo);
    this.aplicarEstado();
    this.avisar();
  }

  private avisar(): void {
    const e = this.estado();
    for (const f of this.ouvintes) f(e);
  }

  private ganho(): number {
    return this.mudo ? 0 : Math.pow(this.volume, 1.6) * 0.8;
  }

  /** Cria o contexto dentro do primeiro gesto da pessoa. */
  private liberar(): void {
    if (this.ctx || !this.Classe) return;
    try {
      const ctx = new this.Classe();
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.ratio.value = 4;
      compressor.connect(ctx.destination);
      const mestre = ctx.createGain();
      mestre.gain.value = 0;
      mestre.connect(compressor);
      // um segundo de ruído branco, reaproveitado por caixa e chimbal
      const ruido = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const dados = ruido.getChannelData(0);
      for (let i = 0; i < dados.length; i++) dados[i] = Math.random() * 2 - 1;
      this.ctx = ctx;
      this.mestre = mestre;
      this.ruido = ruido;
    } catch {
      return;
    }
    this.oculta = document.hidden;
    this.trocar();
    this.aplicarEstado();
    this.avisar();
  }

  private get ativo(): boolean {
    return !!this.ctx && !this.mudo && this.volume > 0 && !this.oculta;
  }

  /** Começa a faixa escolhida e manda a anterior sair em fade. */
  private trocar(): void {
    const ctx = this.ctx;
    if (!ctx || !this.mestre || !this.ruido) return;
    const agora = ctx.currentTime;
    const rodando = ctx.state === 'running' && this.ativo;
    if (this.atual) {
      if (rodando) { this.atual.sair(agora); this.saindo.push(this.atual); }
      else this.atual.descartar();
    }
    this.atual = new Tocador(ctx, this.mestre, this.faixa, this.ruido, agora + 0.08, rodando && this.saindo.length > 0);
  }

  /** Liga ou desliga o contexto e o temporizador conforme mudo, volume e aba. */
  private aplicarEstado(): void {
    const ctx = this.ctx;
    if (!ctx || !this.mestre) return;
    const agora = ctx.currentTime;
    const g = this.mestre.gain;
    g.cancelScheduledValues(agora);
    g.setValueAtTime(g.value, agora);
    if (this.ativo) {
      ctx.resume().catch(() => { /* o navegador recusou */ });
      g.linearRampToValueAtTime(this.ganho(), agora + 0.25);
      this.iniciarRelogio();
    } else {
      g.linearRampToValueAtTime(0, agora + 0.12);
      this.pararRelogio();
      // suspende de verdade para não gastar processador da VM
      setTimeout(() => {
        if (!this.ativo && this.ctx && this.ctx.state === 'running') this.ctx.suspend().catch(() => { /* nada */ });
      }, 200);
    }
  }

  private iniciarRelogio(): void {
    if (this.relogio !== null) return;
    const tique = () => {
      this.relogio = null;
      if (!this.ativo || !this.ctx) return;
      const agora = this.ctx.currentTime;
      this.atual?.agendar(agora, agora + ANTECEDENCIA);
      this.saindo = this.saindo.filter((t) => {
        if (agora > t.fim + 0.5) { t.descartar(); return false; }
        t.agendar(agora, Math.min(t.fim, agora + ANTECEDENCIA));
        return true;
      });
      this.relogio = setTimeout(tique, INTERVALO_MS);
    };
    tique();
  }

  private pararRelogio(): void {
    if (this.relogio !== null) clearTimeout(this.relogio);
    this.relogio = null;
  }
}

export const trilha = new Trilha();
