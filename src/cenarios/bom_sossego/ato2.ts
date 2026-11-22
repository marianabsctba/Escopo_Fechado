// Ato 2 do Bom Sossego: relatório para uma prefeitura em ano eleitoral.
import type { AtoRelatorio } from '../../motor/tipos';

export const ato2: AtoRelatorio = {
  titulo: 'Ato 2: o relatório',

  abertura: [
    {
      id: 'bs-a2-tania',
      de: 'tania',
      canal: 'whatsapp',
      texto: [
        'Rede interna muda o CVSS: quem ataca está na rede adjacente (AV:A), não na internet. E quando a conta exposta é admin do domínio, o impacto sai do componente e pega o domínio inteiro (escopo alterado).',
        'O relatório vai ser lido por um prefeito em campanha. Precisão total, nenhum adjetivo a mais, nenhum a menos.',
      ],
    },
  ],

  itens: [
    {
      achado: 'bs-mapa',
      cvss: null,
      passos: [
        'Varrer as portas 389 e 445 na faixa autorizada 10.20.0.0/24.',
        'Consultar a raiz do diretório (namingContexts) no controlador de domínio.',
        'Registrar servidores, serviços e a raiz do domínio.',
      ],
      evidencia: {
        id: 'bs-ev-mapa',
        situacao: 'Que evidência vai para o relatório?',
        alternativas: [
          { texto: 'A saída da varredura e da consulta de namingContexts, com data e hora.', certa: true, retorno: 'Isso. Base de comparação para o reteste.' },
          { texto: 'O print da tela da VPN conectada.', certa: false, retorno: 'Prova que você entrou, não o que encontrou.' },
          { texto: 'A lista de todos os IPs que existem na prefeitura, inclusive a Câmara.', certa: false, retorno: 'A Câmara está fora do escopo. Não entra nem como evidência de varredura.' },
        ],
      },
      recomendacao: {
        id: 'bs-rec-mapa',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'Separar a rede da Prefeitura da rede da Câmara e manter inventário dos serviços do domínio.', certa: true, retorno: 'Isso. Dois Poderes, duas redes.' },
          { texto: 'Desligar o LDAP.', certa: false, retorno: 'O domínio depende dele. O problema é a configuração, não o serviço.' },
          { texto: 'Trocar o IP do controlador de domínio.', certa: false, retorno: 'Não muda nada para quem varre a rede.' },
        ],
      },
    },
    {
      achado: 'bs-anonimo',
      cvss: {
        min: 4.0, max: 6.9,
        sugerido: 'CVSS:3.1/AV:A/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N',
        explica: 'Precisa estar na rede interna (adjacente), mas não precisa de conta. Vaza informação limitada (contas, cargos, grupos): 4,3 (Média).',
      },
      passos: [
        'Executar ldapsearch sem credenciais (-x, sem -D e -w) contra o controlador de domínio.',
        "Filtrar objetos de usuário com '(objectClass=user)' e pedir sAMAccountName.",
        'Contar as contas devolvidas.',
      ],
      evidencia: {
        id: 'bs-ev-anonimo',
        situacao: 'Que evidência vai para o relatório?',
        alternativas: [
          { texto: 'O comando sem credenciais e a contagem de contas, com três exemplos de nomes de conta.', certa: true, retorno: 'Isso. Prova a abertura sem despejar o diretório inteiro.' },
          { texto: 'A exportação completa do diretório em anexo.', certa: false, retorno: 'Prova mínima. A exportação completa é um presente para quem achar o relatório.' },
          { texto: 'A lista de cargos e salários cruzada com o diretório.', certa: false, retorno: 'Cruzar bases vai além do achado e da autorização.' },
        ],
      },
      recomendacao: {
        id: 'bs-rec-anonimo',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'Desabilitar consulta anônima e criar uma conta de serviço própria para a impressora do protocolo.', certa: true, retorno: 'Isso. Resolve e não quebra o que depende disso.' },
          { texto: 'Bloquear a porta 389 para toda a rede.', certa: false, retorno: 'Os computadores do domínio precisam do LDAP. Bloquear derruba o domínio.' },
          { texto: 'Esconder os usuários numa OU com nome estranho.', certa: false, retorno: 'Nome estranho não é controle de acesso.' },
        ],
      },
    },
    {
      achado: 'bs-descricao',
      cvss: {
        min: 9.0, max: 10,
        sugerido: 'CVSS:3.1/AV:A/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
        explica: 'Da rede interna, sem conta (o diretório é anônimo), lê-se a senha de um administrador do domínio. O impacto sai do diretório e atinge todo o domínio (escopo alterado), com controle total: 9,6 (Crítica).',
      },
      passos: [
        "Consultar o diretório com o filtro '(description=*senha*)' pedindo description, pwdLastSet e memberOf.",
        'Identificar a conta estagiario.ti e a senha provisória na descrição.',
        'Verificar em pwdLastSet que a senha não é trocada desde 2024-02-05.',
        'Verificar em memberOf que a conta pertence a Domain Admins.',
      ],
      evidencia: {
        id: 'bs-ev-descricao',
        situacao: 'Como a senha aparece no relatório?',
        alternativas: [
          { texto: 'Mascarada (Sos*****24), com conta, pwdLastSet e grupos. Sem nenhuma tentativa de uso.', certa: true, retorno: 'Isso. Prova, gravidade e a declaração de que a credencial não foi usada (cláusula 5).' },
          { texto: 'Completa, e um print do login feito com ela para provar que funciona.', certa: false, retorno: 'Usar a credencial viola a cláusula 5. E o print é confissão.' },
          { texto: 'Omitida, para não constranger o estagiário.', certa: false, retorno: 'É o achado mais grave. O constrangimento se resolve tirando nomes de pessoas do sumário, não omitindo o achado.' },
        ],
      },
      recomendacao: {
        id: 'bs-rec-descricao',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'Trocar a senha, limpar a descrição, tirar a conta de Domain Admins e exigir troca no primeiro acesso.', certa: true, retorno: 'Isso. Corrige o caso e a causa.' },
          { texto: 'Só apagar a descrição.', certa: false, retorno: 'A senha já foi lida por quem quisesse. Senha exposta é senha trocada.' },
          { texto: 'Desligar o estagiário.', certa: false, retorno: 'O problema é o processo que deu admin a um estagiário, não o estagiário.' },
        ],
      },
    },
    {
      achado: 'bs-netlogon',
      cvss: {
        min: 9.0, max: 10,
        sugerido: 'CVSS:3.1/AV:A/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H',
        explica: 'Precisa de qualquer conta do domínio (privilégio baixo), que todo servidor tem. A conta exposta é admin do domínio: escopo alterado e controle total. 9,0 (Crítica).',
      },
      passos: [
        'Listar o compartilhamento NETLOGON do controlador com a conta de teste.',
        'Baixar logon.bat e localizar a linha net use com usuário e senha.',
        'Consultar no diretório os grupos da conta adm.financas.',
      ],
      evidencia: {
        id: 'bs-ev-netlogon',
        situacao: 'Que evidência vai para o relatório?',
        alternativas: [
          { texto: 'A linha do script com a senha mascarada, o caminho no NETLOGON e os grupos da conta.', certa: true, retorno: 'Isso. Qualquer pessoa do TI acha e confirma.' },
          { texto: 'O script inteiro com a senha completa, em destaque.', certa: false, retorno: 'O relatório circula entre secretarias. Mascare.' },
          { texto: 'A prova de que a pasta Financas abre com essa senha.', certa: false, retorno: 'Seria usar a credencial (cláusula 5). Os grupos no diretório já mostram o alcance.' },
        ],
      },
      recomendacao: {
        id: 'bs-rec-netlogon',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'Tirar a senha do script, trocar a senha da conta, removê-la de Domain Admins e mapear a pasta por permissão de grupo.', certa: true, retorno: 'Isso. Mapeamento por grupo dispensa senha em script.' },
          { texto: 'Mover o script para outra pasta.', certa: false, retorno: 'O script precisa estar acessível para rodar no logon. O problema é a senha dentro dele.' },
          { texto: 'Codificar a senha em base64 no script.', certa: false, retorno: 'Base64 não é criptografia: qualquer um decodifica em um segundo.' },
        ],
      },
    },
    {
      achado: 'bs-folha',
      cvss: {
        min: 4.0, max: 6.9,
        sugerido: 'CVSS:3.1/AV:A/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N',
        explica: 'Precisa de conta comum na rede interna. Dado pessoal de mais de 400 servidores: confidencialidade alta. 5,7 (Média). A urgência vem da LGPD.',
      },
      passos: [
        'Listar o compartilhamento Publico do servidor de arquivos com a conta de teste.',
        'Baixar folha_pagamento_2026-10.csv para o ambiente de evidências.',
        'Contar os registros e registrar um exemplo com CPF mascarado.',
      ],
      evidencia: {
        id: 'bs-ev-folha',
        situacao: 'Que evidência vai para o relatório?',
        alternativas: [
          { texto: 'Caminho, total de registros, colunas existentes e um registro com CPF mascarado.', certa: true, retorno: 'Isso. Mostra que tem CPF sem expor nenhum.' },
          { texto: 'A planilha completa, já que salário é público.', certa: false, retorno: 'Salário é público no portal da transparência. CPF não. A planilha completa expõe os dois.' },
          { texto: 'Os salários mais altos, para o sumário ficar chamativo.', certa: false, retorno: 'Isso é munição de campanha, não evidência de segurança.' },
        ],
      },
      recomendacao: {
        id: 'bs-rec-folha',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'Tirar da pasta pública, restringir à Administração e publicar remuneração só pelo portal da transparência, sem CPF.', certa: true, retorno: 'Isso. Transparência pelo canal certo, privacidade no resto.' },
          { texto: 'Apagar a pasta Publico inteira.', certa: false, retorno: 'O cardápio da merenda não tem culpa.' },
          { texto: 'Renomear o arquivo para cardapio2.csv.', certa: false, retorno: 'Disfarce não é controle de acesso.' },
        ],
      },
    },
    {
      achado: 'bs-smb',
      cvss: {
        min: 4.0, max: 8.9,
        sugerido: 'CVSS:3.1/AV:A/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:N',
        explica: 'Da rede interna, sem conta, mas depende de condições (interceptar uma autenticação em andamento): complexidade alta. Se der certo, lê e altera dados: 6,8 (Média).',
      },
      passos: [
        'Executar o script smb-protocols do nmap contra o servidor de arquivos.',
        'Executar o script smb2-security-mode do nmap.',
        'Registrar SMBv1 aceito e assinatura não exigida.',
      ],
      evidencia: {
        id: 'bs-ev-smb',
        situacao: 'Que evidência vai para o relatório?',
        alternativas: [
          { texto: 'A saída dos dois scripts do nmap, com data e hora.', certa: true, retorno: 'Isso. Configuração verificável sem login.' },
          { texto: 'Uma demonstração de interceptação de senha na rede.', certa: false, retorno: 'Fora do que o contrato autoriza. A configuração já é a evidência.' },
          { texto: 'A lista de vírus que usam SMBv1.', certa: false, retorno: 'Contexto cabe numa frase com fonte. Não é a evidência.' },
        ],
      },
      recomendacao: {
        id: 'bs-rec-smb',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'Desabilitar SMBv1 e exigir assinatura SMB por política de grupo, testando antes com as impressoras e scanners antigos.', certa: true, retorno: 'Isso. E o teste prévio evita parar o protocolo da prefeitura numa segunda-feira.' },
          { texto: 'Desligar o servidor de arquivos.', certa: false, retorno: 'A prefeitura para.' },
          { texto: 'Trocar a porta do SMB.', certa: false, retorno: 'Os clientes do domínio esperam a 445. E quem varre acha.' },
        ],
      },
    },
    {
      achado: 'bs-admins',
      cvss: null,
      passos: [
        'Consultar os membros do grupo Domain Admins.',
        'Consultar minPwdLength e lockoutThreshold no objeto raiz do domínio.',
        'Comparar os membros com a função de cada um.',
      ],
      evidencia: {
        id: 'bs-ev-admins',
        situacao: 'Que evidência vai para o relatório?',
        alternativas: [
          { texto: 'A lista de membros do grupo com a função de cada conta, e os valores da política.', certa: true, retorno: 'Isso. Fatos, sem adjetivo.' },
          { texto: 'A observação de que o secretário de TI é primo do vice-prefeito.', certa: false, retorno: 'Parentesco não é achado de segurança. Fica fora do relatório.' },
          { texto: 'Nada: governança não é segurança.', certa: false, retorno: 'Excesso de administradores é dos achados mais importantes em AD.' },
        ],
      },
      recomendacao: {
        id: 'bs-rec-admins',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'Reduzir Domain Admins a contas nominais e necessárias, desativar fornecedores encerrados, senha mínima de 12 caracteres e bloqueio por tentativas.', certa: true, retorno: 'Isso. Cada item verificável no reteste.' },
          { texto: 'Tirar todos do grupo, inclusive o secretário de TI.', certa: false, retorno: 'Alguém precisa administrar o domínio. Mínimo necessário, não zero.' },
          { texto: 'Obrigar senha de 30 caracteres trocada toda semana.', certa: false, retorno: 'Política impossível vira senha no post-it. Equilíbrio.' },
        ],
      },
    },
  ],

  sumario: {
    pedido: 'O Prefeito e a Procuradoria vão ler a primeira página. Escolha as frases do sumário executivo.',
    frases: [
      { texto: 'Uma conta comum de servidor, sem quebrar senha nenhuma, conseguiu ler duas senhas de administradores do domínio. Com elas, qualquer servidor controlaria toda a rede da Prefeitura.', boa: true, retorno: 'Claro e verdadeiro. O tamanho do problema numa frase.' },
      { texto: 'A Prefeitura de São Jerônimo é a mais segura do sertão.', boa: false, retorno: 'É o que o Prefeito queria ler. Não é o que o teste mostrou.' },
      { texto: 'Dados pessoais de mais de 400 servidores, incluindo CPF, estavam numa pasta aberta a todos. A remuneração deve continuar pública, mas só pelo portal da transparência.', boa: true, retorno: 'Isso. LGPD e Lei de Acesso à Informação na mesma frase, sem confusão.' },
      { texto: 'A gestão anterior deixou o sistema vulnerável.', boa: false, retorno: 'O domínio é de 2009 e atravessou várias gestões. E relatório técnico não faz discurso de campanha.' },
      { texto: 'As correções mais urgentes são de configuração e podem ser feitas em dias, sem compra de equipamento.', boa: true, retorno: 'Bom para quem decide: urgência e custo.' },
      { texto: 'O estagiário Kauã e o secretário Clodoaldo são os responsáveis pelas falhas.', boa: false, retorno: 'Sumário aponta falhas de processo, não pessoas. Nome de servidor no sumário vira manchete.' },
      { texto: 'Recomendamos reteste após as correções, dentro do prazo do contrato.', boa: true, retorno: 'Isso. E "dentro do prazo do contrato" já responde ao pedido de adiamento.' },
    ],
  },

  reuniao: [
    {
      id: 'bs-reu-juvenal',
      de: 'juvenal',
      situacao: 'Prefeito Juvenal: "Posso falar no comício que a prefeitura passou num teste de segurança?"',
      alternativas: [
        { texto: '"Pode, foi aprovada."', certa: false, retorno: 'Não foi. E a frase vai parar num vídeo.' },
        { texto: '"O relatório é da Prefeitura, e o uso dele é com a Procuradoria. O que eu posso dizer é o que está escrito: houve falhas graves, que estão sendo corrigidas."', certa: true, retorno: 'Isso. Fiel ao relatório e devolve a decisão a quem cabe. A Dra. Iracema anota.' },
        { texto: '"Se o senhor me pagar mais, eu escrevo outra versão."', certa: false, retorno: 'Isso encerra a sua carreira e começa um processo.' },
      ],
    },
    {
      id: 'bs-reu-clodoaldo',
      de: 'clodoaldo',
      situacao: 'Clodoaldo: "Funciona assim desde 2009 e nunca teve problema. Por que mudar agora?"',
      alternativas: [
        { texto: '"Nunca ter percebido um problema não é o mesmo que nunca ter tido. Hoje, qualquer servidor chega a uma senha de administrador em minutos. As mudanças são pequenas e eu ajudo a priorizar."', certa: true, retorno: 'Isso. Respeita a história dele e mostra o risco concreto.' },
        { texto: '"Porque está tudo errado."', certa: false, retorno: 'Verdade dita assim só gera resistência.' },
        { texto: '"Se o senhor não sabe, a gente pode treinar outra pessoa."', certa: false, retorno: 'Ameaça velada. Ele vai dificultar cada correção.' },
      ],
    },
    {
      id: 'bs-reu-iracema',
      de: 'iracema',
      situacao: 'Dra. Iracema: "Se a remuneração já é pública pela transparência, a planilha na pasta é mesmo um problema?"',
      alternativas: [
        { texto: '"Não, então pode ficar."', certa: false, retorno: 'A planilha tem CPF e dados funcionais, que não são públicos.' },
        { texto: '"A remuneração nominal é pública, pelo portal e na forma da Lei de Acesso à Informação. O CPF não é, e a pasta não é o canal de transparência: é uma exposição a toda a rede, sem controle de acesso."', certa: true, retorno: 'Isso. Precisão jurídica e técnica. A Dra. Iracema faz que sim com a cabeça, devagar.' },
        { texto: '"Isso é com a senhora, eu sou da técnica."', certa: false, retorno: 'É com ela decidir, mas os fatos técnicos são seus: quais campos, para quem estava aberto.' },
      ],
    },
    {
      id: 'bs-reu-kaua',
      de: 'estagiario',
      situacao: 'Kauã, o estagiário: "Eu vou ser mandado embora por causa da minha senha?"',
      alternativas: [
        { texto: '"A senha provisória nunca trocada e o acesso de administrador foram decisões de processo, não suas. A recomendação é tirar o seu acesso de admin e trocar a senha, não tirar você."', certa: true, retorno: 'Isso. O Kauã respira. E o relatório continua tecnicamente impecável.' },
        { texto: '"Depende do prefeito."', certa: false, retorno: 'Lava as mãos e deixa um estagiário de 19 anos achando que acabou com a prefeitura.' },
        { texto: '"Deveria, né."', certa: false, retorno: 'Não. E você perdeu a única pessoa que sabe onde fica o toner.' },
      ],
    },
    {
      id: 'bs-reu-prazo',
      de: 'juvenal',
      situacao: 'Prefeito Juvenal: "E o que a gente faz primeiro? Tem eleição daqui a pouco, não dá pra parar a prefeitura."',
      alternativas: [
        { texto: '"Hoje: trocar as duas senhas de administrador expostas e tirar a planilha da pasta. Esta semana: diretório sem acesso anônimo e limpeza de Domain Admins. Depois de testar com as impressoras: SMBv1 e assinatura. Reteste no prazo do contrato."', certa: true, retorno: 'Isso. Pelo risco, sem parar a prefeitura e com verificação.' },
        { texto: '"Depois da eleição a gente vê."', certa: false, retorno: 'Duas senhas de admin abertas não esperam calendário eleitoral (cláusula 8).' },
        { texto: '"Começa pelo SMBv1, que é o mais famoso."', certa: false, retorno: 'Famoso não é o mais urgente. As senhas de admin vêm antes.' },
      ],
    },
  ],

  finais: [
    {
      minimo: 85,
      titulo: 'Relatório exemplar',
      texto: [
        'A Dra. Iracema protocolou o relatório e mandou cópia ao controle interno. O Prefeito, depois de muito resmungar, assinou o plano de correção.',
        'No comício, falou só que "a prefeitura está investindo em segurança". Era verdade. Pela primeira vez na campanha, segundo a oposição.',
        'Reteste agendado.',
      ],
    },
    {
      minimo: 60,
      titulo: 'Relatório entregue',
      texto: ['A Procuradoria pediu ajustes de redação e aprovou. O Clodoaldo começou as correções resmungando, mas começou.', 'Reteste agendado.'],
    },
    {
      minimo: 0,
      titulo: 'Relatório devolvido',
      texto: [
        'Um trecho ambíguo do relatório apareceu num grupo de WhatsApp de campanha, fora de contexto. A Dra. Iracema pediu uma versão nova "sem nenhuma frase que vire meme".',
        'O reteste foi agendado: as senhas de administrador não sabem que é ano eleitoral.',
      ],
    },
  ],
};
