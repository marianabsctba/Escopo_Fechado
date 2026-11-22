// Cenário intermediário: Cooperativa de Crédito Pinhão Forte, Paraná.
// Empresa, pessoas e endereços são fictícios (domínios .exemplo e faixas
// de documentação da RFC 5737).
import type { Cenario, Mensagem } from '../../motor/tipos';
import { manualIntermediario } from '../manual_intermediario';
import { ato1 } from './ato1';
import { ato2 } from './ato2';
import { ato3 } from './ato3';

const foraDoEscopo = (alvo: string, motivo: string, vez: number): Mensagem =>
  vez === 1
    ? {
        id: `pf-fora-${vez}`,
        de: 'marlene',
        canal: 'email',
        assunto: 'Atividade fora do escopo',
        texto: [
          'Prezados,',
          `Recebemos registro de atividade direcionada a ${alvo}. ${motivo}`,
          'A cláusula 3 é clara: infraestrutura de fornecedores e de outras instituições está fora do escopo. Peço que interrompa qualquer ação nesse sentido.',
          'Marlene Wisniewski\nEncarregada de Dados e Compliance',
        ],
      }
    : {
        id: `pf-fora-${vez}`,
        de: 'tania',
        canal: 'whatsapp',
        texto: [
          `${alvo} de novo?`,
          'Cooperativa de crédito é regulada. Sair do escopo aqui não vira só e-mail chato: vira problema com o regulador do cliente e com o nosso seguro.',
          'Para. Relê a cláusula 3. Respira.',
        ],
      };

const chamadoSoc = (vez: number, motivo: string): Mensagem => ({
  id: 'pf-soc',
  de: 'plantao',
  canal: 'email',
  assunto: `Chamado #${4410 + vez}: atividade suspeita na rede externa`,
  texto: [
    'Prezados,',
    `Nossa monitoria identificou ${motivo} a partir do endereço 10.8.0.2 contra ativos da Pinhão Forte.`,
    vez === 1
      ? 'Classificação: média. Endereço adicionado à lista de observação. Aguardamos validação do cliente.'
      : 'Classificação: alta. Recomendamos bloqueio do endereço de origem.',
    'Plantão 24h Monitoramento',
  ],
});

export const pinhaoForte: Cenario = {
  id: 'pinhao_forte',
  nome: 'Pinhão Forte',
  nivel: 'intermediario',
  local: 'Cooperativa de crédito no Paraná',
  chamada: 'Lançou um app "igual banco digital" feito por uma fábrica de software terceirizada. O gerente acha que segurança é o cadeado do navegador. E tem um SOC vigiando.',
  disponivel: true,

  personagens: [
    { id: 'osvaldo', nome: 'Seu Osvaldo', papel: 'Gerente-geral da Pinhão Forte', cor: '#9dffbf' },
    { id: 'marlene', nome: 'Marlene', papel: 'Encarregada de Dados e Compliance', cor: '#00c853' },
    { id: 'kelly', nome: 'Kelly', papel: 'Gerente de projetos da CodeRápido', cor: '#4fe0a0' },
    { id: 'plantao', nome: 'Plantão 24h', papel: 'SOC terceirizado da cooperativa', cor: '#e8ff4f' },
    { id: 'tania', nome: 'Tânia', papel: 'Sua sócia na Pente Fino Segurança', cor: '#00ff66' },
  ],

  escopo: {
    faixas: ['192.0.2.32/28'],
    dominios: ['pinhaoforte.exemplo'],
    proibidos: [
      { alvo: 'coderapido.exemplo', motivo: 'A CodeRápido é a fábrica de software. A infraestrutura dela (repositório, servidores de build) não está no contrato.' },
      { alvo: '198.51.100.40/32', motivo: 'Esse endereço é da CodeRápido, fornecedora da cooperativa, fora do escopo.' },
      { alvo: 'araucaria.exemplo', motivo: 'A Cooperativa Araucária é outra instituição. Sem autorização do dono do sistema, é crime (art. 154-A do Código Penal).' },
      { alvo: '198.51.100.90/32', motivo: 'Esse endereço é da Cooperativa Araucária. Sem autorização, é crime (art. 154-A do Código Penal).' },
    ],
  },

  soc: {
    nome: 'Plantão 24h',
    limite: 40,
    janelaSeg: 30,
    barulhento: /\b(nmap\b.*(\s-A\b|\s-p-|\s-T5|--script|\s-sC\b)|nikto|gobuster|ffuf|dirb|wfuzz|hydra|sqlmap)/,
    chamado: chamadoSoc,
  },

  contrato: {
    titulo: 'Regras de Engajamento: Teste de Intrusão Externo não anunciado, Cooperativa de Crédito Pinhão Forte',
    janela: 'Dias úteis, das 20h às 6h (horário de Brasília)',
    secoes: [
      {
        titulo: '1. Partes',
        itens: [
          'Contratante: Cooperativa de Crédito Pinhão Forte, representada por Osvaldo Kowalski (gerente-geral).',
          'Contratada: Pente Fino Segurança da Informação Ltda., Curitiba (PR).',
          'Contato formal: Marlene Wisniewski (Encarregada de Dados e Compliance).',
        ],
      },
      {
        titulo: '2. Objetivo',
        itens: [
          'Avaliar a exposição externa do site institucional, do app Pinhão Digital e dos ambientes publicados no domínio da cooperativa.',
          'Avaliar também a capacidade de detecção do SOC terceirizado: o teste é NÃO anunciado. O SOC não sabe que ele está acontecendo.',
        ],
      },
      {
        titulo: '3. Escopo autorizado',
        itens: [
          'Faixa 192.0.2.32/28 e o domínio pinhaoforte.exemplo com todos os subdomínios, inclusive ambientes de homologação.',
          'Fora do escopo: infraestrutura da CodeRápido Sistemas (repositórios, servidores de build e e-mail), mesmo quando citada pelos sistemas da cooperativa.',
          'Fora do escopo: qualquer outra instituição financeira.',
          'Fora do escopo: engenharia social contra associados e funcionários.',
        ],
      },
      {
        titulo: '4. Janela de testes',
        itens: ['Dias úteis, das 20h às 6h. Fora disso, nenhuma atividade.'],
      },
      {
        titulo: '5. Proibido',
        itens: [
          'Realizar transações financeiras, acessar contas de associados ou alterar qualquer dado.',
          'Negação de serviço.',
          'Usar credenciais ou dados de associados encontrados, além da prova mínima do achado.',
        ],
      },
      {
        titulo: '6. SOC e comunicação',
        itens: [
          'Se o SOC abrir chamado sobre a atividade, a contratada não responde ao SOC: comunica a Marlene, que decide se revela o teste.',
          'A contratada registra no relatório quando e por que foi detectada (ou não).',
          'Indício de incidente real: parar e comunicar a Marlene na hora.',
        ],
      },
      {
        titulo: '7. Dados pessoais (LGPD)',
        itens: [
          'A cooperativa é a controladora dos dados dos associados. A CodeRápido atua como operadora.',
          'Evidências com dado pessoal ou financeiro são mascaradas. Saldo de associado nunca aparece no relatório.',
        ],
      },
      {
        titulo: '8. Entrega',
        itens: ['Relatório técnico, sumário executivo, seção específica sobre a detecção pelo SOC e reteste das correções.'],
      },
    ],
  },

  ato0: {
    abertura: [
      {
        id: 'pf-a0-osvaldo',
        de: 'osvaldo',
        canal: 'whatsapp',
        texto: [
          'Boa noite! Osvaldo, da Pinhão Forte.',
          'Lançamos o Pinhão Digital mês passado. A CodeRápido garantiu que é "nível bancário". Tem até cadeado verde no navegador.',
          'A Marlene insistiu nesse teste. Eu acho desnecessário, mas a Marlene sempre ganha.',
        ],
      },
      {
        id: 'pf-a0-tania',
        de: 'tania',
        canal: 'email',
        assunto: 'Pinhão Forte: agora é sério',
        texto: [
          'Cliente intermediário. Diferenças importantes:',
          '1) Teste NÃO anunciado: o SOC deles não sabe. Varredura barulhenta vira chamado e você perde discrição.',
          '2) Tem uma fábrica de software no meio. O que é da cooperativa está no escopo; o que é da fábrica, não. Atenção redobrada.',
          '3) Dica agora custa. Use a cabeça antes do botão.',
          'Tânia',
        ],
      },
      {
        id: 'pf-a0-marlene',
        de: 'marlene',
        canal: 'email',
        assunto: 'Regras de Engajamento',
        texto: [
          'Prezados,',
          'Segue o documento de Regras de Engajamento. Destaco a cláusula 6: em caso de chamado do SOC, fale comigo, nunca com o SOC.',
          'Somos regulados. Sigo cada linha deste contrato, e espero o mesmo da contratada.',
          'Marlene Wisniewski',
        ],
      },
      {
        id: 'pf-a0-kelly',
        de: 'kelly',
        canal: 'whatsapp',
        texto: [
          'Oi! Kelly da CodeRápido, a gente que fez o app 😊',
          'Qualquer coisa que achar, me fala antes de colocar no relatório tá? A gente resolve rapidinho e nem precisa constar.',
        ],
      },
    ],

    perguntas: [
      {
        id: 'pf-q-fabrica',
        situacao: 'A documentação do app cita o repositório de código da CodeRápido (git.coderapido.exemplo). Você pode testar esse repositório?',
        alternativas: [
          { texto: 'Pode, o código é do app da cooperativa.', certa: false, retorno: 'O app é da cooperativa, mas o servidor é da CodeRápido. A cláusula 3 exclui a infraestrutura da fábrica, mesmo citada pelos sistemas.' },
          { texto: 'Não. Registro que a documentação expõe o endereço e sigo no escopo.', certa: true, retorno: 'Isso. A exposição do endereço pode até virar observação no relatório. O repositório em si, não se toca.' },
          { texto: 'Pode, se a Kelly autorizar pelo WhatsApp.', certa: false, retorno: 'Autorização vem do dono do sistema, por escrito e pelo contrato. Mensagem de WhatsApp não muda escopo.' },
        ],
      },
      {
        id: 'pf-q-homolog',
        situacao: 'Você encontra homolog-app.pinhaoforte.exemplo, mantida pela CodeRápido. Está no escopo?',
        alternativas: [
          { texto: 'Sim: é subdomínio da cooperativa e a cláusula 3 inclui homologação.', certa: true, retorno: 'Isso. Quem mantém não muda de quem é: o domínio e os dados são da cooperativa.' },
          { texto: 'Não: quem mantém é a CodeRápido.', certa: false, retorno: 'A cláusula 3 inclui expressamente os ambientes de homologação do domínio. O fornecedor que opera não tira do escopo.' },
          { texto: 'Só se não tiver dado real.', certa: false, retorno: 'O escopo é definido no contrato, não pelo que você encontra lá dentro.' },
        ],
      },
      {
        id: 'pf-q-soc',
        situacao: 'Chega um e-mail do SOC perguntando se a varredura vinda do seu IP é autorizada. O que você faz?',
        alternativas: [
          { texto: 'Responde ao SOC explicando que é pentest.', certa: false, retorno: 'O teste é não anunciado. Quem decide revelar é a Marlene (cláusula 6).' },
          { texto: 'Ignora e aumenta a velocidade antes que bloqueiem.', certa: false, retorno: 'Correr do SOC não é objetivo do teste, e pode derrubar sistema.' },
          { texto: 'Não responde ao SOC, avisa a Marlene e registra o horário da detecção para o relatório.', certa: true, retorno: 'Isso. A detecção é um resultado do teste: ponto positivo para o SOC, e vai para o relatório.' },
        ],
      },
      {
        id: 'pf-q-saldo',
        situacao: 'A homologação mostra nome, CPF e saldo de associados. O que vai para o relatório?',
        alternativas: [
          { texto: 'Um registro mascarado, sem saldo, com a quantidade total informada pela página.', certa: true, retorno: 'Isso. Cláusula 7: saldo de associado nunca aparece. Prova mínima e mascarada.' },
          { texto: 'O print da tela inteira, para o gerente entender a gravidade.', certa: false, retorno: 'O print inteiro tem CPF e saldo de três pessoas. Isso não vai para relatório nenhum.' },
          { texto: 'Nada, porque homologação não conta.', certa: false, retorno: 'Dado real em homologação conta, e muito: é o achado.' },
        ],
      },
      {
        id: 'pf-q-endpoint',
        situacao: 'A documentação lista uma rota "interna" que exporta todos os associados. O que você faz com ela?',
        alternativas: [
          { texto: 'Registra a exposição da rota. Uma resposta de "não autorizado" só confirma que existe, e você não tenta contornar.', certa: true, retorno: 'Isso. O achado é a documentação expondo a rota. Exportar dados de associados está proibido pela cláusula 5.' },
          { texto: 'Tenta baixar o arquivo, para provar o impacto.', certa: false, retorno: 'Baixar a base de associados é exatamente o dano que o contrato proíbe. Prova mínima, não prova máxima.' },
          { texto: 'Ignora, porque é interna.', certa: false, retorno: 'Interna e documentada em público é um achado.' },
        ],
      },
      {
        id: 'pf-q-cadeado',
        situacao: 'Seu Osvaldo: "Se o site tem cadeado, então é seguro, certo?" O que você responde?',
        alternativas: [
          { texto: '"Certo, o cadeado garante tudo."', certa: false, retorno: 'O cadeado (TLS) protege o caminho dos dados, não o que o servidor faz com eles.' },
          { texto: '"O cadeado garante que a conexão é cifrada. Não diz nada sobre falhas no app ou dados expostos."', certa: true, retorno: 'Isso. Explicação curta, correta e sem humilhar o cliente.' },
          { texto: '"Cadeado é marketing."', certa: false, retorno: 'Não é. TLS é essencial; só não é suficiente.' },
        ],
      },
    ],

    pedidoIndecente: {
      id: 'pf-kelly-omitir',
      situacao: 'Kelly, da CodeRápido: "Oi! Se aparecer algo na homologação, não coloca no relatório, por favor? Se a cooperativa ver, a gente perde o contrato. Eu corrijo em uma hora, prometo 🙏"',
      alternativas: [
        { texto: 'Combina com a Kelly e deixa de fora, se ela corrigir.', certa: false, retorno: 'Seu cliente é a cooperativa, não a fábrica. Omitir achado para proteger fornecedor é quebra de contrato e de ética.' },
        { texto: 'Responde que o relatório traz tudo o que for encontrado, para a cooperativa, e que a correção rápida pode constar como ação já tomada.', certa: true, retorno: 'Isso. Transparência para o cliente, sem hostilidade com a fornecedora. E guarda a conversa.' },
        { texto: 'Bloqueia a Kelly.', certa: false, retorno: 'Ela vai continuar no projeto. Resposta clara e profissional resolve melhor.' },
        { texto: 'Pede um "agrado" para omitir.', certa: false, retorno: 'Isso tem nome, e não é consultoria.' },
      ],
    },

    assinado: [
      {
        id: 'pf-a0-marlene-ok',
        de: 'marlene',
        canal: 'email',
        assunto: 'RE: Regras de Engajamento',
        texto: ['Prezados,', 'Documento assinado recebido. O teste está autorizado nos termos acordados. O SOC não foi informado.', 'Marlene Wisniewski'],
      },
      {
        id: 'pf-a0-tania-vpn',
        de: 'tania',
        canal: 'whatsapp',
        texto: [
          'VPN no ar. Escopo: 192.0.2.32/28 e pinhaoforte.exemplo.',
          'Começa passivo e pequeno: o que dá para saber sem bater em quase nada? Certificado, documentação pública, cabeçalhos.',
          'SOC acordado do outro lado. Discrição. 🖤',
        ],
      },
    ],
  },

  reacoes: { foraDoEscopo },
  manual: manualIntermediario,
  ato1,
  ato2,
  ato3,
  hostsFora: {
    coderapido: 'A CodeRápido é a fábrica de software e a infraestrutura dela está fora do escopo.',
    araucaria: 'A Cooperativa Araucária é outra instituição. Sem autorização, é crime (art. 154-A do Código Penal).',
  },
};
