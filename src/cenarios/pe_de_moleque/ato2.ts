// Ato 2 do Pé de Moleque: relatório de triagem do incidente e a reunião de crise.
import type { AtoRelatorio, Pergunta } from '../../motor/tipos';

const custodia = (id: string, coisa: string): Pergunta => ({
  id,
  situacao: `Como ${coisa} entra no relatório?`,
  alternativas: [
    { texto: 'Arquivo salvo no notebook da consultoria, com o comando usado, a data e hora da coleta e o SHA-256.', certa: true, retorno: 'Isso. Cadeia de custódia: qualquer perito confere depois que nada mudou.' },
    { texto: 'Print da tela, sem data.', certa: false, retorno: 'Print sem horário e sem hash não se sustenta numa perícia.' },
    { texto: 'Cópia salva no próprio servidor, em /tmp, para ficar junto do resto.', certa: false, retorno: 'Escrever no servidor comprometido altera a cena. A coleta fica do seu lado.' },
  ],
});

export const ato2: AtoRelatorio = {
  titulo: 'Ato 2: o relatório de incidente',

  abertura: [
    {
      id: 'pdm-a2-tania',
      de: 'tania',
      canal: 'whatsapp',
      texto: [
        'Relatório de incidente não tem CVSS: tem linha do tempo, indicadores, evidências com custódia e recomendações de contenção, erradicação e comunicação.',
        'E reunião de crise com presidente desesperado. Respira e vai.',
      ],
    },
  ],

  itens: [
    {
      achado: 'pdm-processo',
      cvss: null,
      passos: [
        'Acessar o servidor com a conta de auditor, por SSH.',
        'Listar os processos com dono e linha de comando (ps -ef).',
        'Registrar o processo que roda de /tmp/.x com nome de sistema.',
      ],
      evidencia: custodia('pdm-ev-processo', 'a lista de processos'),
      recomendacao: {
        id: 'pdm-rec-processo',
        situacao: 'Qual recomendação de contenção vai para o relatório?',
        alternativas: [
          { texto: 'Matar o processo agora, antes de qualquer coisa.', certa: false, retorno: 'Sem preservar a memória antes, a evidência some, e o cron traz o processo de volta em 10 minutos.' },
          { texto: 'Preservar memória e disco, isolar o servidor da internet num horário combinado e só então remover o artefato.', certa: true, retorno: 'Isso. Preservar, conter, erradicar: nessa ordem.' },
          { texto: 'Desligar o servidor da tomada.', certa: false, retorno: 'Apaga a memória e derruba a bilheteria na semana da final.' },
        ],
      },
    },
    {
      achado: 'pdm-conexao',
      cvss: null,
      passos: [
        'No servidor, listar as conexões TCP abertas (ss -tn).',
        'Identificar a conexão ESTABLISHED para 198.51.100.66:3333.',
        'Registrar o IP e a porta como indicadores, sem acessar o destino.',
      ],
      evidencia: custodia('pdm-ev-conexao', 'a lista de conexões'),
      recomendacao: {
        id: 'pdm-rec-conexao',
        situacao: 'O que fazer com o IP do invasor?',
        alternativas: [
          { texto: 'Bloquear a saída para ele no firewall do clube e entregar como indicador à polícia.', certa: true, retorno: 'Isso. Contenção do seu lado; investigação do lado de lá é com a autoridade.' },
          { texto: 'Contratar alguém para invadir o servidor dele e apagar os dados levados.', certa: false, retorno: 'Crime, e inútil: os dados podem estar em mil lugares.' },
          { texto: 'Mandar um e-mail para o dono do IP exigindo os dados de volta.', certa: false, retorno: 'Contato com o invasor é decisão para a autoridade, não para o relatório técnico.' },
        ],
      },
    },
    {
      achado: 'pdm-persistencia',
      cvss: null,
      passos: [
        'Listar /etc/crontabs e ler a tarefa do usuário admin.',
        'Ler /home/admin/.ssh/authorized_keys e comparar as chaves.',
        'Registrar a tarefa de 10 em 10 minutos e a chave com comentário x@vps.',
      ],
      evidencia: custodia('pdm-ev-persistencia', 'a tarefa agendada e as chaves'),
      recomendacao: {
        id: 'pdm-rec-persistencia',
        situacao: 'Qual recomendação de erradicação vai para o relatório?',
        alternativas: [
          { texto: 'Remover a tarefa e a chave intrusa, trocar as credenciais do admin e revisar todas as chaves e tarefas do servidor.', certa: true, retorno: 'Isso. Persistência se caça inteira, não só a que você viu.' },
          { texto: 'Só apagar a pasta /tmp/.x.', certa: false, retorno: 'O invasor ainda tem chave para entrar e recriar tudo.' },
          { texto: 'Trocar a porta do SSH.', certa: false, retorno: 'A chave dele funciona em qualquer porta.' },
        ],
      },
    },
    {
      achado: 'pdm-conta',
      cvss: null,
      passos: [
        'Ler /etc/passwd no servidor.',
        'Filtrar contas com UID 0.',
        'Cruzar com o auth.log: a conta suporte foi criada às 03:44 de 19/11, dois minutos depois do acesso do invasor.',
      ],
      evidencia: custodia('pdm-ev-conta', 'o /etc/passwd'),
      recomendacao: {
        id: 'pdm-rec-conta',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'Remover a conta suporte e garantir que só o root tem UID 0.', certa: true, retorno: 'Isso. E verificar no reteste.' },
          { texto: 'Trocar a senha da conta suporte.', certa: false, retorno: 'A conta não deveria existir. Trocar a senha mantém a porta.' },
          { texto: 'Renomear a conta para algo menos chamativo.', certa: false, retorno: 'Ao contrário: ela já era pouco chamativa. Esse era o problema.' },
        ],
      },
    },
    {
      achado: 'pdm-linha',
      cvss: null,
      passos: [
        'Contar as falhas de senha de 203.0.113.66 no auth.log (46, entre 03:12 e 03:41 de 19/11).',
        'Localizar o login aceito do admin vindo do mesmo IP às 03:42:07.',
        'Encadear com a criação da conta suporte (03:44) e o fim da sessão (04:01).',
      ],
      evidencia: custodia('pdm-ev-linha', 'o trecho do auth.log'),
      recomendacao: {
        id: 'pdm-rec-linha',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'SSH só por chave, bloqueio por tentativas e SSH acessível apenas pela VPN.', certa: true, retorno: 'Isso. Fecha a porta que foi usada.' },
          { texto: 'Senha nova mais forte para o admin, mantendo SSH aberto com senha para a internet.', certa: false, retorno: 'Ajuda, mas a porta continua aberta para o próximo dicionário.' },
          { texto: 'Bloquear só o IP 203.0.113.66.', certa: false, retorno: 'O próximo vem de outro IP.' },
        ],
      },
    },
    {
      achado: 'pdm-exfil',
      cvss: null,
      passos: [
        'Ler o histórico de comandos do admin.',
        'Localizar o empacotamento de /var/backups/socios.sql e o envio para 198.51.100.66.',
        'Confirmar pelo horário que os comandos estão dentro da sessão do invasor (03:42 a 04:01).',
      ],
      evidencia: {
        id: 'pdm-ev-exfil',
        situacao: 'Como provar o vazamento no relatório?',
        alternativas: [
          { texto: 'O trecho do histórico com os comandos e o horário da sessão, com hash. Sem abrir a base de sócios.', certa: true, retorno: 'Isso. O indício está nos comandos. Abrir a base não acrescenta nada e expõe dados.' },
          { texto: 'Uma amostra da base de sócios, para mostrar o que foi levado.', certa: false, retorno: 'O aditivo é somente leitura de configuração e rastros; dados de sócios não são necessários para provar o fato.' },
          { texto: 'A afirmação "provavelmente vazou".', certa: false, retorno: 'Há indício concreto: diga qual.' },
        ],
      },
      recomendacao: {
        id: 'pdm-rec-exfil',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'Encaminhar à encarregada para avaliação de comunicação à ANPD e aos titulares em até 3 dias úteis, e registrar boletim de ocorrência.', certa: true, retorno: 'Isso. Fatos para quem decide, no prazo da Resolução CD/ANPD 15/2024.' },
          { texto: 'Aguardar a final e reavaliar.', certa: false, retorno: 'O prazo corre do conhecimento do incidente, não do apito final.' },
          { texto: 'Apagar o backup para que não vaze de novo.', certa: false, retorno: 'Apagar evidência não desfaz o vazamento e atrapalha a investigação.' },
        ],
      },
    },
    {
      achado: 'pdm-ioc',
      cvss: null,
      passos: [
        'Calcular o SHA-256 de /tmp/.x/kworkerd no servidor.',
        'Registrar o hash junto com os IPs como indicadores.',
        'Recomendar a busca dos indicadores nos demais servidores.',
      ],
      evidencia: custodia('pdm-ev-ioc', 'o hash do artefato'),
      recomendacao: {
        id: 'pdm-rec-ioc',
        situacao: 'O que fazer com os indicadores?',
        alternativas: [
          { texto: 'Procurar nos demais servidores e manter em monitoramento.', certa: true, retorno: 'Isso. Onde tem um, pode ter outro.' },
          { texto: 'Publicar no Instagram do clube.', certa: false, retorno: 'Comunicação de incidente tem canal e texto próprios.' },
          { texto: 'Guardar na gaveta.', certa: false, retorno: 'Indicador parado não protege ninguém.' },
        ],
      },
    },
  ],

  sumario: {
    pedido: 'A diretoria do clube vai ler a primeira página. Escolha as frases do sumário executivo.',
    frases: [
      { texto: 'O servidor da bilheteria foi invadido em 19/11, por tentativa repetida de senha. O invasor instalou um programa, criou um acesso escondido e há indício de que levou a base de sócios-torcedores.', boa: true, retorno: 'O que, quando, como e o impacto, sem jargão.' },
      { texto: 'Foi um ataque hacker internacional altamente sofisticado.', boa: false, retorno: 'Foi senha fraca com SSH aberto. Exagerar a sofisticação esconde a lição.' },
      { texto: 'A consultoria não alterou nada no servidor: todas as evidências foram coletadas somente em leitura, com registro de custódia.', boa: true, retorno: 'Isso. Protege o clube na investigação.' },
      { texto: 'O Wanderson é o culpado.', boa: false, retorno: 'Uma pessoa sozinha cuidando de tudo, sem processo, não é culpa de uma pessoa.' },
      { texto: 'Há prazo legal para avaliar a comunicação à ANPD e aos sócios, que corre a partir de hoje e não depende do campeonato.', boa: true, retorno: 'Isso. A diretoria precisa saber disso na primeira página.' },
      { texto: 'O vetor inicial foi força bruta via SSH com PasswordAuthentication habilitado e ausência de fail2ban.', boa: false, retorno: 'Correto e ilegível para a diretoria. Vai na parte técnica.' },
      { texto: 'As medidas urgentes cabem nesta semana e não exigem tirar a bilheteria do ar durante a final.', boa: true, retorno: 'Isso. Quem decide precisa saber que dá para agir sem parar o clube.' },
    ],
  },

  reuniao: [
    {
      id: 'pdm-reu-bebeto',
      de: 'bebeto',
      situacao: 'Presidente Bebeto: "Isso não sai daqui até domingo! Se a torcida souber, perco a eleição do clube e o time perde a final."',
      alternativas: [
        { texto: '"O prazo de comunicação corre a partir do conhecimento, e quem decide é o clube com a Dra. Lindalva. O que eu posso dizer é que esconder costuma custar mais caro do que comunicar bem."', certa: true, retorno: 'Isso. Respeita o papel dele e devolve a decisão a quem é de direito, com os fatos.' },
        { texto: '"Tudo bem, a gente segura até segunda."', certa: false, retorno: 'Você não tem autoridade para segurar nada, e o prazo não é seu.' },
        { texto: '"Se o senhor não comunicar, eu comunico."', certa: false, retorno: 'A comunicação é do controlador. Ameaçar o cliente não ajuda ninguém.' },
      ],
    },
    {
      id: 'pdm-reu-wanderson',
      de: 'wanderson',
      situacao: 'Wanderson: "Posso formatar o servidor agora e reinstalar tudo? Fica limpo rapidinho."',
      alternativas: [
        { texto: '"Antes, a imagem do disco e da memória precisa ser preservada para a perícia. Depois, reinstalar é uma ótima ideia, com as correções."', certa: true, retorno: 'Isso. Preservar e depois limpar. O Wanderson anota "imagem primeiro".' },
        { texto: '"Formata, quanto antes melhor."', certa: false, retorno: 'Você apagaria a principal prova do incidente.' },
        { texto: '"Não pode mexer nunca mais nesse servidor."', certa: false, retorno: 'Pode e deve ser reconstruído, depois da preservação.' },
      ],
    },
    {
      id: 'pdm-reu-lindalva',
      de: 'lindalva',
      situacao: 'Dra. Lindalva: "Temos indício de vazamento, mas não temos certeza do que estava no backup. Comunico mesmo assim?"',
      alternativas: [
        { texto: '"A decisão é sua, com o clube. Os fatos técnicos são: a base de sócios foi empacotada e enviada para fora durante a sessão do invasor. O conteúdo exato do backup vocês confirmam internamente, sem precisar da consultoria abrir a base."', certa: true, retorno: 'Isso. Fatos, limites do que você sabe e o caminho para completar a informação.' },
        { texto: '"Só comunica se tiver certeza absoluta."', certa: false, retorno: 'A regulamentação não exige certeza absoluta para avaliar a comunicação. E essa decisão não é sua.' },
        { texto: '"Eu abro a base e te digo o que tinha."', certa: false, retorno: 'Fora do aditivo e desnecessário: o clube sabe o que tem no próprio backup.' },
      ],
    },
    {
      id: 'pdm-reu-extorsao',
      de: 'bebeto',
      situacao: 'Presidente Bebeto, mostrando o celular: "Chegou um e-mail dizendo que, se a gente pagar, eles apagam os dados. Pago? É mais barato que a confusão."',
      alternativas: [
        { texto: '"Pagar não garante nada e financia o próximo ataque. Esse e-mail é evidência: preserva, entrega à polícia e segue com a comunicação."', certa: true, retorno: 'Isso. E o e-mail vai para o inquérito.' },
        { texto: '"Paga, e a gente esquece isso."', certa: false, retorno: 'Os dados não voltam por pagamento, e o clube vira cliente fiel de extorsão.' },
        { texto: '"Responde negociando, para ganhar tempo."', certa: false, retorno: 'Negociação com criminoso é assunto da autoridade, não de improviso.' },
      ],
    },
    {
      id: 'pdm-reu-final',
      de: 'bebeto',
      situacao: 'Presidente Bebeto: "E a bilheteria? Domingo é a final!"',
      alternativas: [
        { texto: '"Hoje: preservar evidências, bloquear a saída para o invasor e fechar o SSH para fora da VPN. Amanhã: remover o artefato, a persistência e a conta escondida, trocar credenciais. Antes de domingo: verificação. A bilheteria pode seguir funcionando."', certa: true, retorno: 'Isso. Plano em ordem, com a final no calendário e sem atropelar a perícia.' },
        { texto: '"Fecha a bilheteria e vende ingresso no papel."', certa: false, retorno: 'Não é necessário, se a contenção for bem feita.' },
        { texto: '"Depois da final a gente vê."', certa: false, retorno: 'O invasor ainda tem acesso. Não espera domingo.' },
      ],
    },
  ],

  finais: [
    {
      minimo: 85,
      titulo: 'Relatório de incidente exemplar',
      texto: [
        'A Dra. Lindalva comunicou a ANPD e os sócios dentro do prazo, com texto claro. A delegacia recebeu as evidências com custódia e elogiou "um relatório que dá para usar".',
        'O presidente ainda resmunga, mas agora fala "cadeia de custódia" nas entrevistas.',
        'Erradicação agendada, com verificação antes da final.',
      ],
    },
    {
      minimo: 60,
      titulo: 'Relatório de incidente entregue',
      texto: ['A Dra. Lindalva pediu ajustes na linha do tempo e seguiu com a comunicação. Verificação agendada.'],
    },
    {
      minimo: 0,
      titulo: 'Relatório de incidente devolvido',
      texto: [
        'A delegacia devolveu parte das evidências por falta de registro de custódia. A Tânia passou a madrugada refazendo a linha do tempo.',
        'A verificação foi agendada mesmo assim: o invasor não espera.',
      ],
    },
  ],
};
