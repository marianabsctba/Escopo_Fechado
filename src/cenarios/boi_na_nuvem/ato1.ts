// Ato 1: reconhecimento. Descobrir o que o Boi na Nuvem expõe na internet
// e registrar cada achado com evidência, sem sair do escopo e sem vazar dado.
import type { Ato } from '../../motor/tipos';
import { contemSegredo, normalizar, temCpfCompleto } from '../../motor/evidencia';

const SENHA_BANCO = '809538e51c8cfe2a5b194504e49071adf43ef48fec51f1606b00afbbce69d938';
const SENHA_POSTIT = '5e3b267ec5eba4bcbac8775138513b7693231e28f144dcea6d017806d3b0059b';

export const ato1: Ato = {
  titulo: 'Ato 1: reconhecimento',

  achados: [
    {
      id: 'mapa',
      titulo: 'Mapa do escopo',
      objetivo: 'Quais máquinas estão ativas na faixa 203.0.113.0/28 e quais portas cada uma tem abertas?',
      exemplo: '203.0.113.X: portas ... | 203.0.113.Y: portas ...',
      dicas: [
        'O nmap descobre máquinas e portas. Comece pela faixa inteira do contrato: nmap 203.0.113.0/28',
        'Sem root, o nmap usa o "connect scan" (-sT): ele completa a conexão TCP em cada porta. É mais barulhento que o SYN scan, mas funciona.',
        'Achou poucas portas? Por padrão o nmap só olha as 1.000 mais comuns. Serviços em portas como 8080 aparecem nessa lista, mas confira a saída com calma.',
      ],
      severidade: 'informativa',
      porqueSeveridade: 'Mapear serviços não é falha por si só: é o inventário que guia o resto do teste.',
      recomendacao: 'Manter inventário dos serviços expostos e fechar no firewall tudo que não precisa estar na internet.',
      validar: async (t) => {
        const n = normalizar(t);
        const faltam: string[] = [];
        if (!n.includes('203.0.113.10')) faltam.push('uma máquina');
        if (!n.includes('203.0.113.12')) faltam.push('outra máquina');
        if (!/\b8080\b/.test(n)) faltam.push('uma porta alta');
        if (!/\b22\b/.test(n) || !/\b80\b/.test(n)) faltam.push('portas do servidor do site');
        if (faltam.length) return { ok: false, motivo: `Ainda falta: ${faltam.join(', ')}.` };
        return { ok: true };
      },
      aoRegistrar: {
        id: 'r-mapa',
        de: 'tania',
        canal: 'whatsapp',
        texto: ['Dois servidores: o site e um sistema na 8080. Esse da 8080 tem cara de sistema de pedidos. Guarda pra depois, primeiro termina o reconhecimento.'],
      },
    },
    {
      id: 'robots',
      titulo: 'robots.txt entrega caminhos escondidos',
      objetivo: 'Quais caminhos o site pede para o Google não indexar?',
      exemplo: '/algum-caminho/ e /outro/',
      dicas: [
        'Todo site pode ter um arquivo /robots.txt com instruções para buscadores. Ele é público.',
        'curl http://www.boinanuvem.exemplo/robots.txt',
        'Leia também os comentários do arquivo. Às vezes o comentário é o achado.',
      ],
      severidade: 'baixa',
      porqueSeveridade: 'O robots.txt não protege nada: ele é um mapa do que o dono queria esconder. O risco depende do que tem nesses caminhos.',
      recomendacao: 'Nunca usar o robots.txt para "esconder" área sensível. Área restrita precisa de autenticação, e backup não fica em pasta pública.',
      validar: async (t) => (/backup-antigo/.test(normalizar(t)) ? { ok: true } : { ok: false, motivo: 'Tem um caminho com cara de backup no arquivo. Ele precisa estar na evidência.' }),
    },
    {
      id: 'git',
      titulo: 'Repositório .git exposto com senha no histórico',
      objetivo: 'O código do site está publicado junto com o histórico do git. Qual senha aparece no histórico?',
      exemplo: 'Commit "...", arquivo config.php, senha: ...',
      dicas: [
        'O robots.txt tem um comentário sobre o .git. Teste se http://www.boinanuvem.exemplo/.git/ responde.',
        'Baixe a pasta inteira para as suas evidências: cd ~/evidencias && wget -r -np -nH -R "index.html*" http://www.boinanuvem.exemplo/.git/',
        'Com a pasta .git baixada, o histórico é seu: git log mostra os commits e git log -p mostra o que mudou em cada um. Procure o commit em que o Jefferson "tirou a senha".',
      ],
      severidade: 'alta',
      porqueSeveridade: 'Apagar um arquivo num commit novo não apaga do histórico. Qualquer pessoa na internet baixa o .git e lê a credencial do banco.',
      recomendacao: 'Bloquear /.git no servidor web, trocar a senha exposta imediatamente e tirar segredos do código (variáveis de ambiente ou cofre de segredos). Reescrever o histórico não basta: a senha já vazou.',
      validar: async (t) =>
        (await contemSegredo(t, SENHA_BANCO))
          ? { ok: true }
          : { ok: false, motivo: 'A senha certa não está na evidência. Ela aparece no git log -p, no arquivo que foi apagado depois.' },
      aoRegistrar: {
        id: 'r-git',
        de: 'jefferson',
        canal: 'whatsapp',
        texto: ['pera', 'como vc achou o .git??? isso nem tem link no site', 'mas eu apaguei a senha!! tem o commit falando que apaguei 😰'],
      },
    },
    {
      id: 'backup',
      titulo: 'Backup público com dados pessoais',
      objetivo: 'Tem uma planilha de clientes num diretório público. Registre o nome do arquivo, quantos registros ela tem e um exemplo de linha mascarado.',
      exemplo: 'arquivo X.csv, N registros. Exemplo: Fulano S., CPF 123.***.***-45',
      dicas: [
        'Volte ao robots.txt: um dos caminhos tem cara de backup. Abra a pasta com o curl.',
        'Baixe o arquivo e conte as linhas com wc -l, sem abrir tudo. Lembre que a primeira linha é o cabeçalho.',
        'Para o exemplo, head -n 2 basta. Mascare o CPF antes de colar: só os 3 primeiros e os 2 últimos dígitos ficam visíveis.',
      ],
      severidade: 'alta',
      porqueSeveridade: 'Tecnicamente é alta (vaza confidencialidade, sem login, pela internet). A urgência vem da LGPD: dado pessoal de mais de mil clientes aberto é incidente de segurança, e a avaliação de comunicação à ANPD e aos titulares (art. 48) começa hoje.',
      recomendacao: 'Tirar o arquivo do ar já, verificar nos logs quem acessou, avaliar com o encarregado (DPO) a comunicação do incidente e apagar backups de pastas públicas.',
      validar: async (t) => {
        if (temCpfCompleto(t)) {
          return { ok: false, lgpd: true, motivo: 'Sua evidência tem um CPF inteiro. Prova mínima é mascarada: 123.***.***-45. Apague e registre de novo.' };
        }
        const n = normalizar(t);
        if (!n.includes('clientes_export_2021.csv')) return { ok: false, motivo: 'Falta o nome exato do arquivo.' };
        if (!/\b1\.?28[45]\b/.test(n)) return { ok: false, motivo: 'Falta a quantidade de registros (conte as linhas e desconte o cabeçalho).' };
        if (!/\d{3}\.\*{3}\.\*{3}-\d{2}/.test(t)) return { ok: false, motivo: 'Falta um exemplo de linha com CPF mascarado (formato 123.***.***-45).' };
        return { ok: true };
      },
      aoRegistrar: {
        id: 'r-backup',
        de: 'patricia',
        canal: 'email',
        assunto: 'URGENTE: planilha de clientes',
        texto: [
          'Prezados,',
          'Recebi seu aviso preliminar sobre a planilha de clientes em pasta pública. Obrigada por comunicar de imediato e por enviar a evidência mascarada.',
          'O arquivo será retirado do ar hoje e iniciaremos a avaliação do incidente com base na LGPD. O Jefferson foi informado. Ele não está bem.',
          'Dra. Patrícia Albuquerque',
        ],
      },
    },
    {
      id: 'foto',
      titulo: 'Senha nos metadados de uma foto',
      objetivo: 'Bônus: a página da equipe tem uma foto da festa da Dona Neide. O que a foto revela?',
      exemplo: 'img/..., metadado ..., credencial ...',
      bonus: true,
      dicas: [
        'Arquivos de imagem carregam metadados: autor, programa, descrição... Baixe a foto da página equipe.html.',
        'O comando strings mostra os trechos de texto legível dentro de qualquer arquivo. Combine com grep -i.',
        'Procure por palavras como senha, usuario ou description.',
      ],
      severidade: 'media',
      porqueSeveridade: 'Uma credencial de funcionária publicada no site. Só não é alta porque ainda não sabemos o que ela abre.',
      recomendacao: 'Trocar a senha, revisar fotos publicadas (inclusive o que aparece ao fundo) e limpar metadados antes de publicar. E post-it no monitor, nunca mais.',
      validar: async (t) =>
        (await contemSegredo(t, SENHA_POSTIT)) ? { ok: true } : { ok: false, motivo: 'A credencial da foto não está na evidência.' },
      aoRegistrar: {
        id: 'r-foto',
        de: 'neide',
        canal: 'whatsapp',
        texto: ['Boa noite. O Jefferson disse que a senha do meu post-it apareceu na internet.', 'Eu sabia que não devia ter deixado ele tirar foto da festa.', 'Vou trocar. Vou anotar a nova num caderno, que é mais seguro.'],
      },
    },
  ],

  reacoes: [
    {
      id: 'jeff-nmap',
      quando: (e) => e.tipo === 'cmd' && /^\s*(sudo\s+)?nmap\b/.test(e.comando) && /203\.0\.113\./.test(e.comando),
      mensagem: {
        id: 'jeff-nmap',
        de: 'jefferson',
        canal: 'whatsapp',
        texto: ['o firewall apitou aqui agora!!', 'ah nao pera, era o antivirus do pc da Neide pedindo atualização', 'pode continuar'],
      },
    },
    {
      id: 'jeff-log',
      quando: (e) => e.tipo === 'http' && e.host === 'www',
      mensagem: {
        id: 'jeff-log',
        de: 'jefferson',
        canal: 'whatsapp',
        texto: ['apareceu uns acesso estranho no log do site agora, é vc né? kkk', 'relaxa q o site é só html, nao tem nada pra achar'],
      },
    },
    {
      id: 'dirceu-noite',
      quando: (e) => e.tipo === 'http' && e.host === 'pedidos',
      mensagem: {
        id: 'dirceu-noite',
        de: 'dirceu',
        canal: 'whatsapp',
        texto: ['E aí, já invadiu? 😄', 'O Jefferson tá aqui do lado roendo a unha.'],
      },
    },
  ],

  conclusao: [
    {
      id: 'fim-ato1-tania',
      de: 'tania',
      canal: 'whatsapp',
      texto: [
        'Reconhecimento fechado, e sem encostar em nada fora do contrato. Assim que se faz.',
        'Resumo pro relatório: código e histórico do site expostos, senha do banco no git, planilha de clientes aberta e o mapa dos dois servidores.',
        'Próxima noite: o sistema de pedidos na 8080. O Jefferson jura que esse é seguro. 🍿',
      ],
    },
  ],
};
