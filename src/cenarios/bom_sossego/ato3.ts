// Ato 3 do Bom Sossego: reteste das correções do Clodoaldo.
import type { Ato } from '../../motor/tipos';
import { contemSegredo, normalizar, temCpfCompleto } from '../../motor/evidencia';

const SENHA_FINANCAS = '1a34b24986529317c57fa33cda939dc50ed6b5f65a5fc5162661bb4b52453609';

export const ato3: Ato = {
  titulo: 'Ato 3: o reteste',
  modo: 'reteste',

  abertura: [
    {
      id: 'bs-a3-clodoaldo',
      de: 'clodoaldo',
      canal: 'whatsapp',
      texto: [
        'Corrigi tudo, viu. Trabalhei o feriado inteiro.',
        'Diretório fechado, senha do estagiário trocada, script limpo, planilha guardada e o SMB agora "exige assinatura".',
      ],
    },
    {
      id: 'bs-a3-tania',
      de: 'tania',
      canal: 'whatsapp',
      texto: [
        '"Planilha guardada" e "script limpo". Guardada onde? Limpo como?',
        'Reteste item por item. E lembra: agora o diretório pede login, então a sua consulta precisa usar a conta de teste.',
      ],
    },
  ],

  achados: [
    {
      id: 'bs-rt-anonimo',
      titulo: 'Reteste: consulta anônima ao diretório',
      objetivo: 'O diretório ainda responde a quem não se identifica?',
      exemplo: 'consulta sem -D/-w -> ...',
      status: 'corrigido',
      dicas: ['Repita a consulta de usuários sem credenciais e conte o resultado.'],
      severidade: 'media',
      porqueSeveridade: '',
      recomendacao: 'Corrigido: a consulta anônima não devolve mais nenhuma conta. Confirmar que a impressora do protocolo ganhou conta de serviço própria.',
      validar: async (t) => {
        const n = normalizar(t);
        if (!/anonim|-x|sem login|sem autentica|sem credencia/.test(n)) return { ok: false, motivo: 'Deixe claro que a consulta foi sem credenciais.' };
        if (!/\b0\b|no such object|insufficient|nenhum/.test(n)) return { ok: false, motivo: 'Mostre o que a consulta anônima devolve hoje.' };
        return { ok: true };
      },
    },
    {
      id: 'bs-rt-descricao',
      titulo: 'Reteste: senha da conta do estagiário',
      objetivo: 'A descrição foi limpa? E a senha foi trocada de fato?',
      exemplo: 'description: ..., pwdLastSet: ...',
      status: 'corrigido',
      dicas: [
        "Agora é preciso autenticar: -D 'cn=Servidor Teste,ou=Usuarios,dc=bomsossego,dc=exemplo' -w '<senha do contrato>'.",
        'Limpar a descrição não prova troca de senha. O pwdLastSet prova.',
      ],
      severidade: 'critica',
      porqueSeveridade: '',
      recomendacao: 'Corrigido: descrição limpa e senha trocada (pwdLastSet atualizado). Pendente no plano: tirar a conta de Domain Admins.',
      validar: async (t) => {
        const n = normalizar(t);
        if (n.includes('sossego@2024')) return { ok: false, motivo: 'Essa evidência ainda mostra a senha antiga. É a consulta de antes?' };
        if (!n.includes('2026-11-21')) return { ok: false, motivo: 'Mostre a data da última troca de senha (pwdLastSet).' };
        return { ok: true };
      },
      aoRegistrar: { id: 'bs-r3-kaua', de: 'estagiario', canal: 'whatsapp', texto: ['troquei a senha!! 16 caracteres, uma frase de música', 'não vou falar qual 🤐'] },
    },
    {
      id: 'bs-rt-netlogon',
      titulo: 'Reteste: script de logon',
      objetivo: 'A credencial saiu do NETLOGON?',
      exemplo: 'NETLOGON: arquivos ..., credencial: ...',
      status: 'nao',
      dicas: ['Liste o NETLOGON inteiro, não só o logon.bat.', 'Arquivos .bak são o lugar favorito de senhas esquecidas.'],
      severidade: 'critica',
      porqueSeveridade: '',
      recomendacao: 'Não corrigido: logon.bat foi limpo, mas o logon.bat.bak ficou no NETLOGON com a mesma senha. Apagar o backup e, principalmente, trocar a senha da conta adm.financas, que segue a mesma.',
      validar: async (t) => {
        if (!normalizar(t).includes('logon.bat.bak')) return { ok: false, motivo: 'Mostre em que arquivo a credencial continua.' };
        if (!(await contemSegredo(t, SENHA_FINANCAS))) return { ok: false, motivo: 'Mostre que a credencial ainda está lá (a mesma de antes).' };
        return { ok: true };
      },
      aoRegistrar: { id: 'bs-r3-clodoaldo', de: 'clodoaldo', canal: 'whatsapp', texto: ['o .bak eu fiz pra garantir, caso desse problema', '...', 'tá, apaguei'] },
    },
    {
      id: 'bs-rt-folha',
      titulo: 'Reteste: planilha da folha',
      objetivo: 'A planilha saiu do alcance de todos?',
      exemplo: 'Publico/... -> ...',
      status: 'nao',
      dicas: ['"Guardada" pode querer dizer "mudada de pasta". Liste as subpastas do Publico.'],
      severidade: 'media',
      porqueSeveridade: '',
      recomendacao: 'Não corrigido: a planilha foi movida para Publico/arquivo_morto, que continua aberto a toda a rede. Tirar do compartilhamento público.',
      validar: async (t) => {
        if (temCpfCompleto(t)) return { ok: false, lgpd: true, motivo: 'CPF inteiro na evidência. No reteste também vale prova mínima.' };
        const n = normalizar(t);
        if (!n.includes('arquivo_morto')) return { ok: false, motivo: 'Mostre onde a planilha está agora.' };
        if (!n.includes('folha_pagamento_2026-10.csv')) return { ok: false, motivo: 'Mostre o nome do arquivo encontrado.' };
        return { ok: true };
      },
    },
    {
      id: 'bs-rt-smb',
      titulo: 'Reteste: SMB',
      objetivo: 'A assinatura agora é exigida? E o SMBv1?',
      exemplo: 'smb-protocols: ... | smb2-security-mode: ...',
      status: 'parcial',
      dicas: ['Rode os mesmos dois scripts do nmap e compare cada um com o resultado de antes.'],
      severidade: 'media',
      porqueSeveridade: '',
      recomendacao: 'Parcial: a assinatura passou a ser exigida, mas o SMBv1 continua aceito. Desabilitar depois de testar os equipamentos antigos.',
      validar: async (t) => {
        const n = normalizar(t);
        if (!n.includes('required')) return { ok: false, motivo: 'Mostre a situação da assinatura hoje.' };
        if (n.includes('not required')) return { ok: false, motivo: 'Essa saída é a antiga? Rode de novo.' };
        if (!/nt lm 0\.12|smbv1/.test(n)) return { ok: false, motivo: 'Mostre a situação do SMBv1.' };
        return { ok: true };
      },
    },
  ],

  reacoes: [],

  conclusao: [
    {
      id: 'bs-fim-ato3-tania',
      de: 'tania',
      canal: 'whatsapp',
      texto: [
        'Reteste fechado: diretório e senha do estagiário corrigidos, SMB pela metade, e o clássico duplo: backup do script e planilha "guardada" na própria pasta pública.',
        'Você fez os três níveis. Contrato, escopo, evidência, relatório e reteste, do frigorífico à prefeitura.',
        'Tô orgulhosa. Não espalha. 🖤',
      ],
    },
    {
      id: 'bs-fim-ato3-iracema',
      de: 'iracema',
      canal: 'email',
      assunto: 'Encerramento do contrato',
      texto: [
        'Prezados,',
        'Registro o cumprimento integral do contrato, no prazo, inclusive quanto aos pedidos recusados pela contratada, que constam em ata.',
        'A Procuradoria recomendará a renovação no próximo exercício, seja quem for o prefeito.',
        'Iracema Vasconcelos',
      ],
    },
  ],
};
