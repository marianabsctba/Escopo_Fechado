// Chuva de caracteres verdes num canvas de fundo. Mistura katakana, dígitos
// e pedaços de comandos de verdade. Respeita "reduzir movimento".

const KATAKANA = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';
const EXTRA = '0123456789$#{}[]<>/|=*+:;.~@&%';
const COMANDOS = ['nmap', 'curl', 'grep', 'git log', 'ssh', 'sudo -l', 'wget', '203.0.113', 'robots.txt', '.git', 'sha256sum', 'escopo'];

export interface Chuva {
  parar(): void;
}

export function chuva(canvas: HTMLCanvasElement, opcoes: { intensidade?: number } = {}): Chuva {
  const ctx = canvas.getContext('2d')!;
  const intensidade = opcoes.intensidade ?? 1;
  const tamanho = 16;
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let colunas: { y: number; vel: number; texto: string; i: number }[] = [];
  let quadro = 0;
  let vivo = true;
  let largura = 0;
  let altura = 0;

  const sortear = (): string => {
    if (Math.random() < 0.18) return COMANDOS[(Math.random() * COMANDOS.length) | 0];
    const fonte = Math.random() < 0.7 ? KATAKANA : EXTRA;
    return fonte[(Math.random() * fonte.length) | 0];
  };

  const medir = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    largura = canvas.clientWidth;
    altura = canvas.clientHeight;
    canvas.width = largura * dpr;
    canvas.height = altura * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.ceil(largura / tamanho);
    colunas = Array.from({ length: n }, () => ({
      y: Math.random() * altura * 1.2 - altura * 0.4,
      vel: 0.35 + Math.random() * 0.9,
      texto: sortear(),
      i: 0,
    }));
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, largura, altura);
  };

  const desenhar = () => {
    if (!vivo) return;
    quadro++;
    ctx.fillStyle = `rgba(0, 0, 0, ${0.07 + 0.05 * (1 - intensidade)})`;
    ctx.fillRect(0, 0, largura, altura);
    ctx.font = `${tamanho}px "Share Tech Mono", "Cascadia Mono", monospace`;
    colunas.forEach((col, x) => {
      if (Math.random() > intensidade) return;
      const ch = col.texto[col.i % col.texto.length];
      const px = x * tamanho;
      ctx.fillStyle = '#d6ffe0';
      ctx.fillText(ch, px, col.y);
      ctx.fillStyle = '#00ff66';
      ctx.fillText(ch, px, col.y - tamanho);
      col.y += tamanho * col.vel;
      col.i++;
      if (col.y > altura + tamanho * 4 && Math.random() > 0.96) {
        col.y = -tamanho * (Math.random() * 20);
        col.vel = 0.35 + Math.random() * 0.9;
        col.texto = sortear();
        col.i = 0;
      }
    });
    requestAnimationFrame(desenhar);
  };

  medir();
  const obs = new ResizeObserver(medir);
  obs.observe(canvas);

  if (reduzir) {
    // um quadro estático, sem animação
    for (let i = 0; i < 60; i++) colunas.forEach((c) => (c.y += tamanho * c.vel));
    ctx.font = `${tamanho}px monospace`;
    colunas.forEach((c, x) => {
      for (let k = 0; k < 12; k++) {
        ctx.fillStyle = `rgba(0, 255, 102, ${0.5 - k * 0.04})`;
        ctx.fillText(sortear()[0], x * tamanho, (c.y % altura) - k * tamanho);
      }
    });
  } else {
    requestAnimationFrame(desenhar);
  }

  return {
    parar() {
      vivo = false;
      obs.disconnect();
      void quadro;
    },
  };
}
