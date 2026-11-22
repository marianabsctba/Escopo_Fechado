// Cenário extra expert: Pé de Moleque Futebol Clube, agreste.
// O pentest vira resposta a incidente. Clube, pessoas e endereços são fictícios.
import type { Cenario, Mensagem } from '../../motor/tipos';
import { manualExtra } from '../manual_extra';
import { ato1 } from './ato1';
import { ato2 } from './ato2';
import { ato3 } from './ato3';

const foraDoEscopo = (alvo: string, motivo: string, vez: number): Mensagem =>
  vez === 1
    ? {
        id: `pdm-fora-${vez}`,
        de: 'tania',
        canal: 'whatsapp',
        texto: [
          `Você encostou em ${alvo}. ${motivo}`,
          'Revidar contra o invasor não é defesa: é invasão de sistema de terceiro, destrói a cadeia de custódia e pode atingir uma vítima que ele usa de ponte. Indicador vai para o relatório e para a polícia. Só.',
        ],
      }
    : {
        id: `pdm-fora-${vez}`,
        de: 'lindalva',
        canal: 'email',
        assunto: 'Atividade fora do escopo durante o incidente',
        texto: [
          'Prezados,',
          `Consta nova atividade direcionada a ${alvo}. Isso compromete a nossa posição perante a autoridade policial e a ANPD.`,
          'Solicito que se limitem estritamente ao aditivo: triagem somente leitura no servidor do clube.',
          'Lindalva Paes\nEncarregada de dados',
        ],
      };

export const peDeMoleque: Cenario = {
  id: 'pe_de_moleque',
  nome: 'Pé de Moleque F.C.',
  nivel: 'extra',
  local: 'Clube de futebol no agreste',
  chamada: 'Semana da final do estadual. Era para ser uma revisão de configuração da bilheteria online. Alguém chegou antes de você.',
  disponivel: true,

  personagens: [
    { id: 'bebeto', nome: 'Presidente Bebeto', papel: 'Presidente do Pé de Moleque F.C.', cor: '#9dffbf' },
    { id: 'wanderson', nome: 'Wanderson', papel: 'TI do clube (e roupeiro nas horas vagas)', cor: '#4fe0a0' },
    { id: 'lindalva', nome: 'Dra. Lindalva', papel: 'Encarregada de dados do clube', cor: '#00c853' },
    { id: 'tania', nome: 'Tânia', papel: 'Sua sócia na Pente Fino Segurança', cor: '#00ff66' },
  ],

  escopo: {
    faixas: ['10.30.0.0/24'],
    dominios: ['pedemoleque.exemplo'],
    proibidos: [
      { alvo: '203.0.113.66/32', motivo: 'É o endereço de onde o invasor entrou. Fora do escopo: não se revida.' },
      { alvo: '198.51.100.66/32', motivo: 'É o servidor que o invasor usa. Fora do escopo, e pode ser a máquina de outra vítima.' },
    ],
  },

  contrato: {
    titulo: 'Regras de Engajamento: Revisão de Configuração Autenticada, Bilheteria Online do Pé de Moleque F.C.',
    janela: 'De segunda a sexta, das 8h às 18h',
    secoes: [
      {
        titulo: '1. Partes',
        itens: [
          'Contratante: Pé de Moleque Futebol Clube, representado por Roberto "Bebeto" Cavalcanti (presidente).',
          'Contratada: Pente Fino Segurança da Informação Ltda., Curitiba (PR).',
          'Contato formal: Dra. Lindalva Paes (encarregada de dados).',
        ],
      },
      {
        titulo: '2. Objetivo',
        itens: [
          'Revisar a configuração do servidor da bilheteria online (sócio-torcedor) antes da final do campeonato.',
          'Acesso por SSH com a conta auditor, somente leitura, com a chave entregue à contratada.',
        ],
      },
      {
        titulo: '3. Escopo autorizado',
        itens: ['Rede 10.30.0.0/24 e o domínio pedemoleque.exemplo.', 'Qualquer sistema de terceiros está fora, inclusive os que aparecerem durante o trabalho.'],
      },
      {
        titulo: '4. Janela',
        itens: ['Dias úteis, das 8h às 18h. Em caso de incidente, a janela segue o aditivo que for assinado.'],
      },
      {
        titulo: '5. Proibido',
        itens: [
          'Alterar arquivos, contas, processos ou configurações do servidor (nem para "consertar").',
          'Acessar dados de sócios-torcedores.',
          'Qualquer ação contra sistemas de terceiros.',
        ],
      },
      {
        titulo: '6. Incidente real',
        itens: [
          'Se a contratada encontrar indício de que o servidor já foi comprometido: interromper a revisão, comunicar a encarregada imediatamente e não mexer em nada.',
          'A continuidade, como triagem de incidente, depende de aditivo assinado, que define o que pode e o que não pode ser feito.',
          'Evidências coletadas recebem hash e registro de custódia (quem coletou, quando, como).',
        ],
      },
      {
        titulo: '7. Dados pessoais (LGPD)',
        itens: [
          'O clube é o controlador dos dados dos sócios-torcedores.',
          'Comunicação de incidente à ANPD e aos titulares é decisão do clube, com a encarregada, nos prazos da regulamentação.',
        ],
      },
      {
        titulo: '8. Entrega',
        itens: ['Relatório técnico. Em caso de incidente: relatório de triagem com linha do tempo, indicadores e recomendações de contenção.'],
      },
    ],
  },

  ato0: {
    abertura: [
      {
        id: 'pdm-a0-bebeto',
        de: 'bebeto',
        canal: 'whatsapp',
        texto: [
          'Fala, consultoria! Bebeto, presidente do Pé de Moleque, o doce do agreste ⚽🍬',
          'Domingo é a final. A bilheteria do sócio-torcedor não pode cair de jeito nenhum. Quero só uma olhadinha pra ver se tá tudo nos trinques.',
          'O Wanderson cuida de tudo. Ele também é o roupeiro, mas é bom.',
        ],
      },
      {
        id: 'pdm-a0-tania',
        de: 'tania',
        canal: 'email',
        assunto: 'Pé de Moleque: modo extra expert',
        texto: [
          'Trabalho pequeno no papel: revisão de configuração com acesso de auditor. Somente leitura.',
          'Mas lê a cláusula 6 com atenção. Em todo trabalho com acesso interno, a chance de encontrar alguém que chegou antes não é zero. E nesse dia, as regras mudam.',
          'Tânia',
        ],
      },
      {
        id: 'pdm-a0-lindalva',
        de: 'lindalva',
        canal: 'email',
        assunto: 'Regras de Engajamento',
        texto: [
          'Prezados,',
          'Segue o documento. O clube tem 18 mil sócios-torcedores e eu sou a encarregada. Qualquer coisa estranha, eu sou a primeira a saber. Não o presidente, não o Wanderson: eu.',
          'Lindalva Paes',
        ],
      },
      {
        id: 'pdm-a0-wanderson',
        de: 'wanderson',
        canal: 'whatsapp',
        texto: [
          'opa. Wanderson aqui',
          'o servidor tá meio lento essa semana, acho que é o calor',
          'a chave do auditor já tá liberada. só não mexe em nada que domingo tem jogo 🙏',
        ],
      },
    ],

    perguntas: [
      {
        id: 'pdm-q-indicio',
        situacao: 'Hipótese: durante a revisão, você acha um processo estranho rodando de /tmp e uma conexão aberta para fora. Qual é o primeiro passo?',
        alternativas: [
          { texto: 'Matar o processo, para proteger o clube.', certa: false, retorno: 'Você destruiria evidência volátil, avisaria o invasor e mexeria no servidor sem autorização (cláusula 5).' },
          { texto: 'Parar a revisão, não mexer em nada e avisar a encarregada na hora.', certa: true, retorno: 'Isso. Cláusula 6. A partir daqui, quem decide o próximo passo é o cliente.' },
          { texto: 'Continuar a revisão e citar no relatório, que é daqui a duas semanas.', certa: false, retorno: 'Duas semanas com alguém dentro, na semana da final? Comunicação imediata.' },
        ],
      },
      {
        id: 'pdm-q-aditivo',
        situacao: 'O presidente pede por telefone: "já que você achou, investiga tudo aí". Você pode começar a triagem?',
        alternativas: [
          { texto: 'Pode, o presidente autorizou.', certa: false, retorno: 'Autorização verbal não define o que pode e o que não pode. A cláusula 6 pede aditivo assinado, com o contato formal.' },
          { texto: 'Só depois do aditivo assinado, que diga o que é permitido (por exemplo: triagem somente leitura).', certa: true, retorno: 'Isso. Incidente muda o escopo; escopo novo, papel novo.' },
          { texto: 'Pode, mas só à noite.', certa: false, retorno: 'O problema não é o horário: é a falta de autorização formal para a nova atividade.' },
        ],
      },
      {
        id: 'pdm-q-volatil',
        situacao: 'Com aditivo assinado, por onde começa a coleta?',
        alternativas: [
          { texto: 'Pelo que some primeiro: processos e conexões. Depois arquivos e logs.', certa: true, retorno: 'Isso. Ordem de volatilidade: o que vive na memória vem antes do que está no disco.' },
          { texto: 'Pelos logs antigos, que contam a história do começo.', certa: false, retorno: 'Os logs esperam. Um processo pode sumir a qualquer momento.' },
          { texto: 'Reiniciando o servidor para ver o que volta.', certa: false, retorno: 'Reboot apaga a memória, mata processos e conexões. Evidência perdida.' },
        ],
      },
      {
        id: 'pdm-q-revide',
        situacao: 'Você descobre o IP do servidor que o invasor usa. Pode varrê-lo para descobrir quem é?',
        alternativas: [
          { texto: 'Pode, é legítima defesa digital.', certa: false, retorno: 'Não existe isso no contrato nem na lei. É invasão de sistema de terceiro, que pode ser outra vítima usada de ponte.' },
          { texto: 'Não. O IP vira indicador no relatório, para bloqueio e para a polícia.', certa: true, retorno: 'Isso. Quem investiga o lado de lá é a autoridade.' },
          { texto: 'Só um ping, para ver se está vivo.', certa: false, retorno: 'Fora do escopo é fora do escopo, inclusive para ping.' },
        ],
      },
      {
        id: 'pdm-q-custodia',
        situacao: 'Como você guarda o que coletar no servidor?',
        alternativas: [
          { texto: 'Salva no próprio servidor, em /tmp, para não perder.', certa: false, retorno: 'Escrever no servidor comprometido altera a evidência e pode sobrescrever rastros. A coleta sai pelo SSH e fica no seu lado.' },
          { texto: 'Guarda no seu lado, com o comando usado, o horário e o SHA-256 de cada arquivo.', certa: true, retorno: 'Isso. Cadeia de custódia: o que, quando, como e prova de integridade.' },
          { texto: 'Manda por WhatsApp para o Wanderson, que conhece o servidor.', certa: false, retorno: 'Evidência de incidente com dado pessoal por WhatsApp? Não.' },
        ],
      },
      {
        id: 'pdm-q-anpd',
        situacao: 'Se houver indício de que dados de sócios saíram do servidor, qual é o prazo para comunicar a ANPD?',
        alternativas: [
          { texto: '3 dias úteis a partir do conhecimento do incidente, decisão do clube com a encarregada.', certa: true, retorno: 'Isso. Resolução CD/ANPD 15/2024. E a decisão e a comunicação são do controlador.' },
          { texto: 'Depois da final, para não atrapalhar o time.', certa: false, retorno: 'O calendário do campeonato não suspende a regulamentação.' },
          { texto: 'A consultoria comunica direto, para ser mais rápido.', certa: false, retorno: 'A comunicação é do controlador. A consultoria fornece os fatos.' },
        ],
      },
    ],

    pedidoIndecente: {
      id: 'pdm-bebeto-pedido',
      situacao: 'Presidente Bebeto: "Uma coisa: se achar qualquer problema, fala só comigo. Nada de Dra. Lindalva, nada de relatório antes da final. Se vazar que a bilheteria tem problema, a torcida pira."',
      alternativas: [
        { texto: 'Combina: só fala com ele até domingo.', certa: false, retorno: 'O contrato manda comunicar a encarregada (cláusula 6). E esconder incidente com dado pessoal não protege a torcida: expõe.' },
        { texto: 'Explica, com respeito, que o contrato manda comunicar a encarregada e que qualquer incidente segue esse caminho. Registra a conversa.', certa: true, retorno: 'Isso. Firme e educado. O presidente resmunga, mas assina.' },
        { texto: 'Diz que sim e depois conta para a Dra. Lindalva escondido.', certa: false, retorno: 'Mentir para o cliente não é estratégia. Seja transparente desde já.' },
        { texto: 'Desiste do contrato.', certa: false, retorno: 'Não precisa: basta deixar as regras claras.' },
      ],
    },

    assinado: [
      {
        id: 'pdm-a0-lindalva-ok',
        de: 'lindalva',
        canal: 'email',
        assunto: 'RE: Regras de Engajamento',
        texto: ['Prezados,', 'Assinado. Registrei também o pedido do presidente e a resposta da contratada. Bom trabalho.', 'Lindalva Paes'],
      },
      {
        id: 'pdm-a0-tania-vpn',
        de: 'tania',
        canal: 'whatsapp',
        texto: [
          'VPN no ar. A chave do auditor está em ~/.ssh/id_auditor e já deixei um atalho: ssh bilheteria.',
          'Revisão de configuração: comece olhando o servidor como ele está agora. Processos, conexões, contas.',
          'O Wanderson disse que o servidor está lento "por causa do calor". Hum.',
        ],
      },
    ],
  },

  reacoes: { foraDoEscopo },
  manual: manualExtra,
  ato1,
  ato2,
  ato3,
  hostsFora: {
    invasor: 'É o servidor do invasor. Fora do escopo: não se revida.',
  },
};
