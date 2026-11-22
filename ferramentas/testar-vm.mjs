// Boota a VM de um cenario no Node (sem navegador), roda comandos no
// terminal e mostra o que chega pelas duas seriais.
// Uso: node ferramentas/testar-vm.mjs [cenario] [roteiro.json] [fase: teste ou reteste]
// O roteiro é uma lista de { "cmd": "...", "espera": "regex opcional" };
// se a saída de um comando não casar com "espera", o teste falha.
import { V86 } from "v86";
import fs from "node:fs";
import path from "node:path";

const raiz = path.resolve(import.meta.dirname, "..");
const cenario = process.argv[2] ?? "boi_na_nuvem";
const fase = process.argv[4] ?? "teste";
const passos = process.argv[3]
  ? JSON.parse(fs.readFileSync(process.argv[3], "utf8"))
  : [{ cmd: "id", espera: "uid=1000\\(pentester\\)" }, { cmd: "uname -a" }, { cmd: "ip -br addr" }];
const comandos = passos.map((p) => p.cmd);
const falhas = [];
const canalVisto = [];

const vm = path.join(raiz, "public/vm", cenario);
const t0 = Date.now();
const seg = () => ((Date.now() - t0) / 1000).toFixed(1) + "s";

const emu = new V86({
  wasm_path: path.join(raiz, "node_modules/v86/build/v86.wasm"),
  bios: { url: path.join(raiz, "public/v86/seabios.bin") },
  vga_bios: { url: path.join(raiz, "public/v86/vgabios.bin") },
  bzimage: { url: path.join(vm, "bzimage") },
  initrd: { url: path.join(vm, "initrd") },
  cmdline: `console=ttyS0 quiet loglevel=3 tsc=reliable mitigations=off random.trust_cpu=on escopo.fase=${fase}`,
  memory_size: 512 * 1024 * 1024,
  uart1: true,
  autostart: true,
  disable_keyboard: true,
  disable_mouse: true,
});

const utf8 = new TextDecoder();
let tela = "";
let pronto = false;
emu.add_listener("serial0-output-byte", (b) => {
  const c = utf8.decode(Uint8Array.of(b), { stream: true });
  tela += c;
  process.stdout.write(c);
});

let canal = "";
emu.add_listener("serial1-output-byte", (b) => {
  canal += String.fromCharCode(b);
  let i;
  while ((i = canal.indexOf("\n")) >= 0) {
    const linha = canal.slice(0, i);
    canal = canal.slice(i + 1);
    canalVisto.push(linha);
    console.error(`\n[canal ${seg()}] ${linha}`);
    if (linha === "EF:PRONTO") pronto = true;
  }
});

function esperar(cond, ms) {
  return new Promise((ok, falha) => {
    const fim = Date.now() + ms;
    const t = setInterval(() => {
      if (cond()) { clearInterval(t); ok(); }
      else if (Date.now() > fim) { clearInterval(t); falha(new Error("tempo esgotado")); }
    }, 100);
  });
}

try {
  await esperar(() => pronto && /\$ $/.test(tela), 300_000);
  console.error(`\n[teste] shell pronto em ${seg()}`);
  for (const [i, c] of comandos.entries()) {
    const antes = tela.length;
    emu.serial0_send(c + "\n");
    await esperar(() => /\$ $/.test(tela.slice(antes)), 180_000);
    const saida = tela.slice(antes).replace(/[[0-9;?]*[a-zA-Z]/g, "");
    if (passos[i].espera && !new RegExp(passos[i].espera).test(saida)) falhas.push(`${c}  (esperava /${passos[i].espera}/)`);
  }
  for (const p of passos.filter((x) => x.canal)) {
    if (!canalVisto.some((l) => new RegExp(p.canal).test(l))) falhas.push(`canal sem /${p.canal}/`);
  }
  if (falhas.length) {
    console.error(`\n[teste] ${falhas.length} passo(s) falharam:\n  ` + falhas.join("\n  "));
    process.exitCode = 1;
  }
  console.error(`\n[teste] fim em ${seg()}`);
} catch (e) {
  console.error(`\n[teste] FALHOU em ${seg()}: ${e.message}`);
  process.exitCode = 1;
}
emu.stop();
setTimeout(() => process.exit(process.exitCode ?? 0), 200);
