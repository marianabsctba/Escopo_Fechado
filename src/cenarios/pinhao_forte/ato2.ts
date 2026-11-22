// Ato 2 do Pinhão Forte: relatório para um cliente regulado, com fornecedor
// no meio e uma seção sobre a detecção pelo SOC.
import type { AtoRelatorio } from '../../motor/tipos';

export const ato2: AtoRelatorio = {
  titulo: 'Ato 2: o relatório',

  abertura: [
    {
      id: 'pf-a2-tania',
      de: 'tania',
      canal: 'whatsapp',
      texto: [
        'Relatório de cliente regulado: a Marlene vai ler com lupa, a Kelly vai procurar brecha para defender a fábrica e o Seu Osvaldo vai ler só o sumário.',
        'E tem a seção do SOC: dizer se e quando eles perceberam. Isso é resultado, não fofoca.',
      ],
    },
  ],

  itens: [
    {
      achado: 'pf-mapa',
      cvss: null,
      passos: [
        'Varrer as portas web da faixa autorizada 192.0.2.32/28.',
        'Ler os nomes alternativos (SAN) do certificado TLS do site institucional.',
        'Relacionar o nome homolog-app ao servidor que responde na porta 8443.',
      ],
      evidencia: {
        id: 'pf-ev-mapa',
        situacao: 'Que evidência vai para o relatório?',
        alternativas: [
          { texto: 'A saída da varredura e o trecho do certificado com os nomes alternativos, com data e hora.', certa: true, retorno: 'Isso. Mostra como o ambiente foi descoberto, sem nenhum acesso indevido.' },
          { texto: 'O certificado inteiro em base64 colado no corpo do relatório.', certa: false, retorno: 'Ninguém lê. O trecho relevante basta.' },
          { texto: 'Só a frase "achamos a homologação".', certa: false, retorno: 'Sem como reproduzir, a fábrica vai dizer que não existe.' },
        ],
      },
      recomendacao: {
        id: 'pf-rec-mapa',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'Manter inventário de tudo que está publicado e usar certificados separados por ambiente.', certa: true, retorno: 'Isso. Ataca o esquecimento e o vazamento de nomes.' },
          { texto: 'Trocar a porta da homologação para uma mais alta.', certa: false, retorno: 'Porta diferente não esconde de quem varre. E o certificado continua anunciando.' },
          { texto: 'Desligar o TLS da homologação para não ter certificado.', certa: false, retorno: 'Pior: tira a criptografia e continua exposto.' },
        ],
      },
    },
    {
      achado: 'pf-docs',
      cvss: {
        min: 4.0, max: 6.9,
        sugerido: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N',
        explica: 'Qualquer pessoa lê pela internet, sem login. Revela informação limitada (o mapa da API e nomes de ambientes), sem alterar nem derrubar nada: 5,3 (Média).',
      },
      passos: [
        'Acessar a página de login do Pinhão Digital e localizar a referência à documentação.',
        'Baixar /api/docs/openapi.json sem autenticação.',
        'Listar as rotas e identificar a marcada como interna e o endereço de homologação.',
      ],
      evidencia: {
        id: 'pf-ev-docs',
        situacao: 'Como mostrar a rota interna no relatório?',
        alternativas: [
          { texto: 'O trecho da documentação com a rota e a resposta 401 de uma única consulta, mostrando que ela existe e pede token.', certa: true, retorno: 'Isso. Prova a exposição e mostra que você não tentou contornar a proteção.' },
          { texto: 'O arquivo CSV exportado pela rota, para provar o impacto.', certa: false, retorno: 'Você não exportou (cláusula 5) e não vai exportar. O achado é a documentação.' },
          { texto: 'A documentação inteira, com todas as rotas, no anexo público.', certa: false, retorno: 'Relatório circula. Mostre o trecho necessário.' },
        ],
      },
      recomendacao: {
        id: 'pf-rec-docs',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'Mudar a documentação para outro endereço.', certa: false, retorno: 'Endereço novo é só um caminho a mais para descobrir.' },
          { texto: 'Exigir autenticação para a documentação, separar a de parceiros da interna e tirar rotas internas da especificação publicada.', certa: true, retorno: 'Isso. Quem precisa continua tendo acesso; o resto do mundo, não.' },
          { texto: 'Apagar a rota interna do sistema.', certa: false, retorno: 'A rota pode ser necessária para a operação. O problema é ela estar anunciada.' },
        ],
      },
    },
    {
      achado: 'pf-cookie',
      cvss: {
        min: 0.1, max: 3.9,
        sugerido: 'CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:N/A:N',
        explica: 'Para virar problema, precisa de outra condição (um script injetado, uma rede hostil) e de um usuário navegando: complexidade alta e interação necessária. Impacto limitado: 3,1 (Baixa).',
      },
      passos: [
        'Fazer uma requisição ao Pinhão Digital e ler os cabeçalhos da resposta.',
        'Verificar os atributos do cookie PFSESSID (Secure, HttpOnly, SameSite).',
        'Verificar a ausência do cabeçalho Strict-Transport-Security.',
      ],
      evidencia: {
        id: 'pf-ev-cookie',
        situacao: 'Que evidência vai para o relatório?',
        alternativas: [
          { texto: 'O cabeçalho Set-Cookie como o servidor envia, com o valor da sessão truncado.', certa: true, retorno: 'Isso. Mostra o problema sem entregar uma sessão.' },
          { texto: 'Um valor de sessão completo, para a fábrica testar.', certa: false, retorno: 'Valor de sessão é credencial. Trunque.' },
          { texto: 'Um vídeo de 12 minutos navegando pelo app.', certa: false, retorno: 'Uma linha de cabeçalho prova melhor.' },
        ],
      },
      recomendacao: {
        id: 'pf-rec-cookie',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'Marcar o cookie com Secure, HttpOnly e SameSite, e enviar Strict-Transport-Security.', certa: true, retorno: 'Isso. Configuração, sem custo, efeito imediato.' },
          { texto: 'Trocar o nome do cookie para algo menos óbvio.', certa: false, retorno: 'O nome não protege nada.' },
          { texto: 'Parar de usar cookies.', certa: false, retorno: 'Sessão precisa de algum mecanismo; o cookie bem configurado é o padrão.' },
        ],
      },
    },
    {
      achado: 'pf-erro',
      cvss: {
        min: 4.0, max: 6.9,
        sugerido: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N',
        explica: 'Sem login, pela internet, de forma reproduzível. Vaza informação limitada mas útil (servidor de banco, usuário, versões): 5,3 (Média).',
      },
      passos: [
        'Chamar a rota pública de cotação com uma moeda inexistente.',
        'Observar a resposta 500 com a pilha de erro.',
        'Registrar as informações internas expostas (servidor de banco, usuário, versões).',
      ],
      evidencia: {
        id: 'pf-ev-erro',
        situacao: 'Que evidência vai para o relatório?',
        alternativas: [
          { texto: 'A URL usada e o trecho da pilha com o nome do servidor interno e as versões.', certa: true, retorno: 'Isso. Reproduzível com um comando.' },
          { texto: 'Mil requisições com moedas aleatórias, para mostrar que sempre quebra.', certa: false, retorno: 'Uma basta. E mil acordam o SOC.' },
          { texto: 'A afirmação de que "o sistema é instável".', certa: false, retorno: 'Vago e injusto: o problema é o tratamento de erro, não a estabilidade.' },
        ],
      },
      recomendacao: {
        id: 'pf-rec-erro',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'Responder mensagem genérica ao cliente, guardar o detalhe só no log interno e atualizar Node.js e Express.', certa: true, retorno: 'Isso. Fecha o vazamento e o motivo dele.' },
          { texto: 'Bloquear a palavra "moeda" no firewall.', certa: false, retorno: 'Quebra a função de cotação e não resolve o tratamento de erro do resto da API.' },
          { texto: 'Desligar os logs para não vazar nada.', certa: false, retorno: 'Ao contrário: o detalhe deve ir para o log, não para o cliente.' },
        ],
      },
    },
    {
      achado: 'pf-homolog',
      cvss: {
        min: 7.0, max: 8.9,
        sugerido: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N',
        explica: 'Qualquer pessoa na internet lê, sem login, dados pessoais e financeiros de associados: confidencialidade alta. Nada é alterado: 7,5 (Alta). A prioridade é imediata pela LGPD e pela regulação do setor.',
      },
      passos: [
        'Identificar o nome da homologação pelo certificado TLS do site.',
        'Acessar https://homolog-app.pinhaoforte.exemplo:8443/status (resolvendo o nome para 192.0.2.40).',
        'Registrar a origem declarada da base, o total de associados e um registro mascarado, sem saldo.',
      ],
      evidencia: {
        id: 'pf-ev-homolog',
        situacao: 'Que evidência vai para o relatório?',
        alternativas: [
          { texto: 'A origem declarada ("cópia de produção"), o total de 4.310 associados e um registro com nome abreviado e CPF mascarado, sem saldo.', certa: true, retorno: 'Isso. Cláusula 7 cumprida e gravidade clara.' },
          { texto: 'Os três registros da amostra completos, com saldo, para a Marlene conferir.', certa: false, retorno: 'Saldo de associado nunca aparece (cláusula 7). A Marlene confere pelo sistema, não pelo relatório.' },
          { texto: 'Só "tem dados na homologação".', certa: false, retorno: 'Sem origem e sem volume, a fábrica vai dizer que é dado fictício.' },
        ],
      },
      recomendacao: {
        id: 'pf-rec-homolog',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'Tirar a homologação da internet, usar dados sintéticos ou anonimizados e avaliar com a encarregada se houve incidente.', certa: true, retorno: 'Isso. Contém, corrige a causa e trata a LGPD.' },
          { texto: 'Colocar uma senha na página /status.', certa: false, retorno: 'Melhora pouco: o ambiente continua público e com dado real.' },
          { texto: 'Mascarar só a amostra da página de status.', certa: false, retorno: 'A base inteira continua sendo cópia de produção. A amostra era só a janela.' },
        ],
      },
    },
    {
      achado: 'pf-versao',
      cvss: null,
      passos: [
        'Fazer uma requisição ao Pinhão Digital e ler os cabeçalhos.',
        'Registrar o valor de X-Powered-By.',
        'Comparar a versão anunciada com o calendário de suporte do framework.',
      ],
      evidencia: {
        id: 'pf-ev-versao',
        situacao: 'Que evidência vai para o relatório?',
        alternativas: [
          { texto: 'O cabeçalho X-Powered-By e a referência pública de fim de suporte da versão.', certa: true, retorno: 'Isso. Fato verificável e fonte.' },
          { texto: 'A lista de todas as falhas conhecidas da versão, sem testar nenhuma.', certa: false, retorno: 'Lista sem contexto vira alarme. Cite o fim de suporte e recomende atualizar.' },
          { texto: 'Nada, versão não é achado.', certa: false, retorno: 'Componente fora de suporte é achado (OWASP Top 10, A06).' },
        ],
      },
      recomendacao: {
        id: 'pf-rec-versao',
        situacao: 'Qual recomendação vai para o relatório?',
        alternativas: [
          { texto: 'Remover o X-Powered-By e atualizar Node.js e Express para versões com suporte.', certa: true, retorno: 'Isso. Esconder ajuda pouco; atualizar resolve.' },
          { texto: 'Só remover o cabeçalho.', certa: false, retorno: 'A versão antiga continua lá, só que calada.' },
          { texto: 'Mudar o cabeçalho para uma versão nova falsa.', certa: false, retorno: 'Mentir no cabeçalho atrapalha a própria equipe e não corrige nada.' },
        ],
      },
    },
  ],

  sumario: {
    pedido: 'O Seu Osvaldo e o conselho da cooperativa vão ler só a primeira página. Escolha as frases do sumário executivo.',
    frases: [
      { texto: 'Uma cópia da base real de associados, com CPF e saldo, estava acessível pela internet num ambiente de testes do fornecedor. Precisa sair do ar imediatamente.', boa: true, retorno: 'Claro, com o que, onde e o que fazer.' },
      { texto: 'O cadeado do navegador está funcionando corretamente, portanto o app é seguro.', boa: false, retorno: 'O cadeado está certo; a conclusão, não. Foi o mito que o teste derrubou.' },
      { texto: 'A documentação técnica do app e as mensagens de erro revelam detalhes internos que facilitam ataques. As correções são de configuração.', boa: true, retorno: 'Bom: impacto e esforço numa frase.' },
      { texto: 'A CodeRápido é incompetente e deve ser substituída.', boa: false, retorno: 'Relatório aponta falhas e responsáveis pela correção, não julga fornecedor. Contrato é assunto da cooperativa.' },
      { texto: 'O SOC terceirizado detectou parte da atividade do teste, o que mostra monitoria funcionando, com pontos a melhorar.', boa: true, retorno: 'Isso. O conselho quer saber se o que pagam funciona.' },
      { texto: 'Foram encontradas vulnerabilidades de CWE-209, CWE-1004 e CWE-200 no endpoint /api/v1/cotacao.', boa: false, retorno: 'Correto e ilegível para o conselho. Isso vai na parte técnica.' },
      { texto: 'Recomendamos reteste após as correções da fornecedora, antes de considerar o caso encerrado.', boa: true, retorno: 'Isso. Fornecedor diz que corrigiu; reteste prova.' },
    ],
  },

  reuniao: [
    {
      id: 'pf-reu-kelly',
      de: 'kelly',
      situacao: 'Kelly: "A homologação é nossa, da CodeRápido. Não deveria nem estar nesse relatório, não era escopo."',
      alternativas: [
        { texto: '"O domínio é da cooperativa, a cláusula 3 inclui homologação, e os dados são dos associados. A cooperativa é a controladora; a CodeRápido opera os dados em nome dela."', certa: true, retorno: 'Isso. Contrato e LGPD (o operador trata dados conforme as instruções do controlador, art. 39), sem levantar a voz. A Marlene concorda com a cabeça.' },
        { texto: '"Você pediu para eu esconder isso, então vou contar para todo mundo."', certa: false, retorno: 'Expor a Kelly na reunião não ajuda a corrigir nada. A conversa está guardada, se for preciso.' },
        { texto: '"Tudo bem, tiro do relatório."', certa: false, retorno: 'É o achado mais grave do teste. Não sai.' },
      ],
    },
    {
      id: 'pf-reu-osvaldo',
      de: 'osvaldo',
      situacao: 'Seu Osvaldo: "Mas e o cadeado? A CodeRápido disse que era nível bancário!"',
      alternativas: [
        { texto: '"O cadeado está certo: protege o caminho dos dados. Os problemas que achamos estão no que o sistema expõe, e o cadeado não enxerga isso."', certa: true, retorno: 'Isso. O Seu Osvaldo anota "cadeado = caminho" no caderno.' },
        { texto: '"Nível bancário não existe."', certa: false, retorno: 'Verdade incômoda e inútil. Explique o que o cadeado faz e o que não faz.' },
        { texto: '"Então processa a CodeRápido."', certa: false, retorno: 'Conselho jurídico não é seu papel.' },
      ],
    },
    {
      id: 'pf-reu-marlene',
      de: 'marlene',
      situacao: 'Marlene: "A homologação estava pública. Isso é incidente de segurança com dado pessoal?"',
      alternativas: [
        { texto: '"Sim, comunique a ANPD hoje."', certa: false, retorno: 'A avaliação e a decisão são da controladora, com a encarregada. Seu papel é dar os fatos.' },
        { texto: '"Os fatos: base de produção exposta sem autenticação, 4.310 associados, desde pelo menos a data da cópia. Os logs da homologação dizem se houve acesso de terceiros. A avaliação de risco e a comunicação são decisão da cooperativa."', certa: true, retorno: 'Isso. Fatos, fonte para investigar e respeito ao papel de cada um.' },
        { texto: '"Não, porque só eu acessei."', certa: false, retorno: 'Você não sabe quem mais acessou. Só os logs dizem.' },
      ],
    },
    {
      id: 'pf-reu-soc',
      de: 'plantao',
      situacao: 'Analista do Plantão 24h, convidado pela Marlene: "Por que não avisaram o SOC? A gente perdeu tempo com o chamado."',
      alternativas: [
        { texto: '"O teste era não anunciado, por contrato, justamente para medir a detecção. O relatório mostra o que vocês detectaram e quando, e isso é ponto positivo."', certa: true, retorno: 'Isso. O SOC vira parceiro, não réu. O analista pede a lista de horários para calibrar alertas.' },
        { texto: '"Vocês demoraram, então o problema é de vocês."', certa: false, retorno: 'Hostilidade com o SOC não ajuda a cooperativa a melhorar a detecção.' },
        { texto: '"Foi falha nossa, da próxima vez avisamos."', certa: false, retorno: 'Não foi falha: estava no contrato. Pedir desculpas pelo método enfraquece o resultado.' },
      ],
    },
    {
      id: 'pf-reu-prazo',
      de: 'osvaldo',
      situacao: 'Seu Osvaldo: "Por onde a CodeRápido começa?"',
      alternativas: [
        { texto: '"Hoje: tirar a homologação da internet. Esta semana: documentação, mensagens de erro e cookie. No ciclo seguinte: atualizar o framework. Depois, reteste."', certa: true, retorno: 'Isso. Pelo risco, com prazo e verificação.' },
        { texto: '"Primeiro atualizar o framework, que é a base de tudo."', certa: false, retorno: 'Atualização leva semanas. A base de associados não pode esperar.' },
        { texto: '"A CodeRápido que decida."', certa: false, retorno: 'O fornecedor executa; a prioridade quem recomenda é o relatório, e quem decide é o cliente.' },
      ],
    },
  ],

  finais: [
    {
      minimo: 85,
      titulo: 'Relatório exemplar',
      texto: [
        'A Marlene levou o relatório ao conselho sem mudar uma vírgula. O Seu Osvaldo trocou o slide do "cadeado verde" por um sobre gestão de fornecedores.',
        'A CodeRápido tirou a homologação do ar na mesma noite. O Plantão 24h pediu os horários do teste para ajustar os alertas.',
        'Reteste agendado.',
      ],
    },
    {
      minimo: 60,
      titulo: 'Relatório entregue',
      texto: [
        'A Marlene devolveu com alguns ajustes de linguagem ("cliente regulado não pode ter frase ambígua"). Depois disso, aprovado.',
        'Reteste agendado.',
      ],
    },
    {
      minimo: 0,
      titulo: 'Relatório devolvido',
      texto: [
        'A Kelly usou cada imprecisão do relatório para dizer que nada era problema. A Marlene pediu uma nova versão. A Tânia pediu um café. Duplo.',
        'O reteste foi agendado mesmo assim: a base de associados não espera.',
      ],
    },
  ],
};
