// Comandos extras do nível expert: diretório e compartilhamentos.
import type { Comando } from '../motor/tipos';
import { manualIntermediario } from './manual_intermediario';

export const manualExpert: Comando[] = [
  ...manualIntermediario,
  {
    nome: 'ldapsearch',
    resumo: 'Consulta um diretório LDAP (como o Active Directory).',
    exemplos: [
      { cmd: "ldapsearch -x -H ldap://<ip> -s base -b '' namingContexts", explica: 'Pergunta ao servidor qual é a raiz do diretório. -x usa autenticação simples.' },
      { cmd: "ldapsearch -x -H ldap://<ip> -b <raiz> '(objectClass=user)' sAMAccountName", explica: 'Sem -D e -w: consulta anônima. Se responde, o diretório está aberto a qualquer um.' },
      { cmd: "ldapsearch -x -H ldap://<ip> -D '<dn da sua conta>' -w '<senha>' -b <raiz> '(filtro)' atributos", explica: 'Consulta autenticada com a sua conta de teste.' },
      { cmd: "'(description=*senha*)'", explica: 'Filtro que procura contas com a palavra senha na descrição.' },
      { cmd: '-o ldif-wrap=no', explica: 'Não quebra linhas longas na saída (mais fácil de copiar para a evidência).' },
    ],
    pratica: 'Leia atributos, não teste senhas. pwdLastSet diz quando a senha foi trocada; memberOf diz o que a conta pode.',
  },
  {
    nome: 'smbclient',
    resumo: 'Cliente de compartilhamentos Windows (SMB).',
    exemplos: [
      { cmd: "smbclient -L //<ip> -U 'usuario%senha'", explica: 'Lista os compartilhamentos que o servidor oferece.' },
      { cmd: "smbclient //<ip>/<compartilhamento> -U 'usuario%senha' -c 'ls'", explica: 'Lista os arquivos de um compartilhamento.' },
      { cmd: "smbclient //<ip>/<compartilhamento> -U 'usuario%senha' -c 'get arquivo /tmp/arquivo'", explica: 'Baixa um arquivo para conferir.' },
    ],
    pratica: 'Use só a conta de teste do contrato. Leitura, nunca escrita.',
  },
  {
    nome: 'nmap --script',
    resumo: 'Scripts do nmap que inspecionam configurações de serviço.',
    exemplos: [
      { cmd: 'nmap -p 445 --script smb-protocols <ip>', explica: 'Quais versões do SMB o servidor aceita (SMBv1 aparece como NT LM 0.12).' },
      { cmd: 'nmap -p 445 --script smb2-security-mode <ip>', explica: 'Se a assinatura das mensagens SMB é exigida ou só permitida.' },
    ],
  },
];
