// Manual de comandos do nível iniciante. Cada comando digitado no terminal
// que aparece aqui ganha uma explicação no painel lateral.
import type { Comando } from '../motor/tipos';

export const manualBasico: Comando[] = [
  {
    nome: 'pwd',
    resumo: 'Mostra em qual pasta você está.',
    exemplos: [{ cmd: 'pwd', explica: 'Imprime o caminho completo da pasta atual.' }],
  },
  {
    nome: 'ls',
    resumo: 'Lista os arquivos de uma pasta.',
    exemplos: [
      { cmd: 'ls', explica: 'Lista a pasta atual.' },
      { cmd: 'ls -la', explica: 'Lista tudo, inclusive arquivos ocultos (que começam com ponto), com dono, permissões e tamanho.' },
    ],
  },
  {
    nome: 'cd',
    resumo: 'Entra em outra pasta.',
    exemplos: [
      { cmd: 'cd evidencias', explica: 'Entra na pasta evidencias.' },
      { cmd: 'cd ..', explica: 'Volta uma pasta.' },
      { cmd: 'cd', explica: 'Volta para a sua pasta pessoal.' },
    ],
  },
  {
    nome: 'mkdir',
    resumo: 'Cria uma pasta.',
    exemplos: [{ cmd: 'mkdir -p boi/evidencias', explica: 'Cria a pasta e as intermediárias que faltarem.' }],
    pratica: 'Organize por cliente e por data desde o primeiro minuto. Evidência perdida é achado que não aconteceu.',
  },
  {
    nome: 'cat',
    resumo: 'Mostra o conteúdo de um arquivo.',
    exemplos: [{ cmd: 'cat notas.txt', explica: 'Imprime o arquivo inteiro na tela.' }],
  },
  {
    nome: 'less',
    resumo: 'Lê arquivos grandes com rolagem.',
    exemplos: [{ cmd: 'less arquivo.txt', explica: 'Setas para rolar, / para buscar, q para sair.' }],
  },
  {
    nome: 'head',
    resumo: 'Mostra só o começo de um arquivo.',
    exemplos: [{ cmd: 'head -n 3 arquivo.csv', explica: 'As 3 primeiras linhas.' }],
    pratica: 'Para provar que um arquivo tem dado pessoal, olhe o mínimo. Você não precisa ler a planilha inteira.',
  },
  {
    nome: 'wc',
    resumo: 'Conta linhas, palavras e bytes.',
    exemplos: [{ cmd: 'wc -l arquivo.csv', explica: 'Quantidade de linhas. Ótimo para dizer o tamanho de um vazamento sem abrir o arquivo.' }],
  },
  {
    nome: 'grep',
    resumo: 'Procura texto dentro de arquivos.',
    exemplos: [
      { cmd: 'grep -i senha arquivo.txt', explica: 'Linhas com "senha", sem diferenciar maiúscula de minúscula.' },
      { cmd: 'grep -rn TODO pasta/', explica: 'Procura em todos os arquivos da pasta, mostrando o número da linha.' },
    ],
  },
  {
    nome: 'nano',
    resumo: 'Editor de texto simples.',
    exemplos: [{ cmd: 'nano notas.txt', explica: 'Ctrl+O salva, Ctrl+X sai.' }],
  },
  {
    nome: 'history',
    resumo: 'Lista os comandos que você já digitou.',
    exemplos: [{ cmd: 'history', explica: 'Útil para montar o passo a passo de reprodução do relatório.' }],
    pratica: 'Todo achado precisa de "passos para reproduzir". O histórico é o seu rascunho disso.',
  },
  {
    nome: 'date',
    resumo: 'Mostra data e hora.',
    exemplos: [{ cmd: 'date', explica: 'Anote o horário de cada teste. Se algo cair, você sabe dizer o que estava rodando.' }],
  },
  {
    nome: 'ip',
    resumo: 'Mostra e configura a rede da sua máquina.',
    exemplos: [
      { cmd: 'ip -br addr', explica: 'Seus endereços IP, um por linha.' },
      { cmd: 'ip route', explica: 'Por onde sai cada destino.' },
    ],
  },
  {
    nome: 'cat /etc/hosts',
    resumo: 'Nomes que a sua máquina resolve sem DNS.',
    exemplos: [{ cmd: 'cat /etc/hosts', explica: 'Mostra a tabela local de nomes e endereços.' }],
  },
  {
    nome: 'nmap',
    resumo: 'Descobre quais máquinas estão ativas e quais serviços elas oferecem.',
    exemplos: [
      { cmd: 'nmap -sn <faixa>', explica: 'Só descobre quem está ativo, sem olhar portas.' },
      { cmd: 'nmap <alvo>', explica: 'Verifica as 1.000 portas mais comuns do alvo.' },
      { cmd: 'nmap -sV -p <portas> <alvo>', explica: 'Tenta identificar o programa e a versão de cada serviço.' },
    ],
    pratica: 'Antes de apertar Enter, confira se o alvo está no escopo. Uma faixa digitada errado é um ataque a quem não contratou você.',
  },
  {
    nome: 'curl',
    resumo: 'Faz requisições web pelo terminal.',
    exemplos: [
      { cmd: 'curl http://<site>/', explica: 'Baixa a página e mostra o HTML.' },
      { cmd: 'curl -I http://<site>/', explica: 'Mostra só os cabeçalhos da resposta (servidor, cookies, redirecionamentos).' },
    ],
  },
  {
    nome: 'wget',
    resumo: 'Baixa arquivos da web.',
    exemplos: [{ cmd: 'wget http://<site>/arquivo', explica: 'Salva o arquivo na pasta atual.' }],
    pratica: 'Baixe para uma pasta de evidências do cliente, nunca para a sua pasta pessoal solta.',
  },
  {
    nome: 'sha256sum',
    resumo: 'Calcula o hash de um arquivo.',
    exemplos: [{ cmd: 'sha256sum evidencia.txt', explica: 'Gera a "impressão digital" do arquivo. Se mudar um byte, o hash muda.' }],
    pratica: 'Hash da evidência no relatório prova que ela não foi alterada depois.',
  },
];
