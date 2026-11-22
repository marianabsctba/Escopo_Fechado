// Comandos extras do nível intermediário.
import type { Comando } from '../motor/tipos';
import { manualBasico } from './manual';

export const manualIntermediario: Comando[] = [
  ...manualBasico.filter((c) => c.nome !== 'curl' && c.nome !== 'nmap'),
  {
    nome: 'nmap',
    resumo: 'Descobre máquinas, portas e versões de serviço.',
    exemplos: [
      { cmd: 'nmap -sT -p 80,443,8443 <faixa>', explica: 'Só as portas que interessam: rápido e discreto.' },
      { cmd: 'nmap -sV -p <portas> <alvo>', explica: 'Identifica programa e versão. Faz mais requisições: use com moderação.' },
    ],
    pratica: 'Com SOC vigiando, varredura de todas as portas (-p-), modo agressivo (-A) ou temporização máxima (-T5) chamam atenção. Comece pequeno.',
  },
  {
    nome: 'curl',
    resumo: 'Faz requisições web pelo terminal.',
    exemplos: [
      { cmd: 'curl -sk https://<site>/', explica: '-s silencioso, -k aceita certificado autoassinado (comum em homologação).' },
      { cmd: 'curl -skI https://<site>/', explica: 'Só os cabeçalhos: servidor, cookies, políticas de segurança.' },
      { cmd: 'curl -sk --resolve nome:443:IP https://nome/', explica: 'Acessa um nome que não está no DNS, apontando para um IP.' },
    ],
  },
  {
    nome: 'openssl',
    resumo: 'Ferramenta de criptografia; aqui, para ler certificados TLS.',
    exemplos: [
      { cmd: 'echo | openssl s_client -connect <ip>:443 2>/dev/null | openssl x509 -noout -text', explica: 'Mostra o certificado do servidor: dono, validade e nomes.' },
      { cmd: '... | openssl x509 -noout -ext subjectAltName', explica: 'Só os nomes alternativos (SAN). Costuma revelar subdomínios.' },
    ],
    pratica: 'Certificado é público por natureza. Ler os nomes dele é reconhecimento passivo e não gera alerta.',
  },
  {
    nome: 'jq',
    resumo: 'Lê e filtra JSON.',
    exemplos: [
      { cmd: 'curl -sk <url> | jq .', explica: 'Formata o JSON para leitura.' },
      { cmd: "jq -r '.paths | keys[]'", explica: 'Lista as rotas de uma documentação OpenAPI.' },
    ],
  },
];
