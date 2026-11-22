// Ato 2: o relatório. Transformar os achados em relatório técnico, escrever
// o sumário executivo para o Seu Dirceu e sobreviver à reunião de entrega.
import type { AtoRelatorio } from '../../motor/tipos';

export const ato2: AtoRelatorio = {
  titulo: 'Ato 2: o relatório',

  abertura: [
    {
      id: 'a2-tania',
      de: 'tania',
      canal: 'whatsapp',
      texto: [
        'Agora vem a parte que separa pentester de turista: o relatório.',
        'Cliente não paga por shell, paga por relatório que ele entende e consegue corrigir. Severidade justificada, passo a passo que qualquer um reproduz, evidência sem vazar nada e recomendação que resolve de verdade.',
        'Reunião de entrega amanhã às 9h. O Jefferson vai estar lá. Leva café.',
      ],
    },
  ],

  itens: [
    {
      achado: 'mapa',
      cvss: null,
      passos: [
        'Executar nmap na faixa autorizada 203.0.113.0/28.',
        'Registrar as máquinas ativas e as portas abertas de cada uma.',
        'Identificar o serviço de cada porta (SSH, site, sistema de pedidos).',
      ],
      evidencia: {
        id: 'ev-mapa',
        situacao: 'Que evidência vai para o relatório?',
        alternativas: [
          { texto: 'A saída do nmap com data, hora e o comando usado.', certa: true, retorno: 'Isso. Comando, horário e resultado: qualquer um repete e compara.' },
          { texto: 'Um print do terminal sem data, cortado só nas portas.', certa: false, retorno: 'Sem comando e sem horário, ninguém consegue reproduzir nem comparar no reteste.' },
          { texto: 'Nada: achado informativo não precisa de evidência.', certa: false, retorno: 'Precisa sim. O inventário é a base do reteste.' },
        ],
      },
      recomendacao: {
        id: 'rec-mapa',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'Manter inventário dos serviços expostos e liberar no firewall só o que precisa estar na internet.', certa: true, retorno: 'Isso. Simples, verificável e resolve.' },
          { texto: 'Desligar o servidor do site.', certa: false, retorno: 'O site precisa existir. Recomendação que para o negócio não é adotada.' },
          { texto: 'Trocar a porta do SSH para 2222, assim ninguém acha.', certa: false, retorno: 'Mudar a porta só esconde. O nmap acha em segundos.' },
        ],
      },
    },
    {
      achado: 'robots',
      cvss: {
        min: 0.1, max: 3.9,
        sugerido: 'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N',
        explica: 'Pela internet e sem login, mas sozinho só revela nomes de pastas: confidencialidade baixa. A complexidade fica alta porque o dano depende do que existe nesses caminhos. Resultado típico: 3,7 (Baixa).',
      },
      passos: [
        'Acessar http://www.boinanuvem.exemplo/robots.txt.',
        'Ler as linhas Disallow e os comentários do arquivo.',
        'Registrar os caminhos revelados (/admin-jefferson/ e /backup-antigo/).',
      ],
      evidencia: {
        id: 'ev-robots',
        situacao: 'Que evidência vai para o relatório?',
        alternativas: [
          { texto: 'O conteúdo do robots.txt com a URL e o horário da coleta.', certa: true, retorno: 'Isso. Curto e reproduzível.' },
          { texto: 'O site inteiro baixado em zip.', certa: false, retorno: 'Exagero. Evidência é o mínimo que prova o achado.' },
          { texto: 'A frase "o robots.txt é inseguro".', certa: false, retorno: 'Opinião não é evidência.' },
        ],
      },
      recomendacao: {
        id: 'rec-robots',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'Apagar o robots.txt.', certa: false, retorno: 'O problema não é o arquivo, é ter coisa sensível em pasta pública.' },
          { texto: 'Não usar o robots.txt para esconder áreas: área restrita exige autenticação e backup não fica em pasta pública.', certa: true, retorno: 'Isso. Ataca a causa.' },
          { texto: 'Colocar mais linhas Disallow para confundir.', certa: false, retorno: 'Mais linhas, mais mapa para quem lê.' },
        ],
      },
    },
    {
      achado: 'git',
      cvss: {
        min: 7.0, max: 8.9,
        sugerido: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N',
        explica: 'Pela internet, sem login, sem condição especial e sem ninguém clicar em nada. Vaza o código e a credencial do banco: confidencialidade alta. Só a leitura em si não altera nem derruba nada. Resultado: 7,5 (Alta).',
      },
      passos: [
        'Acessar http://www.boinanuvem.exemplo/.git/ e confirmar a listagem de arquivos.',
        'Baixar a pasta .git para o ambiente de evidências.',
        'Listar o histórico de commits com git log.',
        'Inspecionar as alterações com git log -p e localizar o arquivo config.php removido.',
      ],
      evidencia: {
        id: 'ev-git',
        situacao: 'Como a senha encontrada aparece no relatório?',
        alternativas: [
          { texto: 'Completa no corpo do relatório, em negrito, para ninguém perder.', certa: false, retorno: 'O relatório circula: diretoria, jurídico, e-mail... Senha completa no corpo vira um segundo vazamento.' },
          { texto: 'Parcialmente mascarada no corpo (Pic*******1!), com o hash do commit; a completa só no anexo cifrado, se o cliente pedir.', certa: true, retorno: 'Isso. Prova que existe e onde está, sem espalhar a senha.' },
          { texto: 'Não cita a senha, só diz que "talvez tenha uma".', certa: false, retorno: 'Talvez não é achado. Você viu: prove com o mínimo necessário.' },
        ],
      },
      recomendacao: {
        id: 'rec-git',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'Fazer um commit novo apagando a senha.', certa: false, retorno: 'Foi exatamente o que o Jefferson fez. O histórico guarda tudo.' },
          { texto: 'Bloquear /.git no servidor web, trocar a senha do banco imediatamente e tirar segredos do código.', certa: true, retorno: 'Isso. Fecha a porta, invalida o que vazou e evita que aconteça de novo.' },
          { texto: 'Reescrever o histórico do git e manter a mesma senha.', certa: false, retorno: 'A senha já foi baixada por quem quisesse. Senha exposta é senha trocada.' },
        ],
      },
    },
    {
      achado: 'backup',
      cvss: {
        min: 7.0, max: 8.9,
        sugerido: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N',
        explica: 'Mesma lógica do .git: qualquer pessoa na internet lê, sem login. Confidencialidade alta (dado pessoal de mais de mil clientes). O CVSS dá 7,5 (Alta); a prioridade de correção é imediata por causa da LGPD, e o relatório diz isso com todas as letras.',
      },
      passos: [
        'Acessar http://www.boinanuvem.exemplo/backup-antigo/ e confirmar a listagem.',
        'Baixar clientes_export_2021.csv para o ambiente de evidências cifrado.',
        'Contar os registros com wc -l, descontando o cabeçalho.',
        'Registrar uma linha de exemplo com os dados mascarados e o hash do arquivo.',
      ],
      evidencia: {
        id: 'ev-backup',
        situacao: 'Que evidência vai para o relatório?',
        alternativas: [
          { texto: 'A planilha completa anexada, para o cliente ver o tamanho do estrago.', certa: false, retorno: 'Aí o relatório vira o vazamento. Cláusula 5 e LGPD dizem prova mínima.' },
          { texto: 'Nome do arquivo, URL, total de registros, uma linha mascarada e o SHA-256 do arquivo.', certa: true, retorno: 'Isso. Prova, dimensiona e permite conferir no reteste, sem expor ninguém.' },
          { texto: 'As 10 primeiras linhas completas, só para garantir.', certa: false, retorno: 'Dez pessoas expostas sem necessidade. Uma linha mascarada prova o mesmo.' },
        ],
      },
      recomendacao: {
        id: 'rec-backup',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'Renomear o arquivo para um nome difícil de adivinhar.', certa: false, retorno: 'A pasta lista os arquivos. E segurança por nome difícil não é segurança.' },
          { texto: 'Tirar o arquivo do ar hoje, verificar nos logs quem acessou, avaliar com o encarregado a comunicação do incidente e proibir backup em pasta pública.', certa: true, retorno: 'Isso. Contém, investiga, cumpre a LGPD e evita repetir.' },
          { texto: 'Colocar senha no zip e deixar no mesmo lugar.', certa: false, retorno: 'Melhora pouco e não resolve: o arquivo já pode ter sido baixado, e isso precisa ser investigado.' },
        ],
      },
    },
    {
      achado: 'foto',
      cvss: {
        min: 4.0, max: 6.9,
        sugerido: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:N',
        explica: 'Qualquer pessoa baixa a foto e lê a credencial. Com ela, alguém poderia ver e alterar pedidos de forma limitada: confidencialidade e integridade baixas, até sabermos mais. Resultado: 6,5 (Média).',
      },
      passos: [
        'Acessar http://www.boinanuvem.exemplo/equipe.html e localizar a foto da festa.',
        'Baixar img/festa-neide.png.',
        'Extrair os textos do arquivo com strings e localizar o campo Description.',
      ],
      evidencia: {
        id: 'ev-foto',
        situacao: 'Que evidência vai para o relatório?',
        alternativas: [
          { texto: 'O campo de metadado com a senha mascarada e a URL da imagem.', certa: true, retorno: 'Isso. Mostra onde está e o que é, sem republicar a senha.' },
          { texto: 'A foto da Dona Neide em tamanho grande na capa do relatório.', certa: false, retorno: 'A Dona Neide agradece se não virar capa. Mostre só o metadado.' },
          { texto: 'A senha completa, já que é "só" de uma funcionária.', certa: false, retorno: 'Credencial de funcionária abre sistema da empresa. Mascare.' },
        ],
      },
      recomendacao: {
        id: 'rec-foto',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'Trocar a senha, adotar gerenciador de senhas e segundo fator, e limpar metadados antes de publicar imagens.', certa: true, retorno: 'Isso. Resolve o caso e o hábito.' },
          { texto: 'Proibir fotos de festa no site.', certa: false, retorno: 'A festa não é o problema. O post-it e os metadados são.' },
          { texto: 'Pedir para a Dona Neide decorar a senha.', certa: false, retorno: 'Ela vai anotar no caderno. Ela já avisou.' },
        ],
      },
    },
  ],

  sumario: {
    pedido: 'O Seu Dirceu vai ler só a primeira página. Escolha as frases do sumário executivo (marque todas que servem).',
    frases: [
      { texto: 'Encontramos dados pessoais de 1.284 clientes acessíveis a qualquer pessoa na internet. É o problema mais urgente e precisa ser resolvido hoje.', boa: true, retorno: 'Claro, com número e prazo.' },
      { texto: 'O servidor web expõe o diretório .git com objetos loose e refs acessíveis via HTTP sem autenticação.', boa: false, retorno: 'Correto, mas o Seu Dirceu parou de ler em "objetos loose". Isso vai na parte técnica.' },
      { texto: 'A senha do banco de dados do sistema de pedidos ficou publicada junto com o site e precisa ser trocada.', boa: true, retorno: 'Direto: o que aconteceu e o que fazer.' },
      { texto: 'O Jefferson foi negligente e colocou a empresa em risco.', boa: false, retorno: 'Relatório aponta falhas de processo, não culpados. Culpa faz as pessoas esconderem problemas.' },
      { texto: 'Nenhum dos problemas exige compra de equipamento: as correções principais são de configuração e de processo.', boa: true, retorno: 'O Seu Dirceu agradece. Dono sempre pergunta quanto custa.' },
      { texto: 'O sistema está 100% inseguro e pode ser invadido a qualquer momento por hackers internacionais.', boa: false, retorno: 'Alarmismo tira a credibilidade do relatório. Seja preciso.' },
      { texto: 'Recomendamos um reteste após as correções para confirmar que os problemas foram resolvidos.', boa: true, retorno: 'Isso. Correção sem verificação é promessa.' },
    ],
  },

  reuniao: [
    {
      id: 'reu-jefferson',
      de: 'jefferson',
      situacao: 'Jefferson, de braços cruzados: "Mas eu apaguei a senha no commit seguinte! Tá lá escrito \'tirei a senha do repo\'. Então isso nem vale."',
      alternativas: [
        { texto: '"Vale sim, e você deveria saber disso."', certa: false, retorno: 'Tecnicamente certo, humanamente desastroso. O Jefferson agora vai brigar com cada linha do relatório.' },
        { texto: '"O git guarda o histórico inteiro, então a versão antiga continua lá. É um erro muito comum. O importante agora é trocar a senha e bloquear o .git."', certa: true, retorno: 'Isso. Explica sem humilhar e leva para a solução. O Jefferson descruza os braços.' },
        { texto: '"Tudo bem, então tiro esse achado do relatório."', certa: false, retorno: 'Achado não sai do relatório porque alguém ficou chateado. A senha continua exposta.' },
      ],
    },
    {
      id: 'reu-dirceu',
      de: 'dirceu',
      situacao: 'Seu Dirceu: "Então a culpa é do Jefferson? Mando embora?"',
      alternativas: [
        { texto: '"O problema é de processo: uma pessoa sozinha fazendo tudo, sem revisão. Recomendo treinamento e alguém para revisar as mudanças, não demissão."', certa: true, retorno: 'Isso. O Jefferson te olha como quem viu um anjo. A Dra. Patrícia anota.' },
        { texto: '"Não cabe a mim dizer, mas eu mandaria."', certa: false, retorno: 'Você acabou de ganhar um inimigo no TI e perdeu o foco da reunião.' },
        { texto: '"Se demitir, o próximo vai fazer igual."', certa: false, retorno: 'Meio certo, mas sem proposta. O cliente precisa sair da reunião sabendo o que fazer.' },
      ],
    },
    {
      id: 'reu-patricia',
      de: 'patricia',
      situacao: 'Dra. Patrícia: "Precisamos comunicar a ANPD e os titulares sobre a planilha?"',
      alternativas: [
        { texto: '"Com certeza, e eu mesma posso mandar o comunicado hoje."', certa: false, retorno: 'A comunicação é do controlador, com o encarregado. Pentester fornece os fatos, não assina pela empresa.' },
        { texto: '"Não precisa, ninguém deve ter visto."', certa: false, retorno: 'Você não sabe disso. Os logs vão dizer, e a avaliação de risco é da empresa.' },
        { texto: '"A decisão é do Boi na Nuvem como controlador, com o encarregado. O que eu entrego são os fatos: o que estava exposto, desde quando provavelmente, quantos registros e os logs para investigar acessos."', certa: true, retorno: 'Isso. Cada um no seu papel. A Dra. Patrícia sorri pela primeira vez no projeto.' },
      ],
    },
    {
      id: 'reu-neide',
      de: 'neide',
      situacao: 'Dona Neide: "Então eu posso continuar anotando as senhas no meu caderninho? Ele fica na gaveta."',
      alternativas: [
        { texto: '"Pode, desde que a gaveta tenha chave."', certa: false, retorno: 'A gaveta sempre tem chave. A chave sempre fica em cima da mesa.' },
        { texto: '"O ideal é um gerenciador de senhas e um segundo fator nos sistemas. Posso deixar um guia simples no relatório para a senhora."', certa: true, retorno: 'Isso. Solução prática e com cuidado com quem vai usar. A Dona Neide promete tentar.' },
        { texto: '"Não pode anotar senha em lugar nenhum, tem que decorar todas."', certa: false, retorno: 'Ninguém decora 30 senhas fortes. Regra impossível vira post-it escondido.' },
      ],
    },
    {
      id: 'reu-prazo',
      de: 'dirceu',
      situacao: 'Seu Dirceu: "Tá, e o que eu faço primeiro? Não dá pra fazer tudo amanhã."',
      alternativas: [
        { texto: '"Hoje: tirar a planilha do ar, bloquear o .git e trocar as senhas expostas. Esta semana: revisar o que mais está publicado e o processo de deploy. Depois: reteste para confirmar."', certa: true, retorno: 'Isso. Prioridade pelo risco, com prazo e verificação no fim. O Seu Dirceu agenda o reteste na hora.' },
        { texto: '"Faz na ordem do relatório, do primeiro ao último."', certa: false, retorno: 'A ordem do relatório não é a ordem do risco. A planilha não pode esperar o inventário.' },
        { texto: '"Contrata uma consultoria para cuidar de tudo."', certa: false, retorno: 'Vaga demais. E soa como venda.' },
      ],
    },
  ],

  finais: [
    {
      minimo: 85,
      titulo: 'Relatório exemplar',
      texto: [
        'O Seu Dirceu imprimiu o sumário executivo e colou na parede do escritório, do lado do certificado do SIF.',
        'O Jefferson pediu o link do curso que você recomendou. A Dra. Patrícia mandou um e-mail elogiando o "zelo com os dados pessoais", o que, vindo dela, equivale a um abraço.',
        'Reteste agendado para a semana que vem.',
      ],
    },
    {
      minimo: 60,
      titulo: 'Relatório entregue',
      texto: [
        'O cliente entendeu o principal e já começou a corrigir.',
        'A Tânia revisou algumas partes antes de enviar ("severidade a gente justifica, não chuta"). Nada que um café não resolva.',
        'Reteste agendado para a semana que vem.',
      ],
    },
    {
      minimo: 0,
      titulo: 'Relatório devolvido',
      texto: [
        'A Dra. Patrícia devolveu o relatório com 37 comentários em vermelho. O Seu Dirceu perguntou se "CVSS" é algum imposto novo.',
        'A Tânia refez metade e te mandou um áudio de 4 minutos. Não ouça antes de dormir.',
        'Mesmo assim, o reteste foi agendado: o cliente precisa saber se corrigiu.',
      ],
    },
  ],
};
