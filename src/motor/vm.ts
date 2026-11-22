// Liga a maquina Linux (v86) ao jogo: serial 0 e o terminal, serial 1 e o
// canal de eventos (linhas "EF:...") que a VM manda para o jogo.
import { V86 } from 'v86';

export type EventoVM =
  | { tipo: 'boot' }
  | { tipo: 'pronto' }
  | { tipo: 'cmd'; pasta: string; comando: string }
  | { tipo: 'http'; host: string; porta: number; metodo: string; caminho: string; status: number; agente: string }
  | { tipo: 'outro'; linha: string };

/** Interpreta uma linha do canal da VM. Exportada para os testes. */
export function lerLinhaCanal(linha: string): EventoVM | null {
  if (!linha.startsWith('EF:')) return null;
  const resto = linha.slice(3);
  if (resto === 'BOOT') return { tipo: 'boot' };
  if (resto === 'PRONTO') return { tipo: 'pronto' };
  if (resto.startsWith('CMD ')) {
    const [pasta, ...cmd] = resto.slice(4).split('\t');
    return { tipo: 'cmd', pasta, comando: cmd.join('\t') };
  }
  if (resto.startsWith('HTTP ')) {
    const [host, porta, metodo, caminho, status, agente] = resto.slice(5).split('\t');
    return { tipo: 'http', host, porta: Number(porta), metodo, caminho, status: Number(status), agente: agente ?? '-' };
  }
  return { tipo: 'outro', linha };
}

export interface OpcoesVM {
  cenario: string;
  /** Fase do mundo (teste ou reteste), passada ao kernel. */
  fase?: string;
  aoProgresso?: (fracao: number) => void;
  aoTerminal: (bytes: Uint8Array) => void;
  aoEvento: (e: EventoVM) => void;
}

export class MaquinaVM {
  private emu: V86;
  private fila: number[] = [];
  private agendado = false;

  constructor(op: OpcoesVM) {
    const base = import.meta.env.BASE_URL;
    this.emu = new V86({
      wasm_path: `${base}v86/v86.wasm`,
      bios: { url: `${base}v86/seabios.bin` },
      vga_bios: { url: `${base}v86/vgabios.bin` },
      bzimage: { url: `${base}vm/${op.cenario}/bzimage` },
      initrd: { url: `${base}vm/${op.cenario}/initrd` },
      cmdline: `console=ttyS0 quiet loglevel=3 tsc=reliable mitigations=off random.trust_cpu=on escopo.fase=${op.fase ?? 'teste'}`,
      memory_size: 512 * 1024 * 1024,
      vga_memory_size: 2 * 1024 * 1024,
      uart1: true,
      autostart: true,
      disable_keyboard: true,
      disable_mouse: true,
      disable_speaker: true,
    });

    this.emu.add_listener('download-progress', (p: { loaded: number; total: number; file_index: number; file_count: number }) => {
      if (!op.aoProgresso || !p.total) return;
      op.aoProgresso((p.file_index + p.loaded / p.total) / p.file_count);
    });

    // Junta os bytes do terminal e entrega uma vez por quadro
    this.emu.add_listener('serial0-output-byte', (b: number) => {
      this.fila.push(b);
      if (!this.agendado) {
        this.agendado = true;
        requestAnimationFrame(() => {
          this.agendado = false;
          const bytes = Uint8Array.from(this.fila);
          this.fila = [];
          op.aoTerminal(bytes);
        });
      }
    });

    let buf = '';
    const dec = new TextDecoder();
    const pend: number[] = [];
    this.emu.add_listener('serial1-output-byte', (b: number) => {
      if (b !== 10) {
        pend.push(b);
        return;
      }
      buf = dec.decode(Uint8Array.from(pend));
      pend.length = 0;
      const e = lerLinhaCanal(buf.replace(/\r$/, ''));
      if (e) op.aoEvento(e);
    });
  }

  digitar(texto: string): void {
    this.emu.serial0_send(texto);
  }

  parar(): void {
    this.emu.stop();
  }
}
