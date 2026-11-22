import './estilo.css';
import { apagar, carregar, novoEstado, salvar, type Estado } from './motor/estado';
import type { Cenario } from './motor/tipos';
import { telaInicio } from './ui/inicio';
import { telaContrato } from './ui/contrato';
import { telaMesa } from './ui/mesa';

const raiz = document.getElementById('app')!;

function abrir(c: Cenario, e: Estado): void {
  if (e.etapa === 'contrato') telaContrato(raiz, c, e, () => abrir(c, e));
  // A VM vive enquanto a página vive; voltar ao menu recarrega para desligá-la.
  else telaMesa(raiz, c, e, () => location.reload());
}

function inicio(): void {
  const salvo = carregar();
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
