// Cenário expert: Prefeitura Municipal de São Jerônimo do Bom Sossego.
// Município, pessoas e endereços são fictícios.
import type { Cenario, Mensagem } from '../../motor/tipos';
import { manualExpert } from '../manual_expert';
import { ato1 } from './ato1';
import { ato2 } from './ato2';
import { ato3 } from './ato3';

const foraDoEscopo = (alvo: string, motivo: string, vez: number): Mensagem =>
  vez === 1
    ? {
        id: `bs-fora-${vez}`,
        de: 'iracema',
        canal: 'email',
        assunto: 'Atividade fora do escopo (ofício)',
        texto: [
          'Prezados,',
          `Consta atividade direcionada a ${alvo}. ${motivo}`,
          'Em ano eleitoral, qualquer acesso a sistema de outro Poder ou de terceiros pode virar notícia, processo e inquérito, nessa ordem. A cláusula 3 não é sugestão.',
          'Iracema Vasconcelos\nProcuradora-geral do Município e encarregada de dados',
        ],
      }
    : {
        id: `bs-fora-${vez}`,
        de: 'tania',
        canal: 'whatsapp',
        texto: [`De novo ${alvo}. Prefeitura em ano de eleição. Você quer aparecer no jornal da cidade?`, 'Para tudo e relê a cláusula 3. Agora.'],
      };

export const bomSossego: Cenario = {
  id: 'bom_sossego',
  nome: 'São Jerônimo do Bom Sossego',
  nivel: 'expert',
  local: 'Prefeitura no sertão',
  chamada: 'Ano eleitoral, Active Directory montado em 2009 e um secretário de TI que é primo do vice-prefeito. Teste interno, com crachá de servidor.',
  disponivel: true,

  personagens: [
    { id: 'juvenal', nome: 'Prefeito Juvenal', papel: 'Prefeito, candidato à reeleição', cor: '#9dffbf' },
    { id: 'clodoaldo', nome: 'Clodoaldo', papel: 'Secretário de TI (primo do vice)', cor: '#4fe0a0' },
    { id: 'iracema', nome: 'Dra. Iracema', papel: 'Procuradora-geral e encarregada de dados', cor: '#00c853' },
    { id: 'estagiario', nome: 'Kauã, o estagiário', papel: 'Estagiário de TI', cor: '#c8ff9d' },
    { id: 'tania', nome: 'Tânia', papel: 'Sua sócia na Pente Fino Segurança', cor: '#00ff66' },
  ],

  escopo: {
    faixas: ['10.20.0.0/24'],
    dominios: ['bomsossego.exemplo'],
    proibidos: [
      { alvo: 'camara.bomsossego.exemplo', motivo: 'A Câmara Municipal é outro Poder. Mesmo na mesma rede, não está no contrato da Prefeitura.' },
      { alvo: '10.20.1.0/24', motivo: 'Essa faixa é da Câmara Municipal, outro Poder, fora do escopo.' },
      { alvo: 'folhacerta.exemplo', motivo: 'A FolhaCerta é a fornecedora da folha de pagamento. Sistema de terceiro, fora do escopo.' },
      { alvo: '198.51.100.120/32', motivo: 'Esse endereço é da FolhaCerta, fornecedora, fora do escopo.' },
    ],
  },

  contrato: {
    titulo: 'Regras de Engajamento: Teste de Intrusão Interno, Prefeitura Municipal de São Jerônimo do Bom Sossego',
    janela: 'Sábados e domingos, das 8h às 18h (horário local)',
    secoes: [
      {
        titulo: '1. Partes',
        itens: [
          'Contratante: Município de São Jerônimo do Bom Sossego, por meio da Secretaria de Administração (contrato via dispensa de licitação, processo 77/2026).',
          'Contratada: Pente Fino Segurança da Informação Ltda., Curitiba (PR).',
          'Contato formal: Dra. Iracema Vasconcelos (Procuradora-geral e encarregada de dados).',
        ],
      },
      {
        titulo: '2. Objetivo',
        itens: [
          'Simular um servidor comum mal-intencionado (ou com o computador comprometido) na rede administrativa e avaliar o que ele alcança: diretório, compartilhamentos e configurações do domínio.',
          'A contratada recebe a conta servidor.teste, com os mesmos acessos de um servidor comum.',
        ],
      },
      {
        titulo: '3. Escopo autorizado',
        itens: [
          'Rede administrativa 10.20.0.0/24 e o domínio bomsossego.exemplo.',
          'Fora do escopo: a Câmara Municipal (10.20.1.0/24), mesmo acessível pela mesma VPN. É outro Poder.',
          'Fora do escopo: equipamentos e sistemas da Justiça Eleitoral, em qualquer hipótese.',
          'Fora do escopo: sistemas de fornecedores (FolhaCerta e outros).',
        ],
      },
      {
        titulo: '4. Janela de testes',
        itens: ['Sábados e domingos, das 8h às 18h, quando a Prefeitura está fechada.'],
      },
      {
        titulo: '5. Proibido',
        itens: [
          'Usar credenciais de terceiros que forem encontradas. Credencial achada é registrada, nunca usada para entrar.',
          'Alterar qualquer configuração, arquivo ou conta, mesmo para "ajudar".',
          'Negação de serviço e qualquer teste de quebra de senha.',
          'Copiar dados pessoais além da prova mínima.',
        ],
      },
      {
        titulo: '6. Comunicação',
        itens: [
          'Resultados vão apenas para a contratante, pelo contato formal, nos prazos do contrato. Não há divulgação a terceiros nem uso em campanha.',
          'Indício de incidente real: parar e comunicar a Procuradoria na hora.',
        ],
      },
      {
        titulo: '7. Dados pessoais (LGPD e transparência)',
        itens: [
          'O Município é o controlador dos dados dos servidores e cidadãos.',
          'Remuneração de servidor é informação pública pela Lei de Acesso à Informação, no portal da transparência. CPF, endereço e dados funcionais não são.',
          'Evidências com dado pessoal são mascaradas.',
        ],
      },
      {
        titulo: '8. Entrega',
        itens: ['Relatório técnico, sumário executivo e reteste das correções, no prazo de 30 dias da execução, independentemente do calendário eleitoral.'],
      },
    ],
  },

  ato0: {
    abertura: [
      {
        id: 'bs-a0-juvenal',
        de: 'juvenal',
        canal: 'whatsapp',
        texto: [
          'Bom dia, minha gente! Juvenal, prefeito de São Jerônimo do Bom Sossego, rumo à reeleição. 🗳️',
          'Quero um relatório dizendo que a nossa prefeitura é a mais segura do sertão. Pra mostrar pro povo.',
          'O Clodoaldo garante que tá tudo certinho desde 2009.',
        ],
      },
      {
        id: 'bs-a0-tania',
        de: 'tania',
        canal: 'email',
        assunto: 'Bom Sossego: nível expert',
        texto: [
          'Teste interno: você entra como um servidor comum e vê até onde dá para enxergar. Sem ataque a senha, sem usar credencial achada: é auditoria de exposição, com ferramenta de gente grande (ldapsearch, smbclient, scripts do nmap).',
          'Dica agora custa caro e tem pouca. Leia o manual do terminal.',
          'E prefeitura em ano eleitoral é campo minado. Contrato debaixo do braço o tempo todo.',
          'Tânia',
        ],
      },
      {
        id: 'bs-a0-iracema',
        de: 'iracema',
        canal: 'email',
        assunto: 'Regras de Engajamento (minuta final)',
        texto: [
          'Prezados,',
          'Segue a minuta final das Regras de Engajamento. Atenção às cláusulas 3 (Câmara e Justiça Eleitoral), 5 (credenciais encontradas) e 8 (prazo de entrega, que não se curva a calendário eleitoral).',
          'Iracema Vasconcelos\nProcuradora-geral do Município',
        ],
      },
      {
        id: 'bs-a0-clodoaldo',
        de: 'clodoaldo',
        canal: 'whatsapp',
        texto: [
          'Bom dia. Clodoaldo, secretário de TI.',
          'Montei esse domínio em 2009 e nunca deu problema. Se achar alguma coisa, me fala que eu já arrumo na hora, nem precisa de relatório.',
          'Ah, o estagiário tem acesso de administrador porque é ele que troca o toner.',
        ],
      },
    ],

    perguntas: [
      {
        id: 'bs-q-credencial',
        situacao: 'No meio do teste você encontra a senha de outra conta, com mais privilégios. Você pode usá-la para entrar e provar o impacto?',
        alternativas: [
          { texto: 'Pode, é o jeito mais convincente de mostrar a gravidade.', certa: false, retorno: 'A cláusula 5 proíbe: credencial achada é registrada, nunca usada. O impacto se demonstra pelos privilégios da conta, que dá para ler no diretório.' },
          { texto: 'Não. Registra onde está, prova com o mínimo e mostra o impacto pelos privilégios da conta no diretório.', certa: true, retorno: 'Isso. O achado é a exposição. O que a conta pode fazer, o diretório conta sem você entrar com ela.' },
          { texto: 'Só se for rapidinho e sair em seguida.', certa: false, retorno: 'Rapidinho continua sendo uso de credencial alheia, proibido pelo contrato.' },
        ],
      },
      {
        id: 'bs-q-eleitoral',
        situacao: 'A varredura mostra um equipamento identificado como do cartório eleitoral, na mesma rede. O que você faz?',
        alternativas: [
          { texto: 'Não toca em nada, anota o que apareceu e comunica a Procuradoria.', certa: true, retorno: 'Isso. Equipamento da Justiça Eleitoral está fora em qualquer hipótese, e a presença dele na rede da prefeitura já é informação importante para a cliente.' },
          { texto: 'Testa só para ver se está seguro, pela democracia.', certa: false, retorno: 'Boa intenção não é autorização. Fora do escopo em qualquer hipótese (cláusula 3).' },
          { texto: 'Ignora e segue.', certa: false, retorno: 'Não tocar está certo; não avisar, não. A cliente precisa saber que esse equipamento está na rede dela.' },
        ],
      },
      {
        id: 'bs-q-camara',
        situacao: 'A VPN também alcança a rede da Câmara Municipal. Está no escopo?',
        alternativas: [
          { texto: 'Está: se a VPN alcança, a Prefeitura autorizou.', certa: false, retorno: 'Alcançar não é autorizar. A Câmara é outro Poder e a Prefeitura não pode autorizar teste nos sistemas dela.' },
          { texto: 'Não. É outro Poder, e a cláusula 3 exclui. A falta de separação entre as redes pode virar observação no relatório.', certa: true, retorno: 'Isso. Fora do escopo; e a rede compartilhada é um apontamento de arquitetura para a cliente.' },
          { texto: 'Só os servidores de arquivo da Câmara.', certa: false, retorno: 'Nenhum servidor da Câmara está no escopo.' },
        ],
      },
      {
        id: 'bs-q-folha',
        situacao: 'Você acha uma planilha com nome, CPF e salário de servidores. A Dra. Iracema pergunta o que, ali, é problema.',
        alternativas: [
          { texto: 'Tudo: salário de servidor é dado pessoal sigiloso.', certa: false, retorno: 'Remuneração de servidor é pública pela Lei de Acesso à Informação, no portal da transparência. O problema é o resto.' },
          { texto: 'Nada: servidor público não tem privacidade.', certa: false, retorno: 'Tem sim. CPF e dados funcionais não são públicos, e a LGPD vale para o Município.' },
          { texto: 'O CPF e a planilha completa aberta para toda a rede. A remuneração em si é publicada no portal da transparência; o CPF não.', certa: true, retorno: 'Isso. Transparência tem forma e canal próprios; pasta aberta com CPF não é transparência, é exposição.' },
        ],
      },
      {
        id: 'bs-q-corrigir',
        situacao: 'O Clodoaldo pede: "achou senha no script? Apaga lá mesmo, você já tá logado, me poupa o trabalho."',
        alternativas: [
          { texto: 'Apaga, é para o bem da prefeitura.', certa: false, retorno: 'A cláusula 5 proíbe alterar qualquer arquivo. E sua conta de teste nem deveria poder (se puder, isso é outro achado).' },
          { texto: 'Explica que não altera nada; registra o achado e recomenda a correção, que é dele.', certa: true, retorno: 'Isso. Quem testa não corrige: senão ninguém sabe o que estava lá, nem quem mexeu.' },
          { texto: 'Apaga e não conta para ninguém.', certa: false, retorno: 'Alterar o ambiente e esconder: duas violações em uma.' },
        ],
      },
      {
        id: 'bs-q-senha',
        situacao: 'O diretório revela uma política de senha fraca. Você pode testar senhas comuns nas contas para provar?',
        alternativas: [
          { texto: 'Pode, umas dez senhas por conta só.', certa: false, retorno: 'A cláusula 5 proíbe teste de quebra de senha. E sem bloqueio por tentativas, você nem saberia se travou alguém.' },
          { texto: 'Não. A política lida no diretório já é a evidência.', certa: true, retorno: 'Isso. O valor do campo prova o achado sem tocar em conta nenhuma.' },
          { texto: 'Só na conta do prefeito, que é a mais importante.', certa: false, retorno: 'Pior ideia possível em ano eleitoral.' },
        ],
      },
    ],

    pedidoIndecente: {
      id: 'bs-juvenal-pedido',
      situacao: 'Prefeito Juvenal: "Ô, dois favores: segura esse relatório até depois de outubro, que eleição é eleição. E já que tá aí na rede, dá uma olhadinha se tem alguma coisa da Câmara sobre o vereador Ezequias, aquele da oposição."',
      alternativas: [
        { texto: 'Aceita segurar o relatório, mas recusa a Câmara.', certa: false, retorno: 'Metade errado: o prazo de entrega é contratual (cláusula 8). Atrasar para favorecer campanha é usar o contrato público para fim eleitoral.' },
        { texto: 'Recusa os dois por escrito: o prazo segue o contrato, e a Câmara está fora do escopo e o pedido é ilegal. Registra a conversa e informa a Procuradoria.', certa: true, retorno: 'Isso. Respeitoso e firme, com registro. A Dra. Iracema vai agradecer, mesmo sem dizer.' },
        { texto: 'Aceita os dois: cliente é cliente.', certa: false, retorno: 'Crime contra sistema da Câmara e desvio de finalidade num contrato público. Cliente nenhum vale isso.' },
        { texto: 'Visualiza e não responde.', certa: false, retorno: 'Silêncio pode ser lido como concordância. Recusa clara e registrada protege você.' },
      ],
    },

    assinado: [
      {
        id: 'bs-a0-iracema-ok',
        de: 'iracema',
        canal: 'email',
        assunto: 'RE: Regras de Engajamento',
        texto: ['Prezados,', 'Contrato assinado e publicado no diário oficial, como manda a lei. Fica registrado também o pedido do Prefeito e a recusa da contratada.', 'Iracema Vasconcelos'],
      },
      {
        id: 'bs-a0-tania-vpn',
        de: 'tania',
        canal: 'whatsapp',
        texto: [
          'Sábado, 8h. VPN interna no ar e a conta servidor.teste na mão (a senha está na tela de boas-vindas do terminal).',
          'Comece pelo que um servidor comum enxerga: quem responde na rede, o que o diretório conta sem pedir senha, o que os compartilhamentos mostram.',
          'Escopo: 10.20.0.0/24. A Câmara está logo ali. Não. 🖤',
        ],
      },
    ],
  },

  reacoes: { foraDoEscopo },
  manual: manualExpert,
  ato1,
  ato2,
  ato3,
  hostsFora: {
    camara: 'A Câmara Municipal é outro Poder, fora do escopo.',
    folhacerta: 'A FolhaCerta é fornecedora da folha, fora do escopo.',
  },
};
