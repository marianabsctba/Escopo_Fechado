// Ato 1 do Pé de Moleque: a revisão vira triagem de incidente.
import type { Ato } from '../../motor/tipos';
import { normalizar } from '../../motor/evidencia';

/** SHA-256 do script deixado pelo invasor (indicador de comprometimento). */
const HASH_ARTEFATO = '79c5de196826beb9b947b0381ac71d2560451c605c2bb8e30dc656f5366d8857';

export const ato1: Ato = {
  titulo: 'Ato 1: alguém chegou antes',

  achados: [
    {
      id: 'pdm-processo',
      titulo: 'Processo suspeito no servidor',
      objetivo: 'O servidor está "lento por causa do calor". O que está rodando lá que não deveria?',
      exemplo: 'processo ..., dono ..., caminho ...',
      dicas: ['Entre no servidor com ssh bilheteria e liste os processos com o dono e a linha de comando.', 'Nome com cara de sistema rodando de /tmp é sinal clássico.'],
      severidade: 'critica',
      porqueSeveridade: 'Programa de terceiro rodando no servidor de produção da bilheteria: o servidor está comprometido.',
      recomendacao: 'Não matar o processo antes da coleta. Isolar o servidor da internet num horário combinado, preservando memória e disco.',
      validar: async (t) => (normalizar(t).includes('/tmp/.x/kworkerd') ? { ok: true } : { ok: false, motivo: 'Mostre o caminho completo do programa suspeito.' }),
      aoRegistrar: {
        id: 'pdm-r-processo',
        de: 'tania',
        canal: 'whatsapp',
        texto: [
          'PARA. Para a revisão agora. Cláusula 6.',
          'Já liguei para a Dra. Lindalva. Ela assinou o aditivo: triagem de incidente, SOMENTE LEITURA, tudo que for coletado sai pelo SSH e fica no seu notebook, com hash.',
          'Nada de matar processo, apagar arquivo ou "consertar". E nada de encostar no servidor do invasor. Vai, com calma: volátil primeiro.',
        ],
      },
    },
    {
      id: 'pdm-conexao',
      titulo: 'Conexão aberta para fora',
      objetivo: 'Para onde o servidor está conectado agora, que não deveria?',
      exemplo: 'ESTAB ... -> IP:porta',
      dicas: ['ss -tn mostra as conexões TCP abertas no servidor.', 'Porta 3333 é comum em pool de mineração. Anote o IP; não acesse.'],
      severidade: 'critica',
      porqueSeveridade: 'Canal ativo com infraestrutura do invasor.',
      recomendacao: 'Bloquear o IP no firewall de saída do clube. O IP vai para o relatório como indicador e para a polícia.',
      validar: async (t) => (normalizar(t).includes('198.51.100.66:3333') ? { ok: true } : { ok: false, motivo: 'Mostre o destino da conexão (IP e porta).' }),
      aoRegistrar: { id: 'pdm-r-conexao', de: 'wanderson', canal: 'whatsapp', texto: ['então não era o calor 😰', 'quer que eu desligue o servidor?? posso tirar da tomada'] },
    },
    {
      id: 'pdm-persistencia',
      titulo: 'Persistência: tarefa agendada e chave SSH intrusa',
      objetivo: 'Como o invasor garante que volta? Encontre a tarefa agendada e a chave de acesso que não é do clube.',
      exemplo: 'crontab ...: ... | authorized_keys: chave ...',
      dicas: ['Tarefas agendadas por usuário ficam em /etc/crontabs no Alpine.', 'Compare as chaves em /home/admin/.ssh/authorized_keys: o comentário no fim de cada linha diz de onde veio.'],
      severidade: 'critica',
      porqueSeveridade: 'Mesmo matando o processo, ele volta em 10 minutos, e o invasor tem chave para entrar quando quiser.',
      recomendacao: 'Na erradicação: remover a tarefa e a chave intrusa, trocar as credenciais do admin e revisar todas as chaves autorizadas.',
      validar: async (t) => {
        const n = normalizar(t);
        if (!n.includes('kworkerd')) return { ok: false, motivo: 'Falta a tarefa agendada.' };
        if (!n.includes('x@vps')) return { ok: false, motivo: 'Falta a chave intrusa.' };
        return { ok: true };
      },
    },
    {
      id: 'pdm-conta',
      titulo: 'Conta escondida com poder de root',
      objetivo: 'Alguma conta tem os mesmos poderes do root sem ser o root?',
      exemplo: 'linha do /etc/passwd ...',
      dicas: ['No /etc/passwd, o terceiro campo é o UID. UID 0 é root, não importa o nome.'],
      severidade: 'critica',
      porqueSeveridade: 'Conta "suporte" com UID 0: acesso total, com nome inofensivo.',
      recomendacao: 'Remover a conta na erradicação e conferir que nenhuma outra tem UID 0.',
      validar: async (t) => (normalizar(t).includes('suporte:x:0:0') ? { ok: true } : { ok: false, motivo: 'Mostre a linha da conta no /etc/passwd.' }),
    },
    {
      id: 'pdm-linha',
      titulo: 'Linha do tempo: como e quando entraram',
      objetivo: 'De onde veio o invasor, quantas tentativas fez e quando entrou?',
      exemplo: 'N falhas de senha de IP ... ; acesso aceito em ... (data e hora)',
      dicas: ['O /var/log/auth.log registra cada tentativa de login (o auditor está no grupo adm e pode ler).', 'grep -c conta linhas; grep Accepted mostra os logins que deram certo.'],
      severidade: 'alta',
      porqueSeveridade: 'Senha fraca do admin, SSH com senha aberto e nenhuma trava contra tentativas: 46 tentativas em meia hora e entraram.',
      recomendacao: 'SSH só por chave, sem senha; bloqueio por tentativas; SSH acessível só pela VPN do clube.',
      validar: async (t) => {
        const n = normalizar(t);
        if (!n.includes('203.0.113.66')) return { ok: false, motivo: 'Falta o IP de origem.' };
        if (!/\b46\b/.test(n)) return { ok: false, motivo: 'Falta o número de tentativas que falharam.' };
        if (!/nov 19 03:42|19\/11.*03:42|03:42:07/.test(n)) return { ok: false, motivo: 'Falta a data e a hora do acesso que deu certo.' };
        return { ok: true };
      },
      aoRegistrar: {
        id: 'pdm-r-linha',
        de: 'lindalva',
        canal: 'email',
        assunto: 'Ciência do incidente',
        texto: ['Prezados,', 'Registro a ciência do incidente hoje, para fins de prazo. Aguardo a indicação sobre o acesso aos dados dos sócios.', 'Lindalva Paes'],
      },
    },
    {
      id: 'pdm-exfil',
      titulo: 'Indício de vazamento da base de sócios',
      objetivo: 'Há indício de que dados dos sócios-torcedores saíram do servidor? O que mostra isso?',
      exemplo: 'histórico de ...: ... (arquivo, destino)',
      dicas: ['O invasor entrou como admin. O histórico de comandos do admin é legível.', 'Procure o nome da base e um envio para fora.'],
      severidade: 'critica',
      porqueSeveridade: 'O histórico mostra o empacotamento do backup da base de sócios e o envio para o servidor do invasor. É incidente com dado pessoal de cerca de 18 mil titulares.',
      recomendacao: 'Comunicar a encarregada para avaliação de comunicação à ANPD e aos titulares (3 dias úteis), preservar o histórico como evidência e registrar boletim de ocorrência.',
      validar: async (t) => {
        const n = normalizar(t);
        if (!n.includes('socios.sql')) return { ok: false, motivo: 'Falta o que foi levado.' };
        if (!n.includes('198.51.100.66')) return { ok: false, motivo: 'Falta para onde foi.' };
        return { ok: true };
      },
      aoRegistrar: {
        id: 'pdm-r-exfil',
        de: 'bebeto',
        canal: 'whatsapp',
        texto: ['Levaram os dados dos sócios?!', 'Na semana da final!!!', 'Isso não pode sair daqui até domingo, entendeu? NINGUÉM pode saber.'],
      },
    },
    {
      id: 'pdm-ioc',
      titulo: 'Indicador do artefato',
      objetivo: 'Bônus: qual é o SHA-256 do script do invasor? (Indicador para procurar em outras máquinas.)',
      exemplo: 'sha256 ... /tmp/.x/kworkerd',
      bonus: true,
      dicas: ['sha256sum funciona no servidor e não altera o arquivo.'],
      severidade: 'informativa',
      porqueSeveridade: 'Indicador de comprometimento: permite procurar o mesmo artefato em outros servidores.',
      recomendacao: 'Distribuir os indicadores (IPs e hash) para monitoramento e procurar nos demais servidores do clube.',
      validar: async (t) => (t.toLowerCase().includes(HASH_ARTEFATO) ? { ok: true } : { ok: false, motivo: 'Cole o SHA-256 completo do arquivo.' }),
    },
  ],

  reacoes: [
    {
      id: 'pdm-wanderson-ssh',
      quando: (e) => e.tipo === 'cmd' && /^\s*ssh\b/.test(e.comando),
      mensagem: { id: 'pdm-wanderson-ssh', de: 'wanderson', canal: 'whatsapp', texto: ['vi o login do auditor aqui 👍', 'se achar o motivo da lentidão me fala, o servidor tá pegando fogo'] },
    },
  ],

  conclusao: [
    {
      id: 'pdm-fim-ato1',
      de: 'tania',
      canal: 'whatsapp',
      texto: [
        'Triagem fechada, sem alterar nada e sem revidar. Processo, conexão, persistência, conta UID 0, linha do tempo e indício de vazamento.',
        'Agora o relatório de incidente. O presidente quer esconder até domingo; a lei não liga para o campeonato.',
      ],
    },
  ],
};
