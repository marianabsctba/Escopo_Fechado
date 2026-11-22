// Ato 1 do Pinhão Forte: reconhecimento discreto, com SOC acordado.
import type { Ato } from '../../motor/tipos';
import { normalizar, temCpfCompleto } from '../../motor/evidencia';

/** Saldo ou valor monetário que não deveria ir para evidência. */
function temSaldo(t: string): boolean {
  return /saldo"?\s*:\s*\d/i.test(t) || /\b\d{3,}\.\d{2}\b/.test(t);
}

export const ato1: Ato = {
  titulo: 'Ato 1: reconhecimento discreto',

  achados: [
    {
      id: 'pf-mapa',
      titulo: 'Mapa do escopo e o ambiente escondido',
      objetivo: 'Quais máquinas e portas existem na faixa 192.0.2.32/28? E qual nome a homologação usa, se ela não está no DNS?',
      exemplo: '192.0.2.X: portas ... | homologação: nome ...',
      dicas: [
        'Varra só as portas web comuns (80, 443, 8080, 8443) com -sT. Pouco barulho, resposta rápida.',
        'Um dos servidores responde numa porta alta com TLS, mas sem nome no DNS. Certificados guardam nomes: leia os nomes alternativos (SAN) do certificado do site.',
        'echo | openssl s_client -connect 192.0.2.34:443 2>/dev/null | openssl x509 -noout -ext subjectAltName',
      ],
      severidade: 'informativa',
      porqueSeveridade: 'Inventário e nomes não são falha por si. Mas um ambiente de homologação publicado na internet é o tipo de coisa que todo mundo esquece.',
      recomendacao: 'Inventário de tudo que está publicado, inclusive homologação, e certificados separados por ambiente para não anunciar nomes internos.',
      validar: async (t) => {
        const n = normalizar(t);
        const falta: string[] = [];
        for (const ip of ['192.0.2.34', '192.0.2.36', '192.0.2.40']) if (!n.includes(ip)) falta.push(ip);
        if (!n.includes('8443')) falta.push('a porta da homologação');
        if (!n.includes('homolog-app.pinhaoforte.exemplo')) falta.push('o nome da homologação');
        return falta.length ? { ok: false, motivo: `Ainda falta: ${falta.join(', ')}.` } : { ok: true };
      },
      aoRegistrar: {
        id: 'pf-r-mapa',
        de: 'tania',
        canal: 'whatsapp',
        texto: ['Certificado entregando a homologação: clássico. E você descobriu sem mandar uma requisição sequer para ela. Isso é reconhecimento com classe.'],
      },
    },
    {
      id: 'pf-docs',
      titulo: 'Documentação da API publicada',
      objetivo: 'O app publica a documentação da API. Que rota marcada como interna ela revela?',
      exemplo: 'URL da documentação + rota interna',
      dicas: [
        'A página de login do app cita a documentação para parceiros. Abra com curl -sk.',
        "OpenAPI é JSON: jq -r '.paths | keys[]' lista as rotas.",
        'Procure a rota com x-interno. Não tente usar a rota: o achado é ela estar documentada em público.',
      ],
      severidade: 'media',
      porqueSeveridade: 'Mapa completo da API para qualquer um, incluindo rota interna de exportação e o endereço da homologação. Não dá acesso sozinho, mas encurta muito o caminho de quem ataca.',
      recomendacao: 'Tirar a documentação do ar público (ou exigir autenticação), separar a documentação de parceiros da interna e remover rotas internas da especificação publicada.',
      validar: async (t) => {
        const n = normalizar(t);
        if (!n.includes('exportar-associados')) return { ok: false, motivo: 'Falta a rota interna que a documentação expõe.' };
        if (!n.includes('openapi')) return { ok: false, motivo: 'Inclua onde a documentação está publicada.' };
        return { ok: true };
      },
      aoRegistrar: {
        id: 'pf-r-docs',
        de: 'kelly',
        canal: 'whatsapp',
        texto: ['ah, a documentação é pros parceiros', 'mas a rota interna não era pra estar lá não 😬', 'e ela pede token, então tá seguro né?'],
      },
    },
    {
      id: 'pf-cookie',
      titulo: 'Cookie de sessão sem proteções',
      objetivo: 'Como o app entrega o cookie de sessão? Que proteções faltam nele e nos cabeçalhos?',
      exemplo: 'Set-Cookie: ... (faltam: ...) | cabeçalhos ausentes: ...',
      dicas: [
        'curl -skI mostra só os cabeçalhos da resposta.',
        'Um cookie de sessão bem configurado tem Secure (só via HTTPS), HttpOnly (fora do alcance de JavaScript) e SameSite.',
        'Procure também o Strict-Transport-Security (HSTS), que obriga o navegador a usar HTTPS.',
      ],
      severidade: 'baixa',
      porqueSeveridade: 'Sozinho não invade nada, mas facilita roubo de sessão se outra falha aparecer (um script injetado, uma rede hostil).',
      recomendacao: 'Marcar o cookie de sessão com Secure, HttpOnly e SameSite=Lax (ou Strict), e enviar Strict-Transport-Security em todas as respostas.',
      validar: async (t) => {
        const n = normalizar(t);
        if (!n.includes('pfsessid')) return { ok: false, motivo: 'Cole a linha do Set-Cookie como o servidor envia.' };
        if (!n.includes('httponly') || !n.includes('secure')) return { ok: false, motivo: 'Diga quais proteções faltam no cookie (os nomes delas).' };
        return { ok: true };
      },
    },
    {
      id: 'pf-erro',
      titulo: 'Erro verboso entrega a infraestrutura',
      objetivo: 'Uma rota pública da API quebra com entrada inesperada. O que a mensagem de erro revela?',
      exemplo: 'URL que gera o erro + o que vazou',
      dicas: [
        'A rota de cotação aceita um parâmetro moeda. O que acontece com uma moeda que não existe?',
        "curl -sk 'https://app.pinhaoforte.exemplo/api/v1/cotacao?moeda=XYZ'",
        'Leia a pilha de erro com calma: caminho no servidor, versões e um nome de servidor interno.',
      ],
      severidade: 'media',
      porqueSeveridade: 'Vaza nome do banco de dados interno, usuário da aplicação, caminhos e versões antigas. Informação que vira próximo passo para um atacante.',
      recomendacao: 'Tratar erros e responder mensagem genérica ao cliente, guardando o detalhe só no log interno. Atualizar Node.js e Express, que estão fora de suporte.',
      validar: async (t) => (normalizar(t).includes('db-core.pinhao.interno') ? { ok: true } : { ok: false, motivo: 'Falta o nome do servidor interno que aparece no erro.' }),
    },
    {
      id: 'pf-homolog',
      titulo: 'Homologação pública com dados de produção',
      objetivo: 'O que a homologação expõe sobre os associados? Registre a origem dos dados, o total e um exemplo mascarado, sem saldo.',
      exemplo: 'URL, base: ..., N associados. Exemplo: Nome S., CPF 123.***.***-45',
      dicas: [
        'A homologação não está no DNS. Use o IP ou curl --resolve com o nome do certificado.',
        'A página /status responde JSON. Use jq para ler só os campos de que precisa (.base, .associados).',
        'Mascare o CPF e deixe o saldo de fora: cláusula 7.',
      ],
      severidade: 'alta',
      porqueSeveridade: 'Cópia da base real de associados, com CPF e saldo, aberta na internet, num ambiente que normalmente tem menos controle que produção.',
      recomendacao: 'Tirar a homologação da internet (VPN ou lista de IPs), usar dados sintéticos ou anonimizados em homologação e avaliar com a encarregada se houve incidente com dado pessoal.',
      validar: async (t) => {
        if (temCpfCompleto(t)) return { ok: false, lgpd: true, motivo: 'Tem CPF inteiro na evidência. Mascare: 123.***.***-45.' };
        if (temSaldo(t)) return { ok: false, lgpd: true, motivo: 'Saldo de associado não vai para evidência (cláusula 7). Tire o valor.' };
        const n = normalizar(t);
        if (!n.includes('producao')) return { ok: false, motivo: 'Diga de onde vêm os dados (a página informa).' };
        if (!/\b4\.?310\b/.test(n)) return { ok: false, motivo: 'Falta o total de associados na base.' };
        if (!/\d{3}\.\*{3}\.\*{3}-\d{2}/.test(t)) return { ok: false, motivo: 'Falta um exemplo com CPF mascarado.' };
        return { ok: true };
      },
      aoRegistrar: {
        id: 'pf-r-homolog',
        de: 'marlene',
        canal: 'email',
        assunto: 'Dados de associados em homologação',
        texto: [
          'Prezados,',
          'Recebi o aviso preliminar. Base de produção em homologação pública é exatamente o que não pode acontecer.',
          'Acionei a CodeRápido para retirar o ambiente da internet e iniciei a avaliação do caso. Obrigada pela evidência mascarada e sem saldos.',
          'Marlene Wisniewski',
        ],
      },
    },
    {
      id: 'pf-versao',
      titulo: 'Componentes fora de suporte anunciados',
      objetivo: 'Bônus: que versão de framework o app anuncia em todas as respostas?',
      exemplo: 'Cabeçalho ... : ...',
      bonus: true,
      dicas: ['Olhe de novo os cabeçalhos da resposta do app.', 'Um deles diz com o que o app foi feito, e a versão.'],
      severidade: 'baixa',
      porqueSeveridade: 'Anunciar a versão facilita achar falhas conhecidas. O problema maior é a versão ser antiga.',
      recomendacao: 'Remover o cabeçalho X-Powered-By e atualizar Express e Node.js para versões com suporte.',
      validar: async (t) => (/express\s*4\.16/.test(normalizar(t)) ? { ok: true } : { ok: false, motivo: 'Falta o framework e a versão.' }),
    },
  ],

  reacoes: [
    {
      id: 'pf-osvaldo-noite',
      quando: (e) => e.tipo === 'http' && e.host === 'app',
      mensagem: { id: 'pf-osvaldo-noite', de: 'osvaldo', canal: 'whatsapp', texto: ['A Marlene disse que o teste começou. Já viu o cadeado verde? 🔒😄'] },
    },
    {
      id: 'pf-kelly-homolog',
      quando: (e) => e.tipo === 'http' && e.host === 'homolog',
      mensagem: { id: 'pf-kelly-homolog', de: 'kelly', canal: 'whatsapp', texto: ['oi, apareceu acesso na homolog agora', 'como vc achou ela? nem tem DNS 😳'] },
    },
  ],

  conclusao: [
    {
      id: 'pf-fim-ato1',
      de: 'tania',
      canal: 'whatsapp',
      texto: [
        'Reconhecimento fechado. Homologação com dado real, documentação aberta, erro falador e cookie pelado.',
        'Agora o relatório. Esse cliente é regulado e tem fornecedor no meio: cada palavra vai ser lida por três pessoas com interesses diferentes.',
      ],
    },
  ],
};
