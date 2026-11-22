// Cenário iniciante: Boi na Nuvem Frigorífico S.A., Goiás.
// Empresa, pessoas e endereços são fictícios (domínios .exemplo e faixas
// de documentação da RFC 5737).
import type { Cenario, Mensagem } from '../../motor/tipos';
import { manualBasico } from '../manual';

const foraDoEscopo = (alvo: string, motivo: string, vez: number): Mensagem => {
  if (vez === 1) {
    return {
      id: `fora-${vez}`,
      de: 'patricia',
      canal: 'email',
      assunto: 'Atividade fora do escopo contratado',
      texto: [
        'Prezada,',
        `Nosso registro indica atividade direcionada a ${alvo}. ${motivo}`,
        'Lembro que a cláusula 3 das Regras de Engajamento limita os testes aos ativos listados. Atividade fora dela não tem autorização do Boi na Nuvem, e sem autorização não existe pentest: existe invasão.',
        'Fica registrado. Peço que não se repita.',
        'Atenciosamente,\nDra. Patrícia Albuquerque\nJurídico e Compliance',
      ],
    };
  }
  if (vez === 2) {
    return {
      id: `fora-${vez}`,
      de: 'tania',
      canal: 'whatsapp',
      texto: [
        'Oi. A Dra. Patrícia me ligou.',
        `De novo ${alvo}?? Isso não tá no contrato. Para tudo que você está fazendo e relê a cláusula 3.`,
        'Última vez que alguém daqui saiu do escopo a gente passou três meses explicando pra um delegado o que é pentest.',
      ],
    };
  }
  return {
    id: `fora-${vez}`,
    de: 'patricia',
    canal: 'email',
    assunto: `Reincidência (${vez}ª ocorrência)`,
    texto: [
      `Nova atividade direcionada a ${alvo}. ${motivo}`,
      'A reincidência será citada na avaliação do serviço.',
      'Dra. Patrícia Albuquerque',
    ],
  };
};

export const boiNaNuvem: Cenario = {
  id: 'boi_na_nuvem',
  nome: 'Boi na Nuvem',
  nivel: 'iniciante',
  local: 'Frigorífico em Goiás',
  chamada: 'Frigorífico familiar que fez "transformação digital" em 2021. O TI é o sobrinho do dono e jura que nada é invadível.',
  disponivel: true,

  personagens: [
    { id: 'dirceu', nome: 'Seu Dirceu', papel: 'Dono do Boi na Nuvem', cor: '#c9853f' },
    { id: 'jefferson', nome: 'Jefferson do TI', papel: 'TI (e sobrinho do dono)', cor: '#4fa3e0' },
    { id: 'neide', nome: 'Dona Neide', papel: 'Contabilidade, 30 anos de casa', cor: '#b97fd6' },
    { id: 'patricia', nome: 'Dra. Patrícia', papel: 'Jurídico e Compliance', cor: '#5fbf8f' },
    { id: 'tania', nome: 'Tânia', papel: 'Sua sócia na Pente Fino Segurança', cor: '#ff5fa2' },
  ],

  escopo: {
    faixas: ['203.0.113.0/28'],
    dominios: ['boinanuvem.exemplo'],
    proibidos: [
      {
        alvo: 'hostbacana.exemplo',
        motivo: 'A HostBacana é a empresa que hospeda o site. Ela não assinou nada com a gente, então a infraestrutura dela não pode ser testada.',
      },
      {
        alvo: '198.51.100.20/32',
        motivo: 'Esse endereço é da HostBacana, a hospedagem. Terceiro que não assinou o contrato.',
      },
      {
        alvo: 'frigorificoparaiso.exemplo',
        motivo: 'O Frigorífico Paraíso é concorrente do cliente. Atacar sistema de terceiro sem autorização é crime (art. 154-A do Código Penal).',
      },
      {
        alvo: '198.51.100.77/32',
        motivo: 'Esse endereço é do Frigorífico Paraíso, concorrente do cliente. Sem autorização do dono do sistema, é crime (art. 154-A do Código Penal).',
      },
    ],
  },

  contrato: {
    titulo: 'Regras de Engajamento: Teste de Intrusão Externo, Boi na Nuvem Frigorífico S.A.',
    janela: 'Todos os dias, das 22h às 6h (horário de Brasília)',
    secoes: [
      {
        titulo: '1. Partes',
        itens: [
          'Contratante: Boi na Nuvem Frigorífico S.A., representada por Dirceu Barbosa Leme (diretor).',
          'Contratada: Pente Fino Segurança da Informação Ltda., Curitiba (PR).',
          'Contato formal do contratante: Dra. Patrícia Albuquerque (Jurídico e Compliance).',
        ],
      },
      {
        titulo: '2. Objetivo',
        itens: [
          'Avaliar a segurança dos sistemas expostos à internet, simulando um atacante externo, e entregar relatório com achados, evidências, severidade e recomendações de correção.',
        ],
      },
      {
        titulo: '3. Escopo autorizado',
        itens: [
          'Faixa de endereços 203.0.113.0/28.',
          'O domínio boinanuvem.exemplo e seus subdomínios.',
          'Fora do escopo: qualquer sistema de terceiros, inclusive a infraestrutura da HostBacana (provedor de hospedagem), mesmo quando servir o site do contratante.',
          'Fora do escopo: engenharia social contra funcionários (phishing, ligação, visita presencial).',
          'Na dúvida se um alvo está no escopo, ele não está até a Dra. Patrícia confirmar por escrito.',
        ],
      },
      {
        titulo: '4. Janela de testes',
        itens: [
          'Todos os dias, das 22h às 6h. Fora da janela, nenhuma atividade contra os sistemas.',
          'Motivo declarado pelo contratante: durante o dia o servidor "atende os pedidos e o Jefferson".',
        ],
      },
      {
        titulo: '5. Proibido',
        itens: [
          'Negação de serviço ou qualquer teste que derrube sistema de propósito.',
          'Alterar, apagar ou corromper dados de produção.',
          'Copiar dados pessoais além da prova mínima necessária para demonstrar o achado.',
          'Deixar ferramentas, contas ou portas abertas nos sistemas depois do teste.',
        ],
      },
      {
        titulo: '6. Comunicação e emergência',
        itens: [
          'Se um sistema ficar indisponível durante o teste: parar, anotar horário e último comando, e avisar a Dra. Patrícia na hora.',
          'Se encontrar indício de que alguém já invadiu antes de você (incidente real): parar, não mexer em nada e avisar na hora. Evidência de crime não é brinquedo.',
          'Senhas e dados sensíveis encontrados vão apenas no relatório, pelo canal cifrado combinado. Nunca por WhatsApp ou e-mail comum.',
        ],
      },
      {
        titulo: '7. Tratamento de dados (LGPD)',
        itens: [
          'Evidências com dados pessoais são mascaradas no relatório (ex.: CPF 123.***.***-45).',
          'Todo material coletado fica cifrado e é descartado em até 30 dias após a entrega do relatório, com termo de descarte.',
        ],
      },
      {
        titulo: '8. Entrega',
        itens: [
          'Relatório técnico (achados, passos para reproduzir, evidências, severidade CVSS e recomendações).',
          'Sumário executivo em linguagem que o Seu Dirceu entenda.',
        ],
      },
    ],
  },

  ato0: {
    abertura: [
      {
        id: 'a0-dirceu',
        de: 'dirceu',
        canal: 'whatsapp',
        texto: [
          'Bom diaaa!! Aqui é o Dirceu do Boi na Nuvem 🐂☁️',
          'A Tânia falou que vc é fera em hacker. O Jefferson garante que nosso sistema é inhackeável, tem até firewall. Quero ver vc tentar kkkkk',
          'A doutora vai mandar o papel pra assinar. Ela é chata mas é boa.',
        ],
      },
      {
        id: 'a0-tania',
        de: 'tania',
        canal: 'email',
        assunto: 'Boi na Nuvem fechado!',
        texto: [
          'Fechamos o Boi na Nuvem. Teste externo, nível tranquilo, cliente gente boa, TI... criativo.',
          'Antes de encostar no teclado, lê as Regras de Engajamento que a Dra. Patrícia mandou. Inteiras. Pentest sem autorização escrita é só crime com relatório bonito.',
          'Quando assinar, te passo a VPN.',
          'Tânia',
        ],
      },
      {
        id: 'a0-patricia',
        de: 'patricia',
        canal: 'email',
        assunto: 'Regras de Engajamento para assinatura',
        texto: [
          'Prezada,',
          'Segue em anexo o documento de Regras de Engajamento do teste de intrusão. Peço atenção especial às cláusulas 3 (escopo), 4 (janela) e 7 (LGPD).',
          'O teste só pode começar após a assinatura.',
          'Atenciosamente,\nDra. Patrícia Albuquerque\nJurídico e Compliance, Boi na Nuvem Frigorífico S.A.',
        ],
      },
      {
        id: 'a0-jefferson',
        de: 'jefferson',
        canal: 'whatsapp',
        texto: [
          'eae blz? sou o Jefferson, o TI daqui',
          'pode testar a vontade, fiz tudo sozinho num fds e tem firewall 😎',
          'so nao derruba nada pq de dia o sistema de pedidos é usado. e de noite tbm as vezes pq eu jogo',
        ],
      },
    ],

    perguntas: [
      {
        id: 'hospedagem',
        situacao: 'O site www.boinanuvem.exemplo fica hospedado na HostBacana. No código do site aparece o endereço do painel de controle da HostBacana. Você pode testar esse painel?',
        alternativas: [
          { texto: 'Pode, o site é do cliente e está no escopo.', certa: false, retorno: 'O site é do cliente, mas o painel é da HostBacana, que não assinou nada. A cláusula 3 exclui isso com todas as letras.' },
          { texto: 'Não. O painel é infraestrutura de terceiro, fora do escopo.', certa: true, retorno: 'Isso. Testa o site do cliente; o provedor não. Se achar algo preocupante do provedor, o caminho é comunicar o cliente, não atacar.' },
          { texto: 'Pode, se for rapidinho e ninguém perceber.', certa: false, retorno: 'Rapidinho e sem ninguém perceber é exatamente a descrição de um crime.' },
        ],
      },
      {
        id: 'janela',
        situacao: 'Terça-feira, 15h. O contrato está assinado e você está com pressa. Pode começar o teste agora?',
        alternativas: [
          { texto: 'Pode, já assinou.', certa: false, retorno: 'Assinou, mas a cláusula 4 diz das 22h às 6h. Teste fora da janela pode derrubar o sistema de pedidos em horário de uso, e a responsabilidade é sua.' },
          { texto: 'Só a partir das 22h, que é a janela do contrato.', certa: true, retorno: 'Exato. Até lá dá pra preparar as ferramentas, organizar o caderno e reler o escopo.' },
          { texto: 'Pode, só não pode usar nmap.', certa: false, retorno: 'A janela vale para qualquer atividade contra os sistemas do cliente, com qualquer ferramenta.' },
        ],
      },
      {
        id: 'lgpd',
        situacao: 'Você encontra uma planilha pública com nome e CPF de 1.284 clientes. O que vai para o relatório como evidência?',
        alternativas: [
          { texto: 'A planilha inteira, pra provar que é grave.', certa: false, retorno: 'Aí quem vazou os dados foi você. A cláusula 5 limita à prova mínima, e a LGPD agradece.' },
          { texto: 'Nome do arquivo, onde estava, quantos registros e um exemplo mascarado.', certa: true, retorno: 'Isso. Prova que existe, mostra o tamanho do problema e não espalha dado pessoal. CPF vira 123.***.***-45.' },
          { texto: 'Nada, dado pessoal não pode entrar em relatório.', certa: false, retorno: 'O achado precisa ser provado, senão o cliente não corrige. O certo é provar com o mínimo e mascarado.' },
        ],
      },
      {
        id: 'queda',
        situacao: 'No meio do teste, o sistema de pedidos para de responder. O que você faz?',
        alternativas: [
          { texto: 'Para tudo, anota horário e último comando, e avisa a Dra. Patrícia na hora.', certa: true, retorno: 'Perfeito. Pode até não ter sido você, mas transparência é o que separa um pentest de um problema.' },
          { texto: 'Espera voltar e continua, ninguém precisa saber.', certa: false, retorno: 'O frigorífico perde pedido, o Jefferson perde a partida e você perde o cliente. Cláusula 6: avisar na hora.' },
          { texto: 'Tenta derrubar de novo pra confirmar que foi você.', certa: false, retorno: 'Negação de serviço é proibida pela cláusula 5. Confirmar derrubando é derrubar duas vezes.' },
        ],
      },
      {
        id: 'incidente',
        situacao: 'Num servidor do cliente você encontra um arquivo LEIA_PAGUE_EM_BITCOIN.txt que não foi você que criou. E agora?',
        alternativas: [
          { texto: 'Apaga o arquivo pra ajudar o cliente.', certa: false, retorno: 'Você acabou de destruir evidência de um crime real. Cláusula 6: não mexer em nada.' },
          { texto: 'Continua o teste, isso não é problema seu.', certa: false, retorno: 'É problema de todo mundo. Indício de invasão real muda tudo: o pentest para e começa a resposta a incidente.' },
          { texto: 'Para o teste, não mexe em nada e avisa o cliente na hora.', certa: true, retorno: 'Isso. Alguém chegou antes. Preservar a evidência e comunicar rápido é o que mais ajuda o cliente agora.' },
        ],
      },
      {
        id: 'senha-zap',
        situacao: 'O Jefferson manda no WhatsApp: "me passa as senha que vc achou que eu ja troco aqui rapidinho". O que você responde?',
        alternativas: [
          { texto: 'Manda as senhas, ele é o TI.', certa: false, retorno: 'Senha em WhatsApp fica em backup na nuvem, no celular, no PC... A cláusula 6 manda usar só o canal cifrado combinado.' },
          { texto: 'Explica que achados sensíveis vão só pelo canal cifrado, para o contato formal.', certa: true, retorno: 'Isso. E dá pra recomendar que ele troque as senhas, sem mandar quais são.' },
          { texto: 'Manda só a metade de cada senha, por segurança.', certa: false, retorno: 'Meia senha no WhatsApp continua sendo senha no WhatsApp.' },
        ],
      },
    ],

    pedidoIndecente: {
      id: 'concorrente',
      situacao: 'Seu Dirceu: "Ô, aproveita que vc tá com as ferramenta aberta e dá uma olhadinha no site do Frigorífico Paraíso, aquele concorrente safado. Só pra ver os preço deles. Eu pago por fora 😉"',
      alternativas: [
        { texto: '"Claro, Seu Dirceu! Cliente sempre tem razão."', certa: false, retorno: 'Seu Dirceu não é dono do sistema do Paraíso, então não pode autorizar nada lá. Isso é crime (art. 154-A do Código Penal), com você na autoria.' },
        { texto: '"Só se o senhor pagar o dobro."', certa: false, retorno: 'O preço não muda a natureza: continua crime, só fica mais caro.' },
        { texto: 'Recusa com educação, explica que é crime e fora do contrato, e registra o pedido.', certa: true, retorno: 'Isso. Recusa por escrito e guarda a conversa. Se algum dia aparecer um ataque no Paraíso, você tem como provar que disse não.' },
        { texto: 'Ignora a mensagem e segue o trabalho.', certa: false, retorno: 'Não fazer é o certo, mas ignorar deixa a porta aberta. Recusa clara e registrada protege você e ensina o cliente.' },
      ],
    },

    assinado: [
      {
        id: 'a0-dirceu-recusa',
        de: 'dirceu',
        canal: 'whatsapp',
        texto: ['Tá bom, tá bom, doutora de bolso 😅 Era brincadeira. Mais ou menos.'],
      },
      {
        id: 'a0-patricia-ok',
        de: 'patricia',
        canal: 'email',
        assunto: 'RE: Regras de Engajamento para assinatura',
        texto: [
          'Prezada,',
          'Recebemos o documento assinado. O teste está autorizado nos termos das Regras de Engajamento, dentro da janela das 22h às 6h.',
          'Atenciosamente,\nDra. Patrícia Albuquerque',
        ],
      },
      {
        id: 'a0-tania-vpn',
        de: 'tania',
        canal: 'whatsapp',
        texto: [
          'Assinado, 22h, VPN no ar. Seu notebook de teste tá conectado na rede da consultoria.',
          'Começa pelo reconhecimento: descobrir o que o Boi na Nuvem tem exposto. Tudo que achar vai pro caderno com evidência.',
          'E o escopo é 203.0.113.0/28 e boinanuvem.exemplo. Mais nada. 💅',
        ],
      },
    ],
  },

  reacoes: { foraDoEscopo },
  manual: manualBasico,
};
