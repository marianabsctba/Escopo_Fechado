import './estilo.css';
import { cenarios } from './cenarios';
import { apagar, carregar, novoEstado, salvar, type Estado } from './motor/estado';
import type { Cenario } from './motor/tipos';
import { telaInicio } from './ui/inicio';
import { telaContrato } from './ui/contrato';
import { telaMesa } from './ui/mesa';
import { telaRelatorio } from './ui/relatorio';

const raiz = document.getElementById('app')!;
const DIRETO = 'escopo-fechado:direto';

/** Troca de etapa recarregando a página (desliga a VM) e volta direto ao jogo. */
function irPara(e: Estado, etapa: Estado['etapa'], fase?: Estado['fase']): void {
  e.etapa = etapa;
  if (fase) e.fase = fase;
  salvar(e);
  try { sessionStorage.setItem(DIRETO, '1'); } catch { /* sem armazenamento */ }
  location.reload();
}

function abrir(c: Cenario, e: Estado): void {
  if (e.etapa === 'contrato') telaContrato(raiz, c, e, () => abrir(c, e));
  else if (e.etapa === 'relatorio') {
    telaRelatorio(raiz, c, e, () => irPara(e, 'mesa'), () => irPara(e, 'mesa', 'reteste'));
  } else {
    telaMesa(raiz, c, e, () => location.reload(), () => irPara(e, 'relatorio'));
  }
}

function inicio(): void {
  const salvo = carregar();
  let direto = false;
  try { direto = sessionStorage.getItem(DIRETO) === '1'; sessionStorage.removeItem(DIRETO); } catch { /* nada */ }
  const c = salvo && cenarios.find((x) => x.id === salvo.cenario);
  if (direto && salvo && c) { abrir(c, salvo); return; }

  telaInicio(raiz, !!salvo, (c, recomecar) => {
    let e = salvo && salvo.cenario === c.id && !recomecar ? salvo : null;
    if (!e) {
      apagar();
      e = novoEstado(c.id);
      salvar(e);
    }
    abrir(c, e);
  });
}

inicio();
