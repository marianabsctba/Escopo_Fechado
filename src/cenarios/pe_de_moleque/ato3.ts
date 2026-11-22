// Ato 3 do Pé de Moleque: verificação depois da erradicação.
import type { Ato } from '../../motor/tipos';
import { normalizar } from '../../motor/evidencia';

export const ato3: Ato = {
  titulo: 'Ato 3: verificação pós-erradicação',
  modo: 'reteste',

  abertura: [
    {
      id: 'pdm-a3-wanderson',
      de: 'wanderson',
      canal: 'whatsapp',
      texto: ['limpei TUDO 🧹', 'matei o processo, apaguei a pasta, tirei o cron, tirei a chave e troquei a senha do admin', 'pode ver, tá zerado. domingo tem final!'],
    },
    {
      id: 'pdm-a3-tania',
      de: 'tania',
      canal: 'whatsapp',
      texto: ['Ele listou cinco coisas. O relatório tinha seis.', 'Confere cada indicador da triagem, um por um.'],
    },
  ],

  achados: [
    {
      id: 'pdm-rt-processo',
      titulo: 'Verificação: processo e pasta do artefato',
      objetivo: 'O processo e a pasta /tmp/.x sumiram?',
      exemplo: 'ps ... | ls /tmp/.x ...',
      status: 'corrigido',
      dicas: ['Repita o ps e tente listar a pasta.'],
      severidade: 'critica',
      porqueSeveridade: '',
      recomendacao: 'Corrigido. Manter os indicadores no monitoramento por pelo menos 90 dias.',
      validar: async (t) => {
        const n = normalizar(t);
        if (n.includes('/tmp/.x/kworkerd') && !n.includes('no such file')) return { ok: false, motivo: 'Essa evidência ainda mostra o processo. É a de antes?' };
        if (!/no such file|nao existe|0\b/.test(n)) return { ok: false, motivo: 'Mostre que o processo e a pasta não existem mais.' };
        return { ok: true };
      },
    },
    {
      id: 'pdm-rt-persistencia',
      titulo: 'Verificação: tarefa agendada e chave intrusa',
      objetivo: 'A tarefa e a chave do invasor foram removidas?',
      exemplo: 'crontabs: ... | authorized_keys: ...',
      status: 'corrigido',
      dicas: ['Liste /etc/crontabs e conte quantas vezes x@vps aparece nas chaves.'],
      severidade: 'critica',
      porqueSeveridade: '',
      recomendacao: 'Corrigido: a tarefa saiu e só a chave do Wanderson ficou.',
      validar: async (t) => {
        const n = normalizar(t);
        if (n.includes('*/10 * * * *')) return { ok: false, motivo: 'A tarefa ainda aparece na evidência. Rode de novo.' };
        if (!n.includes('wanderson@notebook-ti') && !/x@vps.*\b0\b|\b0\b.*x@vps/.test(n)) return { ok: false, motivo: 'Mostre como ficaram as chaves autorizadas.' };
        return { ok: true };
      },
    },
    {
      id: 'pdm-rt-conta',
      titulo: 'Verificação: conta com UID 0',
      objetivo: 'A conta escondida com poder de root foi removida?',
      exemplo: 'contas com UID 0: ...',
      status: 'nao',
      dicas: ['Procure de novo as linhas com :0:0: no /etc/passwd.'],
      severidade: 'critica',
      porqueSeveridade: '',
      recomendacao: 'Não corrigido: a conta suporte com UID 0 continua lá. É uma porta aberta com chave de root. Remover hoje, antes da final.',
      validar: async (t) => (normalizar(t).includes('suporte:x:0:0') ? { ok: true } : { ok: false, motivo: 'Mostre as contas com UID 0 que existem hoje.' }),
      aoRegistrar: { id: 'pdm-r3-conta', de: 'wanderson', canal: 'whatsapp', texto: ['eu achei que suporte era conta do sistema 😶', 'apagando agora', 'desculpa, Dra. Lindalva'] },
    },
    {
      id: 'pdm-rt-conexao',
      titulo: 'Verificação: conexão com o invasor',
      objetivo: 'O servidor ainda fala com o servidor do invasor?',
      exemplo: 'ss -tn ...',
      status: 'corrigido',
      dicas: ['Repita o ss -tn e procure o IP do invasor.'],
      severidade: 'critica',
      porqueSeveridade: '',
      recomendacao: 'Corrigido. Manter o bloqueio de saída para os IPs indicadores.',
      validar: async (t) => {
        const n = normalizar(t);
        if (n.includes('estab') && n.includes('198.51.100.66')) return { ok: false, motivo: 'A conexão ainda aparece. Rode de novo.' };
        if (!/ss|conex/.test(n)) return { ok: false, motivo: 'Mostre a verificação das conexões.' };
        return { ok: true };
      },
    },
  ],

  reacoes: [],

  conclusao: [
    {
      id: 'pdm-fim-ato3-tania',
      de: 'tania',
      canal: 'whatsapp',
      texto: [
        'Verificação fechada: três corrigidos e a conta UID 0 que quase ficou para a final.',
        'Você fez o que pouca gente faz bem: parou na hora certa, pediu autorização, coletou sem sujar e não caiu na tentação de revidar.',
        'Isso não é mais pentest. É maturidade. 🖤',
      ],
    },
    {
      id: 'pdm-fim-ato3-bebeto',
      de: 'bebeto',
      canal: 'whatsapp',
      texto: [
        'Comunicamos os sócios ontem, como a Dra. Lindalva mandou. A torcida até elogiou a transparência, acredita?',
        'E domingo... 2 a 1, com gol aos 47 do segundo tempo! CAMPEÃO! ⚽🏆',
        'Tem ingresso de camarote pra equipe da Pente Fino na próxima temporada.',
      ],
    },
  ],
};
