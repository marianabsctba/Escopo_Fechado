// Ato 1 do Bom Sossego: auditoria interna do domínio com conta de servidor comum.
import type { Ato } from '../../motor/tipos';
import { contemSegredo, normalizar, temCpfCompleto } from '../../motor/evidencia';

const SENHA_ESTAGIARIO = 'e631d85b428df95a8c9a159525883106f110720c58d7e4b90d0c4f2df7a21fa7';
const SENHA_FINANCAS = '1a34b24986529317c57fa33cda939dc50ed6b5f65a5fc5162661bb4b52453609';

export const ato1: Ato = {
  titulo: 'Ato 1: o que um servidor comum enxerga',

  achados: [
    {
      id: 'bs-mapa',
      titulo: 'Mapa da rede administrativa e do domínio',
      objetivo: 'Quais servidores respondem em 10.20.0.0/24, com quais serviços, e qual é a raiz do diretório?',
      exemplo: '10.20.0.X: ... | 10.20.0.Y: ... | raiz: dc=...',
      dicas: [
        'Serviços típicos de domínio: LDAP (389) e SMB (445). Varra só essas portas na faixa.',
        "O próprio servidor LDAP diz a raiz se você perguntar: ldapsearch -x -H ldap://<ip> -s base -b '' namingContexts",
      ],
      severidade: 'informativa',
      porqueSeveridade: 'Inventário. A partir daqui é que se mede o que um servidor comum alcança.',
      recomendacao: 'Manter inventário dos serviços do domínio e separar a rede da Prefeitura da rede da Câmara.',
      validar: async (t) => {
        const n = normalizar(t);
        const falta: string[] = [];
        if (!n.includes('10.20.0.10')) falta.push('o controlador de domínio');
        if (!n.includes('10.20.0.20')) falta.push('o servidor de arquivos');
        if (!/\b389\b/.test(n) || !/\b445\b/.test(n)) falta.push('as portas dos serviços');
        if (!n.includes('dc=bomsossego,dc=exemplo')) falta.push('a raiz do diretório');
        return falta.length ? { ok: false, motivo: `Ainda falta: ${falta.join(', ')}.` } : { ok: true };
      },
    },
    {
      id: 'bs-anonimo',
      titulo: 'Diretório aberto a consulta anônima',
      objetivo: 'O diretório responde sem login? Quantas contas de usuário ele entrega para quem nem se identificou?',
      exemplo: 'consulta sem -D/-w ... N contas',
      dicas: [
        'Faça a consulta de usuários sem -D e sem -w. Se vier resposta, é anônima.',
        "Conte as linhas de sAMAccountName com grep -c.",
      ],
      severidade: 'media',
      porqueSeveridade: 'Qualquer equipamento na rede, mesmo sem conta, lista todos os servidores, cargos e grupos. É o mapa para tudo que vem depois.',
      recomendacao: 'Desabilitar consulta anônima ao diretório e exigir autenticação para leitura.',
      validar: async (t) => {
        const n = normalizar(t);
        if (!/\b22\b/.test(n)) return { ok: false, motivo: 'Falta a quantidade de contas que a consulta anônima devolveu.' };
        if (!/anonim|-x|sem login|sem autentica/.test(n)) return { ok: false, motivo: 'Deixe claro que a consulta foi feita sem autenticação.' };
        return { ok: true };
      },
      aoRegistrar: {
        id: 'bs-r-anonimo',
        de: 'clodoaldo',
        canal: 'whatsapp',
        texto: ['mas isso é pra facilitar, a impressora do protocolo consulta o diretório', 'sempre foi assim'],
      },
    },
    {
      id: 'bs-descricao',
      titulo: 'Senha no campo de descrição de uma conta administrativa',
      objetivo: 'Alguma conta guarda senha na descrição? Qual, que senha, desde quando ela não é trocada e o que essa conta pode fazer?',
      exemplo: 'conta ..., descrição: ..., pwdLastSet: ..., grupos: ...',
      dicas: [
        "Filtre por descrição: '(description=*senha*)' e peça também pwdLastSet e memberOf.",
        'pwdLastSet mostra se a senha "provisória" foi trocada algum dia. memberOf mostra o tamanho do estrago.',
      ],
      severidade: 'critica',
      porqueSeveridade: 'Senha provisória nunca trocada, legível por qualquer um, de uma conta que é administradora do domínio. Quem lê, manda em tudo.',
      recomendacao: 'Trocar a senha da conta imediatamente, limpar descrições com segredos, tirar o estagiário do grupo Domain Admins e exigir troca de senha no primeiro acesso.',
      validar: async (t) => {
        if (!(await contemSegredo(t, SENHA_ESTAGIARIO))) return { ok: false, motivo: 'Falta a senha que está na descrição.' };
        const n = normalizar(t);
        if (!n.includes('2024-02-05')) return { ok: false, motivo: 'Mostre desde quando a senha não é trocada (pwdLastSet).' };
        if (!n.includes('domain admins')) return { ok: false, motivo: 'Mostre o que a conta pode fazer (grupos).' };
        return { ok: true };
      },
      aoRegistrar: {
        id: 'bs-r-descricao',
        de: 'estagiario',
        canal: 'whatsapp',
        texto: ['oi, sou o Kauã, o estagiário', 'o Clodoaldo disse que minha senha tava escrita no meu usuário??', 'eu nem sabia que tinha senha provisória, eu entro pelo computador da recepção 😅'],
      },
    },
    {
      id: 'bs-netlogon',
      titulo: 'Credencial no script de logon',
      objetivo: 'O script que roda no logon de todos os servidores tem alguma credencial? De qual conta e o que ela pode?',
      exemplo: 'NETLOGON/logon.bat: conta ..., senha ...',
      dicas: [
        'O controlador de domínio compartilha NETLOGON com todos os usuários do domínio. Liste e baixe o que tiver lá com a sua conta de teste.',
        'Depois, consulte no diretório os grupos da conta que aparece no script.',
      ],
      severidade: 'critica',
      porqueSeveridade: 'Todo servidor da prefeitura lê esse script. A conta exposta é administradora do domínio.',
      recomendacao: 'Remover a credencial do script, trocar a senha da conta adm.financas, tirá-la de Domain Admins e mapear a pasta por permissão de grupo, sem senha no script.',
      validar: async (t) => {
        if (!(await contemSegredo(t, SENHA_FINANCAS))) return { ok: false, motivo: 'Falta a senha que aparece no script.' };
        if (!normalizar(t).includes('adm.financas')) return { ok: false, motivo: 'Falta de qual conta é a senha.' };
        return { ok: true };
      },
      aoRegistrar: {
        id: 'bs-r-netlogon',
        de: 'iracema',
        canal: 'email',
        assunto: 'Credenciais administrativas expostas',
        texto: ['Prezados,', 'Duas credenciais administrativas legíveis por qualquer servidor. Solicitei ao Secretário de TI a troca imediata das senhas, sem esperar o relatório final.', 'Iracema Vasconcelos'],
      },
    },
    {
      id: 'bs-folha',
      titulo: 'Folha de pagamento com CPF na pasta pública',
      objetivo: 'O que está na pasta Publico que não deveria? Registre o arquivo, quantos servidores aparecem e um exemplo mascarado.',
      exemplo: 'arquivo ..., N registros. Ex.: Nome S., CPF 123.***.***-45',
      dicas: [
        'Liste o compartilhamento Publico do servidor de arquivos e baixe o que parecer sensível.',
        'Conte as linhas (descontando o cabeçalho) e mascare o CPF. A remuneração é pública pela transparência; o CPF, não.',
      ],
      severidade: 'media',
      porqueSeveridade: 'CPF e dados funcionais de mais de 400 servidores abertos para toda a rede. Não é internet, mas é todo mundo, inclusive terceirizados e estagiários.',
      recomendacao: 'Tirar a planilha da pasta pública, restringir à Secretaria de Administração e publicar a remuneração só pelo portal da transparência, sem CPF.',
      validar: async (t) => {
        if (temCpfCompleto(t)) return { ok: false, lgpd: true, motivo: 'CPF inteiro na evidência. Mascare: 123.***.***-45.' };
        const n = normalizar(t);
        if (!n.includes('folha_pagamento_2026-10.csv')) return { ok: false, motivo: 'Falta o nome exato do arquivo.' };
        if (!/\b41[23]\b/.test(n)) return { ok: false, motivo: 'Falta a quantidade de servidores na planilha.' };
        if (!/\d{3}\.\*{3}\.\*{3}-\d{2}/.test(t)) return { ok: false, motivo: 'Falta um exemplo com CPF mascarado.' };
        return { ok: true };
      },
    },
    {
      id: 'bs-smb',
      titulo: 'SMBv1 ativo e assinatura SMB não exigida',
      objetivo: 'Como o servidor de arquivos está configurado quanto às versões do SMB e à assinatura das mensagens?',
      exemplo: 'smb-protocols: ... | smb2-security-mode: ...',
      dicas: [
        'Os scripts smb-protocols e smb2-security-mode do nmap respondem isso sem login.',
        'SMBv1 aparece como NT LM 0.12. "Enabled but not required" quer dizer que a assinatura é opcional.',
      ],
      severidade: 'media',
      porqueSeveridade: 'SMBv1 é obsoleto e já foi porta de entrada de ataques em massa. Assinatura opcional permite que alguém na rede intercepte e retransmita autenticações.',
      recomendacao: 'Desabilitar SMBv1 e exigir assinatura SMB em servidores e estações (política de grupo).',
      validar: async (t) => {
        const n = normalizar(t);
        if (!/nt lm 0\.12|smbv1|smb ?1\b/.test(n)) return { ok: false, motivo: 'Mostre que o SMBv1 está ativo.' };
        if (!n.includes('not required') && !n.includes('nao exigida') && !n.includes('nao obrigatoria')) return { ok: false, motivo: 'Mostre a situação da assinatura SMB.' };
        return { ok: true };
      },
    },
    {
      id: 'bs-admins',
      titulo: 'Domain Admins inchado e política de senha fraca',
      objetivo: 'Bônus: quantas contas são administradoras do domínio, quais não deveriam ser, e qual é a política de senha?',
      exemplo: 'Domain Admins: N membros (...) | minPwdLength ..., lockoutThreshold ...',
      bonus: true,
      dicas: ['Consulte o grupo Domain Admins (atributo member) e o objeto raiz do domínio (minPwdLength, lockoutThreshold).'],
      severidade: 'alta',
      porqueSeveridade: 'Seis administradores do domínio, incluindo estagiário, prefeito e uma empresa de suporte com contrato encerrado. Senha de 6 caracteres e sem bloqueio por tentativas.',
      recomendacao: 'Reduzir Domain Admins ao mínimo nominal, desativar contas de fornecedores encerrados, senha de no mínimo 12 caracteres e bloqueio por tentativas.',
      validar: async (t) => {
        const n = normalizar(t);
        if (!/\b6\b/.test(n)) return { ok: false, motivo: 'Falta quantos membros o grupo tem.' };
        if (!/estagiario|suporte\.terceirizado|prefeito/.test(n)) return { ok: false, motivo: 'Cite quem não deveria estar no grupo.' };
        if (!n.includes('minpwdlength')) return { ok: false, motivo: 'Falta a política de senha.' };
        return { ok: true };
      },
    },
  ],

  reacoes: [
    {
      id: 'bs-clodoaldo-ldap',
      quando: (e) => e.tipo === 'cmd' && /^\s*ldapsearch\b/.test(e.comando),
      mensagem: { id: 'bs-clodoaldo-ldap', de: 'clodoaldo', canal: 'whatsapp', texto: ['vi no log uma consulta no diretório agora, é vc?', 'pode olhar, lá não tem nada demais'] },
    },
    {
      id: 'bs-juvenal-sabado',
      quando: (e) => e.tipo === 'cmd' && /^\s*smbclient\b/.test(e.comando),
      mensagem: { id: 'bs-juvenal-sabado', de: 'juvenal', canal: 'whatsapp', texto: ['Trabalhando no sábado pela prefeitura! Posso postar isso? 📸'] },
    },
  ],

  conclusao: [
    {
      id: 'bs-fim-ato1',
      de: 'tania',
      canal: 'whatsapp',
      texto: [
        'Fechou. Um servidor comum, sem quebrar senha nenhuma, chegou a duas credenciais de administrador do domínio só lendo o que estava aberto.',
        'Agora o relatório. Dois críticos, prefeito candidato e procuradora atenta. Escolha cada palavra.',
      ],
    },
  ],
};
