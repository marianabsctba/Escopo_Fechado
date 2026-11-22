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
- **Evidência:** cada achado vai para o caderno com comando, horário e hash.

## Clientes (níveis)

| nível | cliente | situação |
|---|---|---|
| Iniciante | **Boi na Nuvem**, frigorífico em Goiás que fez "transformação digital" com o sobrinho do dono | Ato 0 (contrato) pronto; reconhecimento em construção |
| Intermediário | **Pinhão Forte**, cooperativa de crédito no Paraná | em breve |
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
