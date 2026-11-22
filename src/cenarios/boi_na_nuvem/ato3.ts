// Ato 3: o reteste. O Jefferson jura que corrigiu tudo. A pentester refaz os
// testes do relatório e prova, achado por achado, o que mudou de verdade.
import type { Ato } from '../../motor/tipos';
import { normalizar, temCpfCompleto } from '../../motor/evidencia';

/** SHA-256 da planilha do backup (o mesmo arquivo do Ato 1). */
const HASH_PLANILHA = 'eccc0182d39229088f65404d3aa693f5225b9bb2ed359bca8aa33e9ce8e19cff';

export const ato3: Ato = {
  titulo: 'Ato 3: o reteste',
  modo: 'reteste',

  abertura: [
    {
      id: 'a3-jefferson',
      de: 'jefferson',
      canal: 'whatsapp',
      texto: [
        'corrigi TUDO 😎',
        'bloqueei o .git, bloqueei a pasta do backup, tirei do robots e limpei a foto da Neide',
        'pode testar, agora sim tá inhackeável',
      ],
    },
    {
      id: 'a3-tania',
      de: 'tania',
      canal: 'whatsapp',
      texto: [
        'Reteste: refaz os testes do relatório, do mesmo jeito, e compara com a evidência original.',
        'Corrigido é o que você prova, não o que o Jefferson diz. E teste o caminho exato da evidência, não só a pasta.',
        'Mesmo escopo, mesma janela, mesmas regras. 💅',
      ],
    },
  ],

  achados: [
    {
      id: 'rt-git',
      titulo: 'Reteste: repositório .git',
      objetivo: 'O .git ainda pode ser baixado? Mostre a evidência do que responde hoje.',
      exemplo: 'GET /.git/ -> ... | GET /.git/HEAD -> ...',
      status: 'nao',
      dicas: [
        'Teste a pasta: curl -s -o /dev/null -w "%{http_code}\\n" http://www.boinanuvem.exemplo/.git/',
        'Bloquear a listagem não é bloquear os arquivos. Peça um arquivo que todo repositório tem: /.git/HEAD ou /.git/config.',
        'Se o HEAD responde, quem souber o caminho dos objetos baixa o histórico um por um. A senha antiga continua lá.',
      ],
      severidade: 'alta',
      porqueSeveridade: '',
      recomendacao: 'Bloquear tudo que começa com /.git (regra por prefixo, não pelo caminho exato) e conferir pedindo um arquivo interno, como /.git/HEAD. E confirmar que a senha do banco foi trocada, porque ela já vazou.',
      validar: async (t) => {
        const n = normalizar(t);
        if (n.includes('ref: refs/heads/main') || n.includes('repositoryformatversion')) return { ok: true };
        return { ok: false, motivo: 'Mostre o que um arquivo de dentro do .git responde hoje (o conteúdo do HEAD ou do config).' };
      },
      aoRegistrar: {
        id: 'r3-git',
        de: 'jefferson',
        canal: 'whatsapp',
        texto: ['mas tá dando 403!!! eu testei no navegador', 'ah. eu testei só a pasta né', '😶'],
      },
    },
    {
      id: 'rt-backup',
      titulo: 'Reteste: planilha de clientes',
      objetivo: 'A planilha do Ato 1 ainda está acessível? Prove que é (ou não é) o mesmo arquivo.',
      exemplo: 'GET /backup-antigo/ -> ... | GET /backup-antigo/clientes_export_2021.csv -> ... | sha256: ...',
      status: 'nao',
      dicas: [
        'A pasta pode ter sido fechada. Teste a URL exata do arquivo, que está na evidência do Ato 1.',
        'Use curl -s -o /tmp/arquivo -w "%{http_code}\\n" <url> para ver o código de resposta sem jogar a planilha na tela.',
        'Para provar que é o mesmo arquivo, compare o sha256sum com o hash que você registrou no relatório.',
      ],
      severidade: 'alta',
      porqueSeveridade: '',
      recomendacao: 'Remover o arquivo do servidor (não basta esconder a listagem), apagar cópias em outras pastas e checar nos logs se houve download desde o relatório. Isso volta para a Dra. Patrícia como atualização do incidente.',
      validar: async (t) => {
        if (temCpfCompleto(t)) return { ok: false, lgpd: true, motivo: 'De novo um CPF inteiro na evidência. No reteste também vale prova mínima.' };
        if (!t.toLowerCase().includes(HASH_PLANILHA)) {
          return { ok: false, motivo: 'Falta provar que é o mesmo arquivo: cole o SHA-256 do arquivo baixado hoje.' };
        }
        return { ok: true };
      },
      aoRegistrar: {
        id: 'r3-backup',
        de: 'patricia',
        canal: 'email',
        assunto: 'RE: URGENTE: planilha de clientes',
        texto: [
          'Prezada,',
          'Recebi a informação de que a planilha continua acessível pelo endereço direto, com o mesmo conteúdo. Isso altera a avaliação do incidente.',
          'Solicitei a remoção imediata do arquivo e os registros de acesso do servidor desde a entrega do relatório.',
          'Dra. Patrícia Albuquerque',
        ],
      },
    },
    {
      id: 'rt-robots',
      titulo: 'Reteste: robots.txt',
      objetivo: 'O robots.txt ainda entrega o caminho do backup?',
      exemplo: 'Conteúdo atual do robots.txt: ...',
      status: 'corrigido',
      dicas: [
        'curl http://www.boinanuvem.exemplo/robots.txt e compare com a evidência do Ato 1.',
        'O que saiu? O que ficou? Leia os comentários também.',
      ],
      severidade: 'baixa',
      porqueSeveridade: '',
      recomendacao: 'Corrigido. Mas o robots.txt nunca foi a proteção: o que importa é o arquivo ter saído do servidor, e ele não saiu.',
      validar: async (t) => {
        const n = normalizar(t);
        if (!n.includes('admin-jefferson')) return { ok: false, motivo: 'Cole o conteúdo atual do robots.txt.' };
        if (/disallow:\s*\/backup-antigo/.test(n)) return { ok: false, motivo: 'Esse é o robots.txt antigo. Busque de novo o arquivo de hoje.' };
        return { ok: true };
      },
    },
    {
      id: 'rt-foto',
      titulo: 'Reteste: metadados da foto',
      objetivo: 'A foto da festa ainda carrega a credencial nos metadados?',
      exemplo: 'file ... | strings ... | grep -i senha -> ...',
      status: 'corrigido',
      dicas: [
        'Baixe de novo img/festa-neide.png e confira com file.',
        'Repita o strings com grep -i senha. Nenhuma linha também é resultado: anote que a busca voltou vazia (grep -c mostra 0).',
      ],
      severidade: 'media',
      porqueSeveridade: '',
      recomendacao: 'Corrigido: a imagem foi republicada sem metadados. Falta confirmar com a Dona Neide que a senha antiga foi trocada, porque ela ficou meses publicada.',
      validar: async (t) => {
        const n = normalizar(t);
        if (n.includes('boi@1994')) return { ok: false, motivo: 'Essa evidência ainda mostra a senha. É da foto antiga? Baixe a imagem de hoje.' };
        if (!n.includes('png')) return { ok: false, motivo: 'Mostre a conferência da imagem de hoje (a saída do file e da busca nos textos).' };
        return { ok: true };
      },
      aoRegistrar: {
        id: 'r3-foto',
        de: 'neide',
        canal: 'whatsapp',
        texto: ['O Jefferson disse que a foto agora está "limpa". Eu também troquei a senha.', 'Agora ela está num aplicativo que o rapaz do banco me ensinou. Com digital e tudo.'],
      },
    },
  ],

  reacoes: [
    {
      id: 'r3-jeff-head',
      quando: (e) => e.tipo === 'http' && e.host === 'www' && /^\/\.git\/.+/.test(e.caminho),
      mensagem: {
        id: 'r3-jeff-head',
        de: 'jefferson',
        canal: 'whatsapp',
        texto: ['ué', 'apareceu acesso no .git/HEAD com 200 no log', 'mas eu bloqueei o .git 🤔'],
      },
    },
    {
      id: 'r3-dirceu',
      quando: (e) => e.tipo === 'http' && e.host === 'www' && e.caminho.includes('clientes_export_2021.csv'),
      mensagem: {
        id: 'r3-dirceu',
        de: 'dirceu',
        canal: 'whatsapp',
        texto: ['O Jefferson ficou branco aqui do meu lado. Isso é bom ou ruim?'],
      },
    },
  ],

  conclusao: [
    {
      id: 'fim-ato3-tania',
      de: 'tania',
      canal: 'whatsapp',
      texto: [
        'Reteste fechado: robots e foto corrigidos; .git e planilha continuam expostos pelo caminho direto.',
        'Esse é o erro mais comum de correção: fechar a vitrine e deixar a porta dos fundos aberta. Por isso reteste existe.',
        'Relatório de reteste vai hoje, com prazo de 48h para as pendências e um segundo reteste agendado. Trabalho bonito. 🖤',
      ],
    },
    {
      id: 'fim-ato3-dirceu',
      de: 'dirceu',
      canal: 'whatsapp',
      texto: [
        'Ô, você não sabe o tanto que eu aprendi essa semana.',
        'O Jefferson vai fazer o curso. E a Neide comprou um cofre. Não sei pra quê, mas comprou.',
        'Ano que vem quero de novo. 🐂☁️',
      ],
    },
  ],
};
