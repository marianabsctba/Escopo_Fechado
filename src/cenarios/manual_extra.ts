// Comandos de triagem de incidente (nível extra expert).
import type { Comando } from '../motor/tipos';
import { manualExpert } from './manual_expert';

export const manualExtra: Comando[] = [
  ...manualExpert,
  {
    nome: 'ssh',
    resumo: 'Acessa o servidor remoto com a chave do contrato.',
    exemplos: [
      { cmd: 'ssh -i ~/.ssh/id_auditor auditor@10.30.0.15', explica: 'Abre um terminal no servidor. O prompt fica amarelo: você está na máquina do cliente.' },
      { cmd: "ssh bilheteria 'comando'", explica: 'Roda um comando só e volta. Ótimo para guardar a saída no seu notebook.' },
      { cmd: "ssh bilheteria 'comando' > evidencias/arquivo.txt", explica: 'Salva a saída direto no seu notebook, sem escrever nada no servidor.' },
    ],
    pratica: 'Em triagem, nada de escrever no servidor do cliente: a evidência sai pelo SSH e é guardada no seu lado, com hash.',
  },
  {
    nome: 'ps',
    resumo: 'Lista os processos em execução.',
    exemplos: [{ cmd: 'ps -ef', explica: 'Todos os processos, com dono e linha de comando. Procure o que roda de /tmp ou tem nome de sistema fora do lugar.' }],
    pratica: 'Processo é evidência volátil: some num reboot. Colete primeiro.',
  },
  {
    nome: 'ss',
    resumo: 'Mostra conexões de rede.',
    exemplos: [{ cmd: 'ss -tn', explica: 'Conexões TCP, com endereços numéricos. ESTAB é conexão aberta agora.' }],
    pratica: 'Achou o endereço do invasor? Ele vira indicador no relatório. Não se acessa o servidor dele: isso é revide, e é crime.',
  },
  {
    nome: 'crontab',
    resumo: 'Tarefas agendadas.',
    exemplos: [{ cmd: 'ls /etc/crontabs/ && cat /etc/crontabs/<usuario>', explica: 'No Alpine as tarefas de cada usuário ficam em /etc/crontabs.' }],
  },
  {
    nome: 'stat',
    resumo: 'Datas e dono de um arquivo.',
    exemplos: [{ cmd: 'stat <arquivo>', explica: 'Modificação, acesso e mudança de metadados. Ajuda a montar a linha do tempo.' }],
  },
  {
    nome: 'find',
    resumo: 'Procura arquivos por nome, data e dono.',
    exemplos: [{ cmd: 'find / -xdev -newer /etc/hostname -type f 2>/dev/null', explica: 'Arquivos modificados depois de uma referência.' }],
  },
];
