// Ato 3 do Pinhão Forte: reteste das correções da CodeRápido.
import type { Ato } from '../../motor/tipos';
import { normalizar, temCpfCompleto } from '../../motor/evidencia';

export const ato3: Ato = {
  titulo: 'Ato 3: o reteste',
  modo: 'reteste',

  abertura: [
    {
      id: 'pf-a3-kelly',
      de: 'kelly',
      canal: 'whatsapp',
      texto: [
        'Oi! Corrigimos tudo 🎉',
        'Documentação fechada, erro tratado, cookie ajustado e a homologação agora está "anonimizada".',
        'Pode retestar, mas acho que nem precisa né? 😅',
      ],
    },
    {
      id: 'pf-a3-tania',
      de: 'tania',
      canal: 'whatsapp',
      texto: [
        'Precisa. "Anonimizada" entre aspas me deixou com uma pulga atrás da orelha.',
        'Refaz cada teste do relatório e compara com a evidência original. E com discrição: o SOC segue acordado.',
      ],
    },
  ],

  achados: [
    {
      id: 'pf-rt-docs',
      titulo: 'Reteste: documentação da API',
      objetivo: 'A documentação ainda está pública?',
      exemplo: 'GET /api/docs/openapi.json -> ...',
      status: 'corrigido',
      dicas: ['Peça a mesma URL da evidência original e olhe o código de resposta.', 'curl -sk -o /dev/null -w "%{http_code}\\n" <url> mostra só o código.'],
      severidade: 'media',
      porqueSeveridade: '',
      recomendacao: 'Corrigido: a documentação agora exige autenticação. Confirmar com a fábrica que a rota interna saiu da especificação de parceiros.',
      validar: async (t) => {
        const n = normalizar(t);
        if (!n.includes('openapi')) return { ok: false, motivo: 'Mostre a URL testada.' };
        if (!/\b401\b|autenticacao necessaria/.test(n)) return { ok: false, motivo: 'Mostre o que o servidor responde hoje.' };
        return { ok: true };
      },
    },
    {
      id: 'pf-rt-cookie',
      titulo: 'Reteste: cookie de sessão',
      objetivo: 'O cookie de sessão agora tem as três proteções recomendadas?',
      exemplo: 'Set-Cookie: ... (tem: ... | falta: ...)',
      status: 'parcial',
      dicas: ['Leia de novo o Set-Cookie com curl -skI.', 'Compare com a recomendação do relatório: eram três atributos e mais um cabeçalho.'],
      severidade: 'baixa',
      porqueSeveridade: '',
      recomendacao: 'Parcial: Secure e HttpOnly entraram; faltam SameSite no cookie e o cabeçalho Strict-Transport-Security.',
      validar: async (t) => {
        const n = normalizar(t);
        if (!n.includes('pfsessid')) return { ok: false, motivo: 'Cole o Set-Cookie de hoje.' };
        if (!n.includes('httponly') || !n.includes('secure')) return { ok: false, motivo: 'Esse é o cookie antigo? O de hoje mudou.' };
        if (!n.includes('samesite')) return { ok: false, motivo: 'Diga também o que ainda falta, pelo nome.' };
        return { ok: true };
      },
      aoRegistrar: {
        id: 'pf-r3-cookie',
        de: 'kelly',
        canal: 'whatsapp',
        texto: ['SameSite... era o terceiro né', 'anotado 📝'],
      },
    },
    {
      id: 'pf-rt-erro',
      titulo: 'Reteste: mensagem de erro',
      objetivo: 'A rota de cotação ainda vaza detalhes internos quando quebra?',
      exemplo: "GET /api/v1/cotacao?moeda=XYZ -> ...",
      status: 'corrigido',
      dicas: ['Repita exatamente a URL da evidência original.', 'Compare a resposta de hoje com a pilha de erro de antes.'],
      severidade: 'media',
      porqueSeveridade: '',
      recomendacao: 'Corrigido: resposta genérica, sem pilha nem nomes internos. A atualização do framework segue pendente no plano da fábrica.',
      validar: async (t) => {
        const n = normalizar(t);
        if (n.includes('db-core')) return { ok: false, motivo: 'Essa evidência ainda mostra o servidor interno. É a resposta antiga?' };
        if (!n.includes('moeda')) return { ok: false, motivo: 'Mostre a URL testada e a resposta de hoje.' };
        return { ok: true };
      },
    },
    {
      id: 'pf-rt-homolog',
      titulo: 'Reteste: homologação',
      objetivo: 'A homologação continua acessível? E os dados, ainda são de produção?',
      exemplo: '/status -> base: ..., amostra: ...',
      status: 'parcial',
      dicas: [
        'Acesse a mesma página /status de antes.',
        'Olhe dois campos separadamente: a amostra e a origem da base.',
        'Mascarar a amostra exibida não muda o que está guardado no banco da homologação.',
      ],
      severidade: 'alta',
      porqueSeveridade: '',
      recomendacao: 'Parcial: a página agora mascara a amostra, mas a homologação segue pública e a base continua sendo cópia de produção. Pendências: tirar da internet e trocar por dados sintéticos.',
      validar: async (t) => {
        if (temCpfCompleto(t)) return { ok: false, lgpd: true, motivo: 'CPF inteiro na evidência, de novo. Mascare.' };
        const n = normalizar(t);
        if (!n.includes('producao')) return { ok: false, motivo: 'Mostre a origem da base que a página declara hoje.' };
        if (!/\*\*\*/.test(t)) return { ok: false, motivo: 'Mostre como a amostra aparece hoje.' };
        return { ok: true };
      },
      aoRegistrar: {
        id: 'pf-r3-homolog',
        de: 'marlene',
        canal: 'email',
        assunto: 'Homologação: correção insuficiente',
        texto: [
          'Prezados,',
          'Entendi: mascarar a tela não anonimiza a base. A CodeRápido tem até sexta para retirar o ambiente da internet e substituir os dados por sintéticos.',
          'Formalizei a exigência no contrato de operação de dados com a fornecedora.',
          'Marlene Wisniewski',
        ],
      },
    },
  ],

  reacoes: [
    {
      id: 'pf-r3-kelly-homolog',
      quando: (e) => e.tipo === 'http' && e.host === 'homolog',
      mensagem: { id: 'pf-r3-kelly-homolog', de: 'kelly', canal: 'whatsapp', texto: ['viu que agora a amostra tem asterisco? 😊'] },
    },
  ],

  conclusao: [
    {
      id: 'pf-fim-ato3-tania',
      de: 'tania',
      canal: 'whatsapp',
      texto: [
        'Reteste fechado: documentação e erro corrigidos; cookie e homologação pela metade.',
        'O "anonimizado" da Kelly era maquiagem na vitrine. Bom olho.',
        'Cliente intermediário entregue. O próximo nível é a prefeitura. Dizem que tem Active Directory de 2009. 🖤',
      ],
    },
    {
      id: 'pf-fim-ato3-osvaldo',
      de: 'osvaldo',
      canal: 'whatsapp',
      texto: [
        'O conselho aprovou contratar teste todo ano. A Marlene ganhou de novo.',
        'Mandei fazer pinhão na chapa pra equipe da Pente Fino. Passa aqui.',
      ],
    },
  ],
};
