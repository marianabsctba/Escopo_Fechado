import './estilo.css';
import { cenarios } from './cenarios';
import { apagar, carregar, novoEstado, salvar, ultimoCenario, type Estado } from './motor/estado';
import type { Cenario } from './motor/tipos';
import { telaInicio } from './ui/inicio';
import { telaContrato } from './ui/contrato';
import { telaMesa } from './ui/mesa';
import { telaRelatorio } from './ui/relatorio';
import { trilha } from './som/motor';
import { faixaDaTela } from './som/faixas';
import { controleSom } from './ui/controle-som';

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
  trilha.tocar(faixaDaTela(e.etapa, c.id));
  if (e.etapa === 'contrato') telaContrato(raiz, c, e, () => abrir(c, e));
  else if (e.etapa === 'relatorio') {
    telaRelatorio(raiz, c, e, () => irPara(e, 'mesa'), () => irPara(e, 'mesa', 'reteste'));
  } else {
    telaMesa(raiz, c, e, () => location.reload(), () => irPara(e, 'relatorio'));
  }
}

function inicio(): void {
  let direto = false;
  try { direto = sessionStorage.getItem(DIRETO) === '1'; sessionStorage.removeItem(DIRETO); } catch { /* nada */ }
  const ultimo = ultimoCenario();
  const cUltimo = ultimo ? cenarios.find((x) => x.id === ultimo) : undefined;
  const eUltimo = cUltimo ? carregar(cUltimo.id) : null;
  if (direto && cUltimo && eUltimo) { abrir(cUltimo, eUltimo); return; }

  trilha.tocar(faixaDaTela('capa'));
  telaInicio(raiz, (id) => !!carregar(id), (c, recomecar) => {
    let e = recomecar ? null : carregar(c.id);
    if (!e) {
      apagar(c.id);
      e = novoEstado(c.id);
      salvar(e);
    }
    salvar(e);
    abrir(c, e);
  });
}

// trilha sonora: começa no primeiro clique ou tecla
trilha.instalar();
controleSom();
inicio();
