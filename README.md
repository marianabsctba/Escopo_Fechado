# Escopo Fechado

Jogo de pentest em português, com humor e técnica de verdade. A sua consultoria é paga para testar a segurança de empresas: com contrato, escopo, janela de testes, LGPD e relatório. O cliente é que nem sempre ajuda.

**[Jogar no navegador](https://marianabsctba.github.io/Escopo_Fechado/)**, sem instalar nada.

Powered by Mariana BS.

## Comandos de verdade

O terminal do jogo não é simulado. O seu notebook de teste é um **Linux real (Alpine, kernel 6.12)** rodando dentro do navegador com o [v86](https://github.com/copy/v86). `ls`, `grep`, `curl`, `nmap`, `git` e companhia são os programas de verdade. Os servidores do cliente vivem na mesma máquina virtual, em network namespaces, então nada sai do seu computador.

Cada comando digitado chega ao jogo por uma segunda porta serial. É assim que o jogo explica o comando no painel lateral e confere se você saiu do escopo.

## Boas práticas viram regra do jogo

- **Escopo:** atacar algo que não está no contrato custa pontos e rende e-mail do jurídico. Atacar o concorrente do cliente é crime (art. 154-A do Código Penal), e o jogo diz isso.
- **Janela de testes, contato de emergência, incidente real:** tudo cobrado no checklist antes de assinar.
- **LGPD:** dado pessoal entra no relatório só como prova mínima e mascarado.
- **Evidência:** cada achado vai para o caderno com a saída do terminal e a severidade, e o jogo confere se ela prova mesmo o achado.

## Os atos do Boi na Nuvem

- **Ato 0, o contrato:** Regras de Engajamento, checklist de escopo e o pedido do dono para atacar o concorrente.
- **Ato 1, reconhecimento:** nmap na faixa do contrato, robots.txt, repositório `.git` publicado junto com o site (com a senha que o Jefferson "apagou"), backup com planilha de clientes e metadados de foto. Tudo com ferramenta de verdade.
- **Ato 2, o relatório:** severidade com a calculadora CVSS 3.1 oficial, passos para reproduzir, evidência sem vazar dado, recomendação, sumário executivo sem jargão e a reunião de entrega com o cliente.
- **Ato 3, o reteste:** o TI jura que corrigiu tudo. A VM sobe o mundo "corrigido" e você prova, com curl e sha256sum, o que foi consertado e o que só foi escondido.

A cada publicação, robôs jogam o Ato 1 e o reteste dentro da VM (`ferramentas/roteiros/`). Se algo quebrar, o site não é publicado.

## Pinhão Forte (intermediário)

Teste não anunciado: o SOC do cliente não sabe, e varredura barulhenta abre chamado e custa pontos de discrição. Dicas custam pontos. A fábrica de software terceirizada fica fora do escopo, e ela ainda pede para você esconder achados do relatório. O reconhecimento usa `openssl` para ler certificados, `curl` e `jq` para documentação de API e cabeçalhos, e a LGPD aparece de novo, agora com saldo de associados.

## Clientes (níveis)

| nível | cliente | situação |
|---|---|---|
| Iniciante | **Boi na Nuvem**, frigorífico em Goiás que fez "transformação digital" com o sobrinho do dono | completo: contrato, reconhecimento, relatório e reteste |
| Intermediário | **Pinhão Forte**, cooperativa de crédito no Paraná com app feito por fábrica terceirizada e SOC vigiando | completo: certificado TLS, documentação de API, cookie, erro verboso, homologação com dado real, relatório e reteste |
| Expert | **São Jerônimo do Bom Sossego**, prefeitura no sertão | em breve |

Empresas, pessoas, domínios (`.exemplo`) e endereços (faixas de documentação da RFC 5737) são fictícios.

## Desenvolvimento

```bash
npm install
npm test          # escopo, contrato e canal da VM
npm run dev
```

A imagem Linux de cada cenário é gerada por `ferramentas/imagem/construir.sh` (precisa de Linux x86_64 e root; o GitHub Actions faz isso a cada publicação) e fica em `public/vm/<cenário>/`, fora do repositório. Para testar a imagem sem navegador:

```bash
sudo bash ferramentas/imagem/construir.sh boi_na_nuvem "$PWD/public/vm/boi_na_nuvem"
node ferramentas/testar-vm.mjs boi_na_nuvem
```

Estrutura:

- `src/motor/`: VM (v86), verificação de escopo, estado salvo.
- `src/ui/`: telas (início, contrato, mesa com terminal).
- `src/cenarios/`: conteúdo de cada cliente.
- `vm/base/`: init da máquina, ambiente do terminal e servidor do mundo.
- `vm/<cenário>/`: o mundo do cliente (servidores e arquivos).

## Licenças

Código do jogo sob licença MIT. Componentes de terceiros distribuídos no site:

- [v86](https://github.com/copy/v86): BSD-2-Clause.
- SeaBIOS e VGABIOS: LGPL-3.0.
- Kernel Linux e pacotes Alpine: licenças de cada pacote (GPL-2.0 no kernel). A lista exata de versões publicada vai em `vm/<cenário>/pacotes-versoes.txt` no site, e o código-fonte correspondente está no [aports do Alpine](https://gitlab.alpinelinux.org/alpine/aports) e nos espelhos de fontes do projeto.
